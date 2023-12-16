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
app.get('/getSetting', (req, res, next) => {
  db.query(`Select s.key_text
  ,s.description
  ,s.value
  ,s.value_type
  ,s.creation_date
  ,s.modification_date
  ,s.setting_id
  From setting s
  Where s.setting_id !=''`,
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


app.get('/getMail', (req, res, next) => {
  db.query(`Select s.key_text
   ,s.value
  ,s.setting_id
  From setting s
  Where s.key_text ='AdminMail' OR s.key_text ='CEOMail' OR s.key_text ='TechHeadMail'`,
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
app.post('/getSettings', (req, res, next) => {
  db.query(`Select s.key_text
  ,s.description
  ,s.value
  ,s.value_type
  ,s.creation_date
  ,s.modification_date
  ,s.setting_id
  From setting s
  Where s.setting_id=${db.escape(req.body.setting_id)}`,
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


app.post('/editSetting', (req, res, next) => {
  db.query(`UPDATE setting 
            SET key_text=${db.escape(req.body.key_text)}
            ,description=${db.escape(req.body.description)}
            ,value=${db.escape(req.body.value)}
            ,value_type=${db.escape(req.body.value_type)}
            ,modification_date=${db.escape(new Date().toISOString())}
            WHERE setting_id = ${db.escape(req.body.setting_id)}`,
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
  
app.post('/insertSetting', (req, res, next) => {

  let data = {value	: req.body.value	
    , creation_date: new Date().toISOString()
    , modification_date: null
    , group_name: req.body.group_name
    , value_type	: req.body.value_type
    , show_to_user	: req.body.show_to_user
    , chi_value: req.body.chi_value
    , used_for_admin: req.body.used_for_admin
    , used_for_www: req.body.used_for_www
    , flag		: req.body.flag		
    , site_id	: req.body.site_id	
    ,key_text : req.body.key_text	
  
    
 };
  let sql = "INSERT INTO setting SET ?";
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

app.post('/deleteSetting', (req, res, next) => {

  let data = {setting_id: req.body.setting_id};
  let sql = "DELETE FROM setting WHERE ?";
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
app.get('/getSettingsForCompany', (req, res, next) => {
  db.query(`SELECT * FROM setting WHERE key_text LIKE 'cp%'`,
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