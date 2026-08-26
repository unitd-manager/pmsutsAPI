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

app.get('/getPurchaseOrderDataForSummary', (req, res, next) => {
  db.query(`SELECT 
  po.po_code,
  po.supplier_id,
  po.status,
  po.project_id,
  po.purchase_order_date,
  po.delivery_date,
  po.payment,
  s.supplier_id,
  s.company_name,
  p.project_id,
  p.title,
  c.company_id,
  c.company_name,
  pi.purchase_invoice_id,
  pit.total_cost
FROM purchase_order po
LEFT JOIN supplier s ON s.supplier_id = po.supplier_id
LEFT JOIN project p ON p.project_id = po.project_id
LEFT JOIN company c ON c.company_id = p.company_id
LEFT JOIN purchase_invoice pi ON pi.purchase_order_id = po.purchase_order_id 
LEFT JOIN purchase_invoice_items pit ON pit.purchase_invoice_id = pi.purchase_invoice_id
Where po.purchase_order_id !=''
Group BY po.purchase_order_id `,
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

app.get("/getSupplierName", (req, res, next) => {
  db.query(`SELECT company_name,supplier_id FROM supplier`, (err, result) => {
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

app.get('/getPurchaseOrderDataForSummary', (req, res, next) => {
  db.query(`SELECT 
  po.po_code,
  po.supplier_id,
  po.status,
  po.project_id,
  po.purchase_order_date,
  po.delivery_date,
  po.payment,
  s.supplier_id,
  s.company_name,
  p.project_id,
  p.title,
  c.company_id,
  c.company_name,
  pi.purchase_invoice_id,
  pit.total_cost
FROM purchase_order po
LEFT JOIN supplier s ON s.supplier_id = po.supplier_id
LEFT JOIN project p ON p.project_id = po.project_id
LEFT JOIN company c ON c.company_id = p.company_id
LEFT JOIN purchase_invoice pi ON pi.purchase_order_id = po.purchase_order_id 
LEFT JOIN purchase_invoice_items pit ON pit.purchase_invoice_id = pi.purchase_invoice_id
Where po.purchase_order_id !=''
Group BY po.purchase_order_id `,
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

app.post('/getInvoiceData', (req, res, next) => {
  db.query(`SELECT 
  pi.purchase_invoice_code
  ,pi.purchase_order_id
  ,pi.purchase_invoice_date
  ,pi.due_date
  ,pi.invoice_amount
  ,pi.status
  ,pi.supplier_id
  ,pi.project_id
  ,pi.company_id
  ,po.po_code
  ,s.company_name
  ,COALESCE(SUM(pit.total_cost), 0) AS invoice_amount
  FROM purchase_invoice pi
  LEFT JOIN purchase_order po ON po.purchase_order_id=pi.purchase_order_id
  LEFT JOIN purchase_invoice_items pit ON pit.purchase_invoice_id = pi.purchase_invoice_id
  LEFT JOIN supplier s ON s.supplier_id = pi.supplier_id
  WHERE pi.supplier_id= ${db.escape(req.body.supplier_id)}
  GROUP BY pi.purchase_order_id`,
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

app.post('/getPieChart', (req, res, next) => {
  db.query(`WITH CTE AS (
    SELECT
        COALESCE(
            (
                SELECT SUM(total_cost)
                FROM purchase_invoice_items
                WHERE purchase_order_id = ${db.escape(req.body.purchase_order_id)}
            ), 0
        ) AS total_invoice_amount,
        COALESCE(
            (
                SELECT SUM(amount)
                FROM supplier_receipt_history
                WHERE purchase_order_id = ${db.escape(req.body.purchase_order_id)}
            ), 0
        ) AS paid_amount
)
SELECT CTE.total_invoice_amount, CTE.paid_amount, CTE.total_invoice_amount - CTE.paid_amount AS remaining_balance, 
supplier.company_name
FROM CTE
JOIN purchase_order ON purchase_order.purchase_order_id = ${db.escape(req.body.purchase_order_id)}
JOIN supplier ON supplier.supplier_id = purchase_order.supplier_id`,
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

app.post('/getSupplierId', (req, res, next) => {
  db.query(`SELECT 
  supplier_id
  FROM purchase_order
  WHERE purchase_order_id = ${db.escape(req.body.purchase_order_id)}`,
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;