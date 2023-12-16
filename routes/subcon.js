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

app.post('/getSubconById', (req, res, next) => {
  db.query(`SELECT s.company_name
  ,s.sub_con_id
  ,s.email
  ,s.fax
  ,s.mobile
  ,s.status
  ,s.address_flat
  ,s.address_street
  ,s.address_state
  ,s.address_country
  ,s.phone
  ,gc.name AS country_name 
  FROM sub_con s LEFT JOIN (geo_country gc) ON (s.address_country = gc.country_code) WHERE s.sub_con_id=${db.escape(req.body.sub_con_id)}`,
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
app.get('/getSubcon', (req, res, next) => {
  db.query(`SELECT s.company_name
  ,s.sub_con_id
  ,s.email
  ,s.fax
  ,s.mobile
  ,s.status
  ,s.address_flat
  ,s.address_street
  ,s.address_state
  ,s.address_country
  ,s.phone
  ,gc.name AS country_name 
  FROM sub_con s LEFT JOIN (geo_country gc) ON (s.address_country = gc.country_code) WHERE s.sub_con_id != ''`,
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

app.post('/edit-Subcon', (req, res, next) => {
  db.query(`UPDATE sub_con 
            SET company_name=${db.escape(req.body.company_name)}
            ,email=${db.escape(req.body.email)}
            ,fax=${db.escape(req.body.fax)}
            ,mobile=${db.escape(req.body.mobile)}
            ,status=${db.escape(req.body.status)}
            ,address_flat=${db.escape(req.body.address_flat)}
            ,address_street=${db.escape(req.body.address_street)}
            ,address_state=${db.escape(req.body.address_state)}
            ,address_country=${db.escape(req.body.address_country)}
            WHERE sub_con_id =  ${db.escape(req.body.sub_con_id)}`,
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



app.post('/insertsub_con', (req, res, next) => {

  let data = {company_name: req.body.company_name,
              email: req.body.email,
              address_street: req.body.address_street,
              address_town: req.body.address_town,
              address_state: req.body.address_state,
              address_country: req.body.address_country,
              address_po_code: req.body.address_po_code,
              phone: req.body.phone,
              fax: req.body.fax,
              notes: req.body.notes,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              mobile: req.body.mobile,
              flag: req.body.flag,
              address_flat: req.body.address_flat,
              status: req.body.status,
              website: req.body.website,
              category : req.body. category ,
              comment_by: req.body.comment_by,
              company_size: req.body.company_size,
              industry: req.body.industry,
              source: req.body.source,
              group_name : req.body. group_name ,
              supplier_type: req.body.supplier_type,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              chi_company_name: req.body.chi_company_name,
              chi_company_address: req.body.chi_company_address,
              company_address_id: req.body.company_address_id,
              contact_person: req.body.contact_person,
              billing_address_flat: req.body.billing_address_flat,
              billing_address_street: req.body.billing_address_street,
              billing_address_country: req.body.billing_address_country,
              billing_address_po_code: req.body.billing_address_po_code,
              gst_no: req.body.gst_no,};
  let sql = "INSERT INTO sub_con  SET ?";
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
app.post('/deleteSub_Con', (req, res, next) => {

  let data = {sub_con_id   : req.body.sub_con_id    };
  let sql = "DELETE FROM sub_con WHERE ?";
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
app.get('/getTabWorkOrder', (req, res, next) => {
  db.query(`SELECT p.sub_con_work_order_id
  FROM sub_con_work_order p 
            WHERE p.sub_con_id != '' AND (p.status != 'Cancelled' OR p.status IS NULL)`,
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
app.post('/insertsub_con_work_order', (req, res, next) => {

  let data = {sub_con_worker_code: req.body.sub_con_worker_code,
              work_order_date: req.body.work_order_date,
              work_order_due_date: req.body.work_order_due_date,
              completed_date: req.body.completed_date,
              project_id: req.body.project_id,
              sub_con_id: req.body.sub_con_id,
              work_order: req.body.work_order,
              status: req.body.status,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              project_location: req.body.project_location,
              project_reference: req.body.project_reference,
              condition: req.body.condition,
              quote_date: req.body.quote_date,
              quote_reference: req.body.quote_reference,};
  let sql = "INSERT INTO sub_con_work_order  SET ?";
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
app.delete('/deletesub_con_work_order', (req, res, next) => {

  let data = {sub_con_work_order_id : req.body.sub_con_work_order_id };
  let sql = "DELETE FROM sub_con_work_order WHERE ?";
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


app.post('/insertsub_con_payments_history', (req, res, next) => {

  let data = {sub_con_work_order_id: req.body.sub_con_work_order_id,
              sub_con_payments_id: req.body.sub_con_payments_id,
              published: req.body.published,
              flag: req.body.flag,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              amount: req.body.amount,
              work_order_date: req.body.work_order_date,
              invoice_paid_status: req.body.invoice_paid_status,
              title: req.body.title,
              receipt_type: req.body.receipt_type,
              related_sub_con_work_order_id: req.body.related_sub_con_work_order_id};
  let sql = "INSERT INTO sub_con_payments_history SET ?";
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

app.delete('/deletesub_con_payments_history', (req, res, next) => {

  let data = {sub_con_payments_history_id : req.body.sub_con_payments_history_id };
  let sql = "DELETE FROM sub_con_payments_history WHERE ?";
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
app.post('/insertsub_con_payments', (req, res, next) => {

  let data = {project_id: req.body.project_id,
              sub_con_id: req.body.sub_con_id,
              sub_con_work_order_id: req.body.sub_con_work_order_id,
              amount: req.body.amount,
              status: req.body.status,
              remarks: req.body.remarks,
              mode_of_payment: req.body.mode_of_payment,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by};
  let sql = "INSERT INTO sub_con_payments SET ?";
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
app.delete('/deletesub_con_payments', (req, res, next) => {

  let data = {sub_con_payments_id : req.body.sub_con_payments_id };
  let sql = "DELETE FROM sub_con_payments WHERE ?";
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
app.post('/insertsub_con_payments', (req, res, next) => {

  let data = {sub_con_worker_code: req.body.sub_con_worker_code,
              work_order_date: req.body.work_order_date,
              work_order_due_date: req.body.work_order_due_date,
              completed_date: req.body.completed_date,
              project_id: req.body.project_id,
              sub_con_id: req.body.sub_con_id,
              work_order: req.body.work_order,
              status: req.body.status,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date,
              created_by: req.body.created_by,
              modified_by: req.body.modified_by,
              project_location: req.body.project_location,
              project_reference: req.body.project_reference,
              condition: req.body.condition,
              quote_reference: req.body.quote_reference,
              quote_date: req.body.quote_date};
  let sql = "INSERT INTO sub_con_work_order SET ?";
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
app.post('/getSubMakePayment', (req, res, next) => {
  db.query(`SELECT i.sub_con_worker_code,
  i.sub_con_work_order_id
  ,i.project_id
  ,(
    SELECT SUM(w.unit_rate*w.quantity) AS prev_sum
    FROM work_order_line_items w
    WHERE w.sub_con_work_order_id =  i.sub_con_work_order_id) as prev_inv_amount
    ,(SELECT SUM(subHist.amount) AS prev_sum 
  FROM sub_con_payments_history subHist 
  LEFT JOIN sub_con_payments r ON (r.sub_con_payments_id = subHist.sub_con_payments_id) 
  WHERE subHist.sub_con_work_order_id = i.sub_con_work_order_id AND i.status != 'Cancelled' ) as prev_amount 
FROM sub_con_work_order i
LEFT JOIN sub_con o ON (i.sub_con_id = o.sub_con_id)
WHERE i.sub_con_id= ${db.escape(req.body.sub_con_id)};
;`,
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

app.post('/getWorkOrderLinkedss', (req, res, next) => {
  db.query(`SELECT p.sub_con_worker_code,
  p.work_order_date,
  p.status,
  p.sub_con_work_order_id,
  pr.project_id,
 pr.title
    ,(
    SELECT SUM(w.unit_rate*w.quantity) AS amount
    FROM work_order_line_items w
    WHERE w.sub_con_work_order_id =  p.sub_con_work_order_id) as amount
    ,(SELECT SUM(subHist.amount) AS prev_sum 
  FROM sub_con_payments_history subHist 
  LEFT JOIN sub_con_payments r ON (r.sub_con_payments_id = subHist.sub_con_payments_id) 
  WHERE subHist.sub_con_work_order_id = p.sub_con_work_order_id AND p.status != 'Cancelled' ) as prev_amount 
  FROM sub_con_work_order p
  LEFT JOIN project pr ON (p.project_id = pr.project_id)
  LEFT JOIN sub_con o ON (p.sub_con_id = o.sub_con_id)
  WHERE p.sub_con_id=${db.escape(req.body.sub_con_id)} ;`,
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
app.get('/PaymentHistoryPortal', (req, res, next) => {
  db.query(`SELECT 
  sr.amount
  ,sr.creation_date AS date
  ,sr.mode_of_payment
  ,sr.sub_con_payments_id
  ,sr.sub_con_id
  ,srh.sub_con_work_order_id
  ,sc.company_name FROM sub_con_payments_history srh 
  LEFT JOIN (sub_con_payments sr) ON (sr.sub_con_payments_id = srh.sub_con_payments_id) LEFT JOIN (sub_con sc) ON (sc.sub_con_id = sr.sub_con_id) WHERE sr.project_id != '' AND sr.status != 'Cancelled'
  ORDER BY srh.sub_con_payments_history_id`,
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

app.post('/SubConPayment', (req, res, next) => {
  db.query(`SELECT sr.amount
  ,srh.creation_date 
  ,sr.mode_of_payment
  ,sr.status
  ,sr.sub_con_payments_id
  ,sr.sub_con_id
  ,sr.project_id
  ,srh.sub_con_work_order_id
FROM sub_con_payments_history srh
LEFT JOIN (sub_con_payments sr) ON (sr.sub_con_payments_id = srh.sub_con_payments_id)
WHERE srh.sub_con_work_order_id =${db.escape(req.body.sub_con_work_order_id)}
ORDER BY srh.sub_con_payments_history_id;`,
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
app.post('/editSubConStatus', (req, res, next) => {
  db.query(`UPDATE sub_con_work_order 
            SET status = 'Paid'
             WHERE sub_con_work_order_id =  ${db.escape(req.body.sub_con_work_order_id)}`,
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
app.get('/getValueList', (req, res, next) => {
  db.query(`SELECT 
  value,valuelist_id
  FROM valuelist WHERE key_text="Company Status"`,
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
app.post('/getStatus', (req, res, next) => {
  db.query(`SELECT 
 p.status from sub_con s 
 LEFT JOIN sub_con_work_order p ON p.sub_con_id = s.sub_con_id 
  AND (p.status = 'New' || p.status = 'Confirmed' || p.status = 'Hold' || p.status = 'Paid' || p.status = 'Partially Paid')
  WHERE s.sub_con_id= ${db.escape(req.body.sub_con_id)}`,
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

app.post('/getSubConWorkOrder', (req, res, next) => {
  db.query(`select * from sub_con_work_order where sub_con_id=${db.escape(req.body.sub_con_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
              data: err,
              msg:'Failed'
            });
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

      }

    }
  );
});

app.post('/editPartialSubconStatus', (req, res, next) => {
  db.query(`UPDATE sub_con_work_order 
            SET status = 'Partially Paid'
             WHERE sub_con_work_order_id =  ${db.escape(req.body.sub_con_work_order_id)}`,
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;