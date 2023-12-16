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

app.post('/SubConWorkOrderPortal', (req, res, next) => {
  db.query(`SELECT 
  q.sub_con_work_order_id
  ,q.work_order_date
  ,q.sub_con_id
  ,q.status
  ,q.project_reference
  ,q.project_location
  ,q.quote_reference
  ,q.quote_date
  ,q.sub_con_worker_code
  ,q.work_order_due_date
  ,q.completed_date
  ,s.company_name
   ,(SELECT SUM(woi.unit_rate*woi.quantity)
    FROM work_order_line_items woi
    WHERE q.sub_con_work_order_id= woi.sub_con_work_order_id ) AS po_amount
   FROM sub_con_work_order q 
   LEFT JOIN (project p) ON (p.project_id = q.project_id) 
   LEFT JOIN (sub_con s) ON (s.sub_con_id = q.sub_con_id)
   WHERE p.project_id =${db.escape(req.body.project_id)} 
ORDER BY q.sub_con_id ASC`,
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
 

app.get("/getSubCon", (req, res, next) => {
  db.query(`SELECT * FROM sub_con`, (err, result) => {
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

  app.post('/editWorkOrderPortal', (req, res, next) => {
    db.query(`UPDATE sub_con_work_order
              SET work_order_due_date=${db.escape(req.body.work_order_due_date)}
              ,completed_date=${db.escape(req.body.completed_date)}
              ,project_location=${db.escape(req.body.project_location)}
              ,project_reference=${db.escape(req.body.project_reference)}
              ,work_order_date=${db.escape(req.body.work_order_date)}
              ,sub_con_id=${db.escape(req.body.sub_con_id)}
              ,quote_reference=${db.escape(req.body.quote_reference)}
              ,status=${db.escape(req.body.status)}
              ,quote_date=${db.escape(req.body.quote_date)}
              WHERE sub_con_work_order_id = ${db.escape(req.body.sub_con_work_order_id)}`,
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

  app.post('/insertsub_con_work_order', (req, res, next) => {

    let data = {sub_con_work_order_id: req.body.sub_con_work_order_id,
                sub_con_worker_code: req.body.sub_con_worker_code,
                work_order_date:  new Date(),
                work_order_due_date: req.body.work_order_due_date,
                completed_date: req.body.completed_date,
                project_id: req.body.project_id,
                sub_con_id: req.body.sub_con_id,
                work_order: req.body.work_order,
                status:'New',
                creation_date: req.body.creation_date,
                modification_date: req.body.modification_date,
                created_by: req.body.created_by,
                modified_by: req.body.modified_by,
                project_location: req.body.project_location,
                project_reference: req.body.project_reference,
                condition: req.body.condition,
                quote_date: req.body.quote_date,
                quote_reference: req.body.quote_reference,};
    let sql = "INSERT INTO sub_con_work_order  SET ?";
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
  app.delete('/deletesub_con_work_order', (req, res, next) => {

    let data = {sub_con_work_order_id : req.body.sub_con_work_order_id };
    let sql = "DELETE FROM sub_con_work_order WHERE ?";
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

  app.post('/getWorkOrderBy', (req, res, next) => {
    db.query(` SELECT 
                 woi.work_order_line_items_id
                ,woi.quantity
                ,woi.unit
                ,woi.description
                ,woi.unit_rate
                ,woi.amount
                ,(woi.quantity*woi.unit_rate) AS amount
                ,woi.remarks
          FROM work_order_line_items woi
          WHERE woi.project_id=${db.escape(req.body.project_id)} 
          AND woi.sub_con_work_order_id=${db.escape(req.body.sub_con_work_order_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } 
      if (result.length == 0) {
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
   app.post('/getWorkOrderAmountBy', (req, res, next) => {
    db.query(`SELECT SUM(woi.unit_rate*woi.quantity) AS po_amount
              FROM work_order_line_items woi
              LEFT JOIN (sub_con_work_order q) ON q.sub_con_work_order_id=woi.sub_con_work_order_id
              WHERE woi.project_id=${db.escape(req.body.project_id)} 
              AND woi.sub_con_work_order_id=${db.escape(req.body.sub_con_work_order_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } 
      if (result.length == 0) {
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
   app.post('/editWorkOrder', (req, res, next) => {
      db.query(`UPDATE work_order_line_items
                SET quantity=${db.escape(req.body.quantity)}
                ,quantity=${db.escape(req.body.quantity)}
                ,unit=${db.escape(req.body.unit)}
                ,description=${db.escape(req.body.description)}
                ,unit_rate=${db.escape(req.body.unit_rate)}
                ,amount=${db.escape(req.body.amount)}
                ,remarks=${db.escape(req.body.remarks)}
                WHERE work_order_line_items_id = ${db.escape(req.body.work_order_line_items_id)}`,
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
  
  app.post('/insertWorkOrderLineIteam', (req, res, next) => {

      let data = {work_order_line_items_id:req.body.work_order_line_items_id,
                  quote_category_id: req.body.quote_category_id,
                  description: req.body.description,
                  amount: req.body.amount,
                  unit_rate: req.body.unit_rate,
                  item_type: req.body.item_type,
                  sort_order: req.body.sort_order,
                  creation_date: req.body.creation_date,
                  modification_date: req.body.modification_date,
                  title: req.body.title,
                  sub_con_work_order_id: req.body.sub_con_work_order_id,
                  actual_amount: req.body.actual_amount,
                  supplier_amount: req.body.supplier_amount,
                  quantity: req.body.quantity,
                  project_id: req.body.project_id,
                  created_by: req.body.created_by,
                  modified_by: req.body.modified_by,
                  unit: req.body.unit,
                  remarks: req.body.remarks,
                  part_no: req.body.part_no,};
      let sql = "INSERT INTO work_order_line_items  SET ?";
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
app.post('/PaymentHistoryPortal', (req, res, next) => {
  db.query(`SELECT 
  sr.amount
  ,sr.creation_date AS date
  ,sr.mode_of_payment
  ,sr.sub_con_payments_id
  ,sr.sub_con_id
  ,srh.sub_con_work_order_id
  ,sr.company_name FROM sub_con_payments_history srh LEFT JOIN (sub_con_payments sr) ON (sr.sub_con_payments_id = srh.sub_con_payments_id) LEFT JOIN (sub_con sc) ON (sc.sub_con_id = sr.sub_con_id) WHERE sr.project_id = ${db.escape(req.body.project_id)} AND sr.status != 'Cancelled'
  ORDER BY srh.sub_con_payments_history_id`,
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
 
app.post('/SubConPaymentHistory', (req, res, next) => {
  db.query(`SELECT sr.amount
  ,srh.creation_date AS date
  ,sr.mode_of_payment
  ,sr.status
  ,sr.sub_con_payments_id
  ,sr.sub_con_id
  ,s.company_name
  ,srh.sub_con_work_order_id
FROM sub_con_payments_history srh
LEFT JOIN (sub_con_payments sr) ON (sr.sub_con_payments_id = srh.sub_con_payments_id)
  LEFT JOIN (sub_con s) ON (s.sub_con_id = sr.sub_con_id)
WHERE sr.sub_con_work_order_id =${db.escape(req.body.sub_con_work_order_id)}
ORDER BY srh.sub_con_payments_history_id;`,
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

module.exports = app;