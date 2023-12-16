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

app.post('/TabMaterialUsedPortal', (req, res, next) => {
  db.query(`SELECT pm.title
  ,pm.description
  ,pm.unit
  ,pm.quantity
  ,pm.status
  ,pm.remark
  ,pm.product_id
  ,pm.project_materials_id
  ,pm.project_id
  ,p.qty_in_stock
  ,pm.creation_date
  ,p.product_type FROM project_materials pm 
  LEFT JOIN (product p) ON (p.product_id = pm.product_id) WHERE pm.project_id =${db.escape(req.body.project_id)} ORDER BY pm.project_materials_id ASC`,
    (err, result) => {
       
      if (err) {
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

app.post('/editTabMaterialUsedPortal', (req, res, next) => {
  db.query(`UPDATE project_materials
            SET title=${db.escape(req.body.title)}
            ,description=${db.escape(req.body.description)}
            ,unit=${db.escape(req.body.unit)}
            ,quantity=${db.escape(req.body.quantity)}
            ,amount=${db.escape(req.body.amount)}
            ,remark=${db.escape(req.body.description)}
            WHERE project_materials_id =${db.escape(req.body.project_materials_id )}`,
    (err, result) => {
     
      if (result.length === 0) {
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

app.post('/insertProjectMaterials', (req, res, next) => {

  let data = {
    project_id:req.body.project_id
     ,title: req.body.title
    , quantity: req.body.quantity
    , amount: req.body.amount
    , description: req.body.description
    , creation_date: req.body.creation_date
    , modification_date: req.body.modification_date
    , created_by: req.body.created_by
    , modified_by: req.body.modified_by
    , status: req.body.status
    , unit: req.body.unit
    , material_used_date: req.body.material_used_date
    , part_no: req.body.part_no
    , product_id: req.body.product_id
    , viresco_factory: req.body.viresco_factory
 };
  let sql = "INSERT INTO project_materials SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
    return res.status(400).send({
            data: err
          });
    } else {
          return res.status(200).send({
            data: result,
            msg:'New Tender has been created successfully'
          });
    }
  });
});

app.delete('/deleteProjectMaterials', (req, res, next) => {

  let data = {project_materials_id : req.body.project_materials_id };
  let sql = "DELETE FROM project_materials WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    } else {
          return res.status(200).send({
            data: result,
            msg:'Tender has been removed successfully'
          });
    }
  });
});

app.post('/returnToStock', (req, res, next) => {

 
  let sql = `UPDATE product SET  qty_in_stock = qty_in_stock - ${db.escape(req.body.qty )} WHERE product_id=${db.escape(req.body.product_id)}`;
  let query = db.query(sql,(err, result) => {
    if (err) {
      return res.status(400).send({
            msg:err
          });
    } else {
        
db.query(`UPDATE project_materials SET  quantity = quantity - ${db.escape(req.body.qty )} WHERE project_materials_id =${db.escape(req.body.project_materials_id )}`,
    (err, result) => {
       
      if (err) {
        return res.status(400).send({
          msg: err
        });
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

        }
 
    }
  );
    }
  });
});

module.exports = app;