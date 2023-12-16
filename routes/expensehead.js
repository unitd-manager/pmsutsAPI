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
app.get('/getExpenseHead', (req, res, next) => {
  db.query(`select title
            ,expense_group_id
            ,modified_by
            ,modification_date
            From expense_group
            where expense_group_id  !=''`,
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


app.post('/getExpenseHeadByid', (req, res, next) => {
  db.query(`select title
            ,expense_group_id
            ,modified_by
            ,modification_date
            ,created_by
            ,creation_date
            From expense_group
            where expense_group_id  =  ${db.escape(req.body.expense_group_id)}`,
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


app.post('/editExpenseHead', (req, res, next) => {
  db.query(`UPDATE expense_group 
            SET title =${db.escape(req.body.title)}
            ,modified_by=${db.escape(req.staff)}
            ,modification_date=${db.escape(
              req.body.modification_date
            )}
            WHERE expense_group_id = ${db.escape(req.body.expense_group_id)}`,
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

app.post('/insertExpGroup', (req, res, next) => {

  let data = {
    expense_group_id:req.body.expense_group_id	
   , title	: req.body.title	
   , created_by: req.staff
   , creation_date: req.body.creation_date
   , modified_by: req.body.modified_by
   , modification_date	: req.body.modification_date
   , site_id	: req.body.site_id
  
  };
  let sql = "INSERT INTO expense_group SET ?";
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

app.post('/deleteExpGroup', (req, res, next) => {

  let data = {expense_group_id: req.body.expense_group_id};
  let sql = "DELETE FROM expense_group WHERE ?";
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



app.get('/getExpenseSubHeadLinked', (req, res, next) => {
  db.query(`select title
            From expense_sub_group
            Where expense_sub_group_id  !=''`,
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
app.post('/getExpenseSubHeadLinkedById', (req, res, next) => {
  db.query(`select title
            ,expense_group_id
            ,expense_sub_group_id
            From expense_sub_group
            Where expense_group_id = ${db.escape(req.body.expense_group_id)}`,
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





app.post('/editsubExpenseHead', (req, res, next) => {
  db.query(`UPDATE expense_sub_group 
            SET title=${db.escape(req.body.title)}
            WHERE expense_sub_group_id = ${db.escape(req.body.expense_sub_group_id)}`,
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

app.post('/insertExp', (req, res, next) => {

  let data = {expense_sub_group_id	:req.body.expense_sub_group_id	
    ,expense_group_id	: req.body.expense_group_id
     ,title	: req.body.title	
   , created_by: req.body.created_by
   , creation_date: req.body.creation_date
   , modified_by: req.body.modified_by
   , modification_date	: req.body.modification_date
   , site_id	: req.body.site_id
   
    
 };
  let sql = "INSERT INTO expense_sub_group SET ?";
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

app.post('/deleteExp', (req, res, next) => {

  let data = {expense_sub_group_id: req.body.expense_sub_group_id};
  let sql = "DELETE FROM expense_sub_group WHERE ?";
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