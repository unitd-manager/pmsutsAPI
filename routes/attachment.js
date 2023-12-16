const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var md5 = require('md5');
var mysql = require('mysql');
const fileUpload = require('express-fileupload');
const _ = require('lodash');
const mime = require('mime-types')
const db = require('../config/Database.js');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(fileUpload({
    createParentPath: true
}));

app.post('/edit-projects', async (req, res) => {

    try {
        if(!req.files) {
            db.query(
                  `UPDATE project SET title=${db.escape(req.body.title)},description=${db.escape(req.body.description)},start_date=${db.escape(req.body.start_date)},estimated_finish_date=${db.escape(req.body.estimated_finish_date)},company_id=${db.escape(req.body.company_id)} WHERE project_id=${db.escape(req.body.project_id)}`,
                      (err, result) => {
                          
                          
                        if (err) {
                          throw err;
                          return res.status(400).send({
                            msg: err
                          });
                        }
                         return res.status(200).send({
                         
                          msg: 'Project Updated!'
                        });
                      } 
                    ); 
        } else {
            let avatar = req.files.attachment;
            var ext = mime.extension(avatar.mimetype)
            const imgPath = Math.floor(Math.random()*90000) + 10000+'.'+ext;
            avatar.mv('./uploads/'  + imgPath);
               db.query(
                  `UPDATE project SET title=${db.escape(req.body.title)},description=${db.escape(req.body.description)},start_date=${db.escape(req.body.start_date)},estimated_finish_date=${db.escape(req.body.estimated_finish_date)},company_id=${db.escape(req.body.company_id)},attachment=${db.escape(imgPath)} WHERE project_id=${db.escape(req.body.project_id)}`,
                      (err, result) => {
                          
                          
                        if (err) {
                          throw err;
                          return res.status(400).send({
                            msg: err
                          });
                        }
                         return res.status(200).send({
                         
                          msg: 'Project Updated!'
                        });
                      } 
                    );   
            //send responseupload-avatar
        }
    } catch (err) {
        res.status(500).send(err);
    }
});




module.exports = app;