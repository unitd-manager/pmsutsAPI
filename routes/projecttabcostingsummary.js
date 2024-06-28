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

app.post('/getTabCostingSummary', (req, res, next) => {
    db.query(`SELECT 
    c.no_of_worker_useds
    ,c.no_of_days_worked
    ,c.labour_rates_per_day
    ,c.po_price
    ,c.po_price_with_gst
    ,c.profit_percentage
    ,c.profit
    ,c.total_material_price
    ,c.transport_charges
    ,c.total_labour_charges
    ,c.salesman_commission
    ,c.finance_charges
    ,c.office_overheads
    ,c.other_charges
    ,c.total_cost of FROM costing_summary c WHERE c.project_id =${db.escape(req.body.project_id)} ORDER BY c.costing_summary_id DESC`,
      (err, result) =>{
        if (err) {
             return res.status(400).send({
                  data: err,
                  msg:'err'
                });
          } else {
              if(result.length === 0){
                return res.status(400).send({
                  msg:'err'
                });
              }else{
                    return res.status(200).send({
                  data: result,
                  msg:'Success'
                });
              }
  
          }
   
      }
    );
  });
  
  app.post('/getTabCostingSummaryById', (req, res, next) => {
    db.query(`SELECT 
     c.no_of_days_worked
    ,c.labour_rates_per_day
    ,c.po_price
    ,c.po_price_with_gst
    ,c.profit_percentage
    ,c.invoiced_price
    ,c.profit
    ,c.total_material_price
    ,c.transport_charges
    ,c.total_labour_charges
    ,c.salesman_commission
    ,c.finance_charges
    ,c.office_overheads
    ,c.other_charges
    ,c.total_cost
    FROM costing_summary c 
    WHERE c.project_id =${db.escape( req.body.project_id)} 
    ORDER BY c.costing_summary_id DESC`,
      (err, result) =>{
        if (err) {
             return res.status(400).send({
                  data: err,
                  msg:'err'
                });
          } else {
              if(result.length == 0){
                return res.status(400).send({
                  msg:'err'
                });
              }else{
                    return res.status(200).send({
                  data: result,
                  msg:'Success'
                });
              }
  
          }
   
      }
    );
  });

 
 app.post('/getCostingSummaryChargesById', (req, res, next) => {
    db.query(`SELECT 
    ac.date,
    ac.description,
    ac.amount ,
    c.costing_summary_id,
    c.project_id,
    (SELECT SUM(amount) FROM actual_costing_summary WHERE costing_summary_id=c.costing_summary_id) AS transport_charges,
    ac.actual_costing_summary_id
     FROM actual_costing_summary ac  
     LEFT JOIN costing_summary c ON (ac.costing_summary_id = c.costing_summary_id) 
     WHERE ac.project_id = ${db.escape( req.body.project_id)} AND title = ${db.escape( req.body.title)} `,
     (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
  }
 );
});

 app.post('/insertTransportCharges', (req, res, next) => {
    let data = {
      costing_summary_id: req.body.costing_summary_id,
      project_id:req.body.project_id,
      actual_costing_summary_id: req.body.actual_costing_summary_id,
      date: req.body.date,
      amount: req.body.amount,
      description: req.body.description,
      title:req.body.type
    }
    let sql = 'INSERT INTO actual_costing_summary SET ?'
    let query = db.query(sql, data, (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
 }
 );
});

app.post('/getTabCostingSummaryById', (req, res, next) => {
    db.query(`SELECT 
     c.no_of_days_worked
    ,c.labour_rates_per_day
    ,c.po_price
    ,c.po_price_with_gst
    ,c.profit_percentage
    ,c.invoiced_price
    ,c.profit
    ,(SELECT SUM(amount) FROM actual_costing_summary WHERE costing_summary_id=c.costing_summary_id) AS Charges
    ,c.total_material_price
    ,c.transport_charges
    ,ac.title 
    ,c.total_labour_charges
    ,c.salesman_commission
    ,c.finance_charges
    ,c.office_overheads
    ,c.other_charges
    ,c.total_cost of 
    FROM costing_summary c 
    LEFT JOIN actual_costing_summary ac ON (c.costing_summary_id = ac.costing_summary_id)
    WHERE c.project_id =${db.escape( req.body.project_id)} 
    ORDER BY c.costing_summary_id DESC`,
      (err, result) =>{
        if (err) {
             return res.status(400).send({
                  data: err,
                  msg:'err'
                });
          } else {
              if(result.length == 0){
                return res.status(400).send({
                  msg:'err'
                });
              }else{
                    return res.status(200).send({
                  data: result,
                  msg:'Success'
                });
              }
  
          }
   
    }
     );
   });
   
   app.post('/getCostingSummaryproject', (req, res, next) => {
    db.query(`SELECT p.*
                    ,p.title AS Project_name,
  (SELECT SUM(amount) 
  FROM actual_costing_summary 
  WHERE title = 'Transport Charges' 
  AND project_id = p.project_id) as transport_charges,
  (SELECT SUM(amount) 
  FROM actual_costing_summary 
  WHERE title = 'Other Charges' 
  AND project_id = p.project_id) as other_charges,
  (SELECT SUM(amount) 
  FROM actual_costing_summary 
  WHERE title = 'Total Labour Charges' 
  AND project_id = p.project_id) as labour_charges,
  (SELECT SUM(amount) 
  FROM actual_costing_summary 
  WHERE title = 'Salesman Commission' 
  AND project_id = p.project_id) as sales_commision,
  (SELECT SUM(amount) 
  FROM actual_costing_summary 
  WHERE title = 'Finance Charges' 
  AND project_id = p.project_id) as finance_charges,
  (SELECT SUM(amount) 
  FROM actual_costing_summary 
  WHERE title = 'Office Overheads' 
  AND project_id = p.project_id) as office_overheads
  FROM project p
  WHERE p.project_id = ${db.escape(req.body.project_id)}`,
      (err, result) => {
         
        if (err) {
          return res.status(400).send({
            msg: err
          });
        } else {
              return res.status(200).send({
                data: result[0],
                msg:'Success'
                
              });
  
          }
   
      }
    );
  });
 app.post('/insertCostingCharges', (req, res, next) => {
    let data = {
      costing_summary_id: req.body.costing_summary_id,
      project_id:req.body.project_id,
      actual_costing_summary_id: req.body.actual_costing_summary_id,
      date: req.body.date,
      amount: req.body.amount,
      description: req.body.description,
      title:req.body.title
    }
    let sql = 'INSERT INTO actual_costing_summary SET ?'
    let query = db.query(sql, data, (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
   }
 );
});
  module.exports = app;