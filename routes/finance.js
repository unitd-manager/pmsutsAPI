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



app.post('/getFinancesById', (req, res, next) => {
  db.query(`SELECT o.order_id
  ,o.order_date
  , o.project_id
  ,o.project_type
  ,o.creation_date
  ,o.order_status
  ,o.invoice_terms
  ,o.notes
  ,o.shipping_first_name
  ,o.shipping_address1
  ,o.shipping_address2
  ,o.shipping_address_country
  ,o.shipping_address_po_code 
  ,o.delivery_date
  ,o.delivery_terms
  ,o.cust_address1
  ,o.cust_address2
  ,o.cust_address_country
  ,o.cust_address_po_code
  ,o.creation_date
  ,o.modification_date
  ,o.created_by
  ,o.modified_by
  ,o.cust_company_name
  ,gc2.name AS shipping_country_name
  ,c.company_name AS company_name
  ,c.website AS company_website
  ,c.fax AS company_fax
  ,c.phone AS company_phone
  ,c.address_flat AS company_address_flat
  ,c.address_street AS company_address_street
  ,c.address_town AS company_address_town
  ,c.address_state AS company_address_state
  ,gc3.name AS company_country_name
 ,(select(sum(i.invoice_amount)))as orderamount
  ,(SELECT (SUM(oi.unit_price * oi.qty) + o.shipping_charge) 
  FROM order_item oi 
  WHERE oi.order_id = o.order_id) AS order_amount
  ,q.quote_code,p.project_code FROM orders o 
  LEFT JOIN geo_country gc2 ON (o.shipping_address_country_code = gc2.country_code) 
  LEFT JOIN company c ON (o.company_id = c.company_id) 
  LEFT JOIN invoice i  ON (i.order_id = o.order_id) 
  LEFT JOIN geo_country gc3 ON (c.address_country = gc3.country_code) 
  LEFT JOIN quote q ON o.quote_id = q.quote_id 
  LEFT JOIN project p ON o.project_id = p.project_id WHERE o.order_id = ${db.escape(req.body.order_id)} `,
    (err, result) => {
      if (err) {
         return res.status(400).send({
              data: err,
              msg:'Failed'
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

app.post("/getProjectById", (req, res, next) => {
  db.query(
    `SELECT p.title
    ,p.project_id
    ,p.project_code
    ,c.company_name 
    ,c.company_id
   from project p
 LEFT JOIN (company c) ON (c.company_id = p.company_id) where p.project_id =  ${db.escape(req.body.project_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return res.status(400).send({
          data: err,
          msg: "failed",
        });
      } else {
        return res.status(200).send({
          data: result[0],
          msg: "Success",
        });
      }
    }
  );
});

app.post("/getCreditById", (req, res, next) => {
  db.query(
    `SELECT c.credit_note_id
  ,c.credit_note_code
  ,c.amount
  ,c.from_date
   FROM credit_note c
   LEFT JOIN orders o ON o.order_id=c.order_id
   WHERE c.order_id= ${db.escape(req.body.order_id)} `,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: "Failed",
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



app.get('/getFinances', (req, res, next) => {
  db.query(`SELECT o.order_id
  ,o.order_date
  , o.project_id
  ,o.project_type
  ,o.creation_date
  ,o.order_status
  ,o.invoice_terms
  ,o.notes
  ,o.shipping_first_name
  ,o.shipping_address1
  ,o.shipping_address2
  ,o.shipping_address_country
  ,o.shipping_address_po_code 
  ,o.delivery_date
  ,o.delivery_terms
  ,o.cust_address1
  ,o.cust_address2
  ,o.cust_address_country
  ,o.cust_address_po_code
  ,o.creation_date
  ,o.modification_date
  ,o.created_by
  ,o.modified_by
  ,o.cust_company_name
  ,gc2.name AS shipping_country_name
  ,c.company_name AS company_name
  ,c.website AS company_website
  ,c.fax AS company_fax
  ,c.phone AS company_phone
  ,c.address_flat AS company_address_flat
  ,c.address_street AS company_address_street
  ,c.address_town AS company_address_town
  ,c.address_state AS company_address_state
  ,gc3.name AS company_country_name
  ,(SELECT (SUM(i.invoice_amount))
  FROM invoice i 
  WHERE i.order_id = o.order_id)  AS orderamount
  ,q.quote_code,p.project_code FROM orders o 
  LEFT JOIN geo_country gc2 ON (o.shipping_address_country_code = gc2.country_code) 
  LEFT JOIN company c ON (c.company_id = o.company_id) 
  LEFT JOIN geo_country gc3 ON (c.address_country = gc3.country_code) 
  LEFT JOIN quote q ON o.quote_id = q.quote_id 
  LEFT JOIN project p ON o.project_id = p.project_id WHERE o.order_id != ''`,
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



app.post('/getOrders', (req, res, next) => {
  db.query(`select * from orders where project_id=${db.escape(req.body.project_id)}`,
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


app.post('/editFinances', (req, res, next) => {
  db.query(`UPDATE orders
            SET invoice_terms=${db.escape(req.body.invoice_terms)}
            ,notes=${db.escape(req.body.notes)}
            ,shipping_first_name=${db.escape(req.body.shipping_first_name)}
            ,shipping_address1=${db.escape(req.body.shipping_address1)}
            ,shipping_address2=${db.escape(req.body.shipping_address2)}
            ,shipping_address_country=${db.escape(req.body.shipping_address_country)}
            ,shipping_address_po_code=${db.escape(req.body.shipping_address_po_code)}
            ,delivery_date=${db.escape(req.body.delivery_date)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,modification_date=${db.escape(
              new Date().toISOString().slice(0, 19).replace('T', ' '),
            )}
            ,delivery_terms=${db.escape(req.body.delivery_terms)}
            WHERE order_id =  ${db.escape(req.body.order_id)}`,
    (err, result) => {
      if (err) {
         return res.status(400).send({
              data: err,
              msg:'failed'
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

app.get('/getTabOrderItemPanel', (req, res, next) => {
  db.query(`SELECT order_item_id, unit_price,qty,discount_percentage,description,remarks FROM order_item WHERE order_id != '' ORDER BY order_item_id ASC;`,
    (err, result) => {
     
      if (err) {
        return res.status(400).send({
              data: err,
              msg:'failed'
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
app.get('/getTabInvoicePortalDisplay', (req, res, next) => {
  db.query(`SELECT i.quote_code
                   ,i.po_number
                   ,i.invoice_code
                   ,i.project_location
                   ,i.project_reference
                   ,i.discount
                   ,i.code
                   ,i.status
                   ,i.so_ref_no
                   ,i.site_code
                   ,i.attention
                   ,i.reference
                   ,i.invoice_date
                   ,invoice_terms
                   ,i.title,(SELECT GROUP_CONCAT(r.receipt_code ORDER BY r.receipt_code SEPARATOR ', ') 
                   FROM receipt r, invoice_receipt_history invrecpt 
                   WHERE r.receipt_id = invrecpt.receipt_id AND i.invoice_id = invrecpt.invoice_id) AS receipt_codes_history FROM invoice i WHERE i.order_id != '' ORDER BY i.invoice_id DESC`,
    (err, result) => {
     
      if (err) {
        return res.status(400).send({
              data: err,
              msg:'failed'
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


app.post("/getInvoiceSummary", (req, res, next) => {
  db.query(
    `SELECT i.invoice_amount
    ,(select(sum(i.invoice_amount)))as orderamount
    ,(SELECT COUNT(i.invoice_id))as invoiceRaised
    ,(SELECT(COUNT(i.status = 'Due' || i.status = 'Partially Paid') ))as outstandingInvoice
     FROM invoice i
     left JOIN orders o ON o.order_id =i.order_id
     where o.order_id= ${db.escape(req.body.order_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: "Failed",
        });
      } else {
        return res.status(200).send({
          data: result[0],
          msg: "Success",
        });
      }
    }
  );
});



app.post("/getInvoiceItemSummary", (req, res, next) => {
  db.query(
    `SELECT iv.amount
    ,(select(sum(i.invoice_amount-(iv.amount))))as gstamount
      FROM invoice_item iv
      LEFT JOIN invoice i ON i.invoice_id =iv.invoice_id
      where i.order_id=${db.escape(req.body.order_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: "Failed",
        });
      } else {
        return res.status(200).send({
          data: result[0],
          msg: "Success",
        });
      }
    }
  );
});

app.post("/getInvoiceReceiptSummary", (req, res, next) => {
  db.query(
    `SELECT i.invoice_amount
    ,(select(sum(ir.amount)))as paidAmount
    ,(select(sum(ir.amount-i.invoice_amount)))as balance
     FROM invoice_receipt_history ir
     LEFT JOIN invoice i ON i.invoice_id =ir.invoice_id
     where i.order_id= ${db.escape(req.body.order_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: "Failed",
        });
      } else {
        return res.status(200).send({
          data: result[0],
          msg: "Success",
        });
      }
 }
 );
});

app.post('/editInvoicePortalDisplay', (req, res, next) => {
  db.query(`UPDATE invoice 
            SET quote_code =${db.escape(req.body.quote_code)}
            ,po_number=${db.escape(req.body.po_number)}
            ,project_location=${db.escape(req.body.project_location)}
            ,project_reference=${db.escape(req.body.project_reference)}
            ,discount=${db.escape(req.body.discount)}
            ,code=${db.escape(req.body.code)}
            ,status=${db.escape(req.body.status)}
            ,so_ref_no=${db.escape(req.body.so_ref_no)}
            ,attention=${db.escape(req.body.attention)}
            ,site_code=${db.escape(req.body.site_code)}
            ,reference=${db.escape(req.body.reference)}
            ,invoice_date=${db.escape(req.body.invoice_date)}
            ,invoice_terms=${db.escape(req.body.invoice_terms)}
             WHERE invoice_id =  ${db.escape(req.body.invoice_id)}`,
    (err, result) => {
      if (err) {
       return res.status(400).send({
              data: err,
              msg:'failed'
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


app.get('/getTabReceiptPortalDisplay', (req, res, next) => {
  db.query(`SELECT DISTINCT r.receipt_id
            ,r.receipt_id
            ,r.receipt_code
            ,r.receipt_status
            ,r.date
            ,r.amount
            ,r.mode_of_payment
            ,r.remarks
            ,r.creation_date
            ,r.created_by
            ,r.modification_date
            ,r.modified_by 
            FROM receipt r 
            LEFT JOIN (invoice_receipt_history irh) ON (r.receipt_id = irh.receipt_id) 
            WHERE r.order_id != '' ORDER BY r.receipt_id DESC`,
    (err, result) => {
     
      if (err) {
       return res.status(400).send({
              data: err,
              msg:'failed'
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

app.post('/editTabReceiptPortalDisplay', (req, res, next) => {
  db.query(`UPDATE receipt 
            SET receipt_id=${db.escape(req.body.receipt_id)}
            ,receipt_code=${db.escape(req.body.receipt_code)}
            ,receipt_status=${db.escape(req.body.receipt_status)}
            ,receipt_date=${db.escape(req.body.receipt_date)}
            ,amount=${db.escape(req.body.amount)}
            ,mode_of_payment=${db.escape(req.body.mode_of_payment)}
            ,remarks=${db.escape(req.body.remarks)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE order_id  =  ${db.escape(req.body.order_id)}`,
    (err, result) => {
     
      if (err) {
 return res.status(400).send({
              data: err,
              msg:'Failed'
            });      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
     }
  );
});
app.post('/editInvoiceItem', (req, res, next) => {
  db.query(`UPDATE invoice_item 
            SET qty=${db.escape(req.body.qty)}
            ,unit_price=${db.escape(req.body.unit_price)}
            ,item_title=${db.escape(req.body.item_title)}
            ,model=${db.escape(req.body.model)}
            ,module=${db.escape(req.body.module)}
            ,cost_price=${db.escape(req.body.cost_price)}
            ,item_code=${db.escape(req.body.item_code)}
            ,vat=${db.escape(req.body.vat)}
            ,discount_percentage=${db.escape(req.body.discount_percentage)}
            ,discount_type=${db.escape(req.body.discount_type)}
            ,site_id=${db.escape(req.body.site_id)}
            ,item_code_backup=${db.escape(req.body.item_code_backup)}
            ,unit=${db.escape(req.body.unit)}
            ,description=${db.escape(req.body.description)}
            ,remarks=${db.escape(req.body.remarks)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,month=${db.escape(req.body.month)}
            ,year=${db.escape(req.body.year)}
            ,total_cost=${db.escape(req.body.total_cost)}
            ,amount=${db.escape(req.body.amount)}
            ,s_no=${db.escape(req.body.s_no)}
            WHERE invoice_id  =  ${db.escape(req.body.invoice_id)}`,
    (err, result) => {
     
      if (err) {
       return res.status(400).send({
              data: err,
              msg:'failed'
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


app.post('/insertOrder', (req, res, next) => {

  let data = {order_status: req.body.order_status,
    payment_method: req.body.payment_method,
    shipping_first_name: req.body.shipping_first_name,
    shipping_last_name: req.body.shipping_last_name,
    shipping_email: req.body.shipping_email,
    shipping_address1: req.body.shipping_address1,
    shipping_address2: req.body.shipping_address2,
    shipping_address_city: req.body.shipping_address_city,
    shipping_address_area: req.body.shipping_address_area,
    shipping_address_state: req.body.shipping_address_state,
    shipping_address_country_code: req.body.shipping_address_country_code,
    shipping_address_po_code: req.body.shipping_address_po_code,
    shipping_phone: req.body.shipping_phone,
    cust_first_name: req.body.cust_first_name,
    cust_last_name: req.body.cust_last_name,
    cust_email: req.body.cust_email,
    cust_address1: req.body.cust_address1,
    cust_address2: req.body.cust_address2,
    cust_address_city: req.body.cust_address_city,
    cust_address_area: req.body.cust_address_area,
    cust_address_state: req.body.cust_address_state,
    cust_address_country: req.body.cust_address_country,
    cust_address_po_code: req.body.cust_address_po_code,
    cust_phone: req.body.cust_phone,
    memo: req.body.memo,
    creation_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    modification_date: req.body.modification_date,
    flag: req.body.flag,
    record_type: req.body.record_type,
    module: req.body.module,
    currency: req.body.currency,
    order_date: req.body.order_date,
    order_code: req.body.order_code,
    shipping_charge: req.body.shipping_charge,
    add_gst_to_total: req.body.add_gst_to_total,
    invoice_terms: req.body.invoice_terms,
    notes: req.body.notes,
    shipping_address_country: req.body.shipping_address_country,
    address_country: req.body.address_country,
    delivery_to_text: req.body.delivery_to_text,
    created_by: req.body.created_by,
    modified_by: req.body.modified_by,
    discount: req.body.discount,
    name_of_company: req.body.name_of_company,
    vat: req.body.vat,
    cust_company_name: req.body.cust_company_name,
    site_id: req.body.site_id,
    manual_invoice: req.body.manual_invoice,
    apply_general_vat: req.body.apply_general_vat,
    link_stock: req.body.link_stock,
    selling_company: req.body.selling_company,
    link_account: req.body.link_account,
    project_id: req.body.project_id,
    start_date : req.body. start_date ,
    end_date: req.body.end_date,
    auto_create_invoice: req.body.auto_create_invoice,
    delivery_date: req.body.delivery_date,
    delivery_terms: req.body.delivery_terms,
    quote_title: req.body.quote_title,
    project_type: req.body.project_type,
    cust_fax: req.body.cust_fax,
    shipping_fax: req.body.shipping_fax};

  let sql = "INSERT INTO orders SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.post('/deleteorders', (req, res, next) => {

  let data = {order_id  : req.body.order_id,};
  let sql = "DELETE FROM orders WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});

app.get('/getMaxInvoiceCode', (req, res, next) => {
  db.query(`SELECT MAX(invoice_code) as inv_code FROM invoice`,
    (err, result) => {
     
      if (err) {
        return res.status(400).send({
              data: err,
              msg:'failed'
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

app.get('/getMaxReceiptCode', (req, res, next) => {
  db.query(`SELECT MAX(receipt_code) as rec_code FROM receipt`,
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
app.post('/insertInvoice', (req, res, next) => {

  let data = {
    invoice_code: req.body.invoice_code
    , order_id: req.body.order_id
    , invoice_amount: req.body.invoice_amount
    , invoice_date: req.body.invoice_date
    , mode_of_payment: req.body.mode_of_payment
    , status: req.body.status
    , creation_date: req.body.creation_date
    , modification_date: req.body.modification_date
    , flag: req.body.flag
    , created_by: req.body.created_by
    , invoice_type: req.body.invoice_type
    , invoice_due_date: req.body.invoice_due_date
    , invoice_terms: req.body.invoice_terms
    , notes: req.body.notes
    , cst: req.body.cst
    , vat: req.body.vat
    , cst_value: req.body.cst_value
    , vat_value: req.body.vat_value
    , frieght: req.body.frieght
    , p_f: req.body.p_f
    , so_ref_no: req.body.so_ref_no
    , discount: req.body.discount
    , invoice_code_vat: req.body.invoice_code_vat
    , invoice_used: req.body.invoice_used
    , invoice_code_vat_quote: req.body.invoice_code_vat_quote
    , site_id: req.body.site_id
    , manual_invoice_seq: req.body.manual_invoice_seq
    , apply_general_vat: req.body.apply_general_vat
    , selling_company: req.body.selling_company
    , project_id: req.body.project_id
    , invoice_paid_date: req.body.invoice_paid_date
    , modified_by: req.body.modified_by
    , invoice_sent_out: req.body.invoice_sent_out
    , gst_percentage: req.body.gst_percentage
    , title: req.body.title
    , rate_text: req.body.rate_text
    , qty_text: req.body.qty_text
    , start_date: req.body.start_date
    , end_date: req.body.end_date
    , reference_no: req.body.reference_no
    , CBF_Ref_No: req.body.CBF_Ref_No
    , invoice_code_user: req.body.invoice_code_user
    , invoice_sent_out_date: req.body.invoice_sent_out_date
    , payment_terms: req.body.payment_terms
    , po_number: req.body.po_number
    , project_location: req.body.project_location
    , project_reference: req.body.project_reference
    , quote_code: req.body.quote_code
    , invoice_manual_code: req.body.invoice_manual_code
    , code: req.body.code
    , site_code: req.body.site_code
    , attention: req.body.attention
    , reference: req.body.reference
    ,gst_value: req.body.gst_value
 };
  let sql = "INSERT INTO invoice SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});
app.delete('/deleteInvoice', (req, res, next) => {

  let data = {invoice_id: req.body.invoice_id};
  let sql = "DELETE FROM invoice WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});



app.post('/insertInvoiceItem', (req, res, next) => {

  let data = {
       qty: req.body.qty
       ,invoice_id: req.body.invoice_id
        , unit_price: req.body.unit_price
    , item_title: req.body.item_title
    , model: req.body.model
    , module: req.body.module
    , cost_price: req.body.cost_price
    , item_code: req.body.item_code
    , vat: req.body.vat
    , discount_percentage: req.body.discount_percentage
    , discount_type: req.body.discount_type
    , amount: req.body.amount
    , s_no: req.body.s_no
    , site_id: req.body.site_id
    , item_code_backup: req.body.item_code_backup
    , unit: req.body.unit
    , description: req.body.description
    , remarks: req.body.remarks
    , modification_date: req.body.modification_date
    , modified_by: req.body.modified_by
    , month: req.body.month
    , year: req.body.year
    , total_cost: req.body.total_cost
 };
  let sql = "INSERT INTO invoice_item SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.post('/insertorder_item', (req, res, next) => {

  let data = {qty: req.body.qty,
              unit_price: req.body.unit_price,
              item_title: req.body.item_title,
              model: req.body.model,
              module: req.body.module,
              cost_price: req.body.cost_price,
              discount_percentage: req.body.discount_percentage,
              mark_up: req.body.mark_up,
              qty_for_invoice: req.body.qty_for_invoice,
              mark_up_type: req.body.mark_up_type,
              item_code: req.body.item_code,
              price_from_supplier: req.body.price_from_supplier,
              ref_code: req.body.ref_code,
              discount_type: req.body.discount_type,
              vat: req.body.vat,
              site_id: req.body.site_id,
              item_code_backup: req.body.item_code_backup,
              unit: req.body.unit,
              description: req.body.description,
              remarks: req.body.remarks,
              month: req.body.month,
              year: req.body.year,
              ot_hourly_rate: req.body.ot_hourly_rate,
              ph_hourly_rate: req.body.ph_hourly_rate,
              employee_ot_hours: req.body.employee_ot_hours,
              employee_ph_hours: req.body.employee_ph_hours,
              part_no: req.body.part_no,
              admin_charges: req.body.admin_charges,
              transport_charges: req.body.transport_charges,
              quote_id: req.body.quote_id,
              drawing_number: req.body.drawing_number,
              drawing_title: req.body.drawing_title,
              drawing_revision: req.body.drawing_revision,
            
            };

  let sql = "INSERT INTO order_item SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.delete('/deleteorder_item', (req, res, next) => {

  let data = {order_item_id : req.body.order_item_id };
  let sql = "DELETE FROM order_item  WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.post('/insertreceipt', (req, res, next) => {

  let data = {receipt_code: req.body.receipt_code,
              amount: req.body.amount,
              mode_of_payment: req.body.mode_of_payment,
              remarks: req.body.remarks,
              receipt_date: req.body.receipt_date,
              published: req.body.published,
              flag: req.body.flag,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              order_id: req.body.order_id,
              receipt_status: req.body.receipt_status,
              cheque_date: req.body.cheque_date,
              bank_name: req.body.bank_name,
              site_id: req.body.site_id,
              cheque_no: req.body.cheque_no,
          };

  let sql = "INSERT INTO receipt SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.delete('/deleteReceipt', (req, res, next) => {

  let data = {receipt_id : req.body.receipt_id };
  let sql = "DELETE FROM receipt WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.post('/insertInvoiceReceiptHistory', (req, res, next) => {

  let data = {invoice_id: req.body.invoice_id,
              receipt_id: req.body.receipt_id,
              published: req.body.published,
              flag: req.body.flag,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              amount: req.body.amount,
              site_id: req.body.site_id
            };

  let sql = "INSERT INTO invoice_receipt_history  SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.delete('/deleteInvoice_receipt_history', (req, res, next) => {

  let data = {invoice_receipt_history_id : req.body.invoice_receipt_history_id};
  let sql = "DELETE FROM invoice_receipt_history WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.post('/insertCredit_note', (req, res, next) => {

  let data = {credit_note_id : req.body.credit_note_id ,
              credit_note_code: req.body.credit_note_code,
              amount: req.body.amount,
              gst_amount: req.body.gst_amount,
              remarks: req.body.remarks,
              from_date:new Date().toISOString().slice(0, 19).replace('T', ' '),
              flag: req.body.flag,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              order_id: req.body.order_id,
              credit_note_status: req.body.credit_note_status,
              site_id: req.body.site_id,
              gst_percentage: req.body.gst_percentage,
            };

  let sql = "INSERT INTO credit_note SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});

app.post('/insertcredit_note_history', (req, res, next) => {

  let data = {invoice_id: req.body.invoice_id,
              credit_note_id: req.body.credit_note_id,
              published: req.body.published,
              amount: req.body.amount,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              site_id: req.body.site_id,
              item_title: req.body.item_title,
               description : req.body. description ,
              gst_percentage: req.body.gst_percentage,
              };

  let sql = "INSERT INTO invoice_credit_note_history SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});


app.delete('/deletecredit_note', (req, res, next) => {

  let data = {credit_note_id : req.body.credit_note_id};
  let sql = "DELETE FROM credit_note WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
              data: err,
              msg:'failed'
            });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Success'
          });
    }
  });
});

app.post('/getNoteById', (req, res, next) => {
  db.query(`select i.credit_note_id 
  ,i.credit_note_code  
  ,i.amount
  ,i.from_date
  ,i.order_id
   from credit_note i
   Where i.order_id = ${db.escape(req.body.order_id)}`,
    (err, result) => {

      if (err) {
        return res.status(400).send({
             data: err,
             msg:'Failed'
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
app.post("/getCreditNoteById", (req, res, next) => {
  db.query(
    `SELECT c.credit_note_id
    ,ch.invoice_credit_note_history_id
    ,c.credit_note_code
    ,c.amount
    ,ch.item_title
    ,ch.description
    ,c.from_date
    ,i.invoice_code
    ,i.invoice_date
    ,c.from_date
     FROM credit_note c
     LEFT JOIN orders o ON o.order_id=c.order_id
     LEFT JOIN invoice_credit_note_history ch ON ch.credit_note_id=c.credit_note_id
     LEFT JOIN invoice i  ON ch.invoice_id=i.invoice_id
     WHERE c.credit_note_id = ${db.escape(req.body.credit_note_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: "Failed",
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

app.post('/getDeliveryCompanyById', (req, res, next) => {
  db.query(`select c.company_id
,c.company_name as shipping_first_name
,c.address_street as shipping_address1
,c.address_town as shipping_address2
,c.address_country as shipping_address_country
,c.address_po_code as shipping_address_po_code
from project p
 LEFT JOIN company c ON (c.company_id = p.company_id) 
 where p.project_id=${db.escape(req.body.project_id)} `,
    (err, result) => {
      if (err) {
         return res.status(400).send({
              data: err,
              msg:'Failed'
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;