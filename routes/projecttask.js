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




app.get('/getProjectTask', (req, res, next) => {
  db.query(`SELECT
  pt.actual_completed_date,
  pt.start_date,
  pt.end_date,
  pt.completion,
  pt.task_title,
  (
    SELECT SUM(t.hours)
    FROM project_timesheet t
    WHERE t.project_task_id = pt.project_task_id AND t.employee_id = e.employee_id
  ) AS actual_hours,
  p.title,
  pt.status,
  pt.task_type,
  pt.project_id,
  e.first_name,
  e.employee_id,
  pt.project_task_id,
  pt.project_milestone_id,
  pt.description,
  pt.priority,
  pt.estimated_hours
FROM project_task pt
LEFT JOIN project p ON pt.project_id = p.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
LEFT JOIN project_milestone m ON m.project_milestone_id = pt.project_milestone_id
  AND pt.project_task_id !='' AND pt.status!=''
  
  GROUP BY pt.task_title,pt.project_task_id`,
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

app.get('/getEmployee', (req, res, next) => {
                db.query(`SELECT 
                e.employee_id
               ,e.first_name
                from employee e
              
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
              })
            }
                }
              );
            });

app.get('/getProjectTask1', (req, res, next) => {
  db.query(`SELECT
  pt.actual_completed_date,
  pt.start_date,
  pt.end_date,
  pt.completion,
  pt.task_title,
  (
    SELECT SUM(t.hours)
    FROM project_timesheet t
    WHERE t.project_task_id = pt.project_task_id AND t.employee_id = e.employee_id
  ) AS actual_hours,
  p.title,
  pt.status,
  pt.task_type,
  pt.project_id,
  e.first_name,
  e.employee_id,
  pt.project_task_id,
  pt.project_milestone_id,
  pt.description,
  pt.priority,
  pt.estimated_hours,
  jo.job_order_id,
  jo.job_order_code,
  jo.job_order_title
FROM project_task pt
LEFT JOIN project p ON pt.project_id = p.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
LEFT JOIN project_milestone m ON m.project_milestone_id = pt.project_milestone_id
LEFT JOIN job_order jo ON jo.job_order_id = pt.job_order_id
  Where pt.project_task_id !=''
  GROUP BY pt.task_title,pt.project_task_id`,
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

app.get('/getEmployeeStats', (req, res, next) => {
                db.query(`SELECT 
                e.employee_id
               ,e.first_name
               ,e.nric_no
               ,e.fin_no
               ,j.designation
               ,j.department
               ,t.task_title
               ,(SELECT COUNT(*) FROM job_information ji WHERE ji.employee_id=e.employee_id AND ji.status='current') AS e_count
                FROM employee e 
                LEFT JOIN job_information j ON (j.employee_id = e.employee_id) 
                LEFT JOIN project_task t ON (t.employee_id = e.employee_id) 
                WHERE  e.employee_id=${db.escape(req.body.employee_id)}
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
              })
            }
                }
              );
            });

app.post('/getProjectTaskId', (req, res, next) => {
  db.query(`SELECT
  pt.actual_completed_date,
  pt.start_date,
  pt.end_date,
  pt.completion,
  pt.task_title,
  (
    SELECT SUM(t.hours)
    FROM project_timesheet t
    WHERE t.project_task_id = pt.project_task_id AND t.employee_id = e.employee_id
  ) AS actual_hours,
  p.title,
  pt.status,
  pt.task_type,
  pt.project_id,
  e.first_name,
  e.employee_id,
  pt.project_task_id,
  pt.project_milestone_id,
  pt.description,
  pt.priority,
  pt.estimated_hours
FROM project_task pt
LEFT JOIN project p ON pt.project_id = p.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
LEFT JOIN project_milestone m ON pt.project_milestone_id = m.project_milestone_id
WHERE pt.project_task_id=${db.escape(req.body.project_task_id)}
GROUP BY pt.task_title,pt.project_task_id`,
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

app.post("/editActualcompletedDate", (req, res, next) => {
  db.query(
    `UPDATE project_task SET
          actual_completed_date=${db.escape(
            new Date().toISOString().slice(0, 19).replace("T", " ")
          )}
    WHERE project_task_id = ${db.escape(req.body.project_task_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: "date has been removed successfully",
        });
      }
    }
  );
});


app.post("/UpdateActualcompletedDate", (req, res, next) => {
  db.query(
    `UPDATE project_milestone SET
          actual_completed_date=${db.escape(
            new Date().toISOString().slice(0, 19).replace("T", " ")
          )}
    WHERE project_milestone_id = ${db.escape(req.body.project_milestone_id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: "date has been removed successfully",
        });
      }
    }
  );
});

app.post("/getmilestoneByID", (req, res, next) => {
  db.query(
    `SELECT project_id,
milestone_title,
project_milestone_id
FROM project_milestone
WHERE project_id=${db.escape(req.body.project_id)};`,
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

app.post("/getEmployeeByID", (req, res, next) => {
  db.query(
    `SELECT 
                e.employee_id
               ,e.first_name
               ,p.title
                           FROM employee e 
                LEFT JOIN project_task t ON (t.employee_id = e.employee_id) 
                LEFT JOIN project p ON (p.project_id = t.project_id) 
                WHERE  p.project_id=${db.escape(req.body.project_id)}
GROUP BY p.project_id,e.employee_id;`,
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

app.get("/getProjectTitle", (req, res, next) => {
  db.query(
    `SELECT
  title,project_id
   From project 
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
app.post("/getProjectTitleById", (req, res, next) => {
  db.query(
    `SELECT
  title,project_id
   From project 
   WHERE project_id=${db.escape(req.body.project_id)}
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

app.post("/getProjectTitleId", (req, res, next) => {
  db.query(
    `SELECT
  p.title,
  p.project_id,
  e.employee_id
   From project p
LEFT JOIN project_task t ON t.project_id=p.project_id
LEFT JOIN employee e ON t.employee_id=e.employee_id
WHERE t.employee_id=${db.escape(req.body.employee_id)} 
GROUP BY p.project_id, e.employee_id`,
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


app.get("/getMilestoneTitle", (req, res, next) => {
  db.query(
    `SELECT
  milestone_title,project_milestone_id
   From project_milestone
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



app.post('/getTaskTimeSheetById', (req, res, next) => {
  db.query(`Select 
  pt.timesheet_title,
  t.task_title,
  pt.date,
  p.title,
  pt.status,
  e.first_name,
  p.project_id,
  pt.project_timesheet_id,
  pt.description,
  pt.hours,
  pt.project_milestone_id,
  pt.project_task_id
  From project_timesheet pt
  LEFT JOIN (project p) ON (pt.project_id = p.project_id)
  LEFT JOIN (employee e) ON (pt.employee_id = e.employee_id)
    LEFT JOIN (project_task t) ON (t.project_task_id = pt.project_task_id)
    LEFT JOIN project_milestone m ON m.project_milestone_id = pt.project_milestone_id
  Where pt.project_task_id=${db.escape(req.body.project_task_id)}`,
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


app.post('/getProjectTaskById', (req, res, next) => {
  db.query(`SELECT
  pt.actual_completed_date,
  pt.start_date,
  pt.end_date,
  pt.completion,
  pt.task_title,
  (
    SELECT SUM(t.hours)
    FROM project_timesheet t
    WHERE t.project_task_id = pt.project_task_id AND t.employee_id = e.employee_id
  ) AS actual_hours,
  p.title,
  pt.status,
  pt.task_type,
  pt.project_id,
  e.first_name,
  e.employee_id,
  pt.project_task_id,
  pt.project_milestone_id,
  pt.description,
  pt.priority,
  pt.estimated_hours,
  pt.creation_date,
  pt.modification_date,
  pt.created_by,
  pt.modified_by
FROM project_task pt
LEFT JOIN project p ON pt.project_id = p.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
LEFT JOIN project_milestone m ON pt.project_milestone_id = m.project_milestone_id
WHERE 
  pt.project_id = ${db.escape(req.body.project_id)}
 AND 
    pt.status = ${db.escape(req.body.status)} AND pt.status <> "Completed" 
GROUP BY pt.task_title, pt.project_task_id
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
})
}
  }
);
});


app.post('/getProjectTaskfilterById', (req, res, next) => {
  db.query(`SELECT
  pt.actual_completed_date,
  pt.start_date,
  pt.end_date,
  pt.completion,
  pt.task_title,
  (
    SELECT SUM(t.hours)
    FROM project_timesheet t
    WHERE t.project_task_id = pt.project_task_id AND t.employee_id = e.employee_id
  ) AS actual_hours,
  p.title,
  pt.status,
  pt.task_type,
  pt.project_id,
  e.first_name,
  e.employee_id,
  pt.project_task_id,
  pt.project_milestone_id,
  pt.description,
  pt.priority,
  pt.estimated_hours,
  pt.creation_date,
  pt.modification_date,
  pt.created_by,
  pt.modified_by
FROM project_task pt
LEFT JOIN project p ON pt.project_id = p.project_id
LEFT JOIN employee e ON pt.employee_id = e.employee_id
LEFT JOIN project_milestone m ON pt.project_milestone_id = m.project_milestone_id
WHERE pt.project_id = ${db.escape(req.body.project_id)} 
GROUP BY pt.task_title, pt.project_task_id;`,
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
app.post('/getProjectTaskfiltersById', (req, res, next) => {
  const { project_id, status } = req.body; // Get project_id and status from request body

  const query = `
    SELECT
      pt.actual_completed_date,
      pt.start_date,
      pt.end_date,
      pt.completion,
      pt.task_title,
      (
        SELECT SUM(t.hours)
        FROM project_timesheet t
        WHERE t.project_task_id = pt.project_task_id AND t.employee_id = e.employee_id
      ) AS actual_hours,
      p.title,
      pt.status,
      pt.task_type,
      pt.project_id,
      e.first_name,
      e.employee_id,
      pt.project_task_id,
      pt.project_milestone_id,
      pt.description,
      pt.priority,
      pt.estimated_hours,
      pt.creation_date,
      pt.modification_date,
      pt.created_by,
      pt.modified_by
    FROM project_task pt
    LEFT JOIN project p ON pt.project_id = p.project_id
    LEFT JOIN employee e ON pt.employee_id = e.employee_id
    LEFT JOIN project_milestone m ON pt.project_milestone_id = m.project_milestone_id
    WHERE pt.project_id = ${db.escape(project_id)} 
    GROUP BY pt.task_title, pt.project_task_id;
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.log('error: ', err);
      return res.status(400).send({
        data: err,
        msg: 'failed',
      });
    } else {
      // Filter the result based on the "status" value
      const filteredResult = result.filter((task) => {
        if (status === 'InProgress') {
          return task.status === 'InProgress';
        } else if (status === 'Completed') {
          return task.status === 'Completed';
        } else {
          // If no status filter is applied, return all tasks
          return true;
        }
      });

      return res.status(200).send({
        data: filteredResult,
        msg: 'Success',
      });
    }
  });
});


app.post('/editTask', (req, res, next) => {
  db.query(`UPDATE project_task 
            SET task_title=${db.escape(req.body.task_title)}
            ,start_date=${db.escape(req.body.start_date)}
            ,end_date=${db.escape(req.body.end_date)}
            ,completion=${db.escape(req.body.completion)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,status=${db.escape(req.body.status)}
            ,description=${db.escape(req.body.description)}
            ,project_id=${db.escape(req.body.project_id)}
           ,estimated_hours=${db.escape(req.body.estimated_hours)}
           ,actual_completed_date=${db.escape(req.body.actual_completed_date)}
            ,task_type=${db.escape(req.body.task_type)}
            ,project_milestone_id=${db.escape(req.body.project_milestone_id)}
            ,priority=${db.escape(req.body.priority)}
            ,creation_date=${db.escape(req.body.creation_date)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,created_by=${db.escape(req.body.created_by)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE project_task_id = ${db.escape(req.body.project_task_id)}`,
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
         app.post('/editTasks', (req, res, next) => {
  db.query(`UPDATE project_task 
            SET task_title=${db.escape(req.body.task_title)}
            ,start_date=${db.escape(req.body.start_date)}
            ,end_date=${db.escape(req.body.end_date)}
            ,completion=${db.escape(req.body.completion)}
            ,employee_id=${db.escape(req.body.employee_id)}
            ,hours=${db.escape(req.body.hours)}
            ,description=${db.escape(req.body.description)}
            ,estimated_hours=${db.escape(req.body.estimated_hours)}
            ,task_type=${db.escape(req.body.task_type)}
             ,project_id=${db.escape(req.body.project_id)}
            ,project_milestone_id=${db.escape(req.body.project_milestone_id)}
            ,actual_completed_date=${db.escape(req.body.actual_completed_date)}
            ,priority=${db.escape(req.body.priority)}
            WHERE project_task_id = ${db.escape(req.body.project_task_id)}`,
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
  
app.post('/insertTask', (req, res, next) => {

  let data = {start_date	: req.body.start_date
      , end_date: req.body.end_date
    , task_title: req.body.task_title
    , project_id	: req.body.project_id
    , employee_id: req.body.employee_id
    , completion: req.body.completion
    , estimated_hours: req.body.estimated_hours
    ,status: req.body.status
    ,description:req.body.description
    ,actual_completed_date:req.body.actual_completed_date
    ,task_type:req.body.task_type
    ,project_milestone_id:req.body.project_milestone_id
    ,priority:req.body.priority
    ,creation_date:req.body.creation_date
    ,modification_date:req.body.modification_date
    ,created_by:req.body.created_by
    ,modified_by:req.body.modified_by

 };
  let sql = "INSERT INTO project_task SET ?";
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


app.post('/deleteTask', (req, res, next) => {

  let data = {project_task_id: req.body.project_task_id};
  let sql = "DELETE FROM project_task WHERE ?";
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

app.get('/getAllCurrentTask', (req, res, next) => {

const date = new Date();

let currentDay= String(date.getDate()).padStart(2, '0');

let currentMonth = String(date.getMonth()+1).padStart(2,"0");

let currentYear = date.getFullYear();

let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

// Get yesterday's date
const yesterday = new Date(date);
yesterday.setDate(yesterday.getDate() - 1);
let yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
let yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
let yesterdayYear = yesterday.getFullYear();
let yesterdayDate = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

  db.query(
     `SELECT 
    pt.timesheet_title,
    t.task_title,
    pt.date,
    pt.creation_date,
    pt.created_by,
    pt.modification_date,
    pt.modified_by,
    p.title,
    pt.status,
    e.first_name,
    e.employee_id,
    p.project_id,
    pt.project_timesheet_id,
    pt.description,
    pt.hours,
    pt.project_milestone_id,
    pt.project_task_id,
    (SELECT SUM(pt2.hours)
     FROM project_timesheet pt2
     WHERE t.employee_id = e.employee_id AND pt2.project_task_id = t.project_task_id
    ) AS actual_hours
  FROM project_timesheet pt
  LEFT JOIN project p ON pt.project_id = p.project_id
  LEFT JOIN project_task t ON t.project_task_id = pt.project_task_id
  LEFT JOIN employee e ON pt.employee_id = e.employee_id
  LEFT JOIN project_milestone m ON m.project_milestone_id = pt.project_milestone_id
  WHERE pt.date BETWEEN '${yesterdayDate}' AND '${currentDate}'`,
   
    (err, result) => {
      if (err) {
        console.log('error: ', err);
        return res.status(400).send({
          data: err,
          msg: 'failed',
        });
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