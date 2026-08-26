const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/Database.js");
const userMiddleware = require("../middleware/UserModel.js");
var md5 = require("md5");
const fileUpload = require("express-fileupload");
const _ = require("lodash");
const mime = require("mime-types");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
app.use(cors());

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.post("/getTradingquoteById", (req, res, next) => {
  db.query(
    `SELECT q.quote_date
    ,q.quote_id
    ,q.quote_code
    ,q.quote_status
    ,q.ref_no_quote
    ,q.project_location
    ,q.project_reference
    ,q.payment_method
    ,q.revision
    ,q.intro_drawing_quote 
    ,q.total_amount
    ,q.discount
    ,q.opportunity_id
    ,c.company_id
    ,cont.contact_id
    ,o.opportunity_code
    ,o.office_ref_no
    ,c.company_name
    ,c.address_flat
    ,c.address_street
    ,c.address_town
    ,c.address_country
    ,c.address_po_code
    ,c.phone
    ,cont.first_name
    ,q.creation_date
    ,q.modification_date
    ,q.created_by
    ,q.modified_by
    ,(SELECT SUM(amount) FROM quote_items WHERE quote_id=q.quote_id) AS totalamount
    FROM quote q  
    LEFT JOIN (opportunity o) ON (o.opportunity_id=q.opportunity_id)
    LEFT JOIN (company c) ON (o.company_id=c.company_id)
    LEFT JOIN (contact cont) ON (o.contact_id = cont.contact_id) 
    
    WHERE q.quote_id =${db.escape(req.body.quote_id)}  ORDER BY quote_code DESC`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          msg: "No result found",
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

app.post('/edit-TradingQuoteLine', (req, res, next) => {
  db.query(`UPDATE quote_items
            SET title=${db.escape(req.body.title)}
            ,description=${db.escape(req.body.description)}
            ,quantity=${db.escape(req.body.quantity)}
            ,unit=${db.escape(req.body.unit)}
            ,unit_price=${db.escape(req.body.unit_price)}
            ,amount=${db.escape(req.body.amount)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE quote_items_id =  ${db.escape(req.body.quote_items_id)}`,
    (err, result) =>{
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

app.get("/getTradingquote", (req, res, next) => {
  db.query(
    ` SELECT q.quote_date
    ,q.quote_id
    ,q.quote_code
    ,q.quote_status
    ,q.ref_no_quote
    ,q.project_location
    ,q.project_reference
    ,q.payment_method
    ,q.revision
    ,q.intro_drawing_quote 
    ,q.total_amount
    ,q.opportunity_id
    ,c.company_id
    ,o.opportunity_code
    ,c.company_name
    ,cont.contact_id
    ,cont.first_name
    ,o.office_ref_no
    ,(SELECT SUM(amount) FROM quote_items WHERE quote_id=q.quote_id) AS totalamount
    FROM quote q  
    LEFT JOIN (opportunity o) ON (o.opportunity_id=q.opportunity_id)
    LEFT JOIN (company c) ON (o.company_id=c.company_id)
    LEFT JOIN (contact cont) ON (o.contact_id = cont.contact_id) 
    WHERE q.quote_id != '' 
    `,
    (err, result) => {
      if (result.length == 0) {
        return res.status(400).send({
          msg: "No result found",
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

app.get("/getEnquiryCode", (req, res, next) => {
  db.query(
    `SELECT 
  o.opportunity_code,
  o.opportunity_id 
  from opportunity o   
  LEFT JOIN (quote q) ON o.opportunity_id = q.opportunity_id
  WHERE
  o.opportunity_id != '' 
  AND q.opportunity_id IS NULL`,
    (err, result) => {
      if (result.length == 0) {
        return res.status(400).send({
          msg: "No result found",
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


app.post("/edit-Tradingquote", (req, res, next) => {
  db.query(
    `UPDATE quote 
              SET quote_date=${db.escape(req.body.quote_date)}
              ,quote_code=${db.escape(req.body.quote_code)}
              ,quote_status=${db.escape(req.body.quote_status)}
              ,project_location=${db.escape(req.body.project_location)}
              ,project_reference=${db.escape(req.body.project_reference)}
              ,payment_method=${db.escape(req.body.payment_method)}
              ,revision=${db.escape(req.body.revision)}
              ,intro_drawing_quote=${db.escape(req.body.intro_drawing_quote)}
              ,quote_condition=${db.escape(req.body.quote_condition)}
              ,show_project_manager=${db.escape(req.body.show_project_manager)}
              ,our_reference=${db.escape(req.body.our_reference)}
              ,drawing_nos=${db.escape(req.body.drawing_nos)}
              ,ref_no_quote=${db.escape(req.body.ref_no_quote)}
              ,discount=${db.escape(req.body.discount)}
              ,total_amount=${db.escape(req.body.total_amount)}
              ,opportunity_id=${db.escape(req.body.opportunity_id)}
              ,company_id=${db.escape(req.body.company_id)}
              ,contact_id=${db.escape(req.body.contact_id)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,modified_by=${db.escape(req.body.modified_by)}
              WHERE quote_id =  ${db.escape(req.body.quote_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});
app.post("/insertTradingContact", (req, res, next) => {
  let data = {
    salutation: req.body.salutation,
    first_name: req.body.first_name,
    email: req.body.email,
    position: req.body.position,
    department: req.body.department,
    phone_direct: req.body.phone_direct,
    fax: req.body.fax,
    mobile: req.body.mobile,
    company_id: req.body.company_id,
  };
  let sql = "INSERT INTO contact SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    } else {
      return res.status(200).send({
        data: result,
        msg: "New Tender has been created successfully",
      });
    }
  });
});

app.post("/inserttradingquote", (req, res, next) => {
  let data = {
    opportunity_id: req.body.opportunity_id,
    project_id: req.body.project_id,
    quote_code: req.body.quote_code,
    quote_date: req.body.quote_date,
    quote_status: "new",
    company_id: req.body.company_id,
    project_location: req.body.project_location,
    project_reference: req.body.project_reference,
    discount: req.body.discount,
    gst: req.body.gst,
    payment_method: req.body.payment_method,
    drawing_nos: req.body.drawing_nos,
    intro_quote: req.body.intro_quote,
    our_reference: req.body.our_reference,
    total_amount: req.body.total_amount,
    revision: req.body.revision,
    employee_id: req.body.employee_id,
    ref_no_quote: req.body.ref_no_quote,
    intro_drawing_quote: req.body.intro_drawing_quote,
    show_project_manager: req.body.show_project_manager,
    creation_date: req.body.creation_date,
    modification_date: null,
    created_by: req.body.created_by,
  };
  let sql = "INSERT INTO quote SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log("error: ", err);
      return;
    } else {
      return res.status(200).send({
        data: result,
        msg: "Success",
      });
    }
  });
});

app.post("/getQuoteLineItemsById", (req, res, next) => {
  db.query(
    `SELECT
              qt.* 
              ,qt.quote_id
              ,qt.quote_items_id
              ,qt.creation_date
              ,qt.modification_date
              ,qt.created_by
              ,qt.modified_by
              FROM quote_items qt 
              WHERE qt.quote_id =  ${db.escape(req.body.quote_id)}`,
    (err, result) => {
      if (result.length == 0) {
        return res.status(400).send({
          msg: "No result found",
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

app.post("/insertQuoteItems", (req, res, next) => {
  let data = {
    quote_category_id: req.body.quote_category_id,
    description: req.body.description,
    product_id:req.body.product_id,
    amount: req.body.amount,
    amount_other: req.body.amount_other,
    item_type: req.body.item_type,
    sort_order: req.body.sort_order,
    title: req.body.title,
    quote_id: req.body.quote_id,
    opportunity_id: req.body.opportunity_id,
    actual_amount: req.body.actual_amount,
    supplier_amount: req.body.supplier_amount,
    quantity: req.body.quantity,
    project_id: req.body.project_id,
    created_by: req.body.created_by,
    creation_date: req.body.creation_date,
    modification_date: null,
    unit: req.body.unit,
    remarks: req.body.remarks,
    part_no: req.body.part_no,
    nationality: req.body.nationality,
    ot_rate: req.body.ot_rate,
    ph_rate: req.body.ph_rate,
    scaffold_code: req.body.scaffold_code,
    erection: req.body.erection,
    dismantle: req.body.dismantle,
    unit_price: req.body.unit_price,
    drawing_number: req.body.drawing_number,
    drawing_title: req.body.drawing_title,
    drawing_revision: req.body.drawing_revision,
  };
  let sql = "INSERT INTO quote_items SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "Failed",
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: "New quote item has been created successfully",
      });
    }
  });
});
app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;