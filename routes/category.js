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

app.get("/getCategory", (req, res, next) => {
  db.query(
    `SELECT 
  c.category_title,
  c.sort_order,
  c.category_id,
  s.section_title,
  c.published,
  c.section_id,
  c.category_type,
  c.internal_link,
  c.published,
  c.meta_title,
  c.meta_description,
  c.meta_keyword,
  c.creation_date,
  c.modification_date
  FROM category c LEFT JOIN (section s) ON s.section_id=c.section_id 
  
  ORDER By c.sort_order ASC`,
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

app.post("/getCategoryById", (req, res, next) => {
  db.query(
    `SELECT 
  c.category_title,
  c.sort_order,
  c.category_id,
   s.section_title,
  c.published,
  c.section_id,
  c.category_type,
  c.internal_link,
  c.published,
  c.meta_title,
  c.seo_title,
  c.meta_description,
  c.meta_keyword,
  c.creation_date,
  c.modification_date
  FROM category c LEFT JOIN (section s) ON (s.section_id=c.section_id )
    WHERE c.category_id = ${db.escape(req.body.category_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
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

app.get("/getSectionTitle", (req, res, next) => {
  db.query(`SELECT  section_title,section_id FROM section  `, (err, result) => {
    if (err) {
      console.log("error: ", err);
      return;
    } else {
      return res.status(200).send({
        data: result,
        msg: "Success",
      });
    }
  });
});

app.get("/get-ValueList", (req, res, next) => {
  db.query(
    `SELECT 
      value,valuelist_id
      FROM valuelist WHERE key_text="Category Type"`,
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

// app.get("/get-ValueList", (req, res, next) => {
//   db.query(
//     `SELECT 
//       value,valuelist_id
//       FROM valuelist WHERE key_text="Category Type"`,
//     (err, result) => {
//       if (err) {
//         console.log("error: ", err);
//         return;
//       } else {
//         return res.status(200).send({
//           data: result,
//           msg: "Success",
//         });
//       }
//     }
//   );
// });

app.post("/edit-Category", (req, res, next) => {
  db.query(
    `UPDATE category 
            SET 
            category_title=${db.escape(req.body.category_title)}
            ,section_id=${db.escape(req.body.section_id)}
            ,category_type=${db.escape(req.body.category_type)}
            ,internal_link=${db.escape(req.body.internal_link)}
            ,published=${db.escape(req.body.published)}
            ,meta_title=${db.escape(req.body.meta_title)}
            ,meta_description=${db.escape(req.body.meta_description)}
            ,meta_keyword=${db.escape(req.body.meta_keyword)}
            ,seo_title=${db.escape(req.body.seo_title)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,section_id=${db.escape(req.body.section_id)}
            WHERE category_id= ${db.escape(req.body.category_id)}
            `,
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


app.post("/insertCategory", (req, res, next) => {
  let data = {
    category_id: req.body.category_id,
    section_id: req.body.section_id,
    category_title: req.body.category_title,
    category_type: "Content",
    internal_link: req.body.internal_link,
    published: "0",
    meta_title: req.body.meta_title,
    meta_description: req.body.meta_description,
    meta_keyword: req.body.meta_keyword,
    creation_date: req.body.creation_date,
    modification_date: null
  };
  let sql = "INSERT INTO category SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: "Success",
      });
    }
  });
});
app.post("/updateSortOrder", (req, res, next) => {
  db.query(
    `UPDATE category 
              SET 
              sort_order=${db.escape(req.body.sort_order)}
              WHERE category_id= ${db.escape(req.body.category_id)}
              `,
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

// app.post("/insertCategory", (req, res, next) => {
//   let data = {
//     category_id: req.body.category_id,
//     section_id: req.body.section_id,
//     category_title: req.body.category_title,
//     category_type: "Content",
//     seo_title: req.body.category_title,
//     internal_link: req.body.internal_link,
//     published:'0',
//     meta_title: req.body.meta_title,
//     meta_description: req.body.meta_description,
//     meta_keyword: req.body.meta_keyword,
//     creation_date: req.body.creation_date,
//     modification_date: null,
//   };
//   let sql = "INSERT INTO category SET ?";
//   let query = db.query(sql, data, (err, result) => {
//     if (err) {
//       console.log("error: ", err);
//       return;
//     } else {
//       return res.status(200).send({
//         data: result,
//         msg: "Success",
//       });
//     }
//   });
// });

app.post("/deleteCategory", (req, res, next) => {
  let data = { category_id: req.body.category_id };
  let sql = "DELETE FROM category WHERE ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      console.log("error: ", err);
      return;
    } else {
      return res.status(200).send({
        data: result,
        msg: "Success",
      });
    }
  });
});
app.post("/getCategoryTitle", (req, res, next) => {
  db.query(
    `SELECT
  category_title,category_id,section_id
   From category 
   WHERE category_id =  ${db.escape(req.body.category_id)}`,
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
app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
