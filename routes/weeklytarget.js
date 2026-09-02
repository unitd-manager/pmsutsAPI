const express = require('express');
const router = express.Router();
const db = require('../config/Database.js');
const userMiddleware = require('../middleware/UserModel.js');
const fileUpload = require('express-fileupload');
const moment = require('moment');
var cors = require('cors');
var app = express();
app.use(cors());

app.use(fileUpload({
  createParentPath: true
}));

// Helper: work out delay_days server-side so the frontend never has to.
function computeDelayDays({ status, extended_due_date, completion_date }) {
  if (!extended_due_date) return 0;

  if (status === 'Completed' && completion_date) {
    const diff = moment(completion_date).startOf('day').diff(moment(extended_due_date).startOf('day'), 'days');
    return diff > 0 ? diff : 0;
  }

  if (status === 'Delayed' || status === 'InProgress' || status === 'Pending') {
    const diff = moment().startOf('day').diff(moment(extended_due_date).startOf('day'), 'days');
    return diff > 0 ? diff : 0;
  }

  return 0;
}

// ------------------------------------------------------------------
// GET all weekly targets (admin / debug use)
// ------------------------------------------------------------------
app.get('/getWeeklyTarget', (req, res) => {
  db.query(`SELECT
      wt.weekly_target_id,
      wt.project_id,
      p.title AS project_title,
      wt.employee_id,
      e.first_name,
      wt.target_title,
      wt.week_start_date,
      wt.week_end_date,
      wt.due_date,
      wt.extended_due_date,
      wt.status,
      wt.completion_date,
      wt.delay_days,
      wt.remarks
    FROM project_weekly_target wt
    LEFT JOIN project p ON wt.project_id = p.project_id
    LEFT JOIN employee e ON wt.employee_id = e.employee_id
    WHERE wt.weekly_target_id != ''`,
    (err, result) => {
      if (err) {
        console.log('error: ', err);
        return res.status(400).send({ data: err, msg: 'failed' });
      }
      return res.status(200).send({ data: result, msg: 'Success' });
    }
  );
});

// ------------------------------------------------------------------
// POST list for a project, optionally filtered by month + staff
// body: { project_id, month_start, month_end, employee_id (optional) }
// Used by the "Weekly target" tab (grouped-by-week view)
// ------------------------------------------------------------------
app.post('/getWeeklyTargetProjectById', (req, res) => {
  const { project_id, month_start, month_end, employee_id } = req.body;

  let sql = `SELECT
      wt.weekly_target_id,
      wt.project_id,
      wt.employee_id,
      e.first_name,
      wt.target_title,
      wt.week_start_date,
      wt.week_end_date,
      wt.due_date,
      wt.extended_due_date,
      wt.status,
      wt.completion_date,
      wt.delay_days,
      wt.remarks
    FROM project_weekly_target wt
    LEFT JOIN employee e ON wt.employee_id = e.employee_id
    WHERE wt.project_id = ${db.escape(project_id)}`;

  if (employee_id) {
    sql += ` AND wt.employee_id = ${db.escape(employee_id)}`;
  }
  if (month_start && month_end) {
    sql += ` AND wt.week_start_date <= ${db.escape(month_end)} AND wt.week_end_date >= ${db.escape(month_start)}`;
  }
  sql += ` ORDER BY wt.week_start_date ASC, wt.weekly_target_id ASC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log('error: ', err);
      return res.status(400).send({ data: err, msg: 'failed' });
    }
    return res.status(200).send({ data: result, msg: 'Success' });
  });
});

// ------------------------------------------------------------------
// POST list for a single week across all staff on the project
// body: { project_id, week_start_date }
// Used by the "week detail" table (all staff, one week)
// ------------------------------------------------------------------
app.post('/getWeeklyTargetByWeek', (req, res) => {
  db.query(`SELECT
      wt.weekly_target_id,
      wt.project_id,
      wt.employee_id,
      e.first_name,
      wt.target_title,
      wt.week_start_date,
      wt.week_end_date,
      wt.due_date,
      wt.extended_due_date,
      wt.status,
      wt.completion_date,
      wt.delay_days,
      wt.remarks
    FROM project_weekly_target wt
    LEFT JOIN employee e ON wt.employee_id = e.employee_id
    WHERE wt.project_id = ${db.escape(req.body.project_id)}
      AND wt.week_start_date = ${db.escape(req.body.week_start_date)}
    ORDER BY e.first_name ASC`,
    (err, result) => {
      if (err) {
        console.log('error: ', err);
        return res.status(400).send({ data: err, msg: 'failed' });
      }
      return res.status(200).send({ data: result, msg: 'Success' });
    }
  );
});

// ------------------------------------------------------------------
// POST single record by id (for the edit modal)
// ------------------------------------------------------------------
app.post('/getWeeklyTargetById', (req, res) => {
  db.query(`SELECT * FROM project_weekly_target WHERE weekly_target_id = ${db.escape(req.body.weekly_target_id)}`,
    (err, result) => {
      if (err) {
        console.log('error: ', err);
        return res.status(400).send({ data: err, msg: 'failed' });
      }
      return res.status(200).send({ data: result, msg: 'Success' });
    }
  );
});

// ------------------------------------------------------------------
// INSERT
// ------------------------------------------------------------------
app.post('/insertWeeklyTarget', (req, res) => {
  const body = req.body;
  const delay_days = computeDelayDays(body);

  let data = {
    project_id: body.project_id,
    employee_id: body.employee_id,
    target_title: body.target_title,
    week_start_date: body.week_start_date,
    week_end_date: body.week_end_date,
    due_date: body.due_date || null,
    extended_due_date: body.extended_due_date || null,
    status: body.status || 'Pending',
    completion_date: body.completion_date || null,
    delay_days: delay_days,
    remarks: body.remarks || null,
    created_date: moment().format('YYYY-MM-DD HH:mm:ss'),
    created_by: body.created_by || null,
  };

  let sql = 'INSERT INTO project_weekly_target SET ?';
  db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err);
      return res.status(400).send({ data: err, msg: 'failed' });
    }
    return res.status(200).send({ data: result, msg: 'Success' });
  });
});

// ------------------------------------------------------------------
// EDIT
// ------------------------------------------------------------------
app.post('/editWeeklyTarget', (req, res) => {
  const body = req.body;
  const delay_days = computeDelayDays(body);

  db.query(`UPDATE project_weekly_target
      SET target_title = ${db.escape(body.target_title)},
          employee_id = ${db.escape(body.employee_id)},
          week_start_date = ${db.escape(body.week_start_date)},
          week_end_date = ${db.escape(body.week_end_date)},
          due_date = ${db.escape(body.due_date || null)},
          extended_due_date = ${db.escape(body.extended_due_date || null)},
          status = ${db.escape(body.status)},
          completion_date = ${db.escape(body.completion_date || null)},
          delay_days = ${db.escape(delay_days)},
          remarks = ${db.escape(body.remarks || null)},
          modified_date = ${db.escape(moment().format('YYYY-MM-DD HH:mm:ss'))},
          modified_by = ${db.escape(body.modified_by || null)}
      WHERE weekly_target_id = ${db.escape(body.weekly_target_id)}`,
    (err, result) => {
      if (err) {
        console.log('error: ', err);
        return res.status(400).send({ data: err, msg: 'failed' });
      }
      return res.status(200).send({ data: result, msg: 'Success' });
    }
  );
});

// ------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------
app.post('/deleteWeeklyTarget', (req, res) => {
  let data = { weekly_target_id: req.body.weekly_target_id };
  let sql = 'DELETE FROM project_weekly_target WHERE ?';
  db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err);
      return res.status(400).send({ data: err, msg: 'failed' });
    }
    return res.status(200).send({ data: result, msg: 'Success' });
  });
});

module.exports = app;