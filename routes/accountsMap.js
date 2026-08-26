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

app.post('/insertMenuItems', (req, res, next) => {

    let data = {
        title: req.body.title	
     , code: req.body.code
     , sort_order: req.body.sort_order
     , parent_id: req.body.parent_id
     , creation_date: req.body.creation_date
     , modification_date: req.body.modification_date
     , category_type: req.body.category_type
   };
    let sql = "INSERT INTO acc_category SET ?";
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

app.get("/getParentItem", (req, res, next) => {
  db.query(
    `SELECT * FROM acc_category`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: "failed",
        });
      } else {
        return res.status(200).send({
          data: result,
        });
      }
    }
  );
});

app.post("/editMenuItems", (req, res, next) => {
  db.query(
    `UPDATE acc_category
              SET title=${db.escape(req.body.title)}
              ,code=${db.escape(req.body.code)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,category_type=${db.escape(req.body.category_type)}
              ,parent_id=${db.escape(req.body.parent_id)}
              WHERE acc_category_id = ${db.escape(req.body.acc_category_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
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