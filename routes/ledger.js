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

app.post('/getAccounts', (req, res, next) => {
    db.query(`SELECT 
    jm.journal_master_id
    ,jm.entry_date
    ,jm.voucher_type
    ,jm.narration AS narration_main
    ,jm.ledger_authorized
    ,j.journal_id
    ,j.credit
    ,j.debit
    ,j.exch_rate_to_base
    ,j.credit_base
    ,j.debit_base
    ,j.narration
    ,j.pending
    ,j.avg_buy_rate
    ,j.avg_stock_rate
    ,j.margin
    ,j.currency_id
    ,ah.title AS acc_head
    ,ah.acc_head_id
    ,jm.creation_date
    ,jm.modification_date
    FROM journal j
    JOIN journal_master jm ON jm.journal_master_id = j.journal_master_id
    JOIN acc_head ah ON ah.acc_head_id = j.acc_head_id
    Where ah.acc_head_id=${db.escape(req.body.acc_head)}`,
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

app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
