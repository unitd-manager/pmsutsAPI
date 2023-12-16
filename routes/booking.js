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

app.get("/getBooking", (req, res, next) => {
  db.query(
    `SELECT b.booking_id
   ,b.booking_date
   ,b.assign_time
   ,b.status
   ,b.gps_parameter
   ,b.created_by
   ,b.modified_by
   ,b.creation_date
   ,c.email AS c_email
   ,c.address_country AS c_address_country
   ,c.address_po_code AS c_address_po_code
   ,c.phone AS c_phone
   ,c.fax AS c_fax
   ,c.status AS c_status
   ,c.website AS c_website
   ,c.category AS c_categor
   ,c.company_name
   ,c.company_name As c_company_name
   ,e.employee_name
   ,b.company_id
   ,b.employee_id
   ,CONCAT_WS(' ', c.address_flat, c.address_street,c.address_town,c.address_state) AS address    
   FROM booking b LEFT JOIN 
   employee e ON (e.employee_id = b.employee_id) LEFT JOIN 
   (company c) ON ( c.company_id = b.company_id )`,
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

app.post("/getBookingById", (req, res, next) => {
  db.query(
    ` SELECT b.booking_id
   ,b.booking_date
   ,b.assign_time
   ,b.status
   ,b.gps_parameter
   ,b.creation_date
   ,b.modification_date
   ,b.created_by
   ,b.modified_by
   ,b.company_id
   ,b.employee_id
   ,c.company_name As c_company_name
   , c.address_po_code AS c_address_po_code
   ,c.phone AS c_phone
   ,c.fax AS c_fax
   ,c.status AS c_status
   ,c.website AS c_website
   ,c.category AS c_category
   ,c.company_name
   ,e.employee_name
   ,CONCAT_WS(' ', c.address_flat, c.address_street,c.address_town,c.address_state) AS address
   FROM booking b LEFT JOIN employee e ON (e.employee_id = b.employee_id) LEFT JOIN (company c) ON ( c.company_id = b.company_id )
   WHERE
  b.booking_id = ${db.escape(req.body.booking_id)} 
   `,
    (err, result) => {
      if (result.length == 0) {
        return res.status(400).send({
          msg: "No result found",
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
app.get("/getEmployeeName", (req, res, next) => {
  db.query(
    `SELECT employee_name,employee_id
    FROM employee`,
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
app.get("/getCompanyName", (req, res, next) => {
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

app.post("/edit-Booking", (req, res, next) => {
  db.query(
    `UPDATE booking 
            SET 
            booking_date=${db.escape(req.body.booking_date)}
            ,assign_time=${db.escape(req.body.assign_time)}
            ,gps_parameter=${db.escape(req.body.gps_parameter)}
            ,status=${db.escape(req.body.status)}
            ,company_id=${db.escape(req.body.company_id)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,modification_date=${db.escape(req.body.modification_date)}
            WHERE booking_id= ${db.escape(req.body.booking_id)}
            `,
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

app.post("/TabCompany", (req, res, next) => {
  db.query(
    `SELECT 
  c.company_name,
  c.company_id  
  FROM company c 
  WHERE c.company_id = ${db.escape(req.body.company_id)}`,
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

app.post("/insertBooking", (req, res, next) => {
  let data = {
    booking_id: req.body.booking_id,
    employee_id: req.body.employee_id,
    company_id: req.body.company_id,
    booking_date: new Date().toISOString().slice(0, 19).replace("T", " "),
    assign_time: req.body.assign_time,
    created_by: req.body.created_by,
    modified_by: req.body.modified_by,
    gps_parameter: req.body.gps_parameter,
    status: "Scheduled",
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    creation_date: req.body.creation_date,
    modification_date: null
  };
  let sql = "INSERT INTO booking SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
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
  });
});
app.post("/insertCompany", (req, res, next) => {
  let data = {
    company_id: req.body.company_id,
    company_name: req.body.company_name,
    email: req.body.email,
    address_street: req.body.address_street,
    address_town: req.body.address_town,
    address_state: req.body.address_state,
    address_country: req.body.address_country,
    address_flat: req.body.address_flat,
    address_po_code: req.body.address_po_code,
    phone: req.body.phone,
    fax: req.body.fax,
    website: req.body.website,
    supplier_type: req.body.supplier_type,
    industry: req.body.industry,
    company_size: req.body.company_size,
    source: req.body.source,
  };
  let sql = "INSERT INTO company SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
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
  });
});

app.post("/deleteBooking", (req, res, next) => {
  let data = { booking_id: req.body.booking_id };
  let sql = "DELETE FROM booking WHERE ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      return;
    } else {
      return res.status(200).send({
        data: result,
        msg: "Success",
      });
    }
  });
});

app.post("/getCreationModificationById", (req, res, next) => {
  db.query(
    ` SELECT 
    b.created_by
   ,b.modified_by
   ,b.creation_date
   ,b.modification_date
    FROM booking b 
    WHERE
    b.booking_id = ${db.escape(req.body.booking_id)} 
   `,
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

app.get("/getTabServiceLink", (req, res, next) => {
  db.query(
    `SELECT * FROM booking_service WHERE booking_id = '' ORDER BY booking_service_id`,
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
app.post("/getTabServiceLinkById", (req, res, next) => {
  db.query(
    `SELECT 
  booking_id,
  booking_service_id,
  service 
  FROM booking_service 
  WHERE booking_service_id =  ${db.escape(req.body.booking_service_id)} `,
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

app.post("/insertbooking_service", (req, res, next) => {
  let data = {
    booking_id: req.body.booking_id,
    service: req.body.service,
    creation_date: req.body.creation_date,
    modification_date: req.body.modification_date,
    modified_by: req.body.modified_by,
    created_by: req.body.created_by,
  };
  let sql = "INSERT INTO booking_service SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
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
  });
});

app.delete("/deleteBooking_service", (req, res, next) => {
  let data = { booking_service_id: req.body.booking_service_id };
  let sql = "DELETE FROM booking_service WHERE ?";
  let query = db.query(sql, data, (err, result) => {
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

app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
