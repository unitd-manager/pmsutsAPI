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

app.get('/getDocument', (req, res, next) => {
  db.query(`SELECT 
  d.document_id
  ,d.document_code
  ,d.document_title
  ,d.project_id
  ,d.contact_id
  ,d.company_id
  ,d.quote_id
  ,d.budget
  ,d.creation_date
  ,d.created_by
  ,d.modification_date
  ,d.modified_by
  ,p.title
  ,p.project_id
  ,p.contact_id
  ,p.start_date
  ,p.estimated_finish_date
  ,p.budget_inhouse
  ,c.company_id
  ,c.company_name
  ,c.email
  ,c.website
  ,c.address_street
  ,c.address_town
  ,c.phone
  ,c.address_state
  ,CONCAT(c.address_street, ',' ,c.address_town) AS company_address
  ,c.address_country
  ,c.address_po_code
  ,co.contact_id
  ,co.company_name AS contact_company_name
  ,co.position
  ,co.email AS contact_email
  ,co.first_name
  ,co.last_name
  ,CONCAT_WS(' ', first_name,last_name) AS contact_name
  ,co.address_street
  ,co.address_area
  ,co.address_town
  ,CONCAT(co.address_street, ',' ,co.address_area, ',' ,co.address_town) AS contact_address
  ,co.phone AS contact_phone
  ,co.address_country AS contact_address_country
  ,co.address_state AS contact_address_state
  ,co.address_po_code AS contact_address_po_code
  ,q.quote_status
  ,q.quote_id
  FROM document d
  LEFT JOIN project p ON p.project_id=d.project_id
  LEFT JOIN company c ON c.company_id=d.company_id
  LEFT JOIN contact co ON co.contact_id=d.contact_id
  LEFT JOIN quote q ON q.quote_id=d.quote_id
  WHERE d.document_id !=''`,
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

app.post('/getDocumentById', (req, res, next) => {
  db.query(`SELECT 
  d.document_id
  ,d.document_code
  ,d.document_title
  ,d.project_id
  ,d.contact_id
  ,d.company_id
  ,d.quote_id
  ,d.budget
  ,d.creation_date
  ,d.created_by
  ,d.modification_date
  ,d.modified_by
  ,p.title
  ,p.project_id
  ,p.contact_id
  ,p.start_date
  ,p.estimated_finish_date
  ,p.budget_inhouse
  ,c.company_id
  ,c.company_name
  ,c.email
  ,c.website
  ,c.address_street
  ,c.address_town
  ,c.phone
  ,c.address_state
  ,CONCAT(c.address_street, ',' ,c.address_town) AS company_address
  ,c.address_country
  ,c.address_po_code
  ,co.contact_id
  ,co.company_name AS contact_company_name
  ,co.position
  ,co.email AS contact_email
  ,co.first_name
  ,co.last_name
  ,CONCAT_WS(' ', first_name,last_name) AS contact_name
  ,co.address_street
  ,co.address_area
  ,co.address_town
  ,CONCAT(co.address_street, ',' ,co.address_area, ',' ,co.address_town) AS contact_address
  ,co.phone AS contact_phone
  ,co.address_country AS contact_address_country
  ,co.address_state AS contact_address_state
  ,co.address_po_code AS contact_address_po_code
  ,q.quote_status
  ,q.quote_id
  FROM document d
  LEFT JOIN project p ON p.project_id=d.project_id
  LEFT JOIN company c ON c.company_id=d.company_id
  LEFT JOIN contact co ON co.contact_id=d.contact_id
  LEFT JOIN quote q ON q.quote_id=d.quote_id
  WHERE d.document_id=${db.escape(req.body.document_id)}`,
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

app.post('/editDocument', (req, res, next) => {
  db.query(`UPDATE document 
            SET project_id=${db.escape(req.body.project_id)}
            ,document_title=${db.escape(req.body.document_title)}
            ,contact_id=${db.escape(req.body.contact_id)}
            ,company_id=${db.escape(req.body.company_id)}
            ,quote_id=${db.escape(req.body.quote_id)}
            ,budget=${db.escape(req.body.budget)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE document_id = ${db.escape(req.body.document_id)}`,
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
        
        
app.post('/insertDocument', (req, res, next) => {
  let data = {
      document_code	: req.body.document_code
    , document_title	: req.body.document_title
    , project_id	: req.body.project_id
    , contact_id: req.body.contact_id
    , company_id: req.body.company_id
    , quote_id	: req.body.quote_id
    , budget : req.body.budget
    , creation_date : req.body.creation_date
    , created_by : req.body.created_by
    , modification_date : req.body.modification_date
    , modified_by : req.body.modified_by
 };
  let sql = "INSERT INTO document SET ?";
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

app.post('/getProjectById', (req, res, next) => {
  db.query(`SELECT
   project_id
  ,title 
  ,contact_id
  ,project_code
  ,company_id
  ,quote_id
  ,budget_inhouse
  FROM project
  WHERE project_id=${db.escape(req.body.project_id)}`,
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

app.get("/getProjectTitle", (req, res, next) => {
  db.query(`SELECT
   p.project_id
  ,p.title 
  FROM project p
  LEFT JOIN document d ON d.project_id=p.project_id
  WHERE p.project_id !=''
  AND d.project_id IS NULL`, 
   (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
      return res.status(200).send({
        data: result,
      });
    }
  });
});

app.post("/getCodeValue", (req, res, next) => {
  var type = req.body.type;
  let sql = '';
  let key_text = '';
  let withprefix = true;
  if(type == 'DocumentCode'){
      key_text = 'nextDocumentCode';
      sql = "SELECT * FROM setting WHERE key_text='DocumentCodePrefix' OR key_text='nextDocumentCode'";
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


app.post('/deleteDocument', (req, res, next) => {

  let data = {document_id: req.body.document_id};
  let sql = "DELETE FROM document WHERE ?";
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



app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;