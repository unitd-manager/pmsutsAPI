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

app.get("/getProposal", (req, res, next) => {
  db.query(
    `SELECT 
             pr.proposal_id
            ,pr.title
            ,pr.proposal_code
            ,pr.proposal_date
            ,q.project_quote_id
            ,q.quote_code
            ,q.company_id
            ,c.company_name 
            ,pr.contact_id
            ,cont.first_name
            ,pr.status
            ,pr.est_start_date
            ,pr.est_end_date
            ,pr.budget
            ,pr.project_manager
            ,pr.no_of_employees
            ,pr.description
            ,pr.creation_date
            ,pr.modification_date
            ,pr.created_by
            ,pr.modified_by
            FROM proposal pr 
            LEFT JOIN (project_quote q)  ON (q.project_quote_id  = pr.project_quote_id)
            LEFT JOIN (company c)  ON (c.company_id  = q.company_id)  
            LEFT JOIN (contact cont) ON (pr.contact_id = cont.contact_id) 
            

            Where pr.proposal_id !=''`,
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

app.post("/getProposalById", (req, res, next) => {
  db.query(
    `SELECT 
    pr.proposal_id
    ,pr.title
    ,pr.proposal_code
    ,pr.proposal_date
   
  ,pr.project_quote_id
   ,q.quote_code
   ,q.company_id
   ,q.contact_id
   ,c.company_name 
   
   ,cont.first_name
   ,pr.status
   ,pr.est_start_date
   ,pr.est_end_date
   ,pr.budget
   ,pr.project_manager
   ,pr.no_of_employees
   ,pr.description
   ,pr.creation_date
   ,pr.modification_date
   ,pr.created_by
   ,pr.modified_by
   ,pr.employee_id
   FROM proposal pr 
   LEFT JOIN (project_quote q)  ON (q.project_quote_id  = pr.project_quote_id)
   LEFT JOIN (company c)  ON (c.company_id  = q.company_id)  
   LEFT JOIN (contact cont) ON (q.contact_id = cont.contact_id)   
    
    WHERE pr.proposal_id=${db.escape(req.body.proposal_id)}
  `,
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

app.get("/getProjectQuoteCode", (req, res, next) => {
  db.query(`SELECT pq.quote_code,
  pq.project_quote_id 
  FROM project_quote pq
  LEFT JOIN proposal p ON p.project_quote_id=pq.project_quote_id
  WHERE pq.project_quote_id !=''
  AND p.project_quote_id IS NULL `, (err, result) => {
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
  });
});

app.post("/editProposal", (req, res, next) => {
  db.query(
    `UPDATE proposal
            SET title=${db.escape(req.body.title)}
            ,proposal_code=${db.escape(req.body.proposal_code)}
            ,project_quote_id=${db.escape(req.body.project_quote_id)}
            ,company_id=${db.escape(req.body.company_id)}
            ,contact_id=${db.escape(req.body.contact_id)}
            ,proposal_date=${db.escape(req.body.proposal_date)}
            ,status=${db.escape(req.body.status)}
            ,est_start_date=${db.escape(req.body.est_start_date)}
            ,est_end_date=${db.escape(req.body.est_end_date)}
            ,budget=${db.escape(req.body.budget)}
            ,project_manager=${db.escape(req.body.project_manager)}
            ,no_of_employees=${db.escape(req.body.no_of_employees)}
            ,description=${db.escape(req.body.description)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,modification_date=${db.escape(req.body.modification_date)}
            
            WHERE proposal_id =${db.escape(req.body.proposal_id)}`,
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

app.post("/insertproposal", (req, res, next) => {
  let data = {
    title: req.body.title,
    proposal_id: req.body.proposal_id,
    proposal_code: req.body.proposal_code,
    project_quote_id: req.body.project_quote_id,
    proposal_date: req.body.proposal_date,
    status: "new",
    company_id: req.body.company_id,
    contact_id: req.body.contact_id,
    budget: req.body.budget,
    est_start_date: req.body.est_start_date,
    est_end_date: req.body.est_end_date,
    project_manager: req.body.project_manager,
    no_of_employees: req.body.no_of_employees,
    description: req.body.description,

    creation_date: req.body.creation_date,
    modification_date: null,
    created_by: req.body.created_by,
    modified_by: req.body.modified_by,
  };
  let sql = "INSERT INTO proposal SET ?";
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

app.get("/checkEmployeeInProposal/:proposalId/:employeeId", (req, res, next) => {
  const proposalId = req.params.proposalId;
  const employeeId = req.params.employeeId;

  db.query(
    `SELECT * FROM proposal_employee WHERE proposal_id = ? AND employee_id = ?, `,
    [proposalId, employeeId],
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

app.post("/getQuoteLineItemsById", (req, res, next) => {
  db.query(
    `SELECT
            pr.project_quote_id
            ,pr.proposal_code
            ,qt.project_quote_items_id
            ,qt.title
            ,qt.amount
            ,qt.quantity
            ,qt.description
            ,qt.unit_price
            FROM proposal pr 
            LEFT JOIN (project_quote_items qt)  ON (qt.project_quote_id  = pr.project_quote_id)
            WHERE pr.proposal_id =  ${db.escape(req.body.proposal_id)}`,
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

app.post("/getMaterialLineItemsById", (req, res, next) => {
  db.query(
    `SELECT
            pr.project_quote_id
            ,pr.proposal_code
            ,qt. material_needed_id
            ,qt.title
            ,qt.amount
            ,qt.quantity
            ,qt.description
            ,qt.unit_price
            FROM proposal pr 
            LEFT JOIN ( material_needed qt)  ON (qt.project_quote_id  = pr.project_quote_id)
            WHERE pr.proposal_id =  ${db.escape(req.body.proposal_id)}`,
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


app.post("/getEmployeeById", (req, res, next) => {
  db.query(
    `SELECT * FROM proposal_employee et 
    INNER JOIN employee e ON e.employee_id = et.employee_id 
    INNER JOIN proposal pr ON pr.proposal_id = et.proposal_id
    WHERE et.proposal_id = ${db.escape(req.body.proposal_id)}`,
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

app.post("/getEmployeeId", (req, res, next) => {
  db.query(
    `SELECT et.employee_id FROM proposal_employee et 
    INNER JOIN employee e ON e.employee_id = et.employee_id 
    INNER JOIN proposal pr ON pr.proposal_id = et.proposal_id
    WHERE et.proposal_id = ${db.escape(req.body.proposal_id)}`,
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

app.get("/getEmployeeName", (req, res, next) => {
  db.query(
    `SELECT employee_id,first_name
  FROM employee`,
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

app.get("/getProjectManager", (req, res, next) => {
  db.query(
    `SELECT employee_id,first_name,position
  FROM employee
  Where position ='Manager'`,
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

app.get('/checkEmployees', (req, res, next) => {
    db.query(
      `SELECT employee_id FROM proposal`,
      (err, result) => {
        if (err) {
          return res.status(400).send({
            data: err,
            msg: 'Failed'
          });
        } else {
          const quoteItemsIds = result.map((row) => row.employee_id);
          return res.status(200).send({
            data: quoteItemsIds,
            msg: 'Success'
          });
        }
      }
    );
  });

app.post("/insertEmployee", (req, res, next) => {
  let data = {
    proposal_id: req.body.proposal_id,
    employee_id: req.body.employee_id,
    creation_date: req.body.creation_date,
    modification_date: req.body.modification_date,
    created_by: req.body.created_by,
    modified_by: req.body.modified_by,
    
  };
  let sql = "INSERT INTO proposal_employee SET ?";
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

app.post('/deleteProposal', (req, res, next) => {
  let sql = `DELETE FROM proposal WHERE proposal_id =${db.escape(req.body.proposal_id)}`;
  let query = db.query(sql,(err, result) => {
    if (err) {
      return res.status(400).send({
            data: '',
            msg:'Unable to delete proposal.'
          });
    } else {
          return res.status(200).send({
            data: result,
            msg:'Proposal has been removed successfully'
          });
    }
  });
});


app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
