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
  db.query(`SELECT a.* ,pe.first_name ,c.company_name FROM leads a LEFT JOIN (employee pe) ON (pe.employee_id = a.employee_id) LEFT JOIN (company c) ON (c.company_id = a.company_id)
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
  pm.source_of_lead,
  pm.lead_status,
  pm.address,
  pm.country,
  pm.postal_code,
  pm.email,
  pm.phone_number,
  pm.lead_date,
  pm.service_of_interest,
  pm.budget,
  pm.priority,
  pm.interaction_type,
  pm.followup_date,
  pm.notes,
  e.employee_id,
  e.first_name,
  c.company_id,
  c.company_name
  From leads pm
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
  db.query(`UPDATE leads 
            SET lead_title=${db.escape(req.body.lead_title)}
            ,company_id=${db.escape(req.body.company_id)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,lead_date=${db.escape(req.body.lead_date)}
            ,phone_number=${db.escape(req.body.phone_number)}
            ,lead_status=${db.escape(req.body.lead_status)}
            ,source_of_lead=${db.escape(req.body.source_of_lead)}
            ,email=${db.escape(req.body.email)}
            ,address=${db.escape(req.body.address)}
            ,country=${db.escape(req.body.country)}
            ,postal_code=${db.escape(req.body.postal_code)}
            ,service_of_interest=${db.escape(req.body.service_of_interest)}
            ,budget=${db.escape(req.body.budget)}
            ,priority=${db.escape(req.body.priority)}
            ,interaction_type=${db.escape(req.body.interaction_type)}
            ,followup_date=${db.escape(req.body.followup_date)}
            ,notes=${db.escape(req.body.notes)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
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
          first_name,employee_id
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

app.get('/getCountry', (req, res, next) => {
  db.query(
    `SELECT * from geo_country`,
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
    },
  )
})


app.post('/insertLeadCompany', (req, res, next) => {

          let data = { company_id	: req.body.company_id
            , lead_title: req.body.lead_title
            ,employee_id:req.body.employee_id
            ,source_of_lead:req.body.source_of_lead
            ,creation_date:req.body.creation_date
            ,created_by:req.body.created_by
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

app.post('/editCommunicationItem', (req, res, next) => {
  db.query(`UPDATE  history_of_communication 
            SET communication_date =${db.escape(req.body.communication_date)}
            ,communication_type=${db.escape(req.body.communication_type)}
            ,topic=${db.escape(req.body.topic)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,description=${db.escape(req.body.description)}
            ,status=${db.escape(req.body.status)}
            ,result=${db.escape(req.body.result)}
            ,priority=${db.escape(req.body.priority)}
            ,duration=${db.escape(req.body.duration)}
            WHERE history_of_communication_id = ${db.escape(req.body.history_of_communication_id)}`,
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


app.post('/getCommunicationItemById', (req, res, next) => {
  db.query(`select a.*
  
            From  history_of_communication  a
            
            Where a.lead_id =${db.escape(req.body.lead_id)}`,
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


app.post('/getFollowupItemById', (req, res, next) => {
  db.query(`select a.*
  
            From  followup_tasks   a
            
            Where a.lead_id =${db.escape(req.body.lead_id)}`,
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

app.post('/editFollowupItem', (req, res, next) => {
  db.query(`UPDATE  followup_tasks 
            SET description =${db.escape(req.body.description)}
            ,due_date=${db.escape(req.body.due_date)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,priority=${db.escape(req.body.priority)}
            ,status=${db.escape(req.body.status)}
            
            WHERE followup_tasks_id = ${db.escape(req.body.followup_tasks_id)}`,
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


app.post('/insertCommunicationItems', (req, res, next) => {

  let data = {
    lead_id:req.body.lead_id
    ,history_of_communication_id: req.body.history_of_communication_id
    , communication_date: req.body.communication_date
    , communication_type:req.body.communication_type
    , created_by: req.body.created_by
    , topic: req.body.topic
    , created_by: req.body.created_by
    , creation_date: req.body.creation_date
    , description: req.body.description
    ,status: req.body.status
    , result: req.body.result
    , priority: req.body.priority
    , duration: req.body.duration
  
 };
  let sql = "INSERT INTO history_of_communication SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
            data: err,
            msg:'Failed'
          });
    } else {
          return res.status(200).send({
            data: result,
            msg:'New communication item has been created successfully'
          });
    }
  });
});

app.post('/insertFollowupItems', (req, res, next) => {

  let data = {
    lead_id:req.body.lead_id
    ,followup_tasks_id: req.body.followup_tasks_id 
    , description: req.body.description
    , due_date:req.body.due_date
    , created_by: req.body.created_by
    , employee_id: req.body.employee_id
    , created_by: req.body.created_by
    , creation_date: req.body.creation_date
    , priority: req.body.priority
    ,status: req.body.status
    
  
 };
  let sql = "INSERT INTO followup_tasks SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
     return res.status(400).send({
            data: err,
            msg:'Failed'
          });
    } else {
          return res.status(200).send({
            data: result,
            msg:'New Followup item has been created successfully'
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

app.get("/getSourceTypeFromValueList", (req, res, next) => {
  db.query(
    `SELECT 
      value,valuelist_id
      FROM valuelist WHERE key_text="Source Type"`,
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

app.post('/deleteCommunicationItem', (req, res, next) => {

  let data = {history_of_communication_id: req.body.history_of_communication_id};
  let sql = "DELETE FROM   history_of_communication  WHERE ?";
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

app.post('/deleteFollowupItem', (req, res, next) => {

  let data = {followup_tasks_id: req.body.followup_tasks_id};
  let sql = "DELETE FROM  followup_tasks  WHERE ?";
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;