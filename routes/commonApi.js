const sgMail = require('@sendgrid/mail');
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomstring = require('randomstring');
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

app.post("/deleteRecord", (req, res, next) => {
  
  let sql = `DELETE FROM ${req.body.tablename} WHERE ${req.body.columnname}=${db.escape(req.body.idvalue)}`;
  let query = db.query(sql, (err, result) => {
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
app.post("/updatePublish", (req, res, next) => {
  
  let sql = `UPDATE ${req.body.tablename} SET published=${db.escape(req.body.value)} WHERE ${req.body.idColumn}=${db.escape(req.body.idValue)}`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
      return res.status(200).send({
        data: result,
        msg:sql
      });
    }
  });
});
app.post("/updateSortOrder", (req, res, next) => {
  
  let sql = `UPDATE ${req.body.tablename} SET sort_order=${db.escape(req.body.value)} WHERE ${req.body.idColumn}=${db.escape(req.body.idValue)}`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
      return res.status(200).send({
        data: result,
        msg:sql
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
    sql = "SELECT * FROM setting WHERE key_text='invoiceCodePrefixes' OR key_text='nextInvoiceCode'";  
  }else if(type == 'subConworkOrder'){
      key_text = 'nextSubconCode';
    sql = "SELECT * FROM setting WHERE key_text='subconCodePrefix' OR key_text='nextSubconCode'";  
  }
  else if(type == 'project'){
      key_text = 'nextProjectCode';
      sql = "SELECT * FROM setting WHERE key_text='projectCodePrefix' OR key_text='nextProjectCode'";  
  }else if(type == 'quote'){
      key_text = 'nextQuoteCode';
      sql = "SELECT * FROM setting WHERE key_text='quoteCodePrefix' OR key_text='nextQuoteCode'";  
  }
  else if(type == 'creditNote'){
      key_text = 'nextCreditNoteCode';
      sql = "SELECT * FROM setting WHERE key_text='creditNotePrefix' OR key_text='nextCreditNoteCode'";  
  }else if(type == 'employee'){
      withprefix = false;
      key_text = 'nextEmployeeCode';
    sql = "SELECT * FROM setting WHERE  key_text='nextEmployeeCode'";  
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
            finalText = result[1].value + result[0].value;
            newvalue = parseInt(result[0].value) + 1
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

app.post('/sendUseremailBooking', (req, res, next) => {
  const { to } = req.body;

  // Generate a random password reset token
  const resetToken = randomstring.generate(10);

  // Store the reset token in the database
  db.query(`SELECT * FROM empleave ORDER BY leave_id DESC LIMIT 1`, (error, results) => {
    if (error) {
      console.error('Error updating reset token:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }

    sgMail.setApiKey("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");

    let data = {
      to: ['sulfiya@unitdtechnologies.com'],
      from: 'notification@unitdtechnologies.com',
      templateId: "d-47e3a9bee0c64ef59225a97f6506817b",
      dynamic_template_data: {
        subject: 'Leave Mail',
        name: req.body.name,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        leaveType: req.body.leaveType,
        leaveReason: req.body.leaveReason,
        leaveId: req.body.leaveId,
         url: `http://pmsuts.unitdtechnologies.com/#/ApprovalSuccess/${req.body.leaveId}`
      },
    };

    sgMail.sendMultiple(data)
      .then((response) => {
        // Send the resetToken in the response only after the email is sent successfully
        return res.status(200).json({
          data: response,
          msg: 'Success',
          resetToken: resetToken,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          data: error,
          msg: 'failed',
        });
      });
  });
});

app.post('/sendUseremailStaff', (req, res, next) => {
  const { to } = req.body;

  // Generate a random password reset token
  const resetToken = randomstring.generate(10);

  // Store the reset token in the database
  db.query(`SELECT * FROM empleave ORDER BY leave_id DESC LIMIT 1`, (error, results) => {
    if (error) {
      console.error('Error updating reset token:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }

    sgMail.setApiKey("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");

    let data = {
      to: req.body.to,
      from: 'notification@unitdtechnologies.com',
      templateId: "d-4b59887135b24aa1a862bcdadb272610",
      dynamic_template_data: {
        subject: 'Leave Confirm Mail',
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
         name: req.body.name,
        leaveType: req.body.leaveType,
      },
    };

    sgMail.sendMultiple(data)
      .then((response) => {
        // Send the resetToken in the response only after the email is sent successfully
        return res.status(200).json({
          data: response,
          msg: 'Success',
          resetToken: resetToken,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          data: error,
          msg: 'failed',
        });
      });
  });
});
app.post('/resetVerification', (req, res) => {
    
  const { Leaves} = req.body;

  // Update the user's password with the new password
  const query = `UPDATE empleave SET status = 'Approved' WHERE leave_id ='${Leaves}'`;
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error resetting verification:', error);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json({ message: 'Your Account is verified successfully' });
    }
  });
});


module.exports = app;
