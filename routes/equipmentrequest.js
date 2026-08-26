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

app.get('/getEquipmentRequest', (req, res, next) => {
  db.query(`select
  lr.equipment_request_id
  ,lr.project_id
  ,lr.equipment_request_code
  ,lr.equipment_request_date
  ,lr.request_date
  ,lr.site_reference
  ,lr.approved_by
            ,lr.approved_date
            ,lr.shipping_method
            ,lr.payment_terms
            ,lr.equipment_status
            ,lr.delivery_terms
            ,lr.request_by
  ,lr.creation_date
  ,lr.modification_date
  ,p.title AS proj_title
  ,p.project_code
  From equipment_request lr
  LEFT JOIN (project p)   ON (p.project_id   = lr.project_id) 
            where lr.equipment_request_id  !=''`,
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
            });

        }
 
    }
  );
});


app.post('/getEquipmentRequestById', (req, res, next) => {
  db.query(`select
  lr.equipment_request_id
  ,lr.project_id
  ,lr.equipment_request_code
  ,lr.equipment_request_date
  ,lr.request_date
  ,lr.site_reference
  ,lr.approved_by
  ,lr.request_by
            ,lr.approved_date
            ,lr.shipping_method
            ,lr.payment_terms
            ,lr.delivery_terms
            ,lr.equipment_status
  ,lr.creation_date
  ,lr.modification_date
  ,lr.created_by
  ,lr.modified_by
  ,p.title AS proj_title
  ,p.project_code
  From equipment_request lr
  LEFT JOIN (project p)   ON (p.project_id   = lr.project_id) 
            where lr.equipment_request_id = ${db.escape(req.body.equipment_request_id)}`,
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
            });

        }
 
    }
  );
});


app.post('/editEquipmentRequest', (req, res, next) => {
  db.query(`UPDATE equipment_request 
            SET 
            project_id=${db.escape(req.body.project_id)}
            ,request_date=${db.escape(req.body.request_date)}
            ,request_by=${db.escape(req.body.request_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,equipment_request_date=${db.escape(req.body.equipment_request_date)}
            ,equipment_status=${db.escape(req.body.equipment_status)}
            ,site_reference=${db.escape(req.body.site_reference)}
            ,delivery_terms=${db.escape(req.body.delivery_terms)}
            ,approved_by=${db.escape(req.body.approved_by)}
            ,approved_date=${db.escape(req.body.approved_date)}
            ,payment_terms=${db.escape(req.body.payment_terms)}
            ,shipping_method=${db.escape(req.body.shipping_method)}
            WHERE equipment_request_id = ${db.escape(req.body.equipment_request_id)}`,
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
            });
      }
     }
  );
});

app.post('/insertEquipmentRequest', (req, res, next) => {

  let data = {
    equipment_request_id:req.body.equipment_request_id	
   , project_id: req.body.project_id
   , equipment_request_code:req.body.equipment_request_code	
   , creation_date: req.body.creation_date
   , modification_date: req.body.modification_date
   , request_date: req.body.request_date
  
  };
  let sql = "INSERT INTO equipment_request SET ?";
  let query = db.query(sql, data,(err, result) => {
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
          });
    }
  });
});

app.post('/deleteEquipmentRequest', (req, res, next) => {

  let data = {equipment_request_id: req.body.equipment_request_id};
  let sql = "DELETE FROM equipment_request WHERE ?";
  let query = db.query(sql, data,(err, result) => {
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
          });
    }
  });
});






app.get('/getProject', (req, res, next) => {
  db.query(`SELECT p.title
  ,p.category
  ,p.status
  ,p.contact_id
  ,p.start_date
  ,p.estimated_finish_date
  ,p.description
  ,p.project_manager_id
  ,p.project_id
  ,p.project_code
  ,CONCAT_WS('/', p.title, p.project_code)  AS project_title
  ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name 
  ,c.company_name 
  ,c.company_size 
  ,c.source ,c.industry 
  ,o.opportunity_code 
  ,cont.first_name
  ,( SELECT GROUP_CONCAT( CONCAT_WS(' ', stf.first_name, stf.last_name) 
  ORDER BY CONCAT_WS(' ', stf.first_name, stf.last_name) SEPARATOR ', ' ) 
  FROM staff stf ,project_staff ts 
  WHERE ts.project_id = p.project_id AND stf.staff_id = ts.staff_id ) 
  AS staff_name ,ser.title as service_title ,CONCAT_WS(' ', s.first_name, s.last_name) 
  AS project_manager_name ,(p.project_value - (IF(ISNULL(( SELECT SUM(invoice_amount) 
  FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id)
 WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ),0, ( SELECT SUM(invoice_amount) 
  FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id) 
  WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ))) AS still_to_bill FROM project p LEFT JOIN (contact cont) ON (p.contact_id = cont.contact_id)LEFT JOIN (company c)ON (p.company_id = c.company_id) 
  LEFT JOIN (service ser) ON (p.service_id = ser.service_id) LEFT JOIN (staff s) ON (p.project_manager_id = s.staff_id) LEFT JOIN (opportunity o) ON (p.opportunity_id = o.opportunity_id) WHERE ( LOWER(p.status) = 'wip' OR LOWER(p.status) = 'billable' OR LOWER(p.status) = 'billed' ) AND ( LOWER(p.status) = 'wip' OR LOWER(p.status) ='billable' OR LOWER(p.status) = 'billed') ORDER BY p.project_code DESC`,
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

app.post('/insertQuoteItems', (req, res, next) => {

  let data = {
    product_id:req.body.product_id
    , amount: req.body.amount
    , type: req.body.type
    , status: req.body.status
    , equipment_request_id: req.body.equipment_request_id
    , product_id: req.body.product_id
    , supplier_id:req.body.supplier_id

    , quantity: req.body.quantity
    , creation_date: req.body.creation_date
    , created_by: req.body.created_by
    , modified_by: req.body.modified_by
    , unit: req.body.unit
    , remarks: req.body.remarks
    
    , brand: req.body.brand
    , unit_price: req.body.unit_price
  
 };
  let sql = "INSERT INTO equipment_request_item SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
            data: err,
            msg:'Failed'
          });
    } else {
          return res.status(200).send({
            data: result,
            msg:'New quote item has been created successfully'
          });
    }
  });
});

app.post('/getMRLineItemsById', (req, res, next) => {
  db.query(`select mri.*
  ,p.title AS product_name
  ,sr.company_name AS supplier_name
            From equipment_request_item mri
            LEFT JOIN (product p)   ON (p.product_id   = mri.product_id) 
            LEFT JOIN (supplier sr)   ON (sr.supplier_id   = mri.supplier_id) 
            Where mri.equipment_request_id =${db.escape(req.body.equipment_request_id)}`,
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
            });

        }
 
    }
  );
});

app.post('/editEquipmentRequestItem', (req, res, next) => {
  db.query(`UPDATE equipment_request_item 
            SET brand =${db.escape(req.body.brand)}
            ,quantity=${db.escape(req.body.quantity)}
            ,unit=${db.escape(req.body.unit)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,unit_price=${db.escape(req.body.unit_price)}
            ,amount=${db.escape(req.body.amount)}
            WHERE equipment_request_item_id = ${db.escape(req.body.equipment_request_item_id)}`,
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
            });
      }
     }
  );
});
  
app.post('/deleteEquipmentRequestItem', (req, res, next) => {

  let data = {equipment_request_item_id: req.body.equipment_request_item_id};
  let sql = "DELETE FROM equipment_request_item WHERE ?";
  let query = db.query(sql, data,(err, result) => {
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
          });
    }
  });
});



app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;