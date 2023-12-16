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

app.post('/getStatsId', (req, res, next) => {
  db.query(`SELECT
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
  t.employee_id= ${db.escape(req.body.employee_id)} AND t.project_id= ${db.escape(req.body.project_id)}
GROUP BY
  t.employee_id, e.first_name, p.project_id, p.title`,
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

app.post('/getDuechartStats', (req, res, next) => {
  db.query(`SELECT
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

app.post('/getProjectDuechartStats', (req, res, next) => {
  db.query(`SELECT
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
  t.employee_id = ${db.escape(req.body.employee_id)} AND t.project_id = ${db.escape(req.body.project_id)}
  GROUP BY
  t.employee_id, e.first_name`,
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

app.post('/getPriorityTasks', (req, res, next) => {
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
        console.log('error: ', err);
        return res.status(400).send({
          data: err,
          msg: 'Failed to fetch priority task data',
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
          msg: 'Success',
        });
      }
    }
  );
});



app.post('/getPriorityTasksById', (req, res, next) => {
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
      t.employee_id=${db.escape(req.body.employee_id)} AND t.project_id=${db.escape(req.body.project_id)}`,
    (err, result) => {
      if (err) {
        console.log('error: ', err);
        return res.status(400).send({
          data: err,
          msg: 'Failed to fetch priority task data',
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
          msg: 'Success',
        });
      }
    }
  );
});


app.post('/getStatsEmployeeId', (req, res, next) => {
  db.query(`SELECT
  p.title,
e.first_name
FROM
  project_task t
LEFT JOIN employee e ON t.employee_id = e.employee_id
LEFT JOIN project p ON t.project_id = p.project_id
WHERE
  e.employee_id=${db.escape(req.body.employee_id)} AND p.project_id=${db.escape(req.body.project_id)}
  GROUP BY e.employee_id,p.project_id`,
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

app.post('/getActualHourStats', (req, res, next) => {
  db.query(`
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


app.post('/getProjectActualHourStats', (req, res, next) => {
  db.query(`
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
WHERE pt.employee_id=${db.escape(req.body.employee_id)} AND pt.project_id=${db.escape(req.body.project_id)}
GROUP BY pt.employee_id, e.first_name, pt.project_task_id, pt.task_title, pt.estimated_hours
`,
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


app.post('/getMilestoneCompletedStats', (req, res, next) => {
  db.query(`
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

app.post('/getActualAveragestats', (req, res, next) => {
  db.query(`SELECT COUNT(*) AS num_issues,
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



app.post('/getProjectActualAveragestats', (req, res, next) => {
  db.query(`SELECT COUNT(*) AS num_issues,
  MONTH(start_date) AS month,
  pt.employee_id,
  e.first_name,
  GROUP_CONCAT(pt.task_title) AS task_titles
FROM project_task pt
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE pt.employee_id=${db.escape(req.body.employee_id)} AND pt.project_id=${db.escape(req.body.project_id)}
AND pt.task_type = 'Issues'
GROUP BY pt.employee_id, e.first_name, MONTH(start_date)
ORDER BY MONTH(start_date)

`,
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

app.post('/getHourEmployeeId', (req, res, next) => {
  db.query(`SELECT
  pt.employee_id,
  e.first_name,
  pt.project_task_id,
  pt.task_title
  FROM project_task pt
LEFT JOIN employee e ON pt.employee_id = e.employee_id
WHERE pt.employee_id=${db.escape(req.body.employee_id)}`,
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

app.post('/getStatsProjectId', (req, res, next) => {
  db.query(`SELECT
  p.title,
e.first_name
FROM
  project_task t
LEFT JOIN employee e ON t.employee_id = e.employee_id
LEFT JOIN project p ON t.project_id = p.project_id
WHERE
   p.project_id=${db.escape(req.body.project_id)} AND e.employee_id=${db.escape(req.body.employee_id)}
   GROUP BY p.project_id,e.employee_id`,
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


app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;