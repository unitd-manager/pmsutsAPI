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

app.get('/getChangeRequest', (req, res, next) => {
  db.query(`SELECT 
   cr.change_request_id
  ,cr.project_id
  ,cr.change_request_title
  ,cr.submission_date
  ,cr.proposed_implementation_date
  ,cr.status
  ,cr.description
  ,cr.creation_date
  ,cr.created_by
  ,cr.modification_date
  ,cr.modified_by
  ,p.project_id
  ,p.title
  FROM change_request cr
  LEFT JOIN project p on p.project_id=cr.project_id
  Where cr.change_request_id !=''`,
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

app.post('/getChangeRequestById', (req, res, next) => {
  db.query(`SELECT 
  cr.change_request_id
 ,cr.project_id
 ,cr.change_request_title
 ,cr.submission_date
 ,cr.proposed_implementation_date
 ,cr.status
 ,cr.description
 ,cr.creation_date
 ,cr.created_by
 ,cr.modification_date
 ,cr.modified_by
 ,p.project_id
 ,p.title
 FROM change_request cr
 LEFT JOIN project p on p.project_id=cr.project_id
 Where cr.change_request_id=${db.escape(req.body.change_request_id)}`,
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

app.post('/editChangeRequest', (req, res, next) => {
  db.query(`UPDATE change_request 
            SET project_id=${db.escape(req.body.project_id)}
            ,change_request_title=${db.escape(req.body.change_request_title)}
            ,submission_date=${db.escape(req.body.submission_date)}
            ,proposed_implementation_date=${db.escape(req.body.proposed_implementation_date)}
            ,status=${db.escape(req.body.status)}
            ,description=${db.escape(req.body.description)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE change_request_id = ${db.escape(req.body.change_request_id)}`,
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
        
        
app.post('/insertChangeRequest', (req, res, next) => {
  let data = {
      project_id	: req.body.project_id
    , change_request_title	: req.body.change_request_title
    , submission_date: req.body.submission_date
    , proposed_implementation_date: req.body.proposed_implementation_date
    , status	: req.body.status
    , description: req.body.description
    , creation_date: req.body.creation_date
    , created_by:req.body.created_by
    , modification_date:req.body.modification_date
    , modified_by:req.body.modified_by
 };
  let sql = "INSERT INTO change_request SET ?";
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

app.get("/getProjectTitle", (req, res, next) => {
  db.query(`SELECT project_id,title FROM project`, (err, result) => {
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
  });
});


app.post('/deleteChangeRequest', (req, res, next) => {

  let data = {change_request_id: req.body.change_request_id};
  let sql = "DELETE FROM change_request WHERE ?";
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