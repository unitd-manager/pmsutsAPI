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

app.get('/getTenders', (req, res, next) => {
  db.query(`SELECT 
            o.*
            ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name 
            ,CONCAT_WS(' ', ref.first_name, ref.last_name) AS ref_contact_name 
            ,c.company_name 
            ,c.company_size 
            ,c.source,c.industry 
            ,e.team,p.project_code,ser.title AS service_title 
            ,CONCAT_WS(' ', s.first_name, s.last_name) AS project_manager_name 
            FROM opportunity o 
            LEFT JOIN (contact cont) ON (o.contact_id = cont.contact_id)  
            LEFT JOIN (contact ref)  ON (o.referrer_contact_id = ref.contact_id) 
            LEFT JOIN (company c)  ON (o.company_id  = c.company_id)  
            LEFT JOIN (employee e)   ON (o.employee_id = e.employee_id)  
            LEFT JOIN (service ser)  ON (o.service_id  = ser.service_id)  
            LEFT JOIN (staff s)  ON (o.project_manager_id  = s.staff_id)  
            LEFT JOIN (valuelist VL) ON (o.chance  = VL.value AND VL.key_text = 'opportunityChance')   
            LEFT JOIN (project p)   ON (p.project_id   = o.project_id) 
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
app.post('/getTendersById', (req, res, next) => {
  db.query(`SELECT 
  o.title
  ,o.office_ref_no
  ,o.company_id
  ,o.contact_id
  ,o.mode_of_submission
  ,o.services
  ,o.site_show_date
  ,o.site_show_attendee
  ,o.actual_submission_date
  ,o.project_end_date
  ,o.status
  ,o.email
  ,o.opportunity_id
  ,o.opportunity_code
  ,o.price
  ,o.itq_ref_no
  ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name 
  ,CONCAT_WS(' ', ref.first_name, ref.last_name) AS ref_contact_name 
  ,c.company_name 
  ,c.company_size 
  ,c.source,c.industry 
  ,e.team,p.project_code,ser.title AS service_title 
  ,CONCAT_WS(' ', s.first_name, s.last_name) AS project_manager_name 
  FROM opportunity o 
  LEFT JOIN (contact cont) ON (o.contact_id = cont.contact_id)  
  LEFT JOIN (contact ref)  ON (o.referrer_contact_id = ref.contact_id) 
  LEFT JOIN (company c)  ON (o.company_id  = c.company_id)  
  LEFT JOIN (employee e)   ON (o.employee_id = e.employee_id)  
  LEFT JOIN (service ser)  ON (o.service_id  = ser.service_id)  
  LEFT JOIN (staff s)  ON (o.project_manager_id  = s.staff_id)  
  LEFT JOIN (valuelist VL) ON (o.chance  = VL.value AND VL.key_text = 'opportunityChance')   
  LEFT JOIN (project p)   ON (p.project_id   = o.project_id) 
  WHERE o.opportunity_id=${db.escape(req.body.opportunity_id)}
  ORDER BY o.opportunity_code DESC`,
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

app.get('/getTabCostingSummary', (req, res, next) => {
  db.query(`SELECT 
  c.total_material_price,c.transport_charges,c.total_labour_charges,c.salesman_commission,c.finance_charges,c.office_overheads,c.other_charges,c.total_cost
  FROM opportunity_costing_summary c 
  WHERE c.opportunity_id != '' 
  ORDER BY c.opportunity_costing_summary_id DESC`,
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


app.get('/getTabCostingSummaryForm', (req, res, next) => {
  db.query(`SELECT * FROM opportunity_costing_summary_history WHERE opportunity_costing_summary_id != ''`,
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

app.get('/getTabquote', (req, res, next) => {
  db.query(` SELECT q.quote_date,q.quote_code,q.quote_status,q.project_location,q.project_reference,q.payment_method,q.revision,q.intro_drawing_quote FROM quote q  WHERE q.opportunity_id != ''  ORDER BY quote_code DESC
  `,
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


app.get('/getTabQuoteLine', (req, res, next) => {
  db.query(`SELECT qt.title,qt.description,qt.quantity,qt.unit,qt.unit_price,qt.amount FROM quote_items qt WHERE qt.opportunity_id != '' AND qt.quote_id != ''`,
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
  db.query(`UPDATE opportunity 
            SET office_ref_no=${db.escape(req.body.office_ref_no)}
            ,company_id=${db.escape(req.body.company_id)}
            ,contact_id=${db.escape(req.body.contact_id)}
            ,mode_of_submission=${db.escape(req.body.mode_of_submission)}
            ,services=${db.escape(req.body.services)}
            ,site_show_date=${db.escape(req.body.site_show_date)}
            ,site_show_attendee=${db.escape(req.body.site_show_attendee)}
            ,actual_submission_date=${db.escape(req.body.actual_submission_date)}
            ,project_end_date=${db.escape(req.body.project_end_date)}
            ,email=${db.escape(req.body.email)}
            ,price=${db.escape(req.body.price)}
            ,title=${db.escape(req.body.title)}
            ,status=${db.escape(req.body.status)}
            WHERE opportunity_id =  ${db.escape(req.body.opportunity_id)}`,
    (err, result) => {
     
      if (err) {
        return res.status(400).send({
          msg:`UPDATE opportunity 
            SET office_ref_no=${db.escape(req.body.office_ref_no)}
            ,company_id=${db.escape(req.body.company_id)}
            ,contact_id=${db.escape(req.body.contact_id)}
            ,mode_of_submission=${db.escape(req.body.mode_of_submission)}
            ,services=${db.escape(req.body.services)}
            ,site_show_date=${db.escape(req.body.site_show_date)}
            ,project_end_date=${db.escape(req.body.project_end_date)}
            ,site_show_attendee=${db.escape(req.body.site_show_attendee)}
            ,actual_submission_date=${db.escape(req.body.actual_submission_date)}
            ,email=${db.escape(req.body.email)}
            ,price=${db.escape(req.body.price)}
            ,title=${db.escape(req.body.title)}
            WHERE opportunity_id =  ${db.escape(req.body.opportunity_id)}`
        });
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success',
              sql:`UPDATE opportunity 
            SET office_ref_no=${db.escape(req.body.office_ref_no)}
            ,company_id=${db.escape(req.body.company_id)}
            ,contact_id=${db.escape(req.body.contact_id)}
            ,mode_of_submission=${db.escape(req.body.mode_of_submission)}
            ,services=${db.escape(req.body.services)}
            ,site_show_date=${db.escape(req.body.site_show_date)}
            ,project_end_date=${db.escape(req.body.project_end_date)}
            ,site_show_attendee=${db.escape(req.body.site_show_attendee)}
            ,actual_submission_date=${db.escape(req.body.actual_submission_date)}
            ,email=${db.escape(req.body.email)}
            ,price=${db.escape(req.body.price)}
            ,title=${db.escape(req.body.title)}
            WHERE opportunity_id =  ${db.escape(req.body.opportunity_id)}`
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
  if(type == 'opportunity'){
      key_text = 'nextOpportunityCode';
      sql = "SELECT * FROM setting WHERE key_text='opportunityCodePrefix' OR key_text='nextOpportunityCode'";
  }else if(type == 'receipt'){
      key_text = 'nextReceiptCode';
      sql = "SELECT * FROM setting WHERE key_text='receiptCodePrefix' OR key_text='nextReceiptCode'";
  }else if(type == 'lead'){
      key_text = 'nextLeadsCode';
      sql = "SELECT * FROM setting WHERE key_text='leadsPrefix' OR key_text='nextLeadsCode'";  
  }else if(type == 'invoicestype'){
      key_text = 'nextInvoiceCode';
    sql = "SELECT * FROM setting WHERE key_text='invoiceCodePrefix' OR key_text='nextInvoiceCode'";  
  }else if(type == 'subConworkOrder'){
      key_text = 'nextSubconCode';
    sql = "SELECT * FROM setting WHERE key_text='subconCodePrefix' OR key_text='nextSubconCode'";  
  }else if(type == 'purchaseOrder'){
    key_text = 'nextPurchaseOrderCode';
  sql = "SELECT * FROM setting WHERE key_text='purchaseOrderCodePrefix' OR key_text='nextPurchaseOrderCode'";  
}
  else if(type == 'project'){
      key_text = 'nextProjectCode';
      sql = "SELECT * FROM setting WHERE key_text='projectCodePrefix' OR key_text='nextProjectCode'";  
  }else if(type == 'opportunityproject'){
      key_text = 'nextOpportunityProjectCode';
      sql = "SELECT * FROM setting WHERE key_text='opportunityprojectCodePrefix' OR key_text='nextOpportunityProjectCode'";  
  }else if(type == 'quote'){
      key_text = 'nextQuotationCode';
      sql = "SELECT * FROM setting WHERE key_text='quotationCodePrefix' OR key_text='nextQuotationCode'";  
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
      // withprefix = false;
      key_text = 'nextClaimCode';
      sql = "SELECT * FROM setting WHERE key_text='claimCodePrefix' OR  key_text='nextClaimCode'";  
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

app.post('/getCostingSummaryById', (req, res, next) => {
  db.query(`SELECT 
            c.* 
            FROM opportunity_costing_summary c  
            WHERE c.opportunity_id =  ${db.escape(req.body.opportunity_id)}
            ORDER BY c.opportunity_costing_summary_id DESC`,
    (err, result) => {
       
      if (result.length == 0) {
        return res.status(400).send({
          msg: 'No result found'
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

app.post('/getQuoteLineItemsById', (req, res, next) => {
  db.query(`SELECT
            qt.* 
            FROM quote_items qt 
            WHERE qt.quote_id =  ${db.escape(req.body.quote_id)}`,
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

app.post('/getQuoteById', (req, res, next) => {
  db.query(`SELECT
            q.* 
            FROM quote q 
            WHERE q.opportunity_id = ${db.escape(req.body.opportunity_id)}
            ORDER BY quote_code DESC`,
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
app.post('/insertTenders', (req, res, next) => {

  let data = {title	:req.body.title	
   , company_id	: req.body.company_id
   ,opportunity_code:req.body.opportunity_code
   ,category: req.body.category
   ,status:"Converted to Project"
   ,creation_date: req.body.creation_date
   ,created_by: req.body.created_by
   ,staff_id: req.body.staff_id
   };
  let sql = "INSERT INTO opportunity SET ?";
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

  let data = {title: req.body.title, company_id: req.body.company_id, category_id: req.body.category_id};
  let sql = "INSERT INTO opportunity SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
       return res.status(400).send({
            data: err,
            msg:'Unable to add tender'
          });
    } else {
          return res.status(200).send({
            data: '200',
            msg:'New Tender has been created successfully'
          });
    }
  });
});
app.post('/getQuotePDF', (req, res, next) => {
    db.query(`SELECT q.*
    ,qi.title AS quote_item_title
    ,qi.quantity
    ,qi.unit
    ,qi.description
    ,qi.amount
    ,qi.unit_price
    ,qi.remarks
    ,o.opportunity_id
    ,o.opportunity_code
    ,o.company_id
    ,c.company_name
    ,c.address_flat AS billing_address_flat
    ,c.address_street AS billing_address_street
    ,c.address_town AS billing_address_town
    ,c.address_state AS billing_address_state
    ,gc.name AS billing_address_country
    ,c.address_po_code AS billing_address_po_code
    ,c.company_id
    ,co.email
    ,c.phone
    ,c.fax
    ,c.mobile
    ,co.salutation
    ,co.first_name
    ,s.email AS employee_email
    ,e.mobile AS employee_mobile
  FROM quote q
  LEFT JOIN (quote_items qi) ON (qi.quote_id = q.quote_id)
  LEFT JOIN (opportunity o) ON (o.opportunity_id = q.opportunity_id)
  LEFT JOIN (company c) ON (c.company_id = o.company_id)
  LEFT JOIN (contact co) ON (co.contact_id = o.contact_id)
  LEFT JOIN (geo_country gc) ON (gc.country_code = c.address_country)
  LEFT JOIN (employee e) ON (e.employee_id = q.employee_id)
  LEFT JOIN (staff s) ON (s.employee_id = q.employee_id)
  WHERE q.quote_id = ${db.escape(req.body.quote_id)}
  ORDER BY qi.quote_items_id ASC`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
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
app.post('/edit-TabCostingSummaryForm', (req, res, next) => {
  db.query(`UPDATE opportunity_costing_summary 
            SET no_of_worker_used=${db.escape(req.body.no_of_worker_used)}
            ,no_of_days_worked=${db.escape(req.body.no_of_days_worked)}
            ,labour_rates_per_day=${db.escape(req.body.labour_rates_per_day)}
            ,po_price=${db.escape(req.body.po_price)}
            ,transport_charges=${db.escape(req.body.transport_charges)}
            ,salesman_commission=${db.escape(req.body.salesman_commission)}
            ,office_overheads=${db.escape(req.body.office_overheads)}
            ,finance_charges=${db.escape(req.body.finance_charges)}
            ,other_charges=${db.escape(req.body.other_charges)}
            ,total_cost =${db.escape(req.body.total_cost)}
           , total_labour_charges=${db.escape(req.body.total_labour_charges)}
           , total_material_price=${db.escape(req.body.total_material_price)}
           ,opportunity_id=${db.escape(req.body.opportunity_id)}
           ,profit_percentage=${db.escape(req.body.profit_percentage)}
           ,profit=${db.escape(req.body.profit)}
            WHERE opportunity_costing_summary_id = ${db.escape(req.body.opportunity_costing_summary_id)}`,
    (err, result) =>{
      if (err) {
          return res.status(400).send({
              data: err,
              msg:'error'
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

app.post('/getQuoteLineItemsById', (req, res, next) => {
  db.query(`SELECT
            qt.* 
            FROM quote_items qt 
            WHERE qt.quote_id =  ${db.escape(req.body.quote_id)}`,
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
app.post('/deleteQuoteItems', (req, res, next) => {

  let data = {quote_items_id: req.body.quote_items_id};
  let sql = "DELETE FROM quote_items WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      return res.status(400).send({
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
app.post('/edit-TabQuote', (req, res, next) => {
  db.query(`UPDATE quote
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
            WHERE quote_id =  ${db.escape(req.body.quote_id)}`,
    (err, result) =>{
      if (err) {
          return res.status(400).send({
              data: err,
              msg:'error'
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
app.post('/edit-TabQuoteLine', (req, res, next) => {
  db.query(`UPDATE quote_items
            SET title=${db.escape(req.body.title)}
            ,description=${db.escape(req.body.description)}
            ,quantity=${db.escape(req.body.quantity)}
            ,unit=${db.escape(req.body.unit)}
            ,unit_price=${db.escape(req.body.unit_price)}
            ,amount=${db.escape(req.body.amount)}
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
app.post('/insertQuoteItems', (req, res, next) => {

  let data = {
    quote_category_id:req.body.quote_category_id
     ,description: req.body.description
    , amount: req.body.amount
    , amount_other: req.body.amount_other
    , item_type: req.body.item_type
    , sort_order: req.body.sort_order
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

app.post('/insertTabcostingsummary', (req, res, next) => {
  let data = {
    opportunity_costing_summary_id: req.body.opportunity_costing_summary_id || null,
    opportunity_id: req.body.opportunity_id || null,
    no_of_worker_used: req.body.no_of_worker_used || 0,
    no_of_days_worked: req.body.no_of_days_worked || 0,
    labour_rates_per_day: req.body.labour_rates_per_day || 0,
    po_price: req.body.po_price || 0,
    transport_charges: req.body.transport_charges || 0,
    salesman_commission: req.body.salesman_commission || 0,
    office_overheads: req.body.office_overheads || 0,
    finance_charges: req.body.finance_charges || 0,
    other_charges: req.body.other_charges || 0,
    total_labour_charges: req.body.total_labour_charges || 0,
    total_cost: req.body.total_cost || 0,
    total_material_price: req.body.total_material_price || 0,
    profit_percentage: req.body.profit_percentage || 0,
    profit: req.body.profit || 0
  };

  let sql = "INSERT INTO opportunity_costing_summary SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: 'Failed'
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: 'New quote item has been created successfully'
      });
    }
  });
});

app.post('/getTabCostingSummaryById', (req, res, next) => {
  db.query(`SELECT 
  c.no_of_days_worked,
  c.opportunity_costing_summary_id,
  c.no_of_worker_used,
  c.labour_rates_per_day,
  c.po_price,
  c.po_price_with_gst,
  c.profit_percentage,
  c.invoiced_price,
  c.profit,
  c.total_material_price,
  c.transport_charges,
  c.total_labour_charges,
  c.salesman_commission,
  c.finance_charges,
  c.office_overheads,
  c.other_charges,
  c.total_cost
FROM opportunity_costing_summary c
WHERE c.opportunity_id = ${db.escape(req.body.opportunity_id)} 
ORDER BY c.opportunity_costing_summary_id DESC;`,
    (err, result) =>{
      if (err) {
           return res.status(400).send({
                data: err,
                msg:'err'
              });
        } else {
            if(err){
              return res.status(200).send({
                  data:[],
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

app.post('/getTabOpportunityCostingSummary', (req, res, next) => {
  db.query(`SELECT 
  c.no_of_worker_used
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
  ,c.total_cost of FROM opportunity_costing_summary c WHERE c.opportunity_id =${db.escape(req.body.opportunity_id)} 
  ORDER BY c.opportunity_costing_summary_id DESC`,
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


app.get('/getTabCostingSummary', (req, res, next) => {
db.query(`SELECT 
c.total_material_price,c.transport_charges,c.total_labour_charges,c.salesman_commission,c.finance_charges,c.office_overheads,c.other_charges,c.total_cost
FROM opportunity_costing_summary c 
WHERE c.opportunity_id != '' 
ORDER BY c.opportunity_costing_summary_id DESC`,
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