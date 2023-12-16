const express = require('express');
const db = require('../config/Database.js');
const fileUpload = require('express-fileupload');
const _ = require('lodash');
var cors = require('cors');
var app = express();
app.use(cors());

app.use(fileUpload({
    createParentPath: true
}));

app.post('/addNote', (req, res, next) => {
    let data = {comments:req.body.comments	
   , room_name	: req.body.room_name	
   , record_id: req.body.record_id
   , creation_date: req.body.creation_date
   , published: '1'
   ,project_task_id:req.body.project_task_id
  }
   let sql = "INSERT INTO comment SET ?";
  let query = db.query(sql, data,(err, result) => {
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
  });
});

app.post('/getNotes', (req, res, next) => {
  db.query(`SELECT c.*, e.first_name
  FROM comment c
  LEFT JOIN project_task pt ON pt.project_task_id = c.project_task_id
  LEFT JOIN employee e ON e.employee_id = pt.employee_id
  WHERE c.record_id = ${db.escape(req.body.record_id)} AND c.room_name = ${db.escape(req.body.room_name)}`,
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

app.post('/deleteNotes', (req, res, next) => {
  db.query(`DELETE from comment WHERE comment_id=${db.escape(req.body.comment_id)}`,
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
module.exports = app;