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

app.post('/TabDeliveryOrder', (req, res, next) => {
    db.query(`SELECT do.date,do.delivery_order_id  FROM delivery_order do WHERE project_id = ${db.escape(req.body.project_id)}`,
        (err, result) => {
           
          if (err) {
             return res.status(400).send({
                  data: err,
                  msg:'Failed'
                });
          } else {
                return res.status(200).send({
                  data: result,
                  msg:'Tender has been removed successfully'
                });
          }
    
            
     
        }
      );
    });
  
    app.post('/editTabDeliveryOrder', (req, res, next) => {
      db.query(`UPDATE delivery_order
                SET date=${db.escape(req.body.date)}
                WHERE project_id=${db.escape(req.body.project_id)}`,
        (err, result) => {
         
          if (err) {
             return res.status(400).send({
                  data: err,
                  msg:'Failed'
                });
          } else {
                return res.status(200).send({
                  data: result,
                  msg:'Tender has been removed successfully'
                });
          
          }
         }
      );
    });
  
    app.post('/insertdelivery_order', (req, res, next) => {
  
      let data = {project_id: req.body.project_id,
                  company_id: req.body.company_id,
                  date: req.body.date,
                  created_by: req.body.created_by,
                  creation_date: req.body.creation_date,
                  modified_by: req.body.modified_by,
                  modification_date: req.body.modification_date,
                  
                   };
    
      let sql = "INSERT INTO delivery_order SET ?";
      let query = db.query(sql, data,(err, result) => {
        if (err) {
          return res.status(400).send({
                  data: err,
                  msg:'Failed'
                });
        } else {
              return res.status(200).send({
                data: result,
                msg:'New Tender has been created successfully'
              });
        }
      });
    });
  
    app.post('/deletedelivery_order', (req, res, next) => {
  
      let data = {delivery_order_id : req.body.delivery_order_id};
      let sql = "DELETE FROM delivery_order WHERE ?";
      let query = db.query(sql, data,(err, result) => {
        if (err) {
           return res.status(400).send({
                  data: err,
                  msg:'Failed'
                });
        } else {
              return res.status(200).send({
                data: result,
                msg:'Delivery Order has been removed successfully'
              });
        
        }
      });
    });

    app.post('/TabDeliveryOrderHistory', (req, res, next) => {
        
      db.query(`SELECT 
                p.item_title,
                  doh.product_id
                  ,do.date
                  ,doh.quantity
                  ,doh.remarks
                  ,doh.status
            FROM delivery_order_history doh
            LEFT JOIN (delivery_order do) ON (do.delivery_order_id = doh.delivery_order_id)
            LEFT JOIN (po_product p) ON (p.po_product_id = doh.product_id)
            WHERE do.delivery_order_id=${db.escape(req.body.delivery_order_id)}`,
          (err, result) => {
             
            if (err) {
               return res.status(400).send({
                  data: err,
                  msg:'Failed'
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

      app.post('/editTabDeliveryOrderHistory', (req, res, next) => {
        db.query(`UPDATE delivery_order_history
                  SET product_id=${db.escape(req.body.date)}
                  quantity=${db.escape(req.body.quantity)}
                  remarks=${db.escape(req.body.remarks)}
                  status=${db.escape(req.body.status)}
                  date=${db.escape(req.body.date)}
                  WHERE do.delivery_order_id=${db.escape(req.body.do.delivery_order_id)}`,
          (err, result) => {
           
            if (err) {
               return res.status(400).send({
                  data: err,
                  msg:'Failed'
                });
            } else {
                  return res.status(200).send({
                    data: result,
                    msg:'Tender has been removed successfully'
                  });
            
            }
           }
        );
      });

      app.post('/insertDeliveryHistoryOrder', (req, res, next) => {
  
        let data = {
            product_id	: req.body.product_id	,
                    purchase_order_id: req.body.purchase_order_id,
                    delivery_order_id: req.body.delivery_order_id,
                    status: req.body.status,
                    quantity: req.body.quantity,
                    creation_date	: req.body.creation_date	,
                    modification_date: req.body.modification_date,
                    remarks: req.body.remarks
                     };
      
        let sql = "INSERT INTO delivery_order_history SET ?";
        let query = db.query(sql, data,(err, result) => {
          if (err) {
           return res.status(400).send({
                  data: err,
                  msg:'Failed'
                });
          } else {
                return res.status(200).send({
                  data: result,
                  msg:'New Tender has been created successfully'
                });
          }
        });
      });
    
  module.exports = app;