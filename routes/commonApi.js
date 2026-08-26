const sgMail = require('@sendgrid/mail');
const nodemailer = require("nodemailer");
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

// app.post('/sendUseremailBooking', (req, res, next) => {
//   const { to } = req.body;

//   // Generate a random password reset token
//   const resetToken = randomstring.generate(10);

//   // Store the reset token in the database
//   db.query(`SELECT * FROM empleave ORDER BY leave_id DESC LIMIT 1`, (error, results) => {
//     if (error) {
//       console.error('Error updating reset token:', error);
//       return res.status(500).json({ error: 'An error occurred' });
//     }

//     sgMail.setApiKey("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");

//     let data = {
//       to: ['admin@unitdtechnologies.com'],
//       from: 'notification@unitdtechnologies.com',
//       templateId: "d-42724b54ac36490ebb2c618051e7b474",
//       dynamic_template_data: {
//         subject: 'Leave Mail',
//         name: req.body.name,
//         fromDate: req.body.fromDate,
//         toDate: req.body.toDate,
//         leaveType: req.body.leaveType,
//         leaveReason: req.body.leaveReason,
//         leaveId: req.body.leaveId,
//         totalLeaveThisMonth: req.body.totalLeaveThisMonth,
//         totalLeaveThisYear: req.body.totalLeaveThisYear,
        
//          url: `http://pmsuts.unitdtechnologies.com/#/ApprovalSuccess/${req.body.leaveId}`
//       },
//     };

//     sgMail.sendMultiple(data)
//       .then((response) => {
//         // Send the resetToken in the response only after the email is sent successfully
//         return res.status(200).json({
//           data: response,
//           msg: 'Success',
//           resetToken: resetToken,
//         });
//       })
//       .catch((error) => {
//         return res.status(400).json({
//           data: error,
//           msg: 'failed',
//         });
//       });
//   });
// });


// app.post('/sendUseremailBooking', async (req, res) => {
//   const { name, fromDate, toDate, leaveType, leaveReason, leaveId, totalLeaveThisMonth, totalLeaveThisYear } = req.body;

//   try {
//     // 1️⃣ Nodemailer SMTP transporter
//     const transporter = nodemailer.createTransport({
//       host: "premium128.web-hosting.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: "notification@unitdtechnologies.com",
//         pass: "notification777#",
//       },
//     });

//     // 2️⃣ Custom HTML email content (replacing SendGrid template)
//     const htmlContent = `
//       <div style="font-family: Arial; padding: 20px; color:#333;">
//         <h2>New Leave Application</h2>

//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>From Date:</strong> ${fromDate}</p>
//         <p><strong>To Date:</strong> ${toDate}</p>
//         <p><strong>Leave Type:</strong> ${leaveType}</p>
//         <p><strong>Reason:</strong> ${leaveReason}</p>
//         <p><strong>Leave ID:</strong> ${leaveId}</p>

//         <br>

//         <p><strong>Total Leave This Month:</strong> ${totalLeaveThisMonth}</p>
//         <p><strong>Total Leave This Year:</strong> ${totalLeaveThisYear}</p>

//         <br>

//         <a href="http://pmsuts.unitdtechnologies.com/#/ApprovalSuccess/${leaveId}"
//           style="background:#0f77c0;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
//           Approve Leave
//         </a>

//         <br><br>
//       </div>
//     `;

//     // 3️⃣ Send email
//     await transporter.sendMail({
//       from: '"Notification" <notification@unitdtechnologies.com>',
//       to: "muthumari@unitdtechnologies.com",
//       subject: "Leave Application",
//       html: htmlContent,
//     });

//     return res.status(200).json({
//       msg: "Success",
//       data: "Email Sent",
//     });

//   } catch (error) {
//     console.error("Mail Error:", error);
//     return res.status(400).json({
//       msg: "failed",
//       data: error,
//     });
//   }
// });

// app.post('/sendUseremailBooking', async (req, res) => {
//   const { name, fromDate, toDate, leaveType, leaveReason, leaveId, totalLeaveThisMonth, totalLeaveThisYear } = req.body;

//   try {
//     const transporter = nodemailer.createTransport({
//       host: "premium128.web-hosting.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: "notification@unitdtechnologies.com",
//         pass: "notification777#",
//       },
//     });

//     const htmlContent = `
//       <div style="font-family: Arial; padding: 20px; color:#333;">
//         <h2>New Leave Application</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>From Date:</strong> ${fromDate}</p>
//         <p><strong>To Date:</strong> ${toDate}</p>
//         <p><strong>Leave Type:</strong> ${leaveType}</p>
//         <p><strong>Reason:</strong> ${leaveReason}</p>
//         <p><strong>Leave ID:</strong> ${leaveId}</p>
//         <p><strong>Total Leaves (Month):</strong> ${totalLeaveThisMonth}</p>
//         <p><strong>Total Leaves (Year):</strong> ${totalLeaveThisYear}</p>

//         <a href="http://pmsuts.unitdtechnologies.com/#/ApprovalSuccess/${leaveId}"
//           style="background:#0f77c0;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
//           Approve Leave
//         </a>
//       </div>
//     `;

//     const info = await transporter.sendMail({
//       from: '"Notification" <notification@unitdtechnologies.com>',
//       to: "muthumari@unitdtechnologies.com",
//       subject: "Leave Application",
//       html: htmlContent
//     });

//     console.log("MAIL SUCCESS:", info);

//     return res.status(200).json({ msg: "Success", data: info });

//   } catch (error) {
//     console.log("FULL ERROR:", JSON.stringify(error, null, 2));
//     return res.status(400).json({ msg: "failed", data: error });
//   }
// });

app.post('/sendUseremailBooking', async (req, res) => {
  const { 
    name,
    fromDate,
    toDate,
    leaveType,
    leaveReason,
    leaveId,
    totalLeaveThisMonth,
    totalLeaveThisYear,
    totalPermissionThisMonth,
    totalPermissionThisYear,
    emailCategory,
    permissionHour
  } = req.body;

  try {
    // =====================================================
    // DATE PARSER (DD-MM-YYYY → JS Date)
    // =====================================================
    const parseDDMMYYYY = (dateStr) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split("-");
      return new Date(`${year}-${month}-${day}`);
    };

    const from = parseDDMMYYYY(fromDate);
    const to = parseDDMMYYYY(toDate || fromDate);

    if (!from || !to || isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({
        msg: "Invalid date format. Expected DD-MM-YYYY"
      });
    }

    // =====================================================
    // LEAVE / PERMISSION DURATION CALCULATION
    // =====================================================
    // const calculatedDuration = Math.max(
    //   Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    //   1
    // );
    let calculatedDuration = 0;

if (emailCategory === "Permission") {
  calculatedDuration = 0; // No leave days increment
} else {
  calculatedDuration = Math.max(
    Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    1
  );
}

    // =====================================================
    // EMAIL TRANSPORTER
    // =====================================================
    const transporter = nodemailer.createTransport({
      host: "premium128.web-hosting.com",
      port: 587,
      secure: false,
      auth: {
        user: "notification@unitdtechnologies.com",
        pass: "notification777#",
      },
    });

    // =====================================================
    // APPROVAL BUTTON
    // =====================================================
    const approvalBtn = `
      <br/>
      <a href="http://pmsuts.unitdtechnologies.com/#/ApprovalSuccess/${leaveId}"
        style="background:#0f77c0;color:#fff;padding:10px 20px;
        text-decoration:none;border-radius:5px;display:inline-block;margin-top:15px;">
        Approve
      </a>
      <br/><br/>
    `;

    // =====================================================
    // PERMISSION EMAIL TEMPLATE
    // =====================================================
    const permissionEmail = `
      <div style="font-family: Arial; padding:20px; line-height:1.6;">
        <h2 style="color:#0f77c0;">Permission Request Notification</h2>

        <p>Dear Sir/Madam,</p>

        <p>
  <strong>${name}</strong> has submitted a permission request for
  <strong>${permissionHour} hour${permissionHour > 1 ? 's' : ''}</strong>
  on <strong>${fromDate}</strong>.
</p>

        <h3>Permission Details</h3>

        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td><strong>LeaveType</strong></td>
            <td>${leaveType}</td>
          </tr>
          <tr>
            <td><strong>From Date</strong></td>
            <td>${fromDate}</td>
          </tr>
          <tr>
            <td><strong>To Date</strong></td>
            <td>${toDate}</td>
          </tr>
          <td><strong>Total Leave Days</strong></td>
            <td>${calculatedDuration}</td>
          </tr>
          <tr>
            <td><strong>Reason</strong></td>
            <td>${leaveReason}</td>
          </tr>
          <tr>
            <td><strong>Total Permissions (This Month)</strong></td>
            <td>${totalPermissionThisMonth}</td>
          </tr>
          <tr>
            <td><strong>Total Permissions (This Year)</strong></td>
            <td>${totalPermissionThisYear}</td>
          </tr>
          <tr>
            <td><strong>Total Leaves (This Month)</strong></td>
            <td>${totalLeaveThisMonth}</td>
          </tr>
          <tr>
            <td><strong>Total Leaves (This Year)</strong></td>
            <td>${totalLeaveThisYear}</td>
          </tr>
        </table>

        ${approvalBtn}

        <p>Best Regards,<br/>HR Notification System</p>
      </div>
    `;

    // =====================================================
    // LEAVE EMAIL TEMPLATE
    // =====================================================
    const leaveEmail = `
      <div style="font-family: Arial; padding:20px; line-height:1.6;">
        <h2 style="color:#0f77c0;">Leave Application Notification</h2>

        <p>Dear Sir/Madam,</p>

        <p>
          <strong>${name}</strong> has applied for leave from
          <strong>${fromDate}</strong> to
          <strong>${toDate}</strong>.
        </p>

        <h3>Leave Details</h3>

        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td><strong>LeaveType</strong></td>
            <td>${leaveType}</td>
          </tr>
          <tr>
            <td><strong>From Date</strong></td>
            <td>${fromDate}</td>
          </tr>
          <tr>
            <td><strong>To Date</strong></td>
            <td>${toDate}</td>
          </tr>
          <tr>
            <td><strong>Total Leave Days</strong></td>
            <td>${calculatedDuration}</td>
          </tr>
          <tr>
            <td><strong>Reason</strong></td>
            <td>${leaveReason}</td>
          </tr>
          <tr>
            <td><strong>Total Permissions (This Month)</strong></td>
            <td>${totalPermissionThisMonth}</td>
          </tr>
          <tr>
            <td><strong>Total Permissions (This Year)</strong></td>
            <td>${totalPermissionThisYear}</td>
          </tr>
          <tr>
            <td><strong>Total Leaves (This Month)</strong></td>
            <td>${totalLeaveThisMonth}</td>
          </tr>
          <tr>
            <td><strong>Total Leaves (This Year)</strong></td>
            <td>${totalLeaveThisYear}</td>
          </tr>
        </table>

        ${approvalBtn}

        <p>Best Regards,<br/>HR Notification System</p>
      </div>
    `;

    // =====================================================
    // AUTO TEMPLATE SELECT
    // =====================================================
    const htmlContent =
      emailCategory === "Permission" ? permissionEmail : leaveEmail;

    // =====================================================
    // SEND EMAIL
    // =====================================================
    const info = await transporter.sendMail({
      from: '"Notification" <notification@unitdtechnologies.com>',
      to: "syed@unitdtechnologies.com",
    subject: emailCategory === "Permission"
  ? `Permission Request from ${name}`
  : `Leave Application from ${name}`,

      html: htmlContent
    });

    return res.status(200).json({
      msg: "Email sent successfully",
      days: calculatedDuration,
      info
    });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return res.status(500).json({
      msg: "Email sending failed",
      error
    });
  }
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


// app.post('/sendTamizhyUseremail', (req, res, next) => {
//     const { to } = req.body;

//     sgMail.setApiKey("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");

//     const emailData = {
//         to: to,
//         from: 'notification@unitdtechnologies.com',
//         subject: 'Test Email',
//         text: 'This is a test email.',
//     };

//     sgMail
//         .send(emailData)
//         .then(response => {
//             console.log('Email sent successfully:', response);
//             return res.status(200).send({
//                 data: response,
//                 msg: 'Success',
//             });
//         })
//         .catch(error => {
//             console.error('Error while sending email:', error);
//             return res.status(400).send({
//                 data: error,
//                 msg: 'Failed to send email',
//             });
//         });
// });





module.exports = app;
