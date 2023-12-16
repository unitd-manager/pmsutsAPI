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

app.post("/getCalendar", (req, res, next) => {
  db.query(
    `SELECT 
    pt.task_title,
    pt.actual_completed_date,
    e.employee_id,
    e.first_name,
    pt.start_date,
    pt.end_date
FROM project_task pt
LEFT JOIN project p ON p.project_id = pt.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE p.project_id =${db.escape(req.body.project_id)} AND e.employee_id =${db.escape(req.body.employee_id)}
GROUP BY p.project_id, e.employee_id, pt.task_title, pt.actual_completed_date, pt.start_date, pt.end_date`,
    (err, result) => {
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
    }
  );
});


app.post("/getCalendarProject", (req, res, next) => {
  db.query(
    `SELECT
  p.title,
  p.project_id,
  e.employee_id,
  t.task_title
   From project p
LEFT JOIN project_task t ON t.project_id=p.project_id
LEFT JOIN employee e ON t.employee_id=e.employee_id
WHERE p.project_id=${db.escape(req.body.project_id)}`,
    (err, result) => {
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
    }
  );
});

app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
