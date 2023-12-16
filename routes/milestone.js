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

app.get('/getMilestone', (req, res, next) => {
  db.query(`Select 
  pm.project_milestone_id,
  pm.actual_completed_date,
  pm.milestone_title,
  pm.description,
  pm.from_date,
  pm.to_date,
  pm.project_id,
  p.title,
  pm.status
  From project_milestone pm
  LEFT JOIN project p ON pm.project_id = p.project_id
  Where pm.project_milestone_id !=''
  `,
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
app.post('/getMilestonById', (req, res, next) => {
  db.query(`Select 
  pm.project_milestone_id,
    pm.actual_completed_date,
  pm.milestone_title,
  pm.description,
  pm.from_date,
  pm.to_date,
  pm.project_id,
  pt.status AS task_status,
  p.title,
  pm.status
  From project_milestone pm
  LEFT JOIN project p ON pm.project_id = p.project_id
 LEFT JOIN project_task pt ON pm.project_milestone_id = pt.project_milestone_id
  Where pm.project_milestone_id=${db.escape(req.body.project_milestone_id)}`,
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


app.post('/getMilestoneProjectById', (req, res, next) => {
  db.query(`SELECT
  pm.project_milestone_id,
  pm.actual_completed_date,
  pm.milestone_title,
  pm.description,
  pm.from_date,
  pm.to_date,
  pm.project_id,
  p.title,
  pm.status
FROM
  project_milestone pm
LEFT JOIN
  project p ON pm.project_id = p.project_id
  WHERE pm.project_id=${db.escape(req.body.project_id)}`,
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

app.post('/getMilestonByIds', (req, res, next) => {
  db.query(`Select 
  pm.project_milestone_id,
    pm.actual_completed_date,
  pm.milestone_title,
  pm.description,
  pm.from_date,
  pm.to_date,
  pm.project_id,
  p.title,
  pt.status AS task_status,
  pm.status
  From project_milestone pm
  LEFT JOIN project p ON pm.project_id = p.project_id
    LEFT JOIN project_task pt ON pm.project_milestone_id = pt.project_milestone_id
  Where pm.project_milestone_id=${db.escape(req.body.project_milestone_id)}`,
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


app.post('/editMilestone', (req, res, next) => {
  db.query(`UPDATE project_milestone 
            SET milestone_title=${db.escape(req.body.milestone_title)}
            ,description=${db.escape(req.body.description)}
            ,from_date=${db.escape(req.body.from_date)}
            ,to_date=${db.escape(req.body.to_date)}
            ,project_id=${db.escape(req.body.project_id)}
            ,status=${db.escape(req.body.status)}
            ,actual_completed_date=${db.escape(req.body.actual_completed_date)}
            WHERE project_milestone_id=${db.escape(req.body.project_milestone_id)}`,
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
        
        
  
app.post('/insertMilestone', (req, res, next) => {

  let data = {description: req.body.description	
    , from_date: req.body.from_date
    , to_date	: req.body.to_date
    , project_id	: req.body.project_id
    , milestone_title: req.body.milestone_title
    ,project_id:req.body.project_id
    ,actual_completed_date:req.body.actual_completed_date
    , status: req.body.status
 };
  let sql = "INSERT INTO project_milestone SET ?";
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

app.post('/getMilestoneById', (req, res, next) => {
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
  m.project_milestone_id,
  pt.project_milestone_id,
  tm.employee_id
FROM project_task pt
LEFT JOIN project p ON pt.project_id = p.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
LEFT JOIN project_milestone m ON m.project_milestone_id = pt.project_milestone_id
LEFT JOIN project_team tm ON tm.employee_id = pt.employee_id
WHERE pt.project_milestone_id =${db.escape(req.body.project_milestone_id)}`,
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

app.post('/deleteMilestone', (req, res, next) => {

  let data = {project_milestone_id: req.body.project_milestone_id};
  let sql = "DELETE FROM project_milestone WHERE ?";
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