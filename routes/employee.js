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

app.get('/getEmployee', (req, res, next) => {
  db.query(
    `SELECT  
     a.employee_id
    ,a.first_name
    ,a.email
    ,a.pass_word
   ,CONCAT_WS(' ', a.first_name, a.last_name ) AS staff_name
    FROM employee a
    LEFT JOIN staff s ON a.employee_id=s.employee_id
    WHERE a.employee_id != ''
    group by a.employee_id`,
    (err, result) => {
      if (err) {
        console.log('error: ', err);
        return res.status(400).send({
          data: err,
          msg: 'failed',
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Staff has been removed successfully',
        });
      }
    }
  );
});


app.get('/getCostingSummary', (req, res, next) => {
  db.query("SELECT c.* FROM `opportunity_costing_summary` c WHERE c.opportunity_id =  ORDER BY c.opportunity_costing_summary_id DESC",
    (err, result) => {
       
      if (result.length == 0) {
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