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

app.get('/getPurchaseRequest', (req, res, next) => {
  db.query(`SELECT 
  pr.purchase_request_id,
  pr.purchase_request_code,
  pr.purchase_request_date,
  pr.purchase_delivery_date,
  pr.department,
  pr.status,
  pr.creation_date,
  pr.modification_date,
  pr.created_by,
  pr.modified_by,
  pr.priority,
  c.company_name,
  c.company_id
  FROM purchase_request pr
  LEFT join company c on c.company_id=pr.company_id
  Where pr.purchase_request_id !=''`,
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

app.post('/getPurchaseRequestById', (req, res, next) => {
  db.query(`SELECT 
  pr.purchase_request_id,
  pr.purchase_request_code,
  pr.purchase_request_date,
  pr.purchase_delivery_date,
  pr.department,
  pr.status,
  pr.creation_date,
  pr.modification_date,
  pr.created_by,
  pr.modified_by,
  pr.priority,
  c.company_name,
  c.company_id
  FROM purchase_request pr
  LEFT join company c on c.company_id=pr.company_id
  Where pr.purchase_request_id=${db.escape(req.body.purchase_request_id)}`,
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

app.post('/editPurchaseRequest', (req, res, next) => {
  db.query(`UPDATE purchase_request 
            SET purchase_request_date=${db.escape(req.body.purchase_request_date)}
            ,purchase_delivery_date=${db.escape(req.body.purchase_delivery_date)}
            ,department=${db.escape(req.body.department)}
            ,status=${db.escape(req.body.status)}
            ,priority=${db.escape(req.body.priority)}
            ,company_id=${db.escape(req.body.company_id)}
            ,description=${db.escape(req.body.description)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE purchase_request_id = ${db.escape(req.body.purchase_request_id)}`,
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
        
        
app.post('/insertPurchaseRequest', (req, res, next) => {
  let data = {
      purchase_request_code	: req.body.purchase_request_code
    , purchase_request_date	: req.body.purchase_request_date
    , purchase_delivery_date: req.body.purchase_delivery_date
    , department: req.body.department
    , status	: req.body.status
    , priority: req.body.priority
    , description: req.body.description
    , creation_date: req.body.creation_date
    , created_by:req.body.created_by
    , modification_date:req.body.modification_date
    , modified_by:req.body.modified_by
    , priority:req.body.priority
 };
  let sql = "INSERT INTO purchase_request SET ?";
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

app.post('/insertPurchaseProduct', (req, res, next) => {

  let data = {category_id: req.body.category_id
    ,  sub_category_id : req.body. sub_category_id 
    , title: req.body.title
    , product_code: req.body.product_code
    , description: req.body.description
    , qty_in_stock: req.body.qty_in_stock
    , price: req.body.price
    , published:req.body.published
    , member_only: req.body.member_only
    , creation_date: req.body.creation_date
    , modification_date: req.body.modification_date
    , chi_title: req.body.chi_title
    , chi_description: req.body.chi_description
    , sort_order: req.body.sort_order
    , meta_title: req.body.meta_title
    , meta_description: req.body.meta_description
    , meta_keyword: req.body.meta_keyword
    , latest : req.body. latest 
    , description_short: req.body.description_short
    , chi_description_short: req.body.chi_description_short
    , general_quotation: req.body.general_quotation
    , unit: req.body.unit
    , product_group_id: req.body.product_group_id
    , department_id: req.body.department_id
    , item_code: req.body.item_code
    , modified_by: req.body.modified_by
    , created_by: req.body.created_by
    , part_number: req.body.part_number
    , price_from_supplier: req.body.price_from_supplier
    , model: req.body.model
    , carton_no: req.body.carton_no
    , batch_no: req.body.batch_no
    , vat: req.body.vat
    , fc_price_code: req.body.fc_price_code
    , batch_import: req.body.batch_import
    , commodity_code: req.body.commodity_code
    , show_in_website: req.body.show_in_website
    , most_selling_product: req.body.most_selling_product
    , site_id: req.body.site_id
    , damaged_qty: req.body.damaged_qty
    , item_code_backup: req.body.item_code_backup
    , hsn_sac: req.body.hsn_sac
    , deals_of_week: req.body.deals_of_week
    , top_seller: req.body.top_seller
    , hot_deal: req.body.hot_deal
    , most_popular : req.body. most_popular 
    , top_rating: req.body.top_rating
    , section_id: req.body.section_id
    , discount_type: req.body.discount_type
    , discount_percentage: req.body.discount_percentage
    , discount_amount: req.body.discount_amount
    , hsn: req.body.hsn
    , gst: req.body.gst
    , product_weight: req.body.product_weight
    , tam_title: req.body.tam_title
    , tam_description: req.body.tam_description
    , tam_description_short: req.body.tam_description_short
    , supplier_id: req.body.supplier_id
    , product_type: req.body.product_type
    , bar_code: req.body.bar_code
    , tag_no: req.body.tag_no
    , pack_size : req.body. pack_size 
    , discount_from_date: req.body.discount_from_date
    , discount_to_date: req.body.discount_to_date
    , mrp: req.body.mrp};
  let sql = "INSERT INTO product SET ?";
  let query = db.query(sql, data,(err, result) => {
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

app.get("/getCustomerName", (req, res, next) => {
  db.query(`SELECT company_name,company_id FROM company`, (err, result) => {
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


app.post('/deletePurchaseRequest', (req, res, next) => {

  let data = {project_task_id: req.body.project_task_id};
  let sql = "DELETE FROM purchase_request WHERE ?";
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
      sql = "SELECT * FROM setting WHERE key_text='invoiceCodePrefix' OR key_text='nextInvoiceCode'";  
    }else if(type == 'subConworkOrder'){
        key_text = 'nextSubconCode';
      sql = "SELECT * FROM setting WHERE key_text='subconCodePrefix' OR key_text='nextSubconCode'";  
    }
    else if(type == 'project'){
        key_text = 'nextProjectCode';
        sql = "SELECT * FROM setting WHERE key_text='projectCodePrefix' OR key_text='nextProjectCode'";  
    }else if(type == 'opportunityproject'){
        key_text = 'nextOpportunityProjectCode';
        sql = "SELECT * FROM setting WHERE key_text='opportunityprojectCodePrefix' OR key_text='nextOpportunityProjectCode'";  
    }else if(type == 'quote'){
        key_text = 'nextQuoteCode';
        sql = "SELECT * FROM setting WHERE key_text='quoteCodePrefix' OR key_text='nextQuoteCode'";  
    }
    else if(type == 'creditNote'){
        key_text = 'nextCreditNoteCode';
        sql = "SELECT * FROM setting WHERE key_text='creditNotePrefix' OR key_text='nextCreditNoteCode'";  
    }else if(type == 'employee'){
      //   withprefix = false;
        key_text = 'nextEmployeeCode';
      sql = "SELECT * FROM setting WHERE key_text='employeeCodePrefix' OR key_text='nextEmployeeCode'";  
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
    else if(type == 'ProductCode'){
        key_text = 'nextProductCode';
        sql = "SELECT * FROM setting WHERE key_text='nextProductCodePrefix' OR key_text='nextProductCode'";  
    }
    else if(type == 'InventoryCode'){
        key_text = 'nextInventoryCode';
        sql = "SELECT * FROM setting WHERE key_text='inventoryCodePrefix' OR key_text='nextInventoryCode'";  
    }
    else if(type == 'ItemCode'){
        withprefix = false;
        key_text = 'nextItemCode';
        sql = "SELECT * FROM setting WHERE key_text='nextItemCode'"; 
    }
    else if(type == 'PurchaseRequestCode'){
        key_text = 'nextPurchaseRequestCode';
        sql = "SELECT * FROM setting WHERE key_text='nextPurchaseRequestCodePrefix' OR key_text='nextPurchaseRequestCode'";  
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

  app.get('/PurchaseRequestLineItem', (req, res, next) => {
    db.query(`SELECT
    p.product_code
    ,pr.unit
    ,pr.purchase_request_qty
    ,pr.modified_by
    ,p.title
    FROM purchase_request_items pr
    LEFT JOIN (product p) ON (p.product_id = pr.product_id) 
    WHERE pr.purchase_request_id !=''`,
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


  app.post('/PurchaseRequestLineItemById', (req, res, next) => {
    db.query(`SELECT
      purchase_request_items_id 
    , purchase_request_id
    , product_id
    , title
    , purchase_request_qty
    , unit
    , creation_date
    , modification_date
    , created_by
    , modified_by
    FROM purchase_request_items
    WHERE purchase_request_id = ${db.escape(req.body.purchase_request_id)}`,
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


  app.post('/editPurchaseRequestItems', (req, res, next) => {
    db.query(`UPDATE purchase_request_items 
              SET purchase_request_id=${db.escape(req.body.purchase_request_id)}
              ,product_id=${db.escape(req.body.product_id)}
              ,title=${db.escape(req.body.title)} 
              ,purchase_request_qty=${db.escape(req.body.purchase_request_qty)}
              ,unit=${db.escape(req.body.unit)}
              ,creation_date=${db.escape(req.body.creation_date)}
              ,created_by=${db.escape(req.body.created_by)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,modified_by=${db.escape(req.body.modified_by)}
              WHERE purchase_request_items_id  = ${db.escape(req.body.purchase_request_items_id )}`,
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

  app.post('/insertPurchaseRequestLineItem', (req, res, next) => {

    let data = {
       product_id:req.body.product_id,
       title:req.body.title,
       purchase_request_qty:req.body.purchase_request_qty,
       unit:req.body.unit,
       creation_date:req.body.creation_date,
       created_by:req.body.created_by,
       purchase_request_id:req.body.purchase_request_id
   };
   console.log(data)
    let sql = "INSERT INTO purchase_request_items SET ?";
    let query = db.query(sql, data,(err, result) => {
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

  app.post('/deleteEditItem', (req, res, next) => {

    let data = {purchase_request_items_id: req.body.purchase_request_items_id};
    let sql = "DELETE FROM purchase_request_items WHERE ?";
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


  app.post('/insertProduct', (req, res, next) => {

    let data = {category_id: req.body.category_id
      , sub_category_id : req.body.sub_category_id 
      , title: req.body.title
      , product_code: req.body.product_code
      , description: req.body.description
      , qty_in_stock: req.body.qty
      , price: req.body.price
      , published:1
      , member_only: req.body.member_only
      , creation_date: req.body.creation_date
      , modification_date: null
      , chi_title: req.body.chi_title
      , chi_description: req.body.chi_description
      , sort_order: req.body.sort_order
      , meta_title: req.body.meta_title
      , meta_description: req.body.meta_description
      , meta_keyword: req.body.meta_keyword
      , latest : req.body. latest 
      , description_short: req.body.description_short
      , chi_description_short: req.body.chi_description_short
      , general_quotation: req.body.general_quotation
      , unit: req.body.unit
      , product_group_id: req.body.product_group_id
      , department_id: req.body.department_id
      , item_code: req.body.item_code
      , modified_by: req.body.modified_by
      , created_by: req.body.created_by
      , part_number: req.body.part_number
      , price_from_supplier: req.body.price_from_supplier
      , model: req.body.model
      , carton_no: req.body.carton_no
      , batch_no: req.body.batch_no
      , vat: req.body.vat
      , fc_price_code: req.body.fc_price_code
      , batch_import: req.body.batch_import
      , commodity_code: req.body.commodity_code
      , show_in_website: req.body.show_in_website
      , most_selling_product: req.body.most_selling_product
      , site_id: req.body.site_id
      , damaged_qty: req.body.damaged_qty
      , item_code_backup: req.body.item_code_backup
      , hsn_sac: req.body.hsn_sac
      , deals_of_week: req.body.deals_of_week
      , top_seller: req.body.top_seller
      , hot_deal: req.body.hot_deal
      , most_popular : req.body. most_popular 
      , top_rating: req.body.top_rating
      , section_id: req.body.section_id
      , discount_type: req.body.discount_type
      , discount_percentage: req.body.discount_percentage
      , discount_amount: req.body.discount_amount
      , hsn: req.body.hsn
      , gst: req.body.gst
      , product_weight: req.body.product_weight
      , tam_title: req.body.tam_title
      , tam_description: req.body.tam_description
      , tam_description_short: req.body.tam_description_short
      , supplier_id: req.body.supplier_id
      , product_type: req.body.product_typenode
      , bar_code: req.body.bar_code
      , tag_no: req.body.tag_no
      , pack_size : req.body. pack_size 
      , discount_from_date: req.body.discount_from_date
      , discount_to_date: req.body.discount_to_date
      , mrp: req.body.mrp};
    let sql = "INSERT INTO product SET ?";
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

  app.get("/getProductsbySearchFilter", (req, res, next) => {
    const { keyword } = req.query; // Extract query parameters
  
    db.query(
      `SELECT p.product_id
    ,p.category_id
    ,p.sub_category_id
    ,p.title
    ,p.description,
    p.qty_in_stock
    ,p.price
    ,p.published
    ,p.creation_date
    ,p.modification_date
    ,p.description_short
    ,p.general_quotation
    ,p.unit
    ,p.product_group_id
    ,p.item_code
    ,p.modified_by
    ,p.created_by
    ,p.part_number
    ,p.price_from_supplier
    ,p.latest
    ,p.section_id
    ,p.hsn_sac
    ,p.gst
    ,p.mrp
    ,p.tag_no
    ,p.product_type
    ,p.bar_code
    ,p.product_code
    ,p.discount_type
    ,p.discount_percentage
    ,p.discount_amount
    ,p.discount_from_date
    ,p.discount_to_date
    ,s.section_title
    ,c.category_title
    ,sc.sub_category_title,co.company_name,co.supplier_id,(SELECT GROUP_CONCAT(co.company_name ORDER BY co.company_name SEPARATOR ', ') 
    FROM supplier co, product_company pc 
    WHERE co.supplier_id = pc.company_id AND pc.product_id = p.product_id) AS company_records
    FROM product p LEFT JOIN (category c) ON (p.category_id = c.category_id) 
    LEFT JOIN (section s) ON (p.section_id = s.section_id) 
    LEFT JOIN (sub_category sc) ON (p.sub_category_id  = sc.sub_category_id)
    LEFT JOIN (product_company pc) ON (pc.product_id = p.product_id) 
    LEFT JOIN (supplier co) ON (co.supplier_id = pc.company_id)
      where p.title LIKE CONCAT('%',  ${db.escape(keyword)}, '%') AND p.published=1 
       GROUP BY p.product_id`,
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;