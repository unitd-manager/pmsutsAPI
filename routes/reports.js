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

app.post('/getEmployeeReports', (req, res, next) => {
  db.query(`SELECT ts.*
              ,t.title AS training_title
              ,e.first_name
        FROM training_staff ts
        LEFT JOIN (training t) ON (ts.training_id = t.training_id)
        LEFT JOIN (employee e) ON (ts.staff_id = e.employee_id)
         WHERE e.status = 'Current'
 ORDER BY ts.from_date ASC, ts.to_date ASC  `,
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

app.get("/getProjectReport", (req, res, next) => {
  db.query(
    `SELECT p.*
    ,p.title AS Project_name
    ,c.company_id
    ,c.company_name 
    ,o.price
    ,p.category
    ,CONCAT_WS(' ', cont.first_name, cont.last_name) AS contact_name
FROM project p
LEFT JOIN company c ON (c.company_id = p.company_id)
LEFT JOIN (contact cont) ON (p.contact_id = cont.contact_id)
LEFT JOIN (opportunity o) ON (p.opportunity_id = o.opportunity_id)
WHERE p.project_id!=''`,
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

app.get("/getSalesReport", (req, res, next) => {
  db.query(
    `SELECT i.invoice_date,
i.invoice_code
,c.company_name
,(select(it.amount)) AS invoiceAmount
,(select(i.invoice_amount - it.amount)) AS gst
,(select(i.invoice_amount)) AS total
,(select(ir.amount)) AS received
,(select(i.invoice_amount - ir.amount)) AS balance
from invoice i
left JOIN invoice_receipt_history ir ON ir.invoice_id =i.invoice_id
left JOIN project p ON p.project_id =i.project_id
left JOIN invoice_item it ON it.invoice_id = i.invoice_id
left JOIN company c ON c.company_id = p.company_id
where i.invoice_id!=''`,
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



app.get("/getInvoiceByYearReport", (req, res, next) => {
  db.query(
    ` SELECT DATE_FORMAT(i.invoice_date, '%Y') AS invoice_year
              ,(SUM(i.invoice_amount )) AS invoice_amount_yearly
              ,o.record_type
        FROM invoice i
        LEFT JOIN orders o   ON (o.order_id   = i.order_id) 
        where o.record_type!=''
 AND i.status != 'cancelled'
 GROUP BY DATE_FORMAT(i.invoice_date, '%Y'),o.record_type`,
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

app.post('/getAgingReports', (req, res, next) => {
  db.query(`SELECT c.company_name,
c.company_id, 
i.invoice_id, 
i.status, 
i.invoice_date,
invHist.amount,
(CASE WHEN DATEDIFF(CURDATE(), i.invoice_date) BETWEEN 0 AND 15 THEN invHist.amount ELSE 0 END) AS 'firstdays', 
(CASE WHEN DATEDIFF(CURDATE(), i.invoice_date) BETWEEN 16 AND 30 THEN invHist.amount ELSE 0 END) AS 'seconddays', 
(CASE WHEN DATEDIFF(CURDATE(), i.invoice_date) BETWEEN 31 AND 45 THEN invHist.amount ELSE 0 END) AS 'thirddays' 
FROM invoice i 
LEFT JOIN orders o ON (i.order_id = o.order_id) 
LEFT JOIN company c ON (o.company_id = c.company_id) 
LEFT JOIN invoice_receipt_history invHist ON (invHist.invoice_id = i.invoice_id)
WHERE c.company_id !='' 
AND i.status != 'Cancelled' 
AND i.status='due' OR i.status='Partial Payment'  OR i.status='paid'`,
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

app.get('/getInvoiveByMonth', (req, res, next) => {
  db.query(` SELECT DATE_FORMAT(i.invoice_date, '%b %Y') AS invoice_month
  ,(SUM(i.invoice_amount 
                    )
                ) AS invoice_amount_monthly
                ,o.record_type
        FROM invoice i
        LEFT JOIN orders o  ON (o.order_id  = i.order_id)
         WHERE o.record_type !=''
 AND i.status != 'Cancelled'
 AND i.invoice_date BETWEEN '2021-01-1' AND '2023-12-1'
 GROUP BY DATE_FORMAT(i.invoice_date, '%Y-%m')`,
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
app.get('/getEmployeeSalaryReport', (req, res, next) => {
  db.query(`SELECT DISTINCT 
             CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
             ,j.designation
            ,j.department
            ,pm.basic_pay
            , first_name,date_of_birth, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), date_of_birth)), '%Y') + 0 AS age
            ,(pm.allowance1+pm.allowance2+pm.allowance3+pm.allowance4+pm.allowance5) AS total_allowance
             ,pm.total_deductions
            ,pm.net_total
            ,e.nric_no
            ,e.position
            ,e.date_of_birth
            ,e.employee_id
            ,e.status
            FROM employee e
            LEFT JOIN (job_information j) ON (j.employee_id = e.employee_id)
            LEFT JOIN (payroll_management pm) ON (pm.employee_id = e.employee_id)
            WHERE e.status = 'current' OR e.status='Archive' OR e.status='Cancel' AND e.employee_id!=''` ,
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

app.get('/getIr8aReport', (req, res, next) => {
  db.query(`
SELECT DISTINCT 
              CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
              ,e.citizen
               ,CONCAT_WS(' ', e.nric_no, e.fin_no) AS nric_fin
              ,e.work_permit
              ,e.date_of_birth AS dob
              ,e.status
              ,e.employee_id
              ,(SELECT GROUP_CONCAT(payroll_month)
         FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS pyrol_month
              ,(SELECT SUM(pm.basic_pay) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS gross_salary
              ,( SELECT SUM(pm.allowance1+pm.allowance2+pm.allowance3+pm.allowance4+pm.allowance5) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS total_allowance
               ,(SELECT AVG(gross_salary+total_allowance) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS total_income
              ,(SELECT SUM(pm.cpf_employee) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS total_cpf_employee
              
        FROM employee e
 ORDER BY e.first_name ASC`,
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


app.post('/getIr8aReportPdf', (req, res, next) => {
  db.query(`
SELECT DISTINCT *
              ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
              ,e.citizen
               ,CONCAT_WS(' ', e.nric_no, e.fin_no) AS nric_fin
              ,e.work_permit
              ,e.date_of_birth AS dob
              ,e.status
               ,(SELECT GROUP_CONCAT(payroll_month)
         FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS pyrol_month
               ,(SELECT SUM(pm.director_fee) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS director_fees
              ,(SELECT SUM(pm.basic_pay) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS gross_salary
              ,( SELECT SUM(pm.allowance1+pm.allowance2+pm.allowance3+pm.allowance4+pm.allowance5) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS total_allowance
               ,(SELECT AVG(gross_salary+total_allowance) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS total_income
              ,(SELECT SUM(pm.cpf_employee) FROM payroll_management pm WHERE pm.employee_id = e.employee_id) AS total_cpf_employee
               ,j.designation
        FROM employee e
         LEFT JOIN job_information j ON j.employee_id = e.employee_id
        WHERE e.employee_id =${db.escape(req.body.employee_id)}
 ORDER BY e.first_name ASC`,
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


app.get("/getAccountReport", (req, res, next) => {
  db.query(
    `SELECT i.invoice_id, i.invoice_code, i.invoice_date, i.invoice_amount, i.mode_of_payment, c.company_name, c.company_id,r.receipt_code,r.mode_of_payment,r.receipt_date,r.amount
            FROM invoice i
            LEFT JOIN orders o ON (i.order_id = o.order_id)
            LEFT JOIN receipt r ON (r.order_id = i.order_id)
            LEFT JOIN company c ON (o.company_id = c.company_id)
 AND o.order_id != ''
 AND i.status != 'Cancelled'
 ORDER BY i.invoice_date ASC`,
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
app.get('/getPayslipReports', (req, res, next) => {
  db.query(` SELECT pm.payroll_management_id
  ,pm.total_deductions
  ,pm.reimbursement
  ,pm.cpf_employee
  ,pm.cpf_employer
  ,pm.net_total
  ,pm.basic_pay
  ,pm.payroll_month
  ,pm.payroll_year
  ,pm.total_basic_pay_for_month
  ,( SELECT SUM(pm.total_basic_pay_for_month+pm.total_deductions+pm.reimbursement))  AS net_total
  ,( SELECT SUM(pm.allowance1+pm.allowance2+pm.allowance3+pm.allowance4+pm.allowance5) ) AS total_allowance
  ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
  ,e.date_of_birth AS dob
  ,e.citizen
  ,e.nric_no
  ,e.fin_no
  ,e.status AS employee_status
 FROM payroll_management pm
LEFT JOIN (employee e) ON (pm.employee_id = e.employee_id)
LEFT JOIN (job_information j) ON (j.employee_id = e.employee_id)
WHERE payroll_management_id!=''
ORDER BY e.first_name ASC
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


app.get('/getCategory', (req, res, next) => {
  db.query("SELECT category FROM project",
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
app.get('/getPurchaseGstReport', (req, res, next) => {
    db.query(`select i.invoice_date,
    i.invoice_amount,
    i.invoice_code,
    i.po_number,
    po.po_code,
    po.purchase_order_date,
    i.mode_of_payment,
    ih.description,
    s.company_name,
    s.gst_no
    from invoice i
    LEFT JOIN invoice_receipt_history ir  ON (ir.invoice_id = i.invoice_id) 
    LEFT JOIN invoice_item it  ON (it.invoice_id = i.invoice_id)
    LEFT JOIN project p  ON (p.project_id = i.project_id)
    LEFT JOIN purchase_order po  ON (po.project_id = p.project_id)
    LEFT JOIN supplier s  ON (po.supplier_id = s.supplier_id)
    LEFT JOIN supplier_receipt sr  ON (sr.supplier_id = s.supplier_id)
    LEFT JOIN supplier_receipt_history srh  ON (srh.supplier_receipt_id = sr.supplier_receipt_id)
    LEFT JOIN invoice_credit_note_history ih ON (ih.invoice_id = i.invoice_id)
    where i.invoice_id!=''`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
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
 
app.get('/getpayslips', (req, res, next) => {
  db.query(`SELECT pm.*
  ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
  ,e.date_of_birth AS dob
  ,e.citizen
  ,e.nric_no
  ,e.fin_no
  ,e.status AS employee_status
  ,pm.payroll_month
  ,pm.payroll_year
FROM payroll_management pm
LEFT JOIN (employee e) ON (pm.employee_id = e.employee_id)
LEFT JOIN (job_information j) ON (j.employee_id = e.employee_id)
WHERE pm.payroll_management_id!=''
ORDER BY e.first_name ASC`,
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
 
app.post('/getPayslipGeneratedReport', (req, res, next) => {
  db.query(` SELECT pm.payroll_management_id
  ,pm.allowance1
  ,pm.reimbursement
  ,pm.cpf_employee
  ,pm.cpf_employer
  ,pm.basic_pay
  ,pm.total_basic_pay_for_month
  ,pm.net_total
  ,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name
  ,e.date_of_birth AS dob
  ,e.citizen
  ,e.nric_no
  ,e.fin_no
  ,e.status AS employee_status
 FROM payroll_management pm
LEFT JOIN (employee e) ON (pm.employee_id = e.employee_id)
LEFT JOIN (job_information j) ON (j.employee_id = e.employee_id)
WHERE pm.payroll_month = ${db.escape(req.body.month)}
    AND pm.payroll_year = ${db.escape(req.body.year)}
    ORDER BY e.first_name ASC `,
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;