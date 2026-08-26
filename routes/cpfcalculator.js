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

app.get('/getCpfCalculatorRecords', (req, res, next) => {
  db.query(`Select 
  c.cpf_calculator_id
  ,c.year
  ,c.from_age
  ,c.to_age
  ,c.spr_year
  ,c.by_employer
  ,c.by_employee
  ,c.cap_amount_employer
  ,c.cap_amount_employee
  ,c.from_salary
  ,c.to_salary
  ,c.flag
  ,c.creation_date
  ,c.modification_date
  From cpf_calculator c 
  Where c.cpf_calculator_id !=''`,
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

app.post('/getCpfCalculatorRecordById', (req, res, next) => {
  db.query(`Select 
  c.cpf_calculator_id
  ,c.year
  ,c.from_age
  ,c.to_age
  ,c.spr_year
  ,c.by_employer
  ,c.by_employee
  ,c.cap_amount_employer
  ,c.cap_amount_employee
  ,c.from_salary
  ,c.to_salary
  ,c.flag
  ,c.creation_date
  ,c.modification_date
  From cpf_calculator c 
  Where c.cpf_calculator_id =${db.escape(req.body.cpf_calculator_id)}`,
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


app.post('/editCpfCalculator', (req, res, next) => {
  db.query(`UPDATE cpf_calculator
            SET year=${db.escape(req.body.year)}
            ,from_age=${db.escape(req.body.from_age)}
            ,to_age=${db.escape(req.body.to_age)}
            ,spr_year=${db.escape(req.body.spr_year)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.staff)}
            ,by_employer=${db.escape(req.body.by_employer)}
            ,by_employee=${db.escape(req.body.by_employee)}
            ,cap_amount_employer=${db.escape(req.body.cap_amount_employer)}
            ,cap_amount_employee=${db.escape(req.body.cap_amount_employee)}
            ,from_salary=${db.escape(req.body.from_salary)}
             ,to_salary=${db.escape(req.body.to_salary)}
            ,flag=${db.escape(req.body.flag)}
            ,creation_date=${db.escape(req.body.creation_date)}
            WHERE cpf_calculator_id=${db.escape(req.body.cpf_calculator_id)}`,
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

app.post('/insertCpfCalculator', (req, res, next) => {

  let data = {
   from_age: req.body.from_age	
   , to_age: req.body.to_age
   ,year: req.body.year
  };
  let sql = "INSERT INTO cpf_calculator SET ?";
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;