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


 app.get('/getAllLeave', (req, res, next) => {
    db.query(`SELECT l.status
    ,l.leave_id
    ,e.employee_id
    ,l.leave_type
    ,l.no_of_days
    ,l.reason
    ,l.from_date
    ,l.to_date
    ,l.no_of_days_next_month
    ,l.employee_id
    ,l.date
    ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
    ,j.designation
    ,e.citizen
    FROM empleave l
    LEFT JOIN employee e ON (l.employee_id = e.employee_id)
    LEFT JOIN job_information j ON (j.employee_id = l.employee_id)
    WHERE l.leave_id !=''`,
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
  
  app.get('/getDashboardLeave', (req, res, next) => {
    db.query(`SELECT l.status
    ,l.leave_id
    ,e.employee_id
    ,l.leave_type
    ,l.no_of_days
    ,l.reason
    ,l.from_date
    ,l.to_date
    ,l.no_of_days_next_month
    ,l.employee_id
    ,l.date
    ,COUNT(CASE WHEN l.leave_type = 'permission' THEN 1 END) AS permission_count
    ,COUNT(CASE WHEN l.leave_type != 'permission' THEN 1 END) AS other_leave_count
    ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
    ,j.designation
    ,e.citizen
    FROM empleave l
    LEFT JOIN employee e ON (l.employee_id = e.employee_id)
    LEFT JOIN job_information j ON (j.employee_id = l.employee_id)
    WHERE l.leave_id !=''
    GROUP BY e.employee_id`,
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
app.post('/getLeave', (req, res, next) => {
    db.query(`SELECT l.status
    ,l.leave_id
    ,e.employee_id
    ,l.leave_type
    ,l.no_of_days
    ,l.reason
    ,l.from_date
    ,l.to_date
    ,l.no_of_days_next_month
    ,l.employee_id
    ,l.date
    ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
    ,j.designation
    ,e.citizen
    FROM empleave l
    LEFT JOIN employee e ON (l.employee_id = e.employee_id)
    LEFT JOIN job_information j ON (j.employee_id = l.employee_id)
    WHERE l.leave_id !='' AND 
   e.email = ${db.escape(req.body.email)}
   GROUP BY l.leave_id`,
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

  
  app.get('/getEmployee', (req, res, next) => {
    db.query(`SELECT 
    e.employee_id,
    e.email
    ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
     ,GROUP_CONCAT(l.from_date) AS from_date
     ,GROUP_CONCAT(l.to_date) AS to_date
    from employee e
     LEFT JOIN empleave l ON (e.employee_id = l.employee_id)
     where e.employee_id !=''
   GROUP BY e.employee_id`,
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
  
app.post('/getAppLeave', (req, res, next) => {
    const userEmail = req.body.email; // Assuming the email is sent in the request body

    db.query(`
        SELECT 
            l.employee_id,
            e.first_name,
            e.employee_id,
            e.email,
            SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveThisYear,
            SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
                     WHEN YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
                     ELSE 0 END) AS TotalLeaveThisMonth,
            SUM(CASE WHEN l.leave_type = 'permission' THEN l.no_of_days ELSE 0 END) AS TotalPermission,
            SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalPermissionThisYear,
            SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
                     WHEN l.leave_type = 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
                     ELSE 0 END) AS TotalPermissionThisMonth,
            SUM(CASE WHEN l.leave_type != 'permission' THEN l.no_of_days ELSE 0 END) AS TotalLeave,
            SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveExceptPermissionThisYear,
            SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
                     WHEN l.leave_type != 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
                     ELSE 0 END) AS TotalLeaveExceptPermissionThisMonth
        FROM 
            empleave l
        LEFT JOIN 
            employee e ON l.employee_id = e.employee_id
        WHERE 
            e.email = ?
    `, [userEmail], (err, result) => {
        if (err) {
            console.log('error: ', err)
            return res.status(400).send({
                data: err,
                msg: 'failed',
            })
        } else {
            return res.status(200).send({
                data: result[0],
                msg: 'Success',
            });
        }
    });
});

  
 app.get('/getLeavePermission', (req, res, next) => {
    db.query(`SELECT 
    l.employee_id,
    e.first_name,
    e.employee_id,
    SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveThisYear,
    SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalLeaveThisMonth,
    SUM(CASE WHEN l.leave_type = 'permission' THEN l.no_of_days ELSE 0 END) AS TotalPermission,
    SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalPermissionThisYear,
    SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN l.leave_type = 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalPermissionThisMonth,
    SUM(CASE WHEN l.leave_type != 'permission' THEN l.no_of_days ELSE 0 END) AS TotalLeave,
    SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveExceptPermissionThisYear,
    SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN l.leave_type != 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalLeaveExceptPermissionThisMonth
FROM 
    empleave l
    LEFT JOIN employee e ON l.employee_id=e.employee_id
WHERE 
    l.employee_id !='' 
 
   GROUP BY l.employee_id`,
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


app.post('/getLeaveandPermission', (req, res, next) => {
  
    db.query(`SELECT 
    l.employee_id,
    e.first_name,
    e.employee_id,
    SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveThisYear,
    SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalLeaveThisMonth,
    SUM(CASE WHEN l.leave_type = 'permission' THEN l.no_of_days ELSE 0 END) AS TotalPermission,
    SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalPermissionThisYear,
    SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN l.leave_type = 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalPermissionThisMonth,
    SUM(CASE WHEN l.leave_type != 'permission' THEN l.no_of_days ELSE 0 END) AS TotalLeave,
    SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveExceptPermissionThisYear,
    SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN l.leave_type != 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalLeaveExceptPermissionThisMonth
FROM 
    empleave l
    LEFT JOIN employee e ON l.employee_id=e.employee_id
WHERE 
    e.email =${db.escape(req.body.email)}
 
   GROUP BY l.employee_id`,
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


 app.post('/getEmployeeEmail', (req, res, next) => {
    db.query(`SELECT 
    e.employee_id,
    e.email
    ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
     ,GROUP_CONCAT(l.from_date) AS from_date
     ,GROUP_CONCAT(l.to_date) AS to_date
    from employee e
     LEFT JOIN empleave l ON (e.employee_id = l.employee_id)
     where e.email = ${db.escape(req.body.email)}
   GROUP BY e.employee_id`,
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

  app.post('/getLeaveByid', (req, res, next) => {
    db.query(`SELECT l.status
    ,l.leave_id
    ,l.leave_type
    ,l.no_of_days
    ,l.no_of_days_next_month
    ,l.reason
    ,l.from_date
    ,l.to_date
    ,l.employee_id
    ,l.date
    ,l.went_overseas
    ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
    ,j.designation
    ,e.citizen
    ,e.email
    FROM empleave l
    LEFT JOIN (employee e) ON (l.employee_id = e.employee_id)
    LEFT JOIN (job_information j) ON (j.employee_id = l.employee_id)
    WHERE l.leave_id =${db.escape(req.body.leave_id)}`,
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


  app.post('/editLeave', (req, res, next) => {
    db.query(`UPDATE empleave
              SET reason=${db.escape(req.body.reason)}
              ,leave_type=${db.escape(req.body.leave_type)}
              ,status=${db.escape(req.body.status)}
              ,date=${db.escape(req.body.date)}
              ,from_date=${db.escape(req.body.from_date)}
              ,to_date=${db.escape(req.body.to_date)}
              ,no_of_days=${db.escape(req.body.no_of_days)}
              ,no_of_days_next_month=${db.escape(req.body.no_of_days_next_month)}
              ,employee_id=${db.escape(req.body.employee_id)}
              ,went_overseas=${db.escape(req.body.went_overseas)}
              WHERE leave_id = ${db.escape(req.body.leave_id)}`,
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
                });
              });

app.post('/insertLeave', (req, res, next) => {
  // Extract relevant information from the request body
  let { employee_id, leave_type, from_date, to_date, reason, creation_date, modification_date, created_by, modified_by } = req.body;

  // Calculate no_of_days and ensure a minimum value of 1
  let from = new Date(from_date);
  let to = new Date(to_date);
  let no_of_days = Math.max(Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1, 1);

  // Assuming a date format like 'yyyy-mm-dd'
  let fromMonth = new Date(from_date).getMonth() + 1;
  let toMonth = new Date(to_date).getMonth() + 1;
  let no_of_days_next_month = (toMonth !== fromMonth) ? 0 + to.getDate() : 0;

  // Prepare the data object for insertion
  let data = {
    date: new Date().toISOString(),
    employee_id,
    leave_type,
    from_date,
    to_date,
    reason,
    creation_date,
    modification_date,
    created_by,
    modified_by,
    no_of_days,
    status: 'Applied',
    no_of_days_next_month,
    went_overseas: 0
  };

  // Execute the SQL INSERT statement
  let sql = "INSERT INTO empleave SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log('error: ', err);
      return res.status(400).send({
        data: err,
        msg: 'failed',
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
      });
    }
  });
});
     app.post('/deleteLeave', (req, res, next) => {

                let data = {leave_id: req.body.leave_id};
                let sql = "DELETE FROM empleave WHERE ?";
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

app.post('/getPastLeaveHistoryById', (req, res, next) => {
db.query(`SELECT 
    YEAR(l.from_date) AS leave_year,
    MONTH(l.from_date) AS leave_month,
    l.employee_id,
    l.leave_type,
    l.no_of_days,
  (l.no_of_days + l.no_of_days_next_month) As totalday
FROM 
    empleave l
WHERE 
    l.employee_id = ${db.escape(req.body.employee_id)}
GROUP BY 
   l.leave_id`,
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
            
             app.post('/getTotalPastLeaveHistoryById', (req, res, next) => {
db.query(`SELECT 
    l.employee_id,
    SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveThisYear,
    SUM(CASE WHEN YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalLeaveThisMonth,
    SUM(CASE WHEN l.leave_type = 'permission' THEN l.no_of_days ELSE 0 END) AS TotalPermission,
    SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalPermissionThisYear,
    SUM(CASE WHEN l.leave_type = 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN l.leave_type = 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalPermissionThisMonth,
    SUM(CASE WHEN l.leave_type != 'permission' THEN l.no_of_days ELSE 0 END) AS TotalLeave,
    SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) THEN l.no_of_days ELSE 0 END) AS TotalLeaveExceptPermissionThisYear,
    SUM(CASE WHEN l.leave_type != 'permission' AND YEAR(l.from_date) = YEAR(CURRENT_DATE()) AND MONTH(l.from_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             WHEN l.leave_type != 'permission' AND YEAR(l.to_date) = YEAR(CURRENT_DATE()) AND MONTH(l.to_date) = MONTH(CURRENT_DATE()) THEN l.no_of_days
             ELSE 0 END) AS TotalLeaveExceptPermissionThisMonth
FROM 
    empleave l
WHERE 
    l.employee_id =  ${db.escape(req.body.employee_id)}
GROUP BY 
    l.employee_id`,
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