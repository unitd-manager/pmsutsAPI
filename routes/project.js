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

// app.get('/getProject', (req, res, next) => {
//   db.query(`SELECT p.title
//   ,p.category
//   ,p.status
//   ,p.contact_id
//   ,p.start_date
//   ,p.estimated_finish_date
//   ,p.description
//   ,p.project_manager_id
//   ,p.project_id
//   ,p.project_code
//   ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name 
//   ,c.company_name 
//   ,c.company_size 
//   ,c.source ,c.industry 
//   ,o.opportunity_code 
//   ,( SELECT GROUP_CONCAT( CONCAT_WS(' ', stf.first_name, stf.last_name) 
//   ORDER BY CONCAT_WS(' ', stf.first_name, stf.last_name) SEPARATOR ', ' ) 
//   FROM staff stf ,project_staff ts 
//   WHERE ts.project_id = p.project_id AND stf.staff_id = ts.staff_id ) 
//   AS staff_name ,ser.title as service_title ,CONCAT_WS(' ', s.first_name, s.last_name) 
//   AS project_manager_name ,(p.project_value - (IF(ISNULL(( SELECT SUM(invoice_amount) 
//   FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id)
//  WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ),0, ( SELECT SUM(invoice_amount) 
//   FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id) 
//   WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ))) AS still_to_bill FROM project p LEFT JOIN (contact cont) ON (p.contact_id = cont.contact_id)LEFT JOIN (company c)ON (p.company_id = c.company_id) 
//   LEFT JOIN (service ser) ON (p.service_id = ser.service_id) LEFT JOIN (staff s) ON (p.project_manager_id = s.staff_id) LEFT JOIN (opportunity o) ON (p.opportunity_id = o.opportunity_id) WHERE ( LOWER(p.status) = 'wip' OR LOWER(p.status) = 'billable' OR LOWER(p.status) = 'billed' ) AND ( LOWER(p.status) = 'wip' OR LOWER(p.status) ='billable' OR LOWER(p.status) = 'billed') ORDER BY p.project_code DESC`,
//     (err, result) => {
       
//       if (result.length == 0) {
//         return res.status(400).send({
//           msg: 'No result found'
//         });
//       } else {
//             return res.status(200).send({
//               data: result,
//               msg:'Success'
//             });

//         }
 
//     }
//   );
// });

// app.post('/getProjectsByID', (req, res, next) => {
//   db.query(`SELECT p.title
//   ,p.category
//   ,p.status
//   ,p.contact_id
//   ,p.start_date
//   ,p.estimated_finish_date
//   ,p.description
//   ,p.project_manager_id
//   ,p.project_id
//   ,p.company_id 
//   ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name 
//   ,c.company_name 
//   ,c.company_size 
//   ,c.source ,c.industry 
//   ,o.opportunity_code 
//   ,p.project_code
//   ,( SELECT GROUP_CONCAT( CONCAT_WS(' ', stf.first_name, stf.last_name) 
//   ORDER BY CONCAT_WS(' ', stf.first_name, stf.last_name) SEPARATOR ', ' ) 
//   FROM staff stf ,project_staff ts 
//   WHERE ts.project_id = p.project_id AND stf.staff_id = ts.staff_id ) 
//   AS staff_name ,ser.title as service_title ,CONCAT_WS(' ', s.first_name, s.last_name) 
//   AS project_manager_name ,(p.project_value - (IF(ISNULL(( SELECT SUM(invoice_amount) 
//   FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id)
//  WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ),0, ( SELECT SUM(invoice_amount) 
//   FROM invoice i LEFT JOIN (orders o) ON (i.order_id = o.order_id) 
//   WHERE o.project_id = p.project_id AND LOWER(i.status) != 'cancelled' ) ))) AS still_to_bill FROM project p LEFT JOIN (contact cont) ON (p.contact_id = cont.contact_id)LEFT JOIN (company c)ON (p.company_id = c.company_id) 
//   LEFT JOIN (service ser) ON (p.service_id = ser.service_id) LEFT JOIN (staff s) ON (p.project_manager_id = s.staff_id) LEFT JOIN (opportunity o) ON (p.opportunity_id = o.opportunity_id) WHERE ( LOWER(p.status) = 'wip' OR LOWER(p.status) = 'billable' OR LOWER(p.status) = 'billed' ) AND ( LOWER(p.status) = 'wip' OR LOWER(p.status) ='billable' OR LOWER(p.status) = 'billed') AND p.project_id=${db.escape(req.body.project_id)}  ORDER BY p.project_code DESC`,
//      (err, result) => {
//     if (err) {
//       console.log('error: ', err)
//       return res.status(400).send({
//         data: err,
//         msg: 'failed',
//       })
//     } else {
//       return res.status(200).send({
//         data: result,
//         msg: 'Success',
// })
// }
//   }
// );
// })

app.post('/getProjectsByIDs', (req, res, next) => {
  db.query(`SELECT
  p.title,
  p.category,
  p.status,
  p.quote_ref,
  p.project_code,
  p.contact_id,
  p.start_date,
  p.estimated_finish_date,
  p.actual_finish_date,
  p.description,
  p.project_manager_id,
  p.project_id,
  p.company_id,
  p.client_type,
  p.difficulty,
  p.per_completed,
  p.project_value,
  p.quote_id,
  p.creation_date,
  p.modification_date,
  p.created_by,
  p.general,
  p.modified_by,
  CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name,
  cont.first_name,
  c.company_name,
  c.company_size,
  c.source,
  c.industry,
  p.project_value,
  (p.project_value -(COALESCE((
    SELECT SUM(i.invoice_amount) AS totalInvoice
    FROM invoice i
    WHERE i.project_id = p.project_id
  ),0) -
  COALESCE((
  SELECT
    SUM(i.invoice_amount) AS cancelAmount
  FROM invoice i
  WHERE i.project_id = p.project_id AND i.status = LOWER('Cancelled')),0)))AS balanceAmount
FROM project p
LEFT JOIN company c ON p.company_id = c.company_id
LEFT JOIN contact cont ON p.contact_id = cont.contact_id
WHERE p.project_id = ${db.escape(req.body.project_id)}  ORDER BY p.project_code DESC`,
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
})

app.get('/getProjects', (req, res, next) => {
  db.query(`SELECT p.title
  ,p.category
  ,p.status
  ,p.contact_id
  ,p.start_date
  ,p.estimated_finish_date
  ,p.description
  ,p.project_manager_id
  ,p.project_id
  ,p.company_id
  ,p.project_code
  ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name 
  ,c.company_name 
  ,c.company_size 
  ,c.source ,c.industry 
  ,o.opportunity_code 
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
  LEFT JOIN (service ser) ON (p.service_id = ser.service_id) LEFT JOIN (staff s) ON (p.project_manager_id = s.staff_id) LEFT JOIN (opportunity o) ON (p.opportunity_id = o.opportunity_id) WHERE p.project_id!='' ORDER BY p.project_code DESC`,
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


app.post('/getcompanyById', (req, res, next) => {
  db.query(` SELECT *,
  c.company_name
             FROM project p 
        LEFT JOIN (company c) ON (c.company_id = p.company_id)
        WHERE p.project_id = ${db.escape(req.body.project_id)}`,
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
})

app.post('/getCompany', (req, res, next) => {
  db.query(` SELECT *,
  c.company_name,
  c.company_id
             FROM company c `,
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
})


app.post('/getcontactById', (req, res, next) => {
  db.query(` SELECT 
  c.contact_id,
  c.first_name,
  cm.company_id,
  c.company_id,
  cm.company_name
  FROM contact c 
 LEFT JOIN company cm  ON (cm.company_id = c.company_id) 
 where cm.company_id=${db.escape(req.body.company_id)} `,
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

app.post('/getAmountByProjectId', (req, res, next) => {
  db.query(`select (sum(i.invoice_amount)) as totalInvoice 
,(sum(ir.amount))as receivedAmount
,(sum(i.invoice_amount - ir.amount))as balanceAmount
from invoice i
 LEFT JOIN (invoice_receipt_history ir) ON (ir.invoice_id = i.invoice_id)
where i.project_id= ${db.escape(req.body.project_id)} `,
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

app.post('/insertTabcostingsummary', (req, res, next) => {
  // Function to handle null or empty values
  const handleNull = (value) => {
    return (value === '' || value === null || value === undefined) ? null : value;
  };

  let data = {
    project_id: handleNull(req.body.project_id),
    no_of_worker_used: handleNull(req.body.no_of_worker_used),
    no_of_days_worked: handleNull(req.body.no_of_days_worked),
    labour_rates_per_day: handleNull(req.body.labour_rates_per_day),
    po_price: handleNull(req.body.po_price),
    transport_charges: handleNull(req.body.transport_charges),
    salesman_commission: handleNull(req.body.salesman_commission),
    office_overheads: handleNull(req.body.office_overheads),
    finance_charges: handleNull(req.body.finance_charges),
    other_charges: handleNull(req.body.other_charges),
    total_labour_charges: handleNull(req.body.total_labour_charges),
    total_cost: handleNull(req.body.total_cost),
    total_material_price: handleNull(req.body.total_material_price),
    profit_percentage: handleNull(req.body.profit_percentage),
    profit: handleNull(req.body.profit)
  };

  let sql = "INSERT INTO costing_summary SET ?";
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
FROM costing_summary c
WHERE c.project_id = ${db.escape(req.body.project_id)} 
ORDER BY c.costing_summary_id DESC;`,
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

app.post('/edit-Project', (req, res, next) => {
  db.query(`UPDATE project 
            SET title=${db.escape(req.body.title)}
            ,category=${db.escape(req.body.category)}
            ,status=${db.escape(req.body.status)}
            ,contact_id=${db.escape(req.body.contact_id)}
            ,company_id=${db.escape(req.body.company_id)}
            ,start_date=${db.escape(req.body.start_date)}
            ,estimated_finish_date=${db.escape(req.body.estimated_finish_date)}
            ,description=${db.escape(req.body.description)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,general=${db.escape(req.body.general)}
            WHERE project_id =  ${db.escape(req.body.project_id)}`,
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


app.post("/getClaimPaymentBYId", (req, res, next) => {
  db.query(
    `select (select (SELECT(sum(c.amount)))
    from claim_payment c
    WHERE c.project_id = ${db.escape(req.body.project_id)}  AND c.claim_payment_id < ${db.escape(req.body.claim_payment_id)}) as prev_amount
    ,cl.amount as contractAmount
              ,cl.title
              ,cl.description
              ,pc.claim_date
              ,c.claim_seq
              ,c.amount
              ,cl.remarks
              ,(SELECT(sum(c.amount))) as cum_amount
              from claim_line_items cl
               LEFT JOIN (claim_payment c) ON (c.claim_line_items_id = cl.claim_line_items_id)
               LEFT JOIN (project_claim pc) ON (pc.project_claim_id = cl.project_claim_id)
              WHERE cl.project_id = ${db.escape(req.body.project_id)}`,
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
            )
    });

app.post("/getProjectClaimSummaryById", (req, res, next) => {
  db.query(
    `SELECT pc.amount
    ,pc.variation_order_submission
    ,(select(sum(pc.amount+ pc.variation_order_submission))) AS overAllAmount
    ,pc.vo_claim_work_done
    ,pc.amount as con_sum
    ,pc.claim_date
    ,pc.ref_no
    ,pc.less_previous_retention
          FROM project_claim pc
                    WHERE pc.project_id=${db.escape(
                        req.body.project_id
                      )}`,
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

app.post("/getProjectPaymentSummaryById", (req, res, next) => {
  db.query(
    `SELECT c.claim_seq
    ,c.date
     ,p.title
     ,c.description
     ,p.quote_id
     ,c.amount
     ,co.company_name
     FROM claim_payment c
               LEFT JOIN (project p) ON (p.project_id = c.project_id)
               LEFT JOIN (company co) ON (co.company_id = p.company_id)
               WHERE c.project_id=${db.escape(
                        req.body.project_id
                      )}`,
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

app.post('/getQuotePdfById', (req, res, next) => {
  db.query(`SELECT q.quote_code
  ,q.quote_date
  ,q.gst
  ,q.payment_method
  ,q.created_by
  ,q.project_location
  ,q.project_reference
  ,q.discount
  ,q.employee_id
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

app.post('/getSupplierById', (req, res, next) => {
  db.query(`select (sum(s.amount)) as payAmount,
(sum(sr.amount)) as paidAmount
from supplier_receipt s
LEFT JOIN supplier_receipt_history sr  ON (sr.supplier_receipt_id = s.supplier_receipt_id) 
LEFT JOIN purchase_order p  ON (p.purchase_order_id = sr.purchase_order_id) 
where p.project_id = ${db.escape(req.body.project_id)}`,
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

app.post('/getSubconById', (req, res, next) => {
  db.query(`select (sum(s.amount)) as payAmount,
(sum(sh.amount)) as paidAmount
from sub_con_payments s
LEFT JOIN sub_con_payments_history sh ON (sh.sub_con_payments_id = s.sub_con_payments_id) 
LEFT JOIN sub_con_work_order so  ON (so.sub_con_work_order_id = s.sub_con_work_order_id) 
where so.project_id =  ${db.escape(req.body.project_id)}`,
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

app.post('/getCompanyProjectById', (req, res, next) => {
  db.query(`select c.company_id
,c.company_name as cust_company_name
,c.address_street as cust_address1
,c.address_town as cust_address2
,c.address_country as cust_address_country
,c.address_po_code as cust_address_po_code
,p.category as project_type
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


app.post('/getProjectSummary', (req, res, next) => {
  db.query(`SELECT p.*
                  ,p.title AS Project_name
                  ,c.company_id
                  ,c.company_name
                  ,o.price
                  ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name
            FROM project p
            LEFT JOIN (company c) ON (c.company_id = p.company_id)
            LEFT JOIN (contact cont) ON (p.contact_id = cont.contact_id)
            LEFT JOIN (opportunity o) ON (p.opportunity_id = o.opportunity_id)
         WHERE p.project_id = ${db.escape(req.body.project_id)}
 ORDER BY p.project_id DESC`,
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

app.post('/insertProject', (req, res, next) => {

  let data = {title	:req.body.title	
   , category	: req.body.category	
   , status: req.body.status
   , contact_id: req.body.contact_id
   , company_id: req.body.company_id
   , quote_id: req.body.quote_id
   , opportunity_id: req.body.opportunity_id
   , start_date	: new Date()
   , actual_finish_date	: req.body.actual_finish_date
   , start_date: req.body.start_date
   , creation_date: req.body.creation_date
   , modification_date: null	
   , project_id:req.body.project_id
   ,created_by: req.body.created_by
  };
  let sql = "INSERT INTO project SET ?";
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

app.post('/getCostingSummaryForDashboard', (req, res, next) => {
  db.query(`SELECT p.*
                  ,p.title AS Project_name,
                (SELECT SUM(amount) 
FROM actual_costing_summary 
WHERE title = 'Transport Charges' 
AND project_id = p.project_id) as transport_charges,
(SELECT SUM(amount) 
FROM actual_costing_summary 
WHERE title = 'Other Charges' 
AND project_id = p.project_id) as other_charges,
(SELECT SUM(amount) 
FROM actual_costing_summary 
WHERE title = 'Total Labour Charges' 
AND project_id = p.project_id) as labour_charges,
(SELECT SUM(amount) 
FROM actual_costing_summary 
WHERE title = 'Salesman Commission' 
AND project_id = p.project_id) as sales_commision,
(SELECT SUM(amount) 
FROM actual_costing_summary 
WHERE title = 'Finance Charges' 
AND project_id = p.project_id) as finance_charges,
(SELECT SUM(amount) 
FROM actual_costing_summary 
WHERE title = 'Office Overheads' 
AND project_id = p.project_id) as office_overheads

            FROM project p
           
         WHERE p.project_id = ${db.escape(req.body.project_id)}`,
    (err, result) => {
       
      if (err) {
        return res.status(400).send({
          msg: err
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