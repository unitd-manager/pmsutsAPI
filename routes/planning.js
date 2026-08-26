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

app.get('/getPlanning', (req, res, next) => {
  db.query(`select title
             ,project_planning_id
            ,code
            ,customer
            ,date
            ,due_date
            ,status
            ,creation_date
            ,modification_date
            From project_planning
            where project_planning_id  !=''`,
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


app.post('/getPlanningById', (req, res, next) => {
  db.query(`select title
            ,project_planning_id
            ,code
            ,customer
            ,date
            ,due_date
            ,status
            ,creation_date
            ,modification_date
            From project_planning
            where project_planning_id = ${db.escape(req.body.project_planning_id)}`,
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


app.post('/editPlanning', (req, res, next) => {
  db.query(`UPDATE project_planning 
            SET title =${db.escape(req.body.title)}
            ,code=${db.escape(req.code)}
            ,customer=${db.escape(req.body.customer)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,date=${db.escape(req.body.date)}
            ,due_date=${db.escape(req.body.due_date)}
            ,status=${db.escape(req.body.status)}
            WHERE project_planning_id = ${db.escape(req.body.project_planning_id)}`,
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

app.post('/insertProjectPlanning', (req, res, next) => {

  let data = {
    project_planning_id:req.body.project_planning_id	
   , title	: req.body.title	
   , code: req.code
   , customer: req.body.customer
   , creation_date: req.body.creation_date
   , modification_date: req.body.modification_date
   , date: req.body.date
   , due_date	: req.body.due_date
   , status	: req.body.status
  
  };
  let sql = "INSERT INTO project_planning SET ?";
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

app.post('/deleteProjectPlanning', (req, res, next) => {

  let data = {project_planning_id: req.body.project_planning_id};
  let sql = "DELETE FROM project_planning WHERE ?";
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



app.post('/getPlanningCpanelLinkedById', (req, res, next) => {
  db.query(`select *,ordered_qty
            From planning_cpanel
            Where project_planning_id =${db.escape(req.body.project_planning_id)}`,
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

app.post('/getPlanningCpanelMaterialsById', (req, res, next) => {
  db.query(`select 
             pc.*,pb.qty,pb.product_name,pb.item_number,i.actual_stock,p.item_code,pb.matrl_shortage,pb.matrl_shortage_qty,pb.planning_bom_id
            From planning_cpanel pc 
            LEFT JOIN planning_bom pb ON pc.planning_cpanel_id = pb.planning_cpanel_id 
            LEFT JOIN product p ON p.item_code = pb.item_number 
            LEFT JOIN inventory i ON i.product_id = p.product_id 
            Where pb.project_planning_id =${db.escape(req.body.project_planning_id)}`,
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

app.post('/editPlanningCpanel', (req, res, next) => {
  db.query(`UPDATE planning_cpanel 
            SET cpanel_name =${db.escape(req.body.cpanel_name)}
            ,ordered_qty=${db.escape(req.body.ordered_qty)}
            ,fg_code=${db.escape(req.body.fg_code)}
            ,start_date=${db.escape(req.body.start_date)}
            ,due_date=${db.escape(req.body.due_date)}
            ,end_date=${db.escape(req.body.end_date)}
            WHERE planning_cpanel_id = ${db.escape(req.body.planning_cpanel_id)}`,
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
  
  
  app.post('/insertPlanningCpanel', (req, res, next) => {

  let data = {
    planning_cpanel_id:req.body.planning_cpanel_id	
   , project_planning_id:req.body.project_planning_id
   , cpanel_name	: req.body.cpanel_name	
   , ordered_qty: req.body.ordered_qty
   , fg_code: req.body.fg_code
   , start_date: req.body.start_date
   , due_date	: req.body.due_date
   , end_date	: req.body.end_date
  
  };
  let sql = "INSERT INTO planning_cpanel SET ?";
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

app.post('/deletePlanningCpanel', (req, res, next) => {

  let data = {planning_cpanel_id: req.body.planning_cpanel_id};
  let sql = "DELETE FROM planning_cpanel WHERE ?";
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


app.post('/getPlanningBomLinkedById', (req, res, next) => {
  db.query(`select *
            From planning_bom
            Where planning_cpanel_id = ${db.escape(req.body.planning_cpanel_id )}`,
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





app.post('/editPlanningBom', (req, res, next) => {
  db.query(`UPDATE planning_bom 
            SET product_name=${db.escape(req.body.product_name)}
            ,item_number=${db.escape(req.body.item_number)}
            ,bom_unit=${db.escape(req.body.bom_unit)}
            ,qty=${db.escape(req.body.qty)}
            ,matrl_shortage=${db.escape(req.body.matrl_shortage)}
            ,matrl_shortage_qty=${db.escape(req.body.matrl_shortage_qty)}
            WHERE planning_bom_id = ${db.escape(req.body.planning_bom_id)}`,
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

app.post('/insertPlanningBom', (req, res, next) => {

  let data = {planning_bom_id	:req.body.planning_bom_id	
    ,product_name	: req.body.product_name
     ,item_number	: req.body.item_number	
   , bom_unit: req.body.bom_unit
   , qty: req.body.qty
   , matrl_shortage: req.body.matrl_shortage
   , matrl_shortage_qty	: req.body.matrl_shortage_qty
   
   };
  let sql = "INSERT INTO planning_bom SET ?";
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

app.post('/deletePlanningBom', (req, res, next) => {

  let data = {planning_bom_id: req.body.planning_bom_id};
  let sql = "DELETE FROM planning_bom WHERE ?";
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