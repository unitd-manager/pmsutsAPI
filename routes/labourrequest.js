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

app.get('/getLabourRequest', (req, res, next) => {
  db.query(`select
  lr.labour_request_id
  ,lr.project_id
  ,lr.request_urgency
  ,lr.request_date
  ,lr.request_start_date
  ,lr.request_end_date
  ,lr.request_by
  ,lr.job_description
  ,lr.request_type
            ,lr.no_of_employees
            ,lr.skills_required
            ,lr.department
  ,lr.creation_date
  ,lr.modification_date
  ,p.title AS proj_title
  ,p.project_code
  From labour_request lr
  LEFT JOIN (project p)   ON (p.project_id   = lr.project_id) 
            where lr.labour_request_id  !=''`,
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

app.get('/getLabourRequestSummary', (req, res, next) => {
  db.query(`select
  lr.labour_request_id
  ,lr.project_id
  ,lr.request_urgency
  ,lr.request_date
  ,lr.request_start_date
  ,lr.request_end_date
  ,lr.request_by
  ,lr.job_description
  ,lr.request_type
            ,lr.no_of_employees
            ,lr.skills_required
            ,lr.department
  ,lr.creation_date
  ,lr.modification_date
  ,p.title,
  p.project_code
  From labour_request lr
  LEFT JOIN (project p)   ON (p.project_id   = lr.project_id) 
  WHERE lr.request_type = 'Skilled' OR lr.request_type='UnSkilled' OR lr.request_type='Temporary' AND lr.labour_request_id!=''`,
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


app.post('/getLabourRequestById', (req, res, next) => {
  db.query(`select
          lr.labour_request_id
            ,lr.project_id
            ,lr.request_urgency
            ,lr.request_date
            ,lr.request_type
            ,lr.request_start_date
            ,lr.request_end_date
            ,lr.request_by
            ,lr.job_description
            ,lr.no_of_employees
            ,lr.skills_required
            ,lr.department
            ,lr.creation_date
            ,lr.modification_date
            ,p.title AS proj_title
            ,p.project_code
            From labour_request lr
            LEFT JOIN (project p)   ON (p.project_id   = lr.project_id) 
            where lr.labour_request_id = ${db.escape(req.body.labour_request_id)}`,
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


app.post('/editLabourRequest', (req, res, next) => {
  db.query(`UPDATE labour_request 
            SET 
            project_id=${db.escape(req.body.project_id)}
            ,request_urgency=${db.escape(req.body.request_urgency)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,request_start_date=${db.escape(req.body.request_start_date)}
            ,request_end_date=${db.escape(req.body.request_end_date)}
            ,department=${db.escape(req.body.department)}
            ,request_type=${db.escape(req.body.request_type)}
            ,request_date=${db.escape(req.body.request_date)}
            ,request_by=${db.escape(req.body.request_by)}
            ,job_description=${db.escape(req.body.job_description)}
            ,no_of_employees=${db.escape(req.body.no_of_employees)}
            ,skills_required=${db.escape(req.body.skills_rquired)}
            WHERE labour_request_id = ${db.escape(req.body.labour_request_id)}`,
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

app.post('/insertLabourRequest', (req, res, next) => {

  let data = {
    labour_request_id:req.body.labour_request_id	
   , project_id: req.body.project_id
   , creation_date: req.body.creation_date
   , modification_date: req.body.modification_date
   , request_date: req.body.request_date
  
  };
  let sql = "INSERT INTO labour_request SET ?";
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

app.post('/deleteLabourRequest', (req, res, next) => {

  let data = {labour_request_id: req.body.labour_request_id};
  let sql = "DELETE FROM labour_request WHERE ?";
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





app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;