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

app.get('/TabMaterialRequest', (req, res, next) => {
    db.query(`SELECT 
    mr.mr_date
    ,mr.project_name
    ,mr.site_reference
    ,mr.request_by
    ,mr.request_date
    ,mr.approved_by
    ,mr.approved_date
    ,mr.shipping_method
    ,mr.delivery_terms FROM materials_request mr WHERE mr.project_id != '' ORDER BY mr.materials_request_id DESC;`,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Tender has been removed successfully'
              });
        }
   
      }
    );
  });
  
  app.post('/editTabMaterialRequest', (req, res, next) => {
    db.query(`UPDATE materials_request
              SET mr_date=${db.escape(req.body.mr_date)}
              ,project_name=${db.escape(req.body.project_name)}
              ,site_reference=${db.escape(req.body.site_reference)}
              ,request_by=${db.escape(req.body.request_by)}
              ,request_date=${db.escape(req.body.request_date)}
              ,approved_by=${db.escape(req.body.approved_by)}
              ,shipping_method=${db.escape(req.body.shipping_method)}
              ,delivery_terms=${db.escape(req.body.delivery_terms)}
              WHERE project_id = ${db.escape(req.body.project_id)}`,
      (err, result) => {
       
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Tender has been removed successfully'
              });
        }
       }
    );
  });

  
  app.post('/insertMaterialRequest', (req, res, next) => {
  
    let data = {
      mr_code:req.body.mr_code
       ,company_id_supplier: req.body.company_id_supplier
      , contact_id_supplier: req.body.contact_id_supplier
      , delivery_terms: req.body.delivery_terms
      , status: req.body.status
      , project_id: req.body.project_id
      , flag: req.body.flag
      , creation_date: req.body.creation_date
      , modification_date: req.body.modification_date
      , created_by: req.body.created_by
      , modified_by: req.body.modified_by
      , supplier_reference_no: req.body.supplier_reference_no
      , our_reference_no	: req.body.our_reference_no	
      , shipping_method: req.body.shipping_method
      , payment_terms: req.body.payment_terms
      , delivery_date: req.body.delivery_date
      , mr_date: req.body.mr_date
      , shipping_address_flat: req.body.shipping_address_flat
      , shipping_address_street: req.body.shipping_address_street
      , shipping_address_country: req.body.shipping_address_country
      , shipping_address_po_code: req.body.shipping_address_po_code
      , expense_id: req.body.expense_id
      , staff_id: req.body.staff_id
      , materials_request_date: req.body.materials_request_date
      , payment_status: req.body.payment_status
      , title: req.body.title
      , priority: req.body.priority
      , follow_up_date: req.body.follow_up_date
      , notes: req.body.notes
      , supplier_inv_code: req.body.supplier_inv_code
      , gst: req.body.gst
      , gst_percentage: req.body.gst_percentage
      , project_name: req.body.project_name
      , site_reference: req.body.site_reference
      , request_by: req.body.request_by
      , request_date: req.body.request_date
      , approved_by: req.body.approved_by
      , approved_date: req.body.approved_date
   };
    let sql = "INSERT INTO materials_request SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Tender has been removed successfully'
            });
      }
    });
  });
  
  app.delete('/deleteMaterialsRequest', (req, res, next) => {
  
    let data = {mr_code: req.body.mr_code};
    let sql = "DELETE FROM materials_request WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Tender has been removed successfully'
            });
      }
    });
  });
  
  app.get('/TabMaterialRequestlineitems', (req, res, next) => {
    db.query(`SELECT 
    mrli.quantity
    ,mrli.unit
    ,mrli.amount
    ,mrli.item_title
    ,mrli.supplier_id
    ,mrli.description FROM materials_request_line_items mrli 
    LEFT JOIN supplier s ON (s.supplier_id = mrli.supplier_id) WHERE mrli.materials_request_id != '' ORDER BY mrli.item_title ASC;`,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Tender has been removed successfully'
              });
        
        }
   
      }
    );
  });
  
  app.post('/editTabMaterialRequestlineitems', (req, res, next) => {
    db.query(`UPDATE materials_request_line_items
              SET quantity=${db.escape(req.body.quantity)}
              ,unit=${db.escape(req.body.unit)}
              ,amount=${db.escape(req.body.amount)}
              ,item_title=${db.escape(req.body.item_title)}
              ,supplier_id=${db.escape(req.body.supplier_id)}
              ,description=${db.escape(req.body.description)}
              WHERE materials_request_id = ${db.escape(req.body.materials_request_id)}`,
      (err, result) => {
       
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Tender has been removed successfully'
              });
        }
       }
    );
  });
  
  app.post('/insertMaterialRequestLineItems', (req, res, next) => {
  
    let data = {
      materials_request_id:req.body.materials_request_id
       ,item_title: req.body.item_title
      , quantity: req.body.quantity
      , unit: req.body.unit
      , amount: req.body.amount
      , description: req.body.description
      , creation_date: req.body.creation_date
      , modification_date: req.body.modification_date
      , created_by: req.body.created_by
      , modified_by: req.body.modified_by
      , status: req.body.status
      , cost_price: req.body.cost_price
      , selling_price	: req.body.selling_price	
      , qty_requested: req.body.qty_requested
      , qty: req.body.qty
      , product_id: req.body.product_id
      , supplier_id: req.body.supplier_id
      , gst: req.body.gst
      , damage_qty: req.body.damage_qty
      , brand: req.body.brand
      
   };
    let sql = "INSERT INTO materials_request_line_items SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Tender has been removed successfully'
            });
      }
    });
  });
  
  app.delete('/deleteMaterialsRequestLineItems', (req, res, next) => {
  
    let data = {materials_request_id: req.body.materials_request_id};
    let sql = "DELETE FROM materials_request_line_items WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Tender has been removed successfully'
            });
      }
    });
  });

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData);
    res.send('This is the secret content. Only logged in users can see that!');
  });
  
  module.exports = app;