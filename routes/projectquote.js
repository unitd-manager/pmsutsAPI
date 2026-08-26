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

app.post('/getProjectquoteById', (req, res, next) => {
    db.query(` SELECT q.quote_date
    ,q.project_quote_id
    ,q.quote_code
    ,q.quote_status
    ,q.ref_no_quote
    ,q.project_location
    ,q.project_reference
    ,q.payment_method
    ,q.revision
    ,q.intro_drawing_quote 
    ,q.total_amount
    ,q.project_enquiry_id
    ,o.company_id
    ,q.contact_id
    ,o.enquiry_code
    ,c.company_name
    ,cont.first_name
    ,q.creation_date
    ,q.modification_date
    ,q.created_by
    ,q.modified_by
    FROM project_quote q  
    LEFT JOIN (project_enquiry o) ON (o.project_enquiry_id=q.project_enquiry_id)
    LEFT JOIN (company c) ON (c.company_id = o.company_id)
    LEFT JOIN (contact cont) ON (cont.contact_id = q.contact_id)   
    WHERE q.project_quote_id =${db.escape(req.body.project_quote_id)}
    `,
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


//   app.post('/editInvoices', (req, res, next) => {
//     const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
//  db.query(`UPDATE invoice
//   SET invoice_date = ${db.escape(req.body.invoice_date)},
//    invoice_terms = ${db.escape(req.body.invoice_terms)},
//    modified_by = ${db.escape(req.body.modified_by)},
//    invoice_amount = (
//        SELECT SUM(total_cost) 
//        FROM invoice_item 
//        WHERE invoice_id = ${db.escape(req.body.invoice_id)}
//    ),
//    modification_date = '${currentDateTime}' 
// WHERE invoice_id = ${db.escape(req.body.invoice_id)}`,
//    (err, result) => {
//      if (err) {
//        return res.status(400).send({
//              data: err,
//              msg:'failed'
//            });
//      } else {
//            return res.status(200).send({
//              data: result,
//              msg:'Success'
//            });
//      }
// }
// );
// });

  app.get('/getProjectquote', (req, res, next) => {
    db.query(` SELECT q.quote_date
    ,q.project_quote_id
    ,q.quote_code
    ,q.quote_status
    ,q.ref_no_quote
    ,q.project_location
    ,q.project_reference
    ,q.payment_method
    ,q.revision
    ,q.intro_drawing_quote 
    ,q.total_amount
    ,q.project_enquiry_id
    ,q.company_id
    ,q.contact_id
    ,o.enquiry_code
    ,c.company_name
    ,cont.first_name
    FROM project_quote q  
    LEFT JOIN (project_enquiry o) ON (o.project_enquiry_id=q.project_enquiry_id)
    LEFT JOIN (company c) ON (q.company_id=c.company_id)
    LEFT JOIN (contact cont) ON (q.contact_id = cont.contact_id) 
    WHERE q.project_quote_id != '' 
    ORDER BY q.project_quote_id DESC
    `,
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

  app.get('/getEnquiryCode', (req, res, next) => {
    db.query(`  SELECT pe.enquiry_code,pe.project_enquiry_id 
    from project_enquiry pe
    LEFT JOIN project_quote o ON o.project_enquiry_id = pe.project_enquiry_id
     WHERE pe.project_enquiry_id != ''
     AND o.project_enquiry_id IS NULL  `,
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
  app.post('/edit-Tradingquote', (req, res, next) => {
    db.query(`UPDATE project_quote 
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
              ,project_enquiry_id=${db.escape(req.body.project_enquiry_id)}
              ,company_id=${db.escape(req.body.company_id)}
              ,contact_id=${db.escape(req.body.contact_id)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,modified_by=${db.escape(req.body.modified_by)}
              WHERE project_quote_id =  ${db.escape(req.body.project_quote_id)}`,
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

  app.post('/inserttradingquote', (req, res, next) => {

    let data = {
        project_enquiry_id: req.body.project_enquiry_id
      , project_id: req.body.project_id
      , quote_code: req.body.quote_code
      , quote_date: req.body.quote_date
      , quote_status: 'new'
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
      , creation_date: req.body.creation_date
      , modification_date: null
      , created_by: req.body.created_by
    };
    let sql = "INSERT INTO project_quote SET ?";
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
  
          
          
  app.post('/getQuoteLineItemsById', (req, res, next) => {
    db.query(`SELECT
              qt.* 
              ,qt.project_quote_id
              ,qt.project_quote_items_id
              ,qt.creation_date
              ,qt.modification_date
              ,qt.created_by
              ,qt.modified_by
              FROM project_quote_items qt 
              WHERE qt.project_quote_id =  ${db.escape(req.body.project_quote_id)}`,
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

  app.post('/deleteEditItem', (req, res, next) => {
    let projectQuoteItemsId = req.body.project_quote_items_id;
  
    let sql = "DELETE FROM quote_items WHERE ?";
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

app.post('/deleteMaterial', (req, res, next) => {

  let data = { material_needed_id: req.body. material_needed_id};
  let sql = "DELETE FROM  material_needed WHERE ?";
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
  
app.post('/deleteProjectQuote', (req, res, next) => {

  let data = { project_quote_items_id: req.body. project_quote_items_id};
  let sql = "DELETE FROM  project_quote_items WHERE ?";
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
  
  // app.post('/edit-TabQuoteLine', (req, res, next) => {
  //   db.query(`UPDATE project_quote_items
  //             SET title=${db.escape(req.body.title)}
  //             ,description=${db.escape(req.body.description)}
  //             ,quantity=${db.escape(req.body.quantity)}
  //             ,unit=${db.escape(req.body.unit)}
  //             ,unit_price=${db.escape(req.body.unit_price)}
  //             ,amount=${db.escape(req.body.amount)}
  //             ,modification_date=${db.escape(req.body.modification_date)}
  //           ,modified_by=${db.escape(req.body.modified_by)}
  //             WHERE project_quote_items_id =  ${db.escape(req.body.project_quote_items_id)}`,
  //     (err, result) =>{
  //       if (err) {
  //         console.log("error: ", err);
  //         return;
  //       } else {
  //             return res.status(200).send({
  //               data: result,
  //               msg:'Success'
  //             });
  //       }
  //      }
  //   );
  // });

  app.post('/edit-TabQuoteLine', (req, res, next) => {
    // ... your existing code
  
    // Calculate the total_amount by summing up all line item amounts
    db.query(
      `UPDATE project_quote_items
            SET title=${db.escape(req.body.title)}
            ,description=${db.escape(req.body.description)}
            ,quantity=${db.escape(req.body.quantity)}
            ,unit=${db.escape(req.body.unit)}
            ,unit_price=${db.escape(req.body.unit_price)}
            ,amount=${db.escape(req.body.amount)}
            ,modification_date=${db.escape(req.body.modification_date)}
          ,modified_by=${db.escape(req.body.modified_by)}
            WHERE project_quote_items_id =  ${db.escape(req.body.project_quote_items_id)}`,
      (err, result) => {
        if (err) {
          console.log("error: ", err);
          return res.status(500).send({ msg: 'Error updating line item' });
        }
  
        // Update total_amount in project_quote table
        db.query(
          `UPDATE project_quote
           SET quote_amount = (SELECT SUM(amount) FROM project_quote_items WHERE project_quote_id = ${db.escape(req.body.project_quote_id)})
           WHERE project_quote_id = ${db.escape(req.body.project_quote_id)}`,
          (err, result) => {
            if (err) {
              console.log("error updating total_amount: ", err);
              return res.status(500).send({ msg: 'Error updating total_amount' });
            }
  
            return res.status(200).send({
              data: result,
              msg: 'Success',
            });
          }
        );
      }
    );
  });
  app.post('/insertQuoteItems', (req, res, next) => {
    let data = {
      quote_category_id: req.body.quote_category_id,
      description: req.body.description,
      amount: req.body.amount,
      amount_other: req.body.amount_other,
      item_type: req.body.item_type,
      sort_order: req.body.sort_order,
      title: req.body.title,
      project_quote_id: req.body.project_quote_id,
      actual_amount: req.body.actual_amount,
      supplier_amount: req.body.supplier_amount,
      quantity: req.body.quantity,
      project_id: req.body.project_id,
      created_by: req.body.created_by,
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
      creation_date: req.body.creation_date,
    };
  
    let sql = "INSERT INTO project_quote_items SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'New Tender has been created successfully'
            });
      }
    });
  });
  
  app.post('/getMaterialLineItemsById', (req, res, next) => {
    db.query(`SELECT
              qt.* 
              ,qt.project_quote_id
              ,qt. material_needed_id
              ,qt.creation_date
              ,qt.modification_date
              ,qt.created_by
              ,qt.modified_by
              FROM  material_needed qt 
              WHERE qt.project_quote_id =  ${db.escape(req.body.project_quote_id)}`,
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

  app.post('/edit-QuoteLine', (req, res, next) => {
    // ... your existing code
  
    // Calculate the total_amount by summing up all line item amounts
    db.query(
      `UPDATE  material_needed
            SET title=${db.escape(req.body.title)}
            ,description=${db.escape(req.body.description)}
            ,quantity=${db.escape(req.body.quantity)}
            ,unit=${db.escape(req.body.unit)}
            ,unit_price=${db.escape(req.body.unit_price)}
            ,amount=${db.escape(req.body.amount)}
            ,modification_date=${db.escape(req.body.modification_date)}
          ,modified_by=${db.escape(req.body.modified_by)}
            WHERE  material_needed_id =  ${db.escape(req.body. material_needed_id)}`,
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
app.post('/insertMaterialItems', (req, res, next) => {
    let data = {
      quote_category_id: req.body.quote_category_id,
      description: req.body.description,
      amount: req.body.amount,
      amount_other: req.body.amount_other,
      item_type: req.body.item_type,
      sort_order: req.body.sort_order,
      title: req.body.title,
      project_quote_id: req.body.project_quote_id,
      actual_amount: req.body.actual_amount,
      supplier_amount: req.body.supplier_amount,
      quantity: req.body.quantity,
      project_id: req.body.project_id,
      created_by: req.body.created_by,
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
      creation_date: req.body.creation_date,
    };
  
    let sql = "INSERT INTO  material_needed SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'New Tender has been created successfully'
            });
      }
    });
  });
  
app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;