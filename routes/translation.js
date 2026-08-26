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
app.get('/getTranslation', (req, res, next) => {
  db.query(`Select s.key_text 
  ,s.value
  ,s.chi_value
  ,s.creation_date
  ,s.modification_date
  ,s.translation_id
  ,s.is_html_text
  ,s.show_to_user
  ,s.group_name
  ,s.flag
  From translation s
  Where s.translation_id  !=''`,
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
app.post('/getTranslationById', (req, res, next) => {
  db.query(`Select s.key_text 
  ,s.value
  ,s.chi_value
  ,s.creation_date
  ,s.modification_date
  ,s.translation_id
  ,s.is_html_text
  ,s.show_to_user
  ,s.group_name
  ,s.flag
  From translation s
  Where s.translation_id = ${db.escape(req.body.translation_id)}`,
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


app.post('/editTranslation', (req, res, next) => {
  db.query(`UPDATE translation 
            SET key_text=${db.escape(req.body.key_text)}
            ,chi_value=${db.escape(req.body.chi_value)}
            ,value=${db.escape(req.body.value)}
            ,is_html_text=${db.escape(req.body.is_html_text)}
            ,show_to_user=${db.escape(req.body.show_to_user)}
            ,group_name=${db.escape(req.body.group_name)}
            ,flag=${db.escape(req.body.flag)}
            ,modification_date=${db.escape(new Date().toISOString())}
            WHERE translation_id = ${db.escape(req.body.translation_id)}`,
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
  
app.post('/insertTranslation', (req, res, next) => {

  let data = {value	: req.body.value	
    , creation_date: new Date().toISOString()
    , modification_date: null
    , group_name: req.body.group_name
    , is_html_text	: req.body.is_html_text
    , show_to_user	: req.body.show_to_user
    , chi_value: req.body.chi_value
    , flag		: req.body.flag		
    ,key_text : req.body.key_text	
  
    
 };
  let sql = "INSERT INTO translation SET ?";
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

app.post('/deleteTranslation', (req, res, next) => {

  let data = {translation_id: req.body.translation_id};
  let sql = "DELETE FROM translation WHERE ?";
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

app.get('/getTranslationForCompany', (req, res, next) => {
  db.query(`SELECT t.value,t.key_text  FROM translation t WHERE key_text LIKE 'cm%'`,
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
app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;