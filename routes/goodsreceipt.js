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

app.get('/getGoodsReceipt', (req, res, next) => {
  db.query(`SELECT
  gr.goods_receipt_id
  ,gr.goods_received_date
  ,gr.supplier_id
  ,gr.purchase_order_id
  ,gr.employee_id
  ,gr.status
  ,gr.total_amount
  ,gr.creation_date
  ,gr.modification_date
  ,gr.created_by
  ,gr.modified_by
  ,s.company_name
  ,po.po_code
  ,e.first_name
  ,e.employee_id
  FROM goods_receipt gr
  LEFT join supplier s on s.supplier_id = gr.supplier_id
  LEFT join purchase_order po on po.purchase_order_id = gr.purchase_order_id
  LEFT join employee e on e.employee_id = gr.employee_id
  Where gr.goods_receipt_id !=''`,
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

app.post('/getGoodsReceiptById', (req, res, next) => {
  db.query(`SELECT
  gr.goods_receipt_id
  ,gr.goods_received_date
  ,gr.supplier_id
  ,gr.purchase_order_id
  ,gr.employee_id
  ,gr.status
  ,gr.total_amount
  ,gr.creation_date
  ,gr.modification_date
  ,gr.created_by
  ,gr.modified_by
  ,s.company_name
  ,po.po_code
  ,e.first_name
  ,e.employee_id
  FROM goods_receipt gr
  LEFT join supplier s on s.supplier_id = gr.supplier_id
  LEFT join purchase_order po on po.purchase_order_id = gr.purchase_order_id
  LEFT join employee e on e.employee_id = gr.employee_id
  Where gr.goods_receipt_id=${db.escape(req.body.goods_receipt_id)}`,
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

app.post('/editGoodsReceipt', (req, res, next) => {
  db.query(`UPDATE goods_receipt 
            SET goods_received_date=${db.escape(req.body.goods_received_date)}
            ,supplier_id=${db.escape(req.body.supplier_id)}
            ,purchase_order_id=${db.escape(req.body.purchase_order_id)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,status=${db.escape(req.body.status)}
            ,total_amount=${db.escape(req.body.total_amount)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE goods_receipt_id = ${db.escape(req.body.goods_receipt_id)}`,
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


        app.post('/editGoodsReceiptItems', (req, res, next) => {
          db.query(`UPDATE goods_receipt_items
                    SET goods_receipt_id=${db.escape(req.body.goods_receipt_id)}
                    ,product_id=${db.escape(req.body.product_id)}
                    ,product_id=${db.escape(req.body.product_id)}
                    ,po_code=${db.escape(req.body.po_code)}
                    ,purchase_order_id=${db.escape(req.body.purchase_order_id)}
                    ,item_title=${db.escape(req.body.item_title)}
                    ,ordered_quantity=${db.escape(req.body.ordered_quantity)}
                    ,goods_received_date=${db.escape(req.body.goods_received_date)}
                    ,goods_received_qty=${db.escape(req.body.goods_received_qty)}
                    ,unit_price=${db.escape(req.body.unit_price)}
                    ,total_cost=${db.escape(req.body.total_cost)}
                    ,goods_damaged_qty=${db.escape(req.body.goods_damaged_qty)}
                    ,unit=${db.escape(req.body.unit)}
                    ,serial_no=${db.escape(req.body.serial_no)}
                    ,description=${db.escape(req.body.description)}
                    ,creation_date=${db.escape(req.body.creation_date)}
                    ,created_by=${db.escape(req.body.created_by)}
                    ,modification_date=${db.escape(req.body.modification_date)}
                    ,modified_by=${db.escape(req.body.modified_by)}
                    WHERE goods_receipt_items_id = ${db.escape(req.body.goods_receipt_items_id)}`,
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
        
        
app.post('/insertGoodsReceipt', (req, res, next) => {
  let data = {
      goods_received_date	: req.body.goods_received_date
    , supplier_id: req.body.supplier_id
    , purchase_order_id: req.body.purchase_order_id
    , employee_id	: req.body.employee_id
    , status: req.body.status
    , total_amount: req.body.total_amount
    , creation_date: req.body.creation_date
    , created_by:req.body.created_by
    , modification_date:req.body.modification_date
    , modified_by:req.body.modified_by
 };
  let sql = "INSERT INTO goods_receipt SET ?";
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

app.post('/insertGoodsReceiptItems', (req, res, next) => {
  let data = {
      goods_receipt_id	: req.body.goods_receipt_id
    , product_id: req.body.product_id
    , item_title: req.body.item_title
    , purchase_order_id: req.body.purchase_order_id
    , po_code: req.body.po_code
    , po_product_id: req.body.po_product_id
    , ordered_quantity: req.body.ordered_quantity
    , goods_received_qty: req.body.goods_received_qty
    , unit_price: req.body.unit_price
    , total_cost: req.body.total_cost
    , goods_damaged_qty	: req.body.goods_damaged_qty
    , unit: req.body.unit
    , serial_no: req.body.serial_no
    , description: req.body.description
    , creation_date: req.body.creation_date
    , created_by:req.body.created_by
    , modification_date:req.body.modification_date
    , modified_by:req.body.modified_by
 };
  let sql = "INSERT INTO goods_receipt_items SET ?";
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

app.post('/getGoodsReceiptItemsById', (req, res, next) => {
  db.query(`SELECT
   goods_receipt_items_id
  ,goods_receipt_id
  ,purchase_order_id
  ,po_code
  ,product_id
  ,item_title
  ,unit
  ,ordered_quantity
  ,goods_received_date
  ,goods_received_qty
  ,unit_price
  ,total_cost
  ,goods_damaged_qty
  ,serial_no
  ,description
  ,creation_date
  ,modification_date
  ,created_by
  ,modified_by
  FROM goods_receipt_items
  Where purchase_order_id=${db.escape(req.body.purchase_order_id)}`,
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

app.get("/getPoCode", (req, res, next) => {
  db.query(
    `SELECT
     po_code
    ,purchase_order_id
   From purchase_order `,
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

app.get("/getSupplierName", (req, res, next) => {
  db.query(`SELECT company_name,supplier_id FROM supplier`, (err, result) => {
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

app.get('/getEmployeeName', (req, res, next) => {
  db.query(`SELECT 
  e.employee_id
 ,e.first_name
 ,e.nric_no
 ,e.fin_no
 ,(SELECT COUNT(*) FROM job_information ji WHERE ji.employee_id=e.employee_id AND ji.status='current') AS e_count
  FROM employee e `,
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


  app.post('/getPurchaseOrderedByIdOLd', (req, res, next) => {
    db.query(`SELECT
    p.product_code
    ,p.product_id
    ,p.unit
    ,p.title
    ,po.unit
    ,po.item_title
    ,po.quantity
    ,po.po_product_id
    ,po.purchase_order_id
    ,gci.goods_received_date
    ,gci. goods_receipt_id 
    ,gci.goods_received_qty
    FROM po_product po
    LEFT JOIN (product p) ON (p.product_id = po.product_id)
    LEFT JOIN (goods_receipt_items gci) ON (gci.product_id = po.product_id)
    WHERE po.purchase_order_id = ${db.escape(req.body.purchase_order_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
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

  app.post('/getPurchaseOrderedById', (req, res, next) => {
    db.query(`SELECT
    pop.unit
    ,pop.item_title
    ,pop.quantity
    ,pop.po_product_id
    ,pop.purchase_order_id
    ,pop.po_product_id
    ,pop.product_id
    ,po.po_code
    ,po.supplier_id
    FROM po_product pop
    LEFT JOIN (purchase_order po) ON (po.purchase_order_id = pop.purchase_order_id)
    WHERE pop.purchase_order_id = ${db.escape(req.body.purchase_order_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
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

  app.get('/checkReceiptItems', (req, res, next) => {
    db.query(
      `SELECT po_product_id FROM goods_receipt_items`,
      (err, result) => {
        if (err) {
          return res.status(400).send({
            data: err,
            msg: 'Failed'
          });
        } else {
          const quoteItemsIds = result.map((row) => row.po_product_id);
          return res.status(200).send({
            data: quoteItemsIds,
            msg: 'Success'
          });
        }
      }
    );
  });
 

  app.post('/deleteEditItem', (req, res, next) => {

    let data = {goods_received_items_id: req.body.goods_received_items_id};
    let sql = "DELETE FROM goods_receipt_items WHERE ?";
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