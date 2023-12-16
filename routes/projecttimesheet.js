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
app.get('/getProjectTimesheet', (req, res, next) => {
  db.query(`Select 
  pt.timesheet_title,
  t.task_title,
  pt.date,
  p.title,
  pt.status,
  e.first_name,
  e.employee_id,
  et.normal_hours,
  p.project_id,
  pt.project_timesheet_id,
  pt.description,
  pt.hours,
  pt.project_milestone_id,
  pt.project_task_id
  From project_timesheet pt
 LEFT JOIN (project p) ON (pt.project_id = p.project_id)
  LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
LEFT JOIN (employee_timesheet et) ON (e.employee_id = et.employee_id)
    LEFT JOIN (project_milestone m) ON (m.project_milestone_id = pt.project_milestone_id)
 Where pt.project_timesheet_id !=''`,
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

app.post('/getProjectTimeSheetById', (req, res, next) => {
  db.query(`Select 
  pt.timesheet_title,
  t.task_title,
  pt.date,
  p.title,
  pt.status,
  e.first_name,
  p.project_id,
  pt.project_timesheet_id,
  pt.description,
  pt.hours,
  pt.project_milestone_id,
  pt.project_task_id,
  p.title,
  t.task_title,
  m.milestone_title
  From project_timesheet pt
  LEFT JOIN (project p) ON (pt.project_id = p.project_id)
  LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
    LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
    LEFT JOIN (project_milestone m) ON (m.project_milestone_id = pt.project_milestone_id)
  Where pt.project_timesheet_id=${db.escape(req.body.project_timesheet_id)}`,
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

app.post("/getMilestoneTitle", (req, res, next) => {
  db.query(
    `SELECT project_id,
milestone_title,
project_milestone_id
FROM project_milestone
WHERE project_id=${db.escape(req.body.project_id)};`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return res.status(400).send({
          data: err,
          msg: "failed",
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});

app.post("/getTaskByID", (req, res, next) => {
  db.query(
    `SELECT
  m.project_milestone_id,
  m.milestone_title,
  t.task_title,
  t.project_task_id
FROM
  project_milestone m
LEFT JOIN
  project_task t ON m.project_milestone_id = t.project_milestone_id
  WHERE m.project_milestone_id=${db.escape(req.body.project_milestone_id)};`,
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
app.post("/getStaffByID", (req, res, next) => {
  db.query(
    `SELECT

  t.task_title,
  t.project_task_id,
  t.employee_id,
  e.first_name
  
FROM
  project_task t

LEFT JOIN  employee e ON t.employee_id = e.employee_id
  WHERE t.project_task_id=${db.escape(req.body.project_task_id)}`,
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

app.post('/getTimeSheetById', (req, res, next) => {
  db.query(`Select 
  pt.timesheet_title,
  t.task_title,
  pt.date,
  p.title,
  pt.status,
  e.first_name,
  e.employee_id,
  et.normal_hours,
  p.project_id,
  pt.project_timesheet_id,
    pt.description,
    pt.hours,
    pt.project_milestone_id,
    pt.project_task_id,
    pt.creation_date,
    pt.modification_date,
     pt.created_by,
    pt.modified_by,
    m.milestone_title
From project_timesheet pt
 LEFT JOIN (project p) ON (pt.project_id = p.project_id)
LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
LEFT JOIN (employee_timesheet et) ON (e.employee_id = et.employee_id)
  LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
LEFT JOIN (project_milestone m) ON (m.project_milestone_id = pt.project_milestone_id)
Where pt.project_timesheet_id=${db.escape(req.body.project_timesheet_id)}`,
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

app.post('/getTimeSheetProjectById', (req, res, next) => {
  db.query(`Select 
  pt.project_timesheet_id,
  pt.timesheet_title,
  t.task_title,
  pt.date,
  p.title,
  pt.status,
  e.first_name,
  e.employee_id,
  p.project_id,
    pt.project_timesheet_id,
  pt.description,
 pt.hours,
 pt.project_milestone_id,
 pt.project_task_id,
 pt.creation_date,
 pt.modification_date,
  pt.created_by,
    pt.modified_by
    From project_timesheet pt
 LEFT JOIN (project p) ON (pt.project_id = p.project_id)
LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
LEFT JOIN (project_task t) ON (pt.project_task_id = t.project_task_id)
LEFT JOIN (project_milestone m) ON (pt.project_milestone_id = m.project_milestone_id)
Where pt.project_id=${db.escape(req.body.project_id)}`,
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

app.post('/getTaskTimeSheetById', (req, res, next) => {
  db.query(`Select 
  pts.timesheet_title,
  t.task_title,
  pts.date,
  p.title,
  pts.status,
  e.first_name,
  p.project_id,
  pts.project_timesheet_id,
    pts.description,
    pts.hours,
pt.project_task_id,
pt.project_milestone_id,
pt.project_id
From project_task pt
LEFT JOIN(project_timesheet pts) ON (pt.project_task_id=pts.project_task_id)
 LEFT JOIN (project p) ON (pt.project_id = p.project_id)
LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
  LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
LEFT JOIN (project_milestone m) ON (m.project_milestone_id = pt.project_milestone_id)
Where pt.project_task_id=${db.escape(req.body.project_task_id)}`,
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


app.post('/editTimeSheet', (req, res, next) => {
  db.query(`UPDATE project_timesheet 
            SET timesheet_title=${db.escape(req.body.timesheet_title)}
            ,date=${db.escape(req.body.date)}
            ,project_id=${db.escape(req.body.project_id)}
            ,status=${db.escape(req.body.status)}
            ,hours=${db.escape(req.body.hours)}
            ,description=${db.escape(req.body.description)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,project_task_id=${db.escape(req.body.project_task_id)}
             ,project_milestone_id=${db.escape(req.body.project_milestone_id)}
             ,creation_date=${db.escape(req.body.creation_date)}
             ,modification_date=${db.escape(req.body.modification_date)}
             ,created_by=${db.escape(req.body.created_by)}
             ,modified_by=${db.escape(req.body.modified_by)}
            WHERE project_timesheet_id = ${db.escape(req.body.project_timesheet_id)}`,
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
  
app.post('/insertTimeSheet', (req, res, next) => {

  let data = {date	: req.body.date	
    , timesheet_title: req.body.timesheet_title
    , project_id	: req.body.project_id
    , employee_id: req.body.employee_id
    , description: req.body.description
    , hours:req.body.hours
    , status:req.body.status
    ,project_task_id:req.body.project_task_id
    ,project_milestone_id:req.body.project_milestone_id
    ,creation_date:req.body.creation_date
    ,created_by: req.body.created_by
    ,modification_date:req.body.modification_date
    ,created_by:req.body.created_by
    ,modified_by:req.body.modified_by
 };
  let sql = "INSERT INTO project_timesheet SET ?";
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

app.post('/deleteTimeSheet', (req, res, next) => {

  let data = {project_timesheet_id: req.body.project_timesheet_id};
  let sql = "DELETE FROM project_timesheet WHERE ?";
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