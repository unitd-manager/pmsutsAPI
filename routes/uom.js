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

app.get("/getUoM", (req, res, next) => {
  db.query(
    `SELECT 
             uom_id
            ,uom_code
            ,uom_name
            ,uom_symbol
            ,conversion_factor
            ,uom_type
            ,base_unit
            ,status 
            ,created_by
            ,creation_date
            ,modified_by
            ,modification_date
            FROM uom
                       
            Where uom_id !=''`,
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

app.post("/getUoMById", (req, res, next) => {
  db.query(
    `SELECT 
    uom_id
    ,uom_code
    ,uom_name
    ,uom_symbol
    ,conversion_factor
    ,uom_type
    ,base_unit
    ,status 
    ,created_by
    ,creation_date
    ,modified_by
    ,modification_date
     
 FROM uom 
   
  
  WHERE uom_id=${db.escape(req.body.uom_id)}
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

app.post('/edit-UoM', (req, res, next) => {
    db.query(`UPDATE uom 
              SET uom_name=${db.escape(req.body.uom_name)}
              ,uom_code=${db.escape(req.body.uom_code)}
              ,uom_symbol=${db.escape(req.body.uom_symbol)}
              ,conversion_factor=${db.escape(req.body.conversion_factor)}
              ,uom_type=${db.escape(req.body.uom_type)}
              ,base_unit=${db.escape(req.body.base_unit)}
              ,status=${db.escape(req.body.status)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,modified_by=${db.escape(req.body.modified_by)}
              ,terms=${db.escape(req.body.terms)}
              WHERE uom_id =${db.escape(req.body.uom_id)}`,
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

  
    app.get('/getValueList', (req, res, next) => {
            db.query(`SELECT 
            value,valuelist_id
            FROM valuelist WHERE key_text="UoM Status"`,
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
          


app.post('/insert-UoM', (req, res, next) => {

    let data = {uom_name: req.body.uom_name,
                uom_id: req.body.uom_id,
                uom_code: req.body.uom_code,
                uom_name: req.body.uom_name,
                uom_symbol: req.body.uom_symbol,
                conversion_factor: req.body.conversion_factor,
                uom_type: req.body.uom_type,
                base_unit: req.body.base_unit,
                status: "new",
                creation_date: req.body.creation_date,
                modification_date: null,
                creation_date: req.body.creation_date,
                created_by: req.body.created_by,
                modified_by: req.body.modified_by,
                };
    let sql = "INSERT INTO uom SET ?";
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
    }
  );
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


app.post("/getTimesheetStaffById", (req, res, next) => {
  db.query(
    `SELECT * FROM employee_timesheet et 
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
app.post("/insertTimesheetEmployee", (req, res, next) => {
  let data = {
    proposal_id: req.body.proposal_id,
    employee_id: req.body.employee_id,
    creation_date: req.body.creation_date,
    month: req.body.month,
    year: req.body.year,
    day: req.body.day,
  };
  let sql = "INSERT INTO employee_timesheet SET ?";
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


app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
