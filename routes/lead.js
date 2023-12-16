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
app.get('/getLead', (req, res, next) => {
  db.query(`SELECT a.* ,pe.employee_name ,c.company_name FROM lead a LEFT JOIN (employee pe) ON (pe.employee_id = a.employee_id) LEFT JOIN (company c) ON (c.company_id = a.company_id)
  Where a.lead_id !=''`,
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


app.post('/getLeadById', (req, res, next) => {
  db.query(`Select 
  pm.lead_id,
  pm.lead_title,
  e.employee_id,
  e.employee_name,
  c.company_id,
  c.company_name
  From lead pm
  LEFT JOIN employee e ON pm.employee_id = e.employee_id
  LEFT JOIN company c ON pm.company_id = c.company_id
  Where pm.lead_id=${db.escape(req.body.lead_id)}`,
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

app.post('/editLead', (req, res, next) => {
  db.query(`UPDATE lead 
            SET lead_title=${db.escape(req.body.lead_title)}
            ,company_id=${db.escape(req.body.description)}
            ,employee_id=${db.escape(req.body.employee_id)}
            WHERE lead_id=${db.escape(req.body.lead_id)}`,
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
            `SELECT
          employee_name,employee_id
           From employee 
          `,
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


        app.get("/getCompanyName", (req, res, next) => {
          db.query(
            `SELECT
          company_name,company_id
           From company 
          `,
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

app.post('/editClients', (req, res, next) => {
  db.query(`UPDATE company
            SET company_name=${db.escape(req.body.company_name)}
            ,phone=${db.escape(req.body.phone)}
            ,website=${db.escape(req.body.website)}
            ,email=${db.escape(req.body.email)}
            ,fax=${db.escape(req.body.fax)}
            ,address_flat=${db.escape(req.body.address_flat)}
            ,address_street=${db.escape(req.body.address_street)}
            ,address_country=${db.escape(req.body.address_country)}
            ,address_po_code=${db.escape(req.body.address_po_code)}
            ,retention=${db.escape(req.body.retention)}
            WHERE company_id = ${db.escape(req.body.company_id)}`,
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


app.post('/insertLeadCompany', (req, res, next) => {

          let data = { company_id	: req.body.company_id
            , lead_title: req.body.lead_title
            ,employee_id:req.body.employee_id
         };
          let sql = "INSERT INTO lead SET ?";
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

app.post('/insertCompany', (req, res, next) => {

  let data = {company_name	:req.body.company_name	
   , email	: req.body.email	
   , address_street: req.body.address_street
   , address_town: req.body.address_town
   , address_state: req.body.address_state
   , address_country	: req.body.address_country
   , address_po_code	: req.body.address_po_code
   , phone: req.body.phone
   , fax: req.body.fax
   , notes: req.body.notes
   , creation_date		: req.body.creation_date		
   , modification_date	: req.body.modification_date	
   , mobile	: req.body.mobile	
   , flag: req.body.flag
   , address_flat: req.body.address_flat
   , status: req.body.status
   , website: req.body.website
   , category: req.body.category
   , comment_by	: req.body.comment_by
   , company_size	: req.body.company_size
   , industry: req.body.industry
   , source: req.body.source
   , group_name: req.body.group_name
   , supplier_type: req.body.supplier_type
   , created_by		: req.body.created_by		
   , modified_by	: req.body.modified_by	
   , chi_company_name: req.body.chi_company_name
   , chi_company_address: req.body.chi_company_address
   , company_address_id: req.body.company_address_id
   , contact_person: req.body.contact_person
   , billing_address_flat	: req.body.billing_address_flat
   , billing_address_street	: req.body.billing_address_street
   , billing_address_country: req.body.billing_address_country
   , billing_address_po_code: req.body.billing_address_po_code
   , client_code: req.body.client_code
   , latitude: req.body.latitude
   , longitude	: req.body.longitude	
   , retention	: req.body.retention };
  let sql = "INSERT INTO company SET ?";
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

app.delete('/deleteCompany', (req, res, next) => {

  let data = {company_name: req.body.company_name};
  let sql = "DELETE FROM company WHERE ?";
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


app.get('/getContactLinked', (req, res, next) => {
  db.query(`SELECT 
  c.first_name
  ,c.email
  ,c.phone
  ,c.mobile
  ,c.position
  ,c.department 

  FROM contact c WHERE c.contact_id = ''`,
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
app.post('/insertContact', (req, res, next) => {

  let data = {company_name	:req.body.company_name	
   , position	: req.body.position	
   , email: req.body.email
   , address_street: req.body.address_street
   , address_area: req.body.address_area
   , address_town: req.body.address_town
   , address_state: req.body.address_state
   , address_country	: req.body.address_country
   , address_po_code	: req.body.address_po_code
   , phone: req.body.phone
   , fax: req.body.fax
   , sort_order: req.body.sort_order
   , published: req.body.published
   , creation_date		: req.body.creation_date		
   , modification_date	: req.body.modification_date	
   , protected	: req.body.protected	
   , pass_word: req.body.pass_word
   , subscribe: req.body.subscribe
   , first_name: req.body.first_name
   , last_name: req.body.last_name
   , mobile: req.body.mobile
   , religion	: req.body.religion
   , relationship	: req.body.relationship
   , known_as_name: req.body.known_as_name
   , address_street1: req.body.address_street1
   , address_town1: req.body.address_town1
   , address_country1: req.body.address_country1
   , flag		: req.body.flag		
   , sex	: req.body.sex	
   , date_of_birth: req.body.date_of_birth
   , random_no: req.body.random_no
   , member_status: req.body.member_status
   , direct_tel: req.body.direct_tel
   , member_type	: req.body.member_type
   , address_flat	: req.body.address_flat
   , phone_direct: req.body.phone_direct
   , salutation: req.body.salutation
   , department: req.body.department
   , created_by: req.body.created_by
   , modified_by	: req.body.modified_by	
   , published_test	: req.body.published_test	
   , company_address_street	: req.body.company_address_street
   , company_address_flat	: req.body.company_address_flat
   , company_address_town: req.body.company_address_town
   , company_address_state: req.body.company_address_state
   , company_address_country: req.body.company_address_country
   , company_address_id: req.body.company_address_id
   , category	: req.body.category	
   , status	: req.body.status	
   , user_group_id	: req.body.user_group_id	
   , name	: req.body.name	
   , notes	: req.body.notes	
   , user_name	: req.body.user_name	
   , address	: req.body.address	
   , login_count	: req.body.login_count	
  
    
 };
  let sql = "INSERT INTO contact SET ?";
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

app.delete('/deleteContact', (req, res, next) => {

  let data = {company_name: req.body.company_name};
  let sql = "DELETE FROM contact WHERE ?";
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;