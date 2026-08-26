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

app.get("/getJournal", (req, res, next) => {
  db.query(
    `SELECT jm.journal_master_id
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
    ,jm.creation_date
    ,jm.modification_date
    ,CONCAT_WS('-', LEFT(jm.voucher_type, 1), jm.journal_master_id) AS voucher_code
    FROM journal_master jm
    LEFT JOIN journal j ON j.journal_master_id = jm.journal_master_id
    LEFT JOIN acc_head ah ON ah.acc_head_id = j.acc_head_id
    LEFT JOIN staff s ON s.staff_id = jm.staff_id
    ORDER BY jm.entry_date DESC`,
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

app.get("/getAccHeadTitle", (req, res, next) => {
  db.query(
    `SELECT * FROM acc_head ah`,
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

app.post('/getJournalById', (req, res, next) => {
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
    FROM journal_master jm
    JOIN journal j ON j.journal_master_id = jm.journal_master_id
    JOIN acc_head ah ON ah.acc_head_id = j.acc_head_id
    Where jm.journal_master_id=${db.escape(req.body.journal_master_id)}`,
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

  // correct for journal
  app.post('/editJournalById', (req, res, next) => {
    const journalUpdates = req.body;
  
    journalUpdates.forEach((update) => {
      db.query(
        `UPDATE journal
         SET acc_head_id = ${db.escape(update.acc_head_id)},
            narration = ${db.escape(update.narration)},
             debit = ${db.escape(update.debit)},
             credit = ${db.escape(update.credit)}
             ,modification_date=${db.escape(req.body.modification_date)}
         WHERE journal_id = ${db.escape(update.journal_id)}`,
        (err, result) => {
          if (err) {
            console.log('error: ', err);
          } else {
            console.log();
          }
        }
      );
    });
  
    return res.status(200).send({
      msg: 'All updates completed successfully',
    });
  });

app.post('/getJournalMasterById', (req, res, next) => {
  db.query(`select jm.*
              From journal_master jm
              where journal_master_id = ${db.escape(req.body.journal_master_id)}`,
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

  app.post('/editJournalMaster', (req, res, next) => {
    db.query(`UPDATE journal_master 
              SET entry_date =${db.escape(req.body.entry_date)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,narration = ${db.escape(req.body.narration)}
              WHERE journal_master_id = ${db.escape(req.body.journal_master_id)}`,
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

  app.post('/insertJournalAndMaster', (req, res) => {
    const journalMasterData = {
      entry_date: req.body.entry_date,
      voucher_type: req.body.voucher_type,
      narration: req.body.narration,
      acc_company_id: req.body.acc_company_id,
      staff_id: req.body.staff_id,
      creation_date: req.body.creation_date,
    };
  
    const journalData1 = {
      acc_head_id: req.body.acc_head_id_1,
      debit: req.body.debit_1,
      credit: req.body.credit_1,
      debit_base: req.body.debit_base_1,
      credit_base: req.body.credit_base_1,
      narration: req.body.narration_1,
      creation_date: req.body.creation_date,
    };
  
    const journalData2 = {
      acc_head_id: req.body.acc_head_id_2,
      debit: req.body.debit_2,
      credit: req.body.credit_2,
      debit_base: req.body.debit_base_2,
      credit_base: req.body.credit_base_2,
      narration: req.body.narration_2,
      creation_date: req.body.creation_date,
    };
  
    const insertMasterSql = 'INSERT INTO journal_master SET ?';
    const insertJournalSql = 'INSERT INTO journal SET ?';
  
    // Start a transaction
    db.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(400).json({
          data: err,
          msg: 'Failed to start transaction'
        });
      }
  
      // Insert data into the journal_master table
      db.query(insertMasterSql, journalMasterData, (err, result) => {
        if (err) {
          console.error('Error inserting data into journal_master:', err);
          db.rollback(() => {
            console.error('Transaction rolled back.');
          });
          return res.status(400).json({
            data: err,
            msg: 'Failed to insert data into journal_master'
          });
        }
  
        const journalMasterId = result.insertId; // Get the auto-generated journal_master_id
  
        // Insert data into the journal table with the retrieved journal_master_id
        journalData1.journal_master_id = journalMasterId;
        journalData2.journal_master_id = journalMasterId;
  
        db.query(insertJournalSql, journalData1, (err, result) => {
          if (err) {
            console.error('Error inserting data into journal:', err);
            db.rollback(() => {
              console.error('Transaction rolled back.');
            });
            return res.status(400).json({
              data: err,
              msg: 'Failed to insert data into journal'
            });
          }
  
          // Insert the second record into the journal table
          db.query(insertJournalSql, journalData2, (err, result) => {
            if (err) {
              console.error('Error inserting data into journal:', err);
              db.rollback(() => {
                console.error('Transaction rolled back.');
              });
              return res.status(400).json({
                data: err,
                msg: 'Failed to insert data into journal'
              });
            }
  
            // Commit the transaction if both inserts were successful
            db.commit((err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                db.rollback(() => {
                  console.error('Transaction rolled back.');
                });
                return res.status(400).json({
                  data: err,
                  msg: 'Failed to commit transaction'
                });
              }
  
              console.log('Transaction committed successfully.');
              return res.status(200).json({
                data: result,
                msg: 'Data inserted successfully'
              });
            });
          });
        });
      });
    });
  });

app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
