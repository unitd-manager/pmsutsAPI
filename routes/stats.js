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


app.use(fileUpload({
    createParentPath: true
}));
app.get('/getcoldCallCountByEmployee', (req, res) => {
  const { month } = req.query; // Assuming you pass the month as a query parameter

  // Query to count cold calls (non-null comments) by employee for the specified month
  const query = 
  `SELECT
      e.employee_id,
      e.first_name,
      COUNT(c.comments) AS cold_call_count
    FROM Leads l
    LEFT JOIN employee e ON e.employee_id = l.employee_id
    LEFT JOIN comment c ON c.record_id = l.lead_id
    WHERE MONTH(l.lead_date) =''
    GROUP BY e.employee_id, e.first_name`;

  // Execute the query
  db.query(query, [month], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send({ error: 'Error fetching data' });
      return;
    }

    res.status(200).send({ data: result });
  });
});
app.get('/getEmployeeNameByColdCall', (req, res, next) => {
  db.query(

    `SELECT 
    e.employee_id,
    e.first_name,
    l.lead_date,
    c.company_name,
    COUNT(l.employee_id) AS cold_call_count
   FROM Leads l
   LEFT JOIN employee e ON e.employee_id = l.employee_id
   LEFT JOIN (company c) ON (c.company_id = l.company_id)
   Where l.lead_id !=''
   GROUP BY e.employee_id, e.first_name `,
               (err, result) => {
      if (err) {
        console.log("Error fetching data:", err);
        res.status(500).send({ msg: 'Error fetching employee data' });
        return;
      }

      if (result.length > 0) {
        res.status(200).send({
          data: result,
          msg: 'Success'
        });
      } else {
        res.status(404).send({ msg: 'No employee data found' });
      }
    }
  );
});
app.post('/getEmployeeNameByComments', (req, res, next) => {
  const { month } = req.body; // Extract query parameters
  const currentYear = new Date().getFullYear(); // Get current year

  let dateCondition = ''; // Initialize the date condition

  dateCondition = `WHERE DATE_FORMAT(l.lead_date, '%M') = ${db.escape(month)} AND YEAR(l.lead_date) = ${currentYear}`;

  db.query(
    `SELECT
      e.employee_id,
      l.lead_date,
      e.first_name,
      COUNT(c.comments) AS cold_call_count
    FROM leads l
    LEFT JOIN employee e ON e.employee_id = l.employee_id
    LEFT JOIN comment c ON c.record_id = l.lead_id
  ${dateCondition}
    GROUP BY e.employee_id, e.first_name`,
    (err, result) => {
      if (err) {
        console.log("Error fetching data:", err);
        res.status(500).send({ msg: 'Error fetching employee data' });
        return;
      }

      if (result.length > 0) {
        res.status(200).send({
          data: result,
          msg: 'Success'
        });
      } else {
        res.status(404).send({ msg: 'No employee data found' });
      }
    }
  );
});


app.get('/getLeadStats', (req, res, next) => {
  db.query(`SELECT a.* ,pe.first_name ,c.company_name 
  FROM leads
  
  a LEFT JOIN (employee pe) 
  ON (pe.employee_id = a.employee_id) 
  LEFT JOIN (company c) 
  ON (c.company_id = a.company_id)
  Where a.lead_id !=''`,
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
app.post('/getSalesStaffName', (req, res, next) => {
  db.query(`
  SELECT 
pt.employee_id,
e.first_name
FROM project_task pt
LEFT JOIN employee e on e.employee_id=pt.employee_id
WHERE pt.project_id=${db.escape(req.body.project_id)}
GROUP BY pt.employee_id`,
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

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.post("/getStatsId", (req, res, next) => {
  db.query(
    `SELECT
  t.employee_id,
  e.first_name,
  e.employee_id AS employees_id,
  p.project_id,
  p.title,
  SUM(t.completion) AS total_completion,
  COUNT(*) AS total_tasks,
  SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) AS pending_tasks,
  SUM(CASE WHEN t.status = 'InProgress' THEN 1 ELSE 0 END) AS in_progress_tasks,
  SUM(CASE WHEN t.status = 'OnHold' THEN 1 ELSE 0 END) AS on_hold_tasks
FROM
  project_task t
LEFT JOIN employee e ON t.employee_id = e.employee_id
LEFT JOIN project p ON t.project_id = p.project_id
WHERE
  t.employee_id= ${db.escape(
    req.body.employee_id
  )} AND t.project_id= ${db.escape(req.body.project_id)}
GROUP BY
  t.employee_id, e.first_name, p.project_id, p.title`,
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

app.post("/getDuechartStats", (req, res, next) => {
  db.query(
    `SELECT
  t.employee_id,
  e.first_name,
  e.employee_id AS employees_id,
  SUM(t.completion) AS total_completion,
  GROUP_CONCAT(DISTINCT t.task_title ORDER BY t.task_title ASC SEPARATOR ', ') AS task_titles,
  COUNT(*) AS total_tasks,
  SUM(CASE WHEN t.end_date = t.actual_completed_date THEN 1 ELSE 0 END) AS due,
  SUM(CASE WHEN t.end_date > t.actual_completed_date THEN 1 ELSE 0 END) AS with_due,
  SUM(CASE WHEN t.end_date < t.actual_completed_date THEN 1 ELSE 0 END) AS over_due
FROM
  project_task t
LEFT JOIN employee e ON t.employee_id = e.employee_id
WHERE
  t.employee_id = ${db.escape(req.body.employee_id)}
  GROUP BY
  t.employee_id, e.first_name`,
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

app.get("/ProjectTitleStats", (req, res, next) => {
  db.query(
    `SELECT 
    p.project_id, 
    p.title, 
    p.general, 
    COUNT(CASE WHEN pt.status = 'InProgress' OR pt.status = 'Not Started' THEN pt.status END) AS task_title_count
FROM 
    project p
JOIN 
    project_task pt ON p.project_id = pt.project_id
WHERE 
    p.project_id !='' AND p.status = 'WIP'
GROUP BY 
    p.project_id`,
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



app.get('/getEmployeeNameByColdCall', (req, res, next) => {
  db.query(

    `SELECT l.*,
    e.employee_id,
    e.first_name,
    l.lead_date,
    c.company_name,
    COUNT(l.employee_id) AS cold_call_count
   FROM Leads l
   LEFT JOIN employee e ON e.employee_id = l.employee_id
   LEFT JOIN (company c) ON (c.company_id = l.company_id)
   Where l.lead_id !=''
   GROUP BY e.employee_id, e.first_name ,l.lead_date`,
               (err, result) => {
      if (err) {
        console.log("Error fetching data:", err);
        res.status(500).send({ msg: 'Error fetching employee data' });
        return;
      }

      if (result.length > 0) {
        res.status(200).send({
          data: result,
          msg: 'Success'
        });
      } else {
        res.status(404).send({ msg: 'No employee data found' });
      }
    }
  );
});





app.get("/ProjectEmployeeStats", (req, res, next) => {
  db.query(
    `SELECT 
  p.project_id, 
  p.title, 
  e.employee_id,
  e.employee_name,
  e.first_name,
  COUNT(CASE WHEN (pt.status = 'InProgress' OR pt.status = 'Not Started') AND pt.employee_id = e.employee_id THEN pt.status END) AS task_count
FROM 
  project p
JOIN 
  project_task pt ON p.project_id = pt.project_id
JOIN 
  employee e ON pt.employee_id = e.employee_id
WHERE 
  p.project_id IN (6, 43, 62, 52, 71)
GROUP BY 
  p.project_id, e.employee_id, e.employee_name,p.title;
`,
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


app.post("/ProjectEmployeeStatsById", (req, res, next) => {
  db.query(
    `SELECT 
  p.project_id, 
  p.title, 
  e.employee_id,
  e.employee_name,
  e.first_name,
  COUNT(CASE WHEN (pt.status = 'InProgress' OR pt.status = 'Not Started') AND pt.employee_id = e.employee_id THEN pt.status END) AS task_count
FROM 
  project p
JOIN 
  project_task pt ON p.project_id = pt.project_id
JOIN 
  employee e ON pt.employee_id = e.employee_id
WHERE 
  p.project_id =  ${db.escape(req.body.project_id)} 
GROUP BY 
  p.project_id, e.employee_id, e.employee_name,p.title;
`,
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


app.get("/ProjectTitleCards", (req, res, next) => {
  db.query(
    `SELECT 
    COUNT(CASE WHEN p.status = 'Not Started' THEN p.task_title END) AS not_started_task,
    COUNT(CASE WHEN p.status = 'InProgress' THEN p.task_title END) AS in_progress_task_count,
COUNT(CASE WHEN p.status = 'Completed' THEN p.task_title END) AS completed,
COUNT(CASE WHEN p.status = 'OnHold' THEN p.task_title END) AS on_hold
FROM 
    project_task p
WHERE 
    p.project_id IN (6, 43, 62, 52, 71)`,
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

app.post("/getProjectDuechartStats", (req, res, next) => {
  db.query(
    `SELECT
  t.employee_id,
  e.first_name,
  e.employee_id AS employees_id,
  SUM(t.completion) AS total_completion,
  GROUP_CONCAT(DISTINCT t.task_title ORDER BY t.task_title ASC SEPARATOR ', ') AS task_titles,
  COUNT(*) AS total_tasks,
  SUM(CASE WHEN t.end_date = t.actual_completed_date THEN 1 ELSE 0 END) AS due,
  SUM(CASE WHEN t.end_date > t.actual_completed_date THEN 1 ELSE 0 END) AS with_due,
  SUM(CASE WHEN t.end_date < t.actual_completed_date THEN 1 ELSE 0 END) AS over_due
FROM
  project_task t
LEFT JOIN employee e ON t.employee_id = e.employee_id
WHERE
  t.employee_id = ${db.escape(
    req.body.employee_id
  )} AND t.project_id = ${db.escape(req.body.project_id)}
  GROUP BY
  t.employee_id, e.first_name`,
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

app.get("/getLeadStats", (req, res, next) => {
  db.query(
    `SELECT a.* ,pe.first_name ,c.company_name FROM leads a LEFT JOIN (employee pe) ON (pe.employee_id = a.employee_id) LEFT JOIN (company c) ON (c.company_id = a.company_id)
  Where a.lead_id !=''`,
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

app.get("/getLeadYear", (req, res, next) => {
  db.query(
    `
    SELECT
      DISTINCT YEAR(lead_date) AS year
    FROM
      leads
    ORDER BY
      year DESC
  `,
    (err, yearsResult) => {
      if (err) {
        console.error("Error getting distinct years:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const years = yearsResult.map((row) => row.year);

      if (years.length === 0) {
        return res.status(200).json({
          data: [],
          msg: "No data available",
        });
      }

      const targetYear = req.query.year || years[0]; // Use the selected year or the latest year

      db.query(
        `
      SELECT
        DATE_FORMAT(a.lead_date, '%Y-%m') AS month_year,
        COUNT(a.lead_title) AS total_lead_titles
      FROM
        leads a
      WHERE
        YEAR(a.lead_date) = ?
      GROUP BY
        month_year
    `,
        [targetYear],
        (err, result) => {
          if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          return res.status(200).json({
            data: result,
            msg: "Success",
          });
        }
      );
    }
  );
});

app.post("/getPriorityTasks", (req, res, next) => {
  db.query(
    `SELECT
      t.project_task_id,
      t.employee_id,
      e.first_name,
      t.task_title,
      t.project_id,
      e.employee_id AS employees_id,
      t.priority
    FROM
      project_task t
    LEFT JOIN employee e ON t.employee_id = e.employee_id
    WHERE
      t.employee_id=${db.escape(req.body.employee_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return res.status(400).send({
          data: err,
          msg: "Failed to fetch priority task data",
        });
      } else {
        const tasksWithPriority = {};
        result.forEach((task) => {
          const { task_title, priority } = task;
          if (!tasksWithPriority[task_title]) {
            tasksWithPriority[task_title] = [];
          }
          tasksWithPriority[task_title].push(priority);
        });
        const taskTitles = Object.keys(tasksWithPriority);
        const taskPriorities = Object.values(tasksWithPriority);

        return res.status(200).send({
          data: {
            task_titles: taskTitles,
            task_priorities: taskPriorities,
          },
          msg: "Success",
        });
      }
    }
  );
});

app.post("/getPriorityTasksById", (req, res, next) => {
  db.query(
    `SELECT
      t.project_task_id,
      t.employee_id,
      e.first_name,
      t.task_title,
      t.project_id,
      e.employee_id AS employees_id,
      t.priority
    FROM
      project_task t
    LEFT JOIN employee e ON t.employee_id = e.employee_id
    WHERE
      t.employee_id=${db.escape(
        req.body.employee_id
      )} AND t.project_id=${db.escape(req.body.project_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return res.status(400).send({
          data: err,
          msg: "Failed to fetch priority task data",
        });
      } else {
        const tasksWithPriority = {};
        result.forEach((task) => {
          const { task_title, priority } = task;
          if (!tasksWithPriority[task_title]) {
            tasksWithPriority[task_title] = [];
          }
          tasksWithPriority[task_title].push(priority);
        });
        const taskTitles = Object.keys(tasksWithPriority);
        const taskPriorities = Object.values(tasksWithPriority);

        return res.status(200).send({
          data: {
            task_titles: taskTitles,
            task_priorities: taskPriorities,
          },
          msg: "Success",
        });
      }
    }
  );
});

app.post("/getStatsEmployeeId", (req, res, next) => {
  db.query(
    `SELECT
  p.title,
e.first_name
FROM
  project_task t
LEFT JOIN employee e ON t.employee_id = e.employee_id
LEFT JOIN project p ON t.project_id = p.project_id
WHERE
  e.employee_id=${db.escape(req.body.employee_id)} AND p.project_id=${db.escape(
      req.body.project_id
    )}
  GROUP BY e.employee_id,p.project_id`,
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

app.post("/getActualHourStats", (req, res, next) => {
  db.query(
    `
 SELECT
  pt.employee_id,
  e.first_name,
  pt.project_task_id,
  pt.task_title,
  SUM(t.hours) AS total_actual_hours,
  pt.estimated_hours,
  AVG(t.hours) AS avg_actual_hours
FROM project_task pt
LEFT JOIN project_timesheet t ON t.project_task_id = pt.project_task_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE pt.employee_id=${db.escape(req.body.employee_id)} 
GROUP BY pt.employee_id, e.first_name, pt.project_task_id, pt.task_title, pt.estimated_hours
`,
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

app.post("/getProjectActualHourStats", (req, res, next) => {
  db.query(
    `
 SELECT
  pt.employee_id,
  e.first_name,
  pt.project_task_id,
  pt.task_title,
  SUM(t.hours) AS total_actual_hours,
  pt.estimated_hours,
  AVG(t.hours) AS avg_actual_hours
FROM project_task pt
LEFT JOIN project_timesheet t ON t.project_task_id = pt.project_task_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE pt.employee_id=${db.escape(
      req.body.employee_id
    )} AND pt.project_id=${db.escape(req.body.project_id)}
GROUP BY pt.employee_id, e.first_name, pt.project_task_id, pt.task_title, pt.estimated_hours
`,
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

app.post("/getMilestoneCompletedStats", (req, res, next) => {
  db.query(
    `
 SELECT
  pt.milestone_title,
  pt.to_date,
  pt.actual_completed_date
FROM project_milestone pt
LEFT JOIN project p ON p.project_id = pt.project_id
WHERE pt.project_id=${db.escape(req.body.project_id)}
`,
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

app.post("/getActualAveragestats", (req, res, next) => {
  db.query(
    `SELECT COUNT(*) AS num_issues,
  MONTH(start_date) AS month,
  pt.employee_id,
  e.first_name,
  GROUP_CONCAT(pt.task_title) AS task_titles
FROM project_task pt
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE pt.employee_id=${db.escape(req.body.employee_id)}
AND pt.task_type = 'Issues'
GROUP BY pt.employee_id, e.first_name, MONTH(start_date)
ORDER BY MONTH(start_date)

`,
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

app.post("/getProjectActualAveragestats", (req, res, next) => {
  db.query(
    `SELECT COUNT(*) AS num_issues,
  MONTH(start_date) AS month,
  pt.employee_id,
  e.first_name,
  GROUP_CONCAT(pt.task_title) AS task_titles
FROM project_task pt
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE pt.employee_id=${db.escape(
      req.body.employee_id
    )} AND pt.project_id=${db.escape(req.body.project_id)}
AND pt.task_type = 'Issues'
GROUP BY pt.employee_id, e.first_name, MONTH(start_date)
ORDER BY MONTH(start_date)

`,
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

app.post("/getHourEmployeeId", (req, res, next) => {
  db.query(
    `SELECT
  pt.employee_id,
  e.first_name,
  pt.project_task_id,
  pt.task_title
  FROM project_task pt
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE pt.employee_id=${db.escape(req.body.employee_id)}`,
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

app.post("/getStatsProjectId", (req, res, next) => {
  db.query(
    `SELECT
  p.title,
e.first_name
FROM
  project_task t
LEFT JOIN employee e ON t.employee_id = e.employee_id
LEFT JOIN project p ON t.project_id = p.project_id
WHERE
   p.project_id=${db.escape(req.body.project_id)} AND e.employee_id=${db.escape(
      req.body.employee_id
    )}
   GROUP BY p.project_id,e.employee_id`,
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