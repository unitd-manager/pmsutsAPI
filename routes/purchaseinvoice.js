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

app.get('/getPurchaseInvoice', (req, res, next) => {
  db.query(`SELECT 
    pi.purchase_invoice_id 
   ,pi.purchase_invoice_code
   ,pi.purchase_invoice_date
   ,pi.due_date
   ,pi.purchase_order_id
   ,pi.supplier_id
   ,pi.project_id
   ,pi.company_id
   ,pi.mode_of_payment
   ,pi.terms_and_condition
   ,COALESCE(SUM(pit.total_cost), 0) as invoice_amount
   ,pi.status
   ,pi.creation_date
   ,pi.created_by
   ,pi.modification_date
   ,pi.modified_by
   ,p.title
   ,p.project_id
   ,c.company_id
   ,c.company_name
  FROM purchase_invoice pi
  LEFT JOIN project p ON (p.project_id=pi.project_id)
  LEFT JOIN purchase_invoice_items pit ON (pit.purchase_invoice_id = pi.purchase_invoice_id) 
  LEFT JOIN company c ON (c.company_id=pi.company_id)
  WHERE pi.purchase_invoice_id !=''
  GROUP BY pi.purchase_invoice_id`,
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

app.post('/getPurchaseInvoiceById', (req, res, next) => {
  db.query(`SELECT 
  pi.purchase_invoice_id 
 ,pi.purchase_invoice_code
 ,pi.purchase_invoice_date
 ,pi.due_date
 ,pi.purchase_order_id
 ,pi.supplier_id
 ,pi.project_id
 ,pi.company_id
 ,pi.mode_of_payment
 ,pi.terms_and_condition
 ,COALESCE(SUM(pit.total_cost), 0) as invoice_amount
 ,pi.status
 ,pi.creation_date
 ,pi.created_by
 ,pi.modification_date
 ,pi.modified_by
 ,p.title
 ,p.project_id
 ,c.company_id
 ,c.company_name
FROM purchase_invoice pi
LEFT JOIN project p ON (p.project_id=pi.project_id)
LEFT JOIN purchase_invoice_items pit ON (pit.purchase_invoice_id = pi.purchase_invoice_id) 
LEFT JOIN company c ON (c.company_id=pi.company_id)
WHERE pi.purchase_invoice_id=${db.escape(req.body.purchase_invoice_id)}`,
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

app.post('/editPurchaseInvoice', (req, res, next) => {
  db.query(`UPDATE purchase_invoice 
            SET due_date=${db.escape(req.body.due_date)}
            ,purchase_invoice_date=${db.escape(req.body.purchase_invoice_date)}
            ,purchase_order_id=${db.escape(req.body.purchase_order_id)}
            ,supplier_id=${db.escape(req.body.supplier_id)}
            ,project_id=${db.escape(req.body.project_id)}
            ,mode_of_payment=${db.escape(req.body.mode_of_payment)}
            ,terms_and_condition=${db.escape(req.body.terms_and_condition)}
            ,invoice_amount=${db.escape(req.body.invoice_amount)}
            ,status=${db.escape(req.body.status)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE purchase_invoice_id = ${db.escape(req.body.purchase_invoice_id)}`,
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
        
        
app.post('/insertPurchaseInvoice', (req, res, next) => {
  let data = {
    purchase_invoice_code	: req.body.purchase_invoice_code
    , purchase_invoice_date	: req.body.purchase_invoice_date
    , due_date	: req.body.due_date
    , purchase_order_id: req.body.purchase_order_id
    , project_id: req.body.project_id
    , company_id: req.body.company_id
    , supplier_id: req.body.supplier_id
    , mode_of_payment	: req.body.mode_of_payment
    , terms_and_condition : req.body.terms_and_condition
    , invoice_amount: req.body.invoice_amount
    , status	: req.body.status
    , creation_date : req.body.creation_date
    , created_by : req.body.created_by
    , modification_date : req.body.modification_date
    , modified_by : req.body.modified_by
 };
  let sql = "INSERT INTO purchase_invoice SET ?";
  let query = db.query(sql, data, (err, result) => {
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

app.post('/editPurchaseInvoiceItems', (req, res, next) => {
  db.query(`UPDATE purchase_invoice_items
            SET purchase_invoice_id=${db.escape(req.body.purchase_invoice_id)}
            ,purchase_order_id=${db.escape(req.body.purchase_order_id)}
            ,po_product_id=${db.escape(req.body.po_product_id)}
            ,item_title=${db.escape(req.body.item_title)}
            ,unit=${db.escape(req.body.unit)}
            ,cost_price=${db.escape(req.body.cost_price)}
            ,ordered_quantity=${db.escape(req.body.ordered_quantity)}
            ,supplier_id=${db.escape(req.body.supplier_id)}
            ,total_cost=${db.escape(req.body.total_cost)}
            ,description=${db.escape(req.body.description)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE purchase_invoice_items_id = ${db.escape(req.body.purchase_invoice_items_id)}`,
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

        app.post('/insertPurchaseInvoiceItems', (req, res, next) => {
          let data = {
            purchase_invoice_id	: req.body.purchase_invoice_id
            , purchase_order_id: req.body.purchase_order_id
            , item_title: req.body.item_title
            , po_product_id: req.body.po_product_id
            , ordered_quantity: req.body.ordered_quantity
            , unit: req.body.unit
            , cost_price: req.body.cost_price
            , supplier_id: req.body.supplier_id
            , total_cost	: req.body.total_cost
            , description: req.body.description
            , creation_date: req.body.creation_date
            , created_by:req.body.created_by
            , modification_date:req.body.modification_date
            , modified_by:req.body.modified_by
         };
          let sql = "INSERT INTO purchase_invoice_items SET ?";
          let query = db.query(sql, data, (err, result) => {
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


        app.post('/getPurchaseInvoiceItemsById', (req, res, next) => {
          db.query(`SELECT
          purchase_invoice_items_id
          ,purchase_invoice_id
          ,purchase_order_id
          ,item_title
          ,unit
          ,ordered_quantity
          ,cost_price
          ,supplier_id
          ,total_cost
          ,description
          ,creation_date
          ,modification_date
          ,created_by
          ,modified_by
          FROM purchase_invoice_items
          Where purchase_order_id=${db.escape(req.body.purchase_order_id)}`,
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

        app.post('/getPoProductById', (req, res, next) => {
          db.query(`SELECT
          pop.unit
          ,pop.item_title
          ,pop.quantity
          ,pop.po_product_id
          ,pop.purchase_order_id
          ,pop.po_product_id
          ,pop.product_id
          ,pop.cost_price
          ,po.supplier_id
          FROM po_product pop
          LEFT JOIN (purchase_order po) ON (po.purchase_order_id = pop.purchase_order_id)
          WHERE pop.purchase_order_id =${db.escape(req.body.purchase_order_id)}`,
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

        app.post('/getPurchaseOrderById', (req, res, next) => {
  db.query(`SELECT
  po.project_id 
 ,po.supplier_id
 ,p.company_id
 FROM purchase_order po
 LEFT JOIN project p ON p.project_id=po.project_id
 WHERE purchase_order_id=${db.escape(req.body.purchase_order_id)}`,
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

app.get('/checkInvoiceItems', (req, res, next) => {
  db.query(
    `SELECT po_product_id FROM purchase_invoice_items`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: 'Failed'
        });
      } else {
        const quoteItemsIds = result.map((row) => row.po_product_id);
        return res.status(200).send({
          data: quoteItemsIds,
          msg: 'Success'
        });
      }
    }
  );
});

app.post("/getCodeValue", (req, res, next) => {
  var type = req.body.type;
  let sql = '';
  let key_text = '';
  let withprefix = true;
  if(type == 'PurchaseInvoiceCode'){
      key_text = 'nextPurchaseInvoiceCode';
      sql = "SELECT * FROM setting WHERE key_text='PurchaseInvoiceCodePrefix' OR key_text='nextPurchaseInvoiceCode'";
  }
  let query = db.query(sql, (err, result) => {
      let old = result
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
       
        var finalText = '';
        var newvalue = 0
        if(withprefix == true){
            var codeObject = result.filter(obj => obj.key_text === key_text);
            
             var prefixObject = result.filter(obj => obj.key_text != key_text);
            finalText = prefixObject[0].value + codeObject[0].value;
            newvalue = parseInt(codeObject[0].value) + 1
        }else{
            finalText = result[0].value
            newvalue = parseInt(result[0].value) + 1
        }
        newvalue = newvalue.toString()
         let query = db.query(`UPDATE setting SET value=${db.escape(newvalue)} WHERE key_text = ${db.escape(key_text)}`, (err, result) => {
            if (err) {
              return res.status(400).send({
                data: err,
                msg: "failed",
              });
            } else {
              return res.status(200).send({
                data: finalText,
                result:old
              });
            }
        });
    }
  });
});


app.get("/getPoCode", (req, res, next) => {
  db.query(
    `SELECT
     po_code
    ,purchase_order_id
    ,project_id
    ,supplier_id
   From purchase_order `,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return res.status(400).send({
          data: err,
          msg: "failed",
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

app.post('/deleteDocument', (req, res, next) => {

  let data = {document_id: req.body.document_id};
  let sql = "DELETE FROM document WHERE ?";
  let query = db.query(sql, data, (err, result) => {
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



app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;