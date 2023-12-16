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

app.post('/login', (req, res, next) => {
  db.query(`SELECT * FROM staff WHERE email=${db.escape(req.body.email)} AND pass_word=${db.escape(req.body.password)}`,
    (err, result) => {
       
      if (result.length == 0) {
          
        return res.status(200).send({
          msg: 'No result found',
          status:'200'
        });
      } else {
          var token = jwt.sign({ id: result[0].staff_id }, 'smartcon', {
              expiresIn: 86400 // expires in 24 hours
            });
            return res.status(200).send({
              data: result[0],
              msg:'Success',
              token:token
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