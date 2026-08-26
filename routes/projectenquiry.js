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

app.get('/getProjectEnquiry', (req, res, next) => {
  db.query(`SELECT 
            o.*
            ,c.company_name 
            ,c.company_size 
            ,c.source,c.industry 
            FROM project_enquiry o 
            LEFT JOIN (company c)  ON (o.company_id  = c.company_id)  
            where o.project_enquiry_id  !=''
            ORDER BY o.project_enquiry_id DESC
            `,
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
app.post('/getTendersById', (req, res, next) => {
  db.query(`SELECT 
  o.*
  ,c.company_name 
  ,c.company_size 
  ,c.source,c.industry 
  FROM project_enquiry o 
  LEFT JOIN (company c)  ON (o.company_id  = c.company_id)  
  WHERE o.project_enquiry_id=${db.escape(req.body.project_enquiry_id)}
  ORDER BY o.enquiry_code DESC`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          msg: 'No result found'
        });
      }else {
            return res.status(200).send({
              data: result[0],
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
      , quote_date: new Date().toISOString()
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
  app.post('/getTabQuoteLineItems', (req, res, next) => {
    db.query(`SELECT 
    qt.title
    ,qt.description
    ,qt.quantity
    ,qt.unit
    ,qt.quote_items_id
    ,qt.opportunity_id
    ,qt.unit_price
    ,qt.amount FROM quote_items_log qt WHERE  qt.quote_log_id = ${db.escape(req.body.quote_log_id)}`,
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
  
  app.get('/getTabQuoteLineItemsById', (req, res, next) => {
    db.query(`SELECT 
    qt.title
    ,qt.description
    ,qt.quantity
    ,qt.unit
    ,qt.quote_items_id
    ,qt.opportunity_id
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
app.post('/getTabQuotelogById', (req, res, next) => {
  db.query(`SELECT
  ql.quote_log_id
  ,ql.quote_id
  ,ql.opportunity_id 
  ,ql.quote_date
  ,ql.quote_status
  ,ql.quote_code
  ,ql.project_location
  ,ql.project_reference
  ,ql.payment_method
  ,ql.ref_no_quote
  ,ql.revision
  ,ql.discount
  ,(SELECT SUM(qlt.amount)
    FROM quote_items_log qlt
    WHERE ql.quote_log_id= qlt.quote_log_id ) AS total_amount
     FROM quote_log ql 
  LEFT JOIN (opportunity o) ON (o.opportunity_id = ql.opportunity_id)
  WHERE ql.opportunity_id =${db.escape( req.body.opportunity_id)} 
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

app.get('/projectIncharge', (req, res, next) => {
  db.query(`select first_name, employee_id from employee`,
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

app.post('/edit-Tenders', (req, res, next) => {
  db.query(`UPDATE project_enquiry 
  SET office_ref_no=${db.escape(req.body.office_ref_no)}
  ,company_id=${db.escape(req.body.company_id)}  
  ,services=${db.escape(req.body.services)}
  ,project_end_date=${db.escape(req.body.project_end_date)}
  ,enquiry_date=${db.escape(req.body.enquiry_date)}
  ,modification_date=${db.escape(req.body.modification_date)}
  ,modified_by=${db.escape(req.body.modified_by)}
  ,status=${db.escape(req.body.status)}
  WHERE project_enquiry_id =  ${db.escape(req.body.project_enquiry_id)}`,
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

app.post('/deleteTender', (req, res, next) => {
  let sql = `DELETE FROM opportunity WHERE opportunity_id =${db.escape(req.body.opportunity_id)}`;
  let query = db.query(sql,(err, result) => {
    if (err) {
      return res.status(400).send({
            data: '',
            msg:'Unable to delete tender.'
          });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Tender has been removed successfully'
          });
    }
  });
});
app.post('/insertProjectEnquiry', (req, res, next) => {

  let data = {services	:req.body.services	
   , company_id	: req.body.company_id
   ,enquiry_code:req.body.enquiry_code
   ,enquiry_date:new Date().toISOString().split('T')[0]
   ,category: req.body.category
   ,status:"Approved"
   ,creation_date: req.body.creation_date
   ,created_by: req.body.created_by
   };
  let sql = "INSERT INTO project_enquiry SET ?";
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
app.post('/insertTender', (req, res, next) => {

  let data = {services: req.body.services, company_id: req.body.company_id, 
  category_id: req.body.category_id,enquiry_code:req.body.enquiry_code};
  let sql = "INSERT INTO project_enquiry SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
       return res.status(400).send({
            data: err,
            msg:'Unable to add tender'
          });
    } else {
          return res.status(200).send({
            data: result,
            msg:'New Tender has been created successfully'
          });
    }
  });
});




app.post('/insertContact', (req, res, next) => {

  let data = {salutation: req.body.salutation
    , first_name: req.body.first_name
    , email: req.body.email
    , position: req.body.position
    , department: req.body.department
    , phone_direct: req.body.phone_direct
    , fax: req.body.fax
    , mobile: req.body.mobile,company_id:req.body.company_id};
  let sql = "INSERT INTO contact SET ?";
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


app.post("/getCodeValue", (req, res, next) => {
  var type = req.body.type;
  let sql = '';
  let key_text = '';
  let withprefix = true;
  if(type == 'opportunity'){
      key_text = 'nextOpportunityCode';
      sql = "SELECT * FROM setting WHERE key_text='opportunityCodePrefix' OR key_text='nextOpportunityCode'";
  }else if(type == 'projectenquiry'){
    key_text = 'nextProjectEnquiryCode';
    sql = "SELECT * FROM setting WHERE key_text='projectenquiryCodePrefix' OR key_text='nextProjectEnquiryCode'";
}else if(type == 'receipt'){
      key_text = 'nextReceiptCode';
      sql = "SELECT * FROM setting WHERE key_text='receiptCodePrefix' OR key_text='nextReceiptCode'";
  }else if(type == 'lead'){
      key_text = 'nextLeadsCode';
      sql = "SELECT * FROM setting WHERE key_text='leadsPrefix' OR key_text='nextLeadsCode'";  
  }else if(type == 'invoice'){
      key_text = 'nextInvoiceCode';
    sql = "SELECT * FROM setting WHERE key_text='invoiceCodePrefix' OR key_text='nextInvoiceCode'";  
  }else if(type == 'subConworkOrder'){
      key_text = 'nextSubconCode';
    sql = "SELECT * FROM setting WHERE key_text='subconCodePrefix' OR key_text='nextSubconCode'";  
  }
  else if(type == 'project'){
      key_text = 'nextProjectCode';
      sql = "SELECT * FROM setting WHERE key_text='projectCodePrefix' OR key_text='nextProjectCode'";  
  }else if(type == 'opportunityproject'){
      key_text = 'nextOpportunityProjectCode';
      sql = "SELECT * FROM setting WHERE key_text='opportunityprojectCodePrefix' OR key_text='nextOpportunityProjectCode'";  
  }else if(type == 'quote'){
      key_text = 'nextQuoteCode';
      sql = "SELECT * FROM setting WHERE key_text='quoteCodePrefix' OR key_text='nextQuoteCode'";  
  }
  else if(type == 'creditNote'){
      key_text = 'nextCreditNoteCode';
      sql = "SELECT * FROM setting WHERE key_text='creditNotePrefix' OR key_text='nextCreditNoteCode'";  
  }else if(type == 'employee'){
    //   withprefix = false;
      key_text = 'nextEmployeeCode';
    sql = "SELECT * FROM setting WHERE key_text='employeeCodePrefix' OR key_text='nextEmployeeCode'";  
  }
  else if(type == 'claim'){
      withprefix = false;
      key_text = 'nextClaimCode';
      sql = "SELECT * FROM setting WHERE  key_text='nextClaimCode'";  
  }
  else if(type == 'QuoteCodeOpp'){
      withprefix = false;
      key_text = 'nextQuoteCodeOpp';
      sql = "SELECT * FROM setting WHERE  key_text='nextQuoteCodeOpp'";  
  }
  else if(type == 'wocode'){
      key_text = 'nextWOCode';
      sql = "SELECT * FROM setting WHERE key_text='wOCodePrefix' OR key_text='nextWOCode'";  
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



app.get('/getTenderSummaryId', (req, res, next) => {
  db.query(`SELECT o.title, c.company_name , q.total_amount
            FROM opportunity o 
            LEFT JOIN (company c)  ON (o.company_id  = c.company_id)  
            LEFT JOIN (quote q)  ON (q.quote_id  = o.opportunity_id)
            ORDER BY o.opportunity_code DESC`,
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

app.get('/getTenderBestMonthSummary', (req, res, next) => {
  db.query(`SELECT DATE_FORMAT(o.creation_date, '%Y-%m') AS monthYear
                  ,COUNT(o.opportunity_id) as total
            FROM opportunity o
            WHERE DATE_FORMAT(o.creation_date, '%Y-%m-%d') > Date_add(Now(), interval - 12 month)
              AND DATE_FORMAT(o.creation_date, '%Y-%m-%d') < Now()
            GROUP BY DATE_FORMAT(o.creation_date, '%m-%Y')
            ORDER BY total DESC, DATE_FORMAT(o.creation_date, '%m-%Y') DESC
            LIMIT 1`,
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


app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;