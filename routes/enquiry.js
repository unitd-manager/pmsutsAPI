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

app.get('/getEnquiry', (req, res, next) => {
  db.query(`SELECT 
            o.*
            ,o.actual_closing
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
app.get('/getEnquirySummary', (req, res, next) => {
  db.query(`SELECT 
    c.company_id,
    c.company_name,
    o.opportunity_code,
   o.opportunity_id ,
   q.quote_code,
   q.quote_date,
   g.goods_delivery_date,
    SUM(qi.amount) AS quoteAmount,
   SUM(gi.amount ) AS deliveryAmount
FROM company c
LEFT JOIN opportunity o ON c.company_id = o.company_id
LEFT JOIN quote q ON o.opportunity_id = q.opportunity_id
LEFT JOIN quote_items qi ON q.quote_id = qi.quote_id
LEFT JOIN orders os ON q.quote_id = os.quote_id
LEFT JOIN goods_delivery g ON os.order_id = g.order_id
LEFT JOIN goods_delivery_item gi ON g.goods_delivery_id = gi.goods_delivery_id
WHERE o.opportunity_id !=''
GROUP BY 
    o.opportunity_id,
    g.goods_delivery_id`,
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
app.post('/getEnquiryById', (req, res, next) => {
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
   ,o.actual_closing
  ,o.itq_ref_no
  ,o.enquiry_date
  ,CONCAT_WS(' ', ref.first_name, ref.last_name) AS ref_contact_name 
  ,c.company_name 
  ,c.company_size 
  ,c.source,c.industry 
    ,cont.first_name
  ,c.address_flat
  ,c.address_street
  ,c.address_town
  ,c.address_country
  ,c.address_po_code
  ,c.phone
  ,o.creation_date
  ,o.modification_date
  ,o.created_by
  ,o.modified_by
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


app.post('/getTabCostingSummaryById', (req, res, next) => {
    db.query(`SELECT 
    c.no_of_days_worked,
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
    (c.transport_charges + c.other_charges + c.finance_charges) AS total_cost
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
              if(result.length == 0){
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

app.post('/getTabCostingSummaryById', (req, res, next) => {
  db.query(`SELECT 
  c.total_material_price
  ,c.transport_charges
  ,c.total_labour_charges
  ,c.salesman_commission
  ,c.finance_charges
  ,c.office_overheads
  ,c.other_charges
  ,c.total_cost
  FROM opportunity_costing_summary c 
  WHERE c.opportunity_id =${db.escape(req.body.opportunity_id)} 
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
app.post('/edit-Enquiry', (req, res, next) => {
  db.query(`UPDATE opportunity 
            SET office_ref_no=${db.escape(req.body.office_ref_no)}
            ,company_id=${db.escape(req.body.company_id)}
            ,modified_by=${db.escape(req.body.modified_by)}
             ,enquiry_date=${db.escape(req.body.enquiry_date)}
            ,contact_id=${db.escape(req.body.contact_id)}
            ,actual_closing=${db.escape(req.body.actual_closing)}
            ,mode_of_submission=${db.escape(req.body.mode_of_submission)}
            ,services=${db.escape(req.body.services)}
            ,site_show_date=${db.escape(req.body.site_show_date)}
            ,site_show_attendee=${db.escape(req.body.site_show_attendee)}
            ,actual_submission_date=${db.escape(req.body.actual_submission_date)}
            ,project_end_date=${db.escape(req.body.project_end_date)}
            ,modification_date=${db.escape(req.body.modification_date)}
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
              data: result,
              msg:'Success'
            });

        }
 
    }
  );
});

app.post('/getQuoteLineItemsById', (req, res, next) => {
  db.query(`SELECT
            qt.title,
            qt.description,
            qt.quantity, 
            qt.unit_price,
            qt.amount
            FROM quote_items qt 
            WHERE qt.opportunity_id =  ${db.escape(req.body.opportunity_id)}`,
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


app.get("/getCategoryFromValueList", (req, res, next) => {
  db.query(
    `SELECT 
      value,valuelist_id
      FROM valuelist WHERE key_text="Category"`,
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


app.post('/getQuoteById', (req, res, next) => {
  db.query(`SELECT
            q.* 
    ,(SELECT SUM(qt.amount)
        FROM quote_items qt
        WHERE q.quote_id = qt.quote_id
    ) AS total_amount,
    (COALESCE((SELECT SUM(qt.amount)
                FROM quote_items qt
                WHERE q.quote_id = qt.quote_id
            ), 0) - COALESCE(q.discount, 0)) AS totalamount
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
app.post('/insertEnquiry', (req, res, next) => {

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

  let data = {title: req.body.title, company_id: req.body.company_id, 
  category_id: req.body.category_id,opportunity_code:req.body.opportunity_code};
  let sql = "INSERT INTO opportunity SET ?";
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
  ,ql.total_amount
  ,ql.discount
  ,ql.drawing_nos
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

// app.post('/getQuoteLineItemsById', (req, res, next) => {
//   db.query(`SELECT
//             qt.* 
//             FROM quote_items qt 
//             WHERE qt.quote_id =  ${db.escape(req.body.quote_id)}`,
//           (err, result) => {
       
//       if (result.length == 0) {
//         return res.status(400).send({
//           msg: 'No result found'
//         });
//       } else {
//             return res.status(200).send({
//               data: result,
//               msg:'Success'
//             });
//       }
 
//     }
//   );
// });

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



app.post('/insertTabcostingsummary', (req, res, next) => {

  let data = {
      opportunity_costing_summary_id:req.body.opportunity_costing_summary_id
    , opportunity_id:req.body.opportunity_id
    , no_of_worker_used: req.body.no_of_worker_used
    , no_of_days_worked: req.body.no_of_days_worked
    , labour_rates_per_day: req.body.labour_rates_per_day
    , po_price: req.body.po_price
    , transport_charges: req.body.transport_charges
    , salesman_commission: req.body.salesman_commission
    , office_overheads: req.body.office_overheads
    , finance_charges: req.body.finance_charges
    , other_charges: req.body.other_charges
     , total_labour_charges:req.body.total_labour_charges
    , total_cost	: req.body.total_cost
    ,total_material_price:req.body.total_material_price
     ,po_price:req.body.po_price
      ,profit_percentage:req.body.profit_percentage
       ,profit:req.body.profit
    
    
 };
  let sql = "INSERT INTO opportunity_costing_summary SET ?";
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
app.post('/insertContact', (req, res, next) => {

  let data = {salutation: req.body.salutation
    , first_name: req.body.first_name
    , email: req.body.email
    , position: req.body.position
    , department: req.body.department
    , phone_direct: req.body.phone_direct
    , fax: req.body.fax
    , mobile: req.body.mobile
    , company_id:req.body.company_id};
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
  else if(type == 'goodsdelivery'){
  key_text = 'nextGoodsDeliveryCode';
  sql = "SELECT * FROM setting WHERE key_text='goodsDeliveryCodePrefix' OR key_text='nextGoodsDeliveryCode'";  
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
  }else if(type == 'projectquote'){
    key_text = 'nextProjectQuoteCode';
    sql = "SELECT * FROM setting WHERE key_text='projectQuoteCodePrefix' OR key_text='nextProjectQuoteCode'";  
}else if(type == 'projectjob'){
  key_text = 'nextProjectJobCode';
  sql = "SELECT * FROM setting WHERE key_text='projectJobCodePrefix' OR key_text='nextProjectJobCode'";  
}else if(type == 'materialrequest'){
  key_text = 'nextMaterialRequestCode';
  sql = "SELECT * FROM setting WHERE key_text='materialRequestCodePrefix' OR key_text='nextMaterialRequestCode'";  
}else if(type == 'equipmentrequest'){
  key_text = 'nextEquipmentRequestCode';
  sql = "SELECT * FROM setting WHERE key_text='equipmentRequestCodePrefix' OR key_text='nextEquipmentRequestCode'";  
}else if(type == 'goodsdelivery'){
  key_text = 'nextGoodsDeliveryCode';
  sql = "SELECT * FROM setting WHERE key_text='goodsDeliveryCodePrefix' OR key_text='nextGoodsDeliveryCode'";  
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
  else if(type == 'proposal'){
    key_text = 'nextProposalCode';
    sql = "SELECT * FROM setting WHERE key_text='proposalCodePrefix' OR key_text='nextProposalCode'";  
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

app.post('/deleteEditItem', (req, res, next) => {

  let data = {quote_items_id: req.body.quote_items_id};
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
            ,our_reference=${db.escape(req.body.our_reference)}
            ,drawing_nos=${db.escape(req.body.drawing_nos)}
            ,ref_no_quote=${db.escape(req.body.ref_no_quote)}
            ,discount=${db.escape(req.body.discount)}
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
app.post("/insertLog", (req, res, next) => {
  let data = {
    opportunity_id	:req.body.opportunity_id	
   , quote_id	: req.body.quote_id	
   ,quote_log_id:req.body.quote_log_id
   , quote_date: req.body.quote_date
   , quote_status: req.body.quote_status
   , quote_code: req.body.quote_code
   , project_location	: req.body.project_location
   , project_reference	: req.body.project_reference
   , modification_date: req.body.modification_date
   , creation_date: new Date().toISOString()
   , ref_no_quote	: req.body.ref_no_quote	
   , revision	: req.body.revision
   , discount	: req.body.discount	
   , payment_method: req.body.payment_method
  };
  let sql = "INSERT INTO quote_log SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
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
  });
});


app.post('/insertLogLine', (req, res, next) => {

  let data = {
    quote_category_id:req.body.quote_category_id
     ,description: req.body.description
    , amount: req.body.amount
    , title: req.body.title
    , quote_id: req.body.quote_id
    , opportunity_id: req.body.opportunity_id
    , quantity: req.body.quantity
    , project_id: req.body.project_id
    , unit: req.body.unit
    , remarks: req.body.remarks
    , unit_price: req.body.unit_price
    , quote_items_id: req.body.quote_items_id
    , quote_log_id: req.body.quote_log_id
 };
  let sql = "INSERT INTO quote_items_log SET ?";
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


app.post('/insertquotes', (req, res, next) => {

    let data = {quote_id: req.body.quote_id,
              opportunity_id: req.body.opportunity_id,
              quote_date: new Date(),
              quote_code: req.body.quote_code,
              
              total_amount:req.body.total_amount
        
    };
    let sql = "INSERT INTO quote  SET ?";
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
  
  
  app.post('/insertquote', (req, res, next) => {

    let data = {quote_id: req.body.quote_id,
              opportunity_id: req.body.opportunity_id,
              project_id:req.body.project_id,
              quote_date:  new Date(),
              
              
              quote_status:'new',
              total_amount:req.body.total_amount
        
    };
    let sql = "INSERT INTO quote  SET ?";
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
            ,o.enquiry_date
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