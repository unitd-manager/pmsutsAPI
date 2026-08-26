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

app.get('/getPriceList', (req, res, next) => {
  db.query(`select
             price_list_id
            ,notes
            ,customer_name
            ,expiry_date
            ,effective_date
            ,status
            ,creation_date
            ,modification_date
            From price_list
            where price_list_id  !=''`,
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


app.post('/getPriceListById', (req, res, next) => {
  db.query(`select
            price_list_id
            ,notes
            ,customer_name
            ,expiry_date
            ,effective_date
            ,status
            ,creation_date
            ,modification_date
            From price_list
            where price_list_id = ${db.escape(req.body.price_list_id)}`,
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


app.post('/editPriceList', (req, res, next) => {
  db.query(`UPDATE price_list 
            SET 
            notes=${db.escape(req.body.notes)}
            ,customer_name=${db.escape(req.body.customer_name)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,expiry_date=${db.escape(req.body.expiry_date)}
            ,effective_date=${db.escape(req.body.effective_date)}
            ,status=${db.escape(req.body.status)}
            WHERE price_list_id = ${db.escape(req.body.price_list_id)}`,
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

app.post('/insertPriceList', (req, res, next) => {

  let data = {
    price_list_id:req.body.price_list_id	
   , notes: req.notes
   , customer_name: req.body.customer_name
   , creation_date: req.body.creation_date
   , modification_date: req.body.modification_date
   , created_by: req.body.created_by
   , expiry_date: req.body.expiry_date
   , effective_date	: req.body.effective_date
   , status	: req.body.status
  
  };
  let sql = "INSERT INTO price_list SET ?";
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

app.post('/deletePriceList', (req, res, next) => {

  let data = {price_list_id: req.body.price_list_id};
  let sql = "DELETE FROM price_list WHERE ?";
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



app.post('/getPriceListItemLinkedById', (req, res, next) => {
  db.query(`select *
            From price_list_item
            Where price_list_id =${db.escape(req.body.price_list_id)}`,
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


app.post('/editPriceListItem', (req, res, next) => {
  db.query(`UPDATE price_list_item 
            SET 
            product_id=${db.escape(req.body.product_id)}
            ,price=${db.escape(req.body.price)}
            ,unit=${db.escape(req.body.unit)}
            WHERE price_list_item_id = ${db.escape(req.body.price_list_item_id)}`,
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
  
  
  app.post('/insertPriceListItem', (req, res, next) => {

  let data = {
   price_list_id:req.body.price_list_id
   , product_id: req.body.product_id
   , title	: req.body.title	
   , price: req.body.price
   , unit: req.body.unit
  
  };
  let sql = "INSERT INTO price_list_item SET ?";
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

app.post('/deletePriceListItem', (req, res, next) => {

  let data = {price_list_item_id: req.body.price_list_item_id};
  let sql = "DELETE FROM price_list_item WHERE ?";
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