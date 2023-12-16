const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/Database.js');
const userMiddleware = require('../middleware/UserModel.js');
var md5 = require('md5');
const fileUpload = require('express-fileupload');
const _ = require('lodash');
const mime = require('mime-types')
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
app.use(cors());

app.use(fileUpload({
    createParentPath: true
}));
app.get('/getProjectTeam', (req, res, next) => {
  db.query(`Select 
  pt.team_title,
  e.first_name,
  j.designation,
  j.department,
  pt.project_team_id,
  pt.employee_id,
  pt.project_task_id,
  pt.project_milestone_id,
  pt.project_id
    From project_team pt
 LEFT JOIN (project p) ON (pt.project_id = p.project_id)
LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
LEFT JOIN (job_information j) ON (e.employee_id = j.employee_id)
 LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
  LEFT JOIN (project_milestone m) ON (m.project_milestone_id = pt.project_milestone_id)
Where pt.project_team_id !=''`,
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

app.post('/getTeamById', (req, res, next) => {
  db.query(`Select 
  pt.team_title,
  e.first_name,
  j.designation,
  j.department,
 pt.project_team_id,
pt.employee_id,
pt.project_task_id,
pt.project_milestone_id,
pt.project_id
    From project_team pt
 LEFT JOIN (project p) ON (pt.project_id = p.project_id)
LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
LEFT JOIN (job_information j) ON (e.employee_id = j.employee_id)
 LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
  LEFT JOIN (project_milestone m) ON (m.project_milestone_id = pt.project_milestone_id)
Where pt.project_team_id=${db.escape(req.body.project_team_id)}`,
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

app.post('/getTeamTaskById', (req, res, next) => {
  db.query(`SELECT
  pt.actual_completed_date,
  pt.start_date,
  pt.end_date,
  pt.completion,
  pt.task_title,
  (
    SELECT SUM(t.hours)
    FROM project_timesheet t
    WHERE t.project_task_id = pt.project_task_id AND t.employee_id = e.employee_id
  ) AS actual_hours,
  p.title,
  pt.status,
  pt.task_type,
  pt.project_id,
  e.first_name,
  e.employee_id,
  tm.employee_id,
  pt.project_task_id,
  pt.project_milestone_id,
  pt.description,
  pt.priority,
  pt.estimated_hours,
  pt.project_id,
tm.employee_id
FROM project_task pt
LEFT JOIN project p ON pt.project_id = p.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
LEFT JOIN project_milestone m ON m.project_milestone_id = pt.project_milestone_id
LEFT JOIN project_team tm ON tm.employee_id = pt.employee_id
  Where tm.project_team_id=${db.escape(req.body.project_team_id)}`,
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
app.post('/getTeamProjectById', (req, res, next) => {
  db.query(`Select 
e.first_name,
j.designation,
j.department,
pt.project_team_id,
pt.employee_id,
pt.project_id,
pt.team_title,
e.employee_id,
pt.project_task_id,
pt.project_milestone_id,
pt.project_id
From project_team pt
 LEFT JOIN (project p) ON (pt.project_id = p.project_id)
LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
LEFT JOIN (job_information j) ON (e.employee_id = j.employee_id)
 LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
  LEFT JOIN (project_milestone m) ON (m.project_milestone_id = pt.project_milestone_id)
WHERE pt.project_id=${db.escape(req.body.project_id)} `,
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


app.post('/editTeam', (req, res, next) => {
  db.query(`UPDATE project_team 
            SET team_title=${db.escape(req.body.team_title)}
            ,project_id=${db.escape(req.body.project_id)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,project_milestone_id=${db.escape(req.body.project_milestone_id)}
            ,project_task_id=${db.escape(req.body.project_task_id)}
            ,project_id=${db.escape(req.body.project_id)}
            WHERE project_team_id = ${db.escape(req.body.project_team_id)}`,
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
  
app.post('/insertTeam', (req, res, next) => {

  let data = {
     team_title: req.body.team_title
    , project_id	: req.body.project_id
    , employee_id: req.body.employee_id
    , project_task_id: req.body.project_task_id
    , project_milestone_id: req.body.project_milestone_id

 };
  let sql = "INSERT INTO project_team SET ?";
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
  }
);
});

app.post('/deleteTeam', (req, res, next) => {

  let data = {project_team_id: req.body.project_team_id};
  let sql = "DELETE FROM project_team WHERE ?";
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
  }
);
});
app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;