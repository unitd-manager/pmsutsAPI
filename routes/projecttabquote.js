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

app.post('/getTabQuoteById', (req, res, next) => {
    db.query(`SELECT
    q.quote_id
    ,q.project_id 
    ,q.quote_date
    ,q.quote_status
    ,q.quote_code
    ,q.project_location
    ,q.project_reference
    ,q.payment_method
    ,q.ref_no_quote
    ,q.revision
    ,q.total_amount
    ,q.discount
    ,q.drawing_nos
     FROM quote q 
    LEFT JOIN (project p) ON (p.project_id = q.project_id)
    WHERE q.project_id =${db.escape( req.body.project_id)} 
    ORDER BY q.quote_code DESC`,
    (err, result) => {
       
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


app.post('/editTabQuote', (req, res, next) => {
    db.query(`UPDATE quote
              SET revision=${db.escape(req.body.revision)}
              ,discount=${db.escape(req.body.discount)}
              ,quote_status=${db.escape(req.body.quote_status)}
              ,quote_date=${db.escape(req.body.quote_date)}
              ,project_location=${db.escape(req.body.project_location)}
              ,drawing_nos=${db.escape(req.body.drawing_nos)}
              ,ref_no_quote=${db.escape(req.body.ref_no_quote)}
              ,total_amount=${db.escape(req.body.total_amount)}
              ,payment_method=${db.escape(req.body.payment_method)}
              WHERE project_id = ${db.escape(req.body.project_id)}  AND quote_id =${db.escape(req.body.quote_id)}`,
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



app.get('/getTabQuote', (req, res, next) => {
    db.query(`SELECT 
     q.quote_id
    ,q.project_id
    ,q.quote_date
    ,q.quote_status
    ,q.quote_code
    ,q.project_location
    ,q.project_reference
    ,q.payment_method
    ,q.ref_no_quote
    ,q.discount
    ,q.revision
    ,q.drawing_nos
     FROM quote q 
    LEFT JOIN (project p) ON (p.project_id = q.project_id) WHERE p.project_id != '' ORDER BY q.quote_code DESC;`,
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


app.post('/TabQuote', (req, res, next) => {
    db.query(`UPDATE quote
              SET  
              quote_date=${db.escape(req.body.quote_date)}
              ,discount=${db.escape(req.body.discount)}
              ,project_location=${db.escape(req.body.project_location)}
              ,project_reference=${db.escape(req.body.project_reference)}
              ,ref_no_quote=${db.escape(req.body.ref_no_quote)}
              ,revision=${db.escape(req.body.revision)}
              WHERE  project_id = ${db.escape(req.body.project_id)}`,
              (err, result) => {
       
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
          
          app.post('/getTabQuotelogById', (req, res, next) => {
  db.query(`SELECT
  ql.quote_log_id
  ,ql.quote_id
  ,ql.project_id 
  ,ql.quote_date
  ,ql.quote_status
  ,ql.quote_code
  ,ql.project_location
  ,ql.project_reference
  ,ql.payment_method
  ,ql.ref_no_quote
  ,ql.revision
  ,ql.total_amount
  ,ql.discount
  ,ql.drawing_nos
   FROM quote_log ql 
  LEFT JOIN (project p) ON (p.project_id = ql.project_id)
  WHERE ql.project_id =${db.escape( req.body.project_id)} 
  ORDER BY ql.quote_code DESC`,
  (err, result) => {
     
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

app.post('/insertQuote', (req, res, next) => {

    let data = {
       opportunity_id: req.body.opportunity_id
      , project_id: req.body.project_id
      , quote_code: req.body.quote_code
      , quote_date: req.body.quote_date
      , quote_status: req.body.quote_status
      
      , project_location: req.body.project_location
      , project_reference: req.body.project_reference
      , discount: req.body.discount
      , gst: req.body.gst
      , payment_method: req.body.payment_method
      , drawing_nos: req.body.drawing_nos
      , intro_quote: req.body.intro_quote
      , our_reference: req.body.our_reference
      , total_amount: req.body.total_amount
      , revision: req.body.revision
      , employee_id: req.body.employee_id
      , ref_no_quote: req.body.ref_no_quote
      , intro_drawing_quote: req.body.intro_drawing_quote
      , show_project_manager: req.body.show_project_manager
    };
    let sql = "INSERT INTO quote SET ?";
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
  
  app.post('/getTabQuoteItemslogById', (req, res, next) => {
    db.query(`SELECT
    qlt.quote_log_id
    ,qlt.quote_id
    ,qlt.project_id 
    ,qlt.quote_date
    ,qlt.quote_status
    ,qlt.quote_code
    ,qlt.revision
    ,qlt.total_amount
    ,qlt.discount
    ,qlt.drawing_nos
     FROM quote_items_log qlt 
    LEFT JOIN (project p) ON (p.project_id = qlt.project_id)
    WHERE qlt.project_id =${db.escape( req.body.project_id)} 
    ORDER BY qlt.quote_code DESC`,
    (err, result) => {
       
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
  
  
  app.post('/insertQuoteitemsLog', (req, res, next) => {

    let data = {
     
       project_id: req.body.project_id
      ,quote_id:req.body.quote_id
      ,quote_log_id:req.body.quote_log_id
      ,quote_items_log_id:req.body.quote_items_log_id
      , title: req.body.title
      , description: req.body.description
      , quantity: req.body.quantity
      , unit: req.body.unit
      , unit_price: req.body.unit_price
      , amount: req.body.revision
    };
    let sql = "INSERT INTO quote_items_log SET ?";
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


app.delete('/deleteQuote', (req, res, next) => {
  
    let data = {opportunity_id: req.body.opportunity_id};
    let sql = "DELETE FROM quote WHERE ?";
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

app.get('/getTabQuoteLineItems', (req, res, next) => {
    db.query(`SELECT 
    qt.title
    ,qt.description
    ,qt.quantity
    ,qt.unit
    ,qt.quote_items_id
    ,qt.project_id
    ,qt.unit_price
    ,qt.amount FROM quote_items qt WHERE  qt.quote_id != ''`,
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
app.post('/getTabQuoteLineItemsById', (req, res, next) => {
    db.query(`SELECT 
    qt.title
    ,qt.description
    ,qt.quantity
    ,qt.unit
    ,qt.quote_items_id
    ,qt.unit_price
    ,qt.project_id
    ,qt.quote_id
    ,qt.amount 
    FROM quote_items qt WHERE  qt.quote_id =${db.escape( req.body.quote_id)} `,
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

 app.post('/editTabQuoteLineItems', (req, res, next) => {
    db.query(`UPDATE quote_items
              SET title=${db.escape(req.body.title)}
              ,description=${db.escape(req.body.description)}
              ,quantity=${db.escape(req.body.quantity)}
              ,unit=${db.escape(req.body.unit)}
              ,unit_price=${db.escape(req.body.unit_price)}
              ,amount=${db.escape(req.body.amount)}
             
              WHERE project_id = ${db.escape(req.body.project_id)}  `,
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

  
  app.post('/insertQuoteItems', (req, res, next) => {

    let data = {
      quote_category_id:req.body.quote_category_id
      ,quote_items_id:req.body.quote_items_id
      ,description: req.body.description
      , amount: req.body.amount
      , amount_other: req.body.amount_other
      , item_type: req.body.item_type
      , sort_order: req.body.sort_order
      , creation_date: req.body.creation_date
      , modification_date: req.body.modification_date
      , title: req.body.title
      , quote_id: req.body.quote_id
      , opportunity_id: req.body.opportunity_id
      , actual_amount: req.body.actual_amount
      , supplier_amount	: req.body.supplier_amount	
      , quantity: req.body.quantity
      , project_id: req.body.project_id
      , created_by: req.body.created_by
      , modified_by: req.body.modified_by
      , unit: req.body.unit
      , remarks: req.body.remarks
      , part_no: req.body.part_no
      , nationality: req.body.nationality
      , ot_rate: req.body.ot_rate
      , ph_rate: req.body.ph_rate
      , scaffold_code: req.body.scaffold_code
      , erection: req.body.erection
      , dismantle: req.body.dismantle
      , unit_price: req.body.unit_price
      , drawing_number: req.body.drawing_number
      , drawing_title: req.body.drawing_title
      , drawing_revision: req.body.drawing_revision
   };
    let sql = "INSERT INTO quote_items SET ?";
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


app.delete('/deleteQuoteItems', (req, res, next) => {

    let data = {quote_category_id: req.body.quote_category_id};
    let sql = "DELETE FROM quote_items WHERE ?";
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

module.exports = app;