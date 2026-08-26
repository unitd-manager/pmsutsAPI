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

app.get('/getChartOfAccounts', (req, res, next) => {
    db.query(`SELECT ah.*, ac.title as category
    FROM acc_head ah
    LEFT JOIN acc_category ac ON ac.acc_category_id = ah.acc_category_id
    WHERE ah.acc_category_id != ''
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
              });
          }
      }
    );
  });

app.post('/getChartofACById', (req, res, next) => {
db.query(`select ah.*, ac.title as category
            From acc_head ah
            LEFT JOIN acc_category ac ON ac.acc_category_id = ah.acc_category_id
            where acc_head_id = ${db.escape(req.body.acc_head_id)}`,
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

app.post('/editChartAc', (req, res, next) => {
  db.query(`UPDATE acc_head 
            SET title =${db.escape(req.body.title)}
            ,code = ${db.escape(req.body.code)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,acc_category_id = ${db.escape(req.body.acc_category_id)}
            WHERE acc_head_id = ${db.escape(req.body.acc_head_id)}`,
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

app.post('/insertChartAc', (req, res, next) => {

  let data = {
    title	: req.body.title	
   , creation_date: req.body.creation_date
   , acc_category_id: req.body.acc_category_id
  };
  let sql = "INSERT INTO acc_head SET ?";
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