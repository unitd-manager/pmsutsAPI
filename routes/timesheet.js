const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/Database.js");
const userMiddleware = require("../middleware/UserModel.js");
var md5 = require("md5");
const fileUpload = require("express-fileupload");
const _ = require("lodash");
const mime = require("mime-types");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
app.use(cors());

app.use(
  fileUpload({
    createParentPath: true,
  })
);


app.post("/insertTimesheetEmployee", (req, res, next) => {
  let data = {
    project_id: req.body.project_id,
    employee_id: req.body.employee_id,
    creation_date: req.body.creation_date, 
  };
  let sql = "INSERT INTO timesheet SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
      })
    }

  });
});

app.post("/getTimesheetStaffById", (req, res, next) => {
  db.query(
    `SELECT * FROM timesheet et INNER JOIN employee e ON e.employee_id = et.employee_id WHERE et.project_id = ${db.escape(req.body.project_id)}`,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
           data: result,
          msg: 'Success',
        })
      }

    }
  );
});

app.post('/updateTimesheet', (req, res, next) => {
  db.query(`UPDATE timesheet 
            SET normal_hours=${db.escape(req.body.normal_hourly_rate)}
            ,employee_ot_hours=${db.escape(req.body.ot_hourly_rate)}
            ,employee_ph_hours=${db.escape(req.body.ph_hourly_rate)}
            WHERE employee_id =  ${db.escape(req.body.employee_timesheet_id)} AND project_id =  ${db.escape(req.body.project_id)}`,
    (err, result) => {
     
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      }
     }
  );
});

app.post("/insertTimesheetMonth", (req, res, next) => {
  let data = {
      project_id: req.body.project_id,
      employee_id: req.body.employee_id,
      creation_date: req.body.creation_date,
      month: req.body.month,
      year: req.body.year,
      day: req.body.day,
      normal_hours: req.body.normal_hours,
      ot_hours: req.body.ot_hours,
      ph_hours: req.body.ph_hours,
  };
  let sql = "INSERT INTO employee_timesheet SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
      })
    }

  });
});

app.post('/updateTimesheetMonth', (req, res, next) => {
  db.query(`UPDATE employee_timesheet 
            SET normal_hours=${db.escape(req.body.normal_hours)}
            ,ot_hours=${db.escape(req.body.ot_hours)}
            ,ph_hours=${db.escape(req.body.ph_hours)}
            ,modification_date= ${db.escape(req.body.modification_date)}
             WHERE employee_timesheet_id =  ${db.escape(req.body.employee_timesheet_id)}`,
    (err, result) => {
     
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      }
     }
  );
});

app.get('/getTotalData', (req, res, next) => {
  db.query(`SELECT COUNT(employee_id) AS total, SUM(normal_hours) AS normal_hours
  , SUM(ot_hours) AS ot_hours, SUM(ph_hours) AS ph_hours
            FROM employee_timesheet et 
            GROUP BY et.employee_id`,
    (err, result) => {
      if (err) {
       return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

          }
   
      }
    );
  });
  
app.post('/getGroupData', (req, res, next) => {
  db.query(`SELECT *
FROM employee_timesheet
WHERE project_id=${db.escape(req.body.project_id)} 
AND employee_id=${db.escape(req.body.employee_id)} AND month=${db.escape(req.body.month)} AND year=${db.escape(req.body.year)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: 'failed'
        })
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

          }
   
      }
    );
  });
module.exports = app;