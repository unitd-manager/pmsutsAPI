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

app.get('/getEquipmentIssue', (req, res, next) => {
  db.query(`select
  lr.equipment_issue_id
  ,lr.project_id
  ,lr.equipment_request_id
  ,lr.reason_for_issue
  ,lr.equipment_issue_date
  ,lr.notes
  ,lr.authorized_by
  ,lr.creation_date
  ,lr.modification_date
  ,lr.modified_by
  ,p.title AS proj_title
  ,p.project_code
  ,mr.equipment_request_code
  From equipment_issue lr
  LEFT JOIN (project p)   ON (p.project_id   = lr.project_id) 
  LEFT JOIN (equipment_request mr)   ON (mr.equipment_request_id   = lr.equipment_request_id) 
            where lr.equipment_issue_id  !=''`,
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


app.post('/getEquipmentIssueById', (req, res, next) => {
  db.query(`select
  lr.equipment_issue_id
  ,lr.project_id
  ,lr.equipment_request_id
  ,lr.reason_for_issue
  ,lr.equipment_issue_date
  ,lr.notes
  ,lr.authorized_by
  ,lr.creation_date
  ,lr.modification_date
  ,lr.modified_by
  ,p.title AS proj_title
  ,p.project_code
  ,mr.equipment_request_code
  From equipment_issue lr
  LEFT JOIN (project p)   ON (p.project_id   = lr.project_id) 
  LEFT JOIN (equipment_request mr)   ON (mr.equipment_request_id   = lr.equipment_request_id) 
            where lr.equipment_issue_id = ${db.escape(req.body.equipment_issue_id)}`,
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


app.post('/editEquipmentIssue', (req, res, next) => {
  db.query(`UPDATE equipment_issue 
            SET 
            project_id=${db.escape(req.body.project_id)}
            ,equipment_request_id=${db.escape(req.body.equipment_request_id)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,equipment_issue_date=${db.escape(req.body.equipment_issue_date)}
            ,reason_for_issue=${db.escape(req.body.reason_for_issue)}
            ,notes=${db.escape(req.body.notes)}
            ,authorized_by=${db.escape(req.body.authorized_by)}
           
            WHERE equipment_issue_id = ${db.escape(req.body.equipment_issue_id)}`,
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

app.post('/insertEquipmentIssue', (req, res, next) => {

  let data = {
    equipment_issue_id:req.body.equipment_issue_id	
   , project_id: req.body.project_id
   , equipment_request_id:req.body.equipment_request_id	
   , equipment_issue_date:req.body.equipment_issue_date	
   , creation_date: req.body.creation_date
   , modification_date: req.body.modification_date
   , created_by: req.body.created_by
  };
  let sql = "INSERT INTO equipment_issue SET ?";
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

app.post('/deleteEquipmentIssue', (req, res, next) => {

  let data = {equipment_issue_id: req.body.equipment_issue_id};
  let sql = "DELETE FROM equipment_issue WHERE ?";
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



app.get('/getProject', (req, res, next) => {
  db.query(`SELECT p.title
  ,p.category
  ,p.status
  ,p.contact_id
  ,p.start_date
  ,p.estimated_finish_date
  ,p.description
  ,p.project_manager_id
  ,p.project_id
  ,p.project_code
  ,CONCAT_WS('/', p.title, p.project_code)  AS project_title
  ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name 
  ,c.company_name 
  ,c.company_size 
  ,c.source ,c.industry 
  ,o.opportunity_code 
  ,cont.first_name
  ,( SELECT GROUP_CONCAT( CONCAT_WS(' ', stf.first_name, stf.last_name) 
  ORDER BY CONCAT_WS(' ', stf.first_name, stf.last_name) SEPARATOR ', ' ) 
  FROM staff stf ,project_staff ts 
  WHERE ts.project_id = p.project_id AND stf.staff_id = ts.staff_id ) 
  AS staff_name ,ser.title as service_title ,CONCAT_WS(' ', s.first_name, s.last_name) 
  AS project_manager_name ,(p.project_value - (IF(ISNULL(( SELECT SUM(invoice_amount) 
  FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id)
 WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ),0, ( SELECT SUM(invoice_amount) 
  FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id) 
  WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ))) AS still_to_bill FROM project p LEFT JOIN (contact cont) ON (p.contact_id = cont.contact_id)LEFT JOIN (company c)ON (p.company_id = c.company_id) 
  LEFT JOIN (service ser) ON (p.service_id = ser.service_id) LEFT JOIN (staff s) ON (p.project_manager_id = s.staff_id) LEFT JOIN (opportunity o) ON (p.opportunity_id = o.opportunity_id) WHERE ( LOWER(p.status) = 'wip' OR LOWER(p.status) = 'billable' OR LOWER(p.status) = 'billed' ) AND ( LOWER(p.status) = 'wip' OR LOWER(p.status) ='billable' OR LOWER(p.status) = 'billed') ORDER BY p.project_code DESC`,
    (err, result) => {
       
      if (err) {
        return res.status(400).send({
          msg: 'No result found'
        });
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

        }
 
    }
  );
});


app.post('/getequipmentRequest', (req, res, next) => {
  db.query(`SELECT * FROM equipment_request WHERE project_id = ${db.escape(req.body.project_id)};`,
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




app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;