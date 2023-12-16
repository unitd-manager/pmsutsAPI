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

app.get('/getTabClaimPaymentPortal', (req, res, next) => {
  db.query(`SELECT cp.date,cp.claim_seq
            ,cp.claim_payment_id
            ,cp.amount
            ,cp.created_by
            ,cp.creation_date
            ,cp.status
            ,cp.claim_amount
            , SUM(amount) AS claim_amount,count(claim_payment_id) AS countRec 
            FROM claim_payment cp WHERE cp.project_id != ' ' AND cp.project_claim_id != '' 
            GROUP BY cp.claim_seq;`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

          }
   
      }
    );
  });

  app.post('/getTabClaimPaymentPortalById', (req, res, next) => {
    db.query(`SELECT 
               cp.claim_seq
               ,cp.date
                ,cp.claim_payment_id
              ,cp.amount
              ,cp.created_by
              ,cp.creation_date
              ,cp.status
              ,cp.claim_amount
              , SUM(amount) AS claim_amount,count(claim_payment_id) AS countRec 
              FROM claim_payment cp WHERE cp.project_id =${db.escape(req.body.project_id)} AND cp.project_claim_id = ${db.escape(req.body.project_claim_id)}
              GROUP BY cp.claim_seq
              ORDER BY cp.claim_payment_id `,
      (err, result) => {
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
            }
     
        }
      );
    });
  
  app.post('/insertClaimPaymenttable', (req, res, next) => {

    let data = {project_claim_id: req.body.project_claim_id,
                claim_line_items_id: req.body.claim_line_items_id,
                date: req.body.date,
                claim_seq: req.body.claim_seq,
                amount: req.body.amount,
                project_id: req.body.project_id,
                created_by: req.body.created_by,
                creation_date: req.body.creation_date,
                modified_by: req.body.modified_by,
                modification_date: req.body.modification_date,
                claim_amount: req.body.claim_amount,
                description: req.body.description,
                status: req.body.status,
                gst: req.body.gst,
                total_amount: req.body.total_amount,
              };
    let sql = "INSERT INTO claim_payment SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.post('/insertClaimLineItems', (req, res, next) => {

    let data = {project_claim_id: req.body.project_claim_id,
                title: req.body.title,
                description: req.body.description,
                amount: req.body.amount,
                amount_other: req.body.amount_other,
                item_type: req.body.item_type,
                sort_order: req.body.sort_order,
                creation_date: req.body.creation_date,
                modification_date: req.body.modification_date,
                quantity: req.body.quantity,
                project_id: req.body.project_id,
                created_by: req.body.created_by,
                modified_by: req.body.modified_by,
                unit: req.body.unit,
                remarks: req.body.remarks,
                status: req.body.status,

              };
    let sql = "INSERT INTO claim_line_items SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.post('/insertProjectClaim', (req, res, next) => {

    let data = {claim_no: req.body.claim_no,
                project_id: req.body.project_id,
                client_id: req.body.client_id,
                project_title: req.body.project_title,
                description: req.body.description,
                po_quote_no: req.body.po_quote_no,
                ref_no: req.body.ref_no,
                claim_date: req.body.claim_date,
                status: req.body.status,
                amount: req.body.amount,
                created_by: req.body.created_by,
                creation_date: req.body.creation_date,
                modified_by: req.body.modified_by,
                modification_date: req.body.modification_date,
                variation_order_submission: req.body.variation_order_submission,
                value_of_contract_work_done: req.body.value_of_contract_work_done,
                vo_claim_work_done: req.body.vo_claim_work_done,
                claim_code: req.body.claim_code,
                less_previous_retention: req.body.less_previous_retention,
              };
    let sql = "INSERT INTO project_claim SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.delete('/deleteproject_claim', (req, res, next) => {

    let data = {project_claim_id : req.body.project_claim_id};
    let sql = "DELETE FROM project_claim WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.delete('/deleteclaim_line_items', (req, res, next) => {

    let data = {claim_line_items_id : req.body.claim_line_items_id };
    let sql = "DELETE FROM claim_line_items WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.delete('/deleteclaim_payment', (req, res, next) => {

    let data = {claim_payment_id : req.body.claim_payment_id };
    let sql = "DELETE FROM claim_payment WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });
  
  
  app.post('/TabClaimPortal', (req, res, next) => {
    db.query(`SELECT 
    pc.claim_date
    ,pc.project_title
    ,pc.project_id
    ,pc.project_claim_id
    ,pc.ref_no
    ,pc.variation_order_submission
    ,pc.vo_claim_work_done
    ,pc.status
    ,pc.description
    ,pc.po_quote_no
    ,pc.value_of_contract_work_done
    ,pc.less_previous_retention
    ,pc.amount
    ,c.company_name FROM project_claim pc 
    LEFT JOIN (project p) ON (p.project_id = pc.project_id) LEFT JOIN (company c) ON (c.company_id = pc.client_id) WHERE pc.project_id =${db.escape(req.body.project_id)} `,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
          }
   
      }
    );
  });
  
  app.post('/editTabClaimPortal', (req, res, next) => {
    db.query(`UPDATE project_claim
              SET claim_date=${db.escape(req.body.claim_date)}
              ,project_title=${db.escape(req.body.project_title)}
              ,ref_no=${db.escape(req.body.ref_no)}
              ,variation_order_submission=${db.escape(req.body.variation_order_submission)}
              ,vo_claim_work_done=${db.escape(req.body.vo_claim_work_done)}
              ,description=${db.escape(req.body.description)}
              ,po_quote_no=${db.escape(req.body.po_quote_no)}
              ,value_of_contract_work_done=${db.escape(req.body.value_of_contract_work_done)}
              ,less_previous_retention=${db.escape(req.body.less_previous_retention)}
              ,amount=${db.escape(req.body.amount)}
                          WHERE project_claim_id = ${db.escape(req.body.project_claim_id)}`,
      (err, result) => {
       
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
        }
       }
    );
  });
  
  app.get('/TabClaimPortalLineItem', (req, res, next) => {
    db.query(`SELECT 
    ct.title
    ,ct.description
    ,ct.amount
    ,ct.status FROM claim_line_items ct LEFT JOIN project_claim pc ON (pc.project_claim_id = ct.project_claim_id) WHERE pc.project_id != '' AND ct.project_claim_id != '' ORDER BY ct.claim_line_items_id ASC`,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
          }
   
      }
    );
  });

  app.get('/TabClaimPortalLineItem', (req, res, next) => {
    db.query(`SELECT 
    ct.title
    ,ct.description
    ,ct.amount
    ,ct.project_claim_id
    ,ct.status FROM claim_line_items ct LEFT JOIN project_claim pc ON (pc.project_claim_id = ct.project_claim_id) WHERE pc.project_id = ${db.escape(req.body.project_id)} AND ct.project_claim_id = ${db.escape(req.body.project_claim_id)} ORDER BY ct.claim_line_items_id ASC`,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
          }
   
      }
    );
  });
  
  app.post('/editTabClaimPortalLineItem', (req, res, next) => {
    db.query(`UPDATE claim_line_items
              SET title=${db.escape(req.body.title)}
              ,description=${db.escape(req.body.description)}
              ,amount=${db.escape(req.body.amount)}
                          WHERE project_id = ${db.escape(req.body.project_id)} AND project_claim_id = ${db.escape(req.body.project_claim_id)}`,
      (err, result) => {
       
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
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