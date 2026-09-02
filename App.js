var express = require("express");
const sgMail = require("@sendgrid/mail");
const db = require("./config/Database.js");
var app = express();
var fs = require("fs");
var http = require("http");
var https = require("https");
const fileUpload = require("express-fileupload");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
var privateKey = fs.readFileSync("sslcrt/server.key", "utf8");
var certificate = fs.readFileSync("sslcrt/server.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };
const axios = require('axios');
const moment = require("moment"); // ADDED: Moment.js for date manipulation

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(3007);
httpsServer.listen(3008);

var bodyParser = require("body-parser");
var cors = require("cors");
const _ = require("lodash");
const mime = require("mime-types");

app.use(bodyParser.json({limit: "50mb"}));
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true, limit: "50mb", parameterLimit:50000
  })
);

const project = require("./routes/project.js");
const Arouter = require("./routes/attachment.js");
const Auth = require("./routes/auth.js");
const tender = require("./routes/tender.js");
const employee = require("./routes/employee.js");
const company = require("./routes/company.js");
const projecttabcostingsummary = require("./routes/projecttabcostingsummary.js");
const indexRouter = require("./routes/fileUpload");
const projecttabmaterialusedportal = require("./routes/projecttabmaterialusedportal.js");
const projecttabdeliveryorder = require("./routes/projecttabdeliveryorder.js");
const purchaseorder = require("./routes/purchaseorder.js");
const projecttabfinanaceportal = require("./routes/projecttabfinanceportal.js");
const projecttabsubconworkorder = require("./routes/projecttabsubconworkorder.js");
const projecttabmaterialstransferredportal = require("./routes/projecttabmaterialstransferredportal.js");
const content = require("./routes/content.js");
const valuelist = require("./routes/valuelist.js");
const staff = require("./routes/staff.js");
const subcategory = require("./routes/subcategory.js");
const category = require("./routes/category.js");
const booking = require("./routes/booking.js");
const loan = require("./routes/loan.js");
const leave = require("./routes/leave.js");
const expensehead = require("./routes/expensehead.js");
const clients = require("./routes/client.js");
const section = require("./routes/section.js");
const accounts = require("./routes/accounts.js");
const product = require("./routes/product.js");
const inventory = require("./routes/inventory.js");
const employeeModule = require("./routes/employeeModule.js");
const payrollmanagement = require("./routes/payrollmanagement.js");
const subcon = require("./routes/subcon.js");
const supplier = require("./routes/supplier.js");
const support = require("./routes/support.js");
const setting = require("./routes/setting.js");
const jobinformation = require("./routes/jobinformation.js");
const finance = require("./routes/finance.js");
const training = require("./routes/training.js");
const geocountry = require("./routes/geocountry.js");
const invoice = require("./routes/invoice.js");
const bank = require("./routes/bank.js");
const note = require("./routes/note.js");
const email = require("./routes/email.js");
const vehicle = require("./routes/vehicle.js");
const attendance = require("./routes/attendance.js");
const usergroup = require("./routes/usergroup.js");
const commonApi = require("./routes/commonApi.js");
const reports = require("./routes/reports.js");
const claim = require("./routes/claim.js");
const projecttabquote = require("./routes/projecttabquote.js");
const timesheet = require("./routes/timesheet.js");
const milestone = require("./routes/milestone.js");
const projecttask = require("./routes/projecttask.js");
const projecttimesheet = require("./routes/projecttimesheet.js");
const projectteam = require("./routes/projectteam.js");
const stats = require("./routes/stats.js");
const lead = require("./routes/lead.js");
const calendar = require("./routes/calendar.js");
const weeklytarget = require("./routes/weeklytarget.js");

app.use("/weeklytarget", weeklytarget);
app.use("/invoice", invoice);
app.use("/vehicle", vehicle);
app.use("/note", note);
app.use("/bank", bank);
app.use("/jobinformation", jobinformation);
app.use("/finance", finance);
app.use("/training", training);
app.use("/geocountry", geocountry);
app.use("/support", support);
app.use("/setting", setting);
app.use("/supplier", supplier);
app.use("/subcon", subcon);
app.use("/accounts", accounts);
app.use("/inventory", inventory);
app.use("/payrollmanagement", payrollmanagement);
app.use("/employeeModule", employeeModule);
app.use("/product", product);
app.use("/project", project);
app.use("/attachment", Arouter);
app.use("/api", Auth);
app.use("/tender", tender);
app.use("/employee", employee);
app.use("/company", company);
app.use("/projecttabcostingsummary", projecttabcostingsummary);
app.use("/projecttabmaterialusedportal", projecttabmaterialusedportal);
app.use("/projecttabdeliveryorder", projecttabdeliveryorder);
app.use("/purchaseorder", purchaseorder);
app.use("/projecttabfinanceportal", projecttabfinanaceportal);
app.use("/projecttabsubconworkorder", projecttabsubconworkorder);
app.use(
  "/projecttabmaterialstransferredportal",
  projecttabmaterialstransferredportal
);
app.use("/content", content);
app.use("/file", indexRouter);
app.use("/valuelist", valuelist);
app.use("/staff", staff);
app.use("/subcategory", subcategory);
app.use("/category", category);
app.use("/booking", booking);
app.use("/leave", leave);
app.use("/clients", clients);
app.use("/loan", loan);
app.use("/expensehead", expensehead);
app.use("/section", section);
app.use("/email", email);
app.use("/attendance", attendance);
app.use("/usergroup", usergroup);
app.use("/commonApi", commonApi);
app.use("/reports", reports);
app.use("/claim", claim);
app.use("/projecttabquote", projecttabquote);
app.use("/timesheet", timesheet);
app.use("/milestone", milestone);
app.use("/projecttask", projecttask);
app.use("/projecttimesheet", projecttimesheet);
app.use("/projectteam", projectteam);
app.use("/stats", stats);
app.use("/lead", lead);
app.use("/calendar", calendar);

app.use(
  fileUpload({
    createParentPath: true,
  })
);

const dbRemote = project.dbRemote;

// Run every day at 1:00 AM
cron.schedule('0 1 * * *', async () => {
  try {
    const today = new Date();
    const day = today.getDate();

    console.log(`Running payment reminder cron for day ${day}`);

    // Get all active payment reminders
    db.query(
      `SELECT * FROM payment_reminder WHERE cron_run='1'`,
      (err, reminders) => {
        if (err) {
          console.error(err);
          return;
        }

        reminders.forEach((row) => {

          // First Alert (5th - 7th)
          if (day >= 5 && day < 8) {

            dbRemote.query(
              `UPDATE setting 
               SET value=? 
               WHERE key_text='paymentReminder'`,
              [1],
              (err) => {
                if (err) console.error(err);
                else console.log(
                  `First alert updated for ${row.domain_link}`
                );
              }
            );
          }

          // Second Alert (8th - 10th)
          if (day >= 8 && day <= 10) {

            dbRemote.query(
              `UPDATE setting 
               SET value=? 
               WHERE key_text='paymentReminder2'`,
              [1],
              (err) => {
                if (err) console.error(err);
                else console.log(
                  `Second alert updated for ${row.domain_link}`
                );
              }
            );
          }

          // Disconnect Site (12th)
          if (day >= 12) {

            dbRemote.query(
              `UPDATE staff 
               SET published=? 
               WHERE email='fhtradersambattur@cubosale.in'`,
              [0],
              (err) => {
                if (err) console.error(err);
                else console.log(
                  `Site disconnected for ${row.domain_link}`
                );
              }
            );
          }

        });
      }
    );
  } catch (error) {
    console.error('Cron Error:', error);
  }
});




const transporter = nodemailer.createTransport({
 host: "premium128.web-hosting.com",
    port: 465,
    secure: true,
  auth: {
   user: "notification@unitdtechnologies.com",
    pass: "notification777#",
  },
});


const date = new Date();

let currentDay = String(date.getDate()).padStart(2, "0");

let currentMonth = String(date.getMonth() + 1).padStart(2, "0");

let currentYear = date.getFullYear();

let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

const employees = [
  
  {
    name: "Gobi",
  },

{
    name: "Andhuna",
  },
   
  {
    name: "Muthumari",
  },
  {
    name: "Jasmine",
  },
   {
    name: "Nabeela",
  },
   {
    name: "Mirzath",
  },
   {
    name: "Bushra",
  },
  {
    name: "Ponmalar",
  },
  
 

 
];

cron.schedule(
  "30 20 * * 1-6",
  async () => {   // ✅ async here
    try {
      let emailContent = `
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid black;
          }
          th, td {
            border: 1px solid black;
            padding: 5px;
            text-align: left;
          }
        </style>

        <p>Dear Team,</p>
        <p>Please find today's timesheet details:</p>
      `;

      const emailPromises = employees.map((employee) => {
           const employeeName = employee.name;

        return new Promise((resolve, reject) => {
          db.query(
            `SELECT 
           pt.timesheet_title,
           t.task_title,
           pt.date,
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
            WHERE pt.date = '${currentDate}' AND e.first_name = '${employeeName}'`,
            
            (err, result) => {
               if (err) {
      console.log(`Error fetching timesheet data for ${employeeName}:`, err);
      reject(err);
      return;
    }
     console.log("Employee:", employeeName);
console.log("Rows:", result.length);
             
                const rows = result.map(row => `
                  <tr>
                    <td>${row.first_name}</td>
                    <td>${row.title}</td>
                    <td>${row.task_title}</td>
                    <td>${row.hours}</td>
                    <td>${row.description}</td>
                    <td>${row.actual_hours || 0}</td>
                  </tr>
                `).join("");

                emailContent += `
                  <p><b>Employee Name:</b> ${employee.name}</p>
                  <table>
                    <tr>
                      <th>Name</th>
                      <th>Project</th>
                      <th>Task</th>
                      <th>Hrs</th>
                      <th>Description</th>
                      <th>Total Hrs</th>
                    </tr>
                    ${rows}
                  </table><br/>
                `;
              

              resolve();
            }
          );
        });
      });

      await Promise.all(emailPromises);

      emailContent += `<p>Regards<br/>Admin</p>`;

      await transporter.sendMail({
        from: '"UTS Notifications" <notification@unitdtechnologies.com>',
          to: ["syed@unitdtechnologies.com","gobi@unitdtechnologies.com","andhuna@unitdtechnologies.com","muthumari@unitdtechnologies.com","jasmine@unitdtechnologies.com","nabeela@unitdtechnologies.com","mirzath@unitdtechnologies.com","bushra@unitdtechnologies.com", "ponmalar@unitdtechnologies.com"],
        subject: `${currentDate} UTS Tasks Overview`,
        html: emailContent,
      });

      console.log("✅ Cron email sent successfully");

    } catch (error) {
      console.error("❌ Cron email failed:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);



// cron.schedule(
//   "30 20 * * 1-6",
// //   "* * * * *",
//   () => {
//     let emailContent = `
//       <style>
//         table {
//           border-collapse: collapse;
//           width: 100%;
//           border: 1px solid black;
//         }
//         th, td {
//           border: 1px solid black;
//           padding: 5px;
//           text-align: left;
//         }
//         img {
//           display: block;
//           margin-left: auto;
//           margin-right: auto;
//         }
//       </style>

//       <p>Dear Team,</p>
//       <br/>
//       <p>Please find today's timesheet details:</p>`;

//     const emailPromises = employees.map((employee) => {
//       const employeeName = employee.name;

//       return new Promise((resolve, reject) => {
//         db.query(
//           `SELECT 
//             pt.timesheet_title,
//             t.task_title,
//             pt.date,
//             p.title,
//             pt.status,
//             e.first_name,
//             e.employee_id,
//             p.project_id,
//             pt.project_timesheet_id,
//             pt.description,
//             pt.hours,
//             pt.project_milestone_id,
//             pt.project_task_id,
//             (SELECT SUM(pt2.hours)
//              FROM project_timesheet pt2
//              WHERE t.employee_id = e.employee_id AND pt2.project_task_id = t.project_task_id
//             ) AS actual_hours
//           FROM project_timesheet pt
//           LEFT JOIN project p ON pt.project_id = p.project_id
//           LEFT JOIN project_task t ON t.project_task_id = pt.project_task_id
//           LEFT JOIN employee e ON pt.employee_id = e.employee_id
//           LEFT JOIN project_milestone m ON m.project_milestone_id = pt.project_milestone_id
//           WHERE pt.date = '${currentDate}' AND e.first_name = '${employeeName}'`,
//           (err, result) => {
//             if (err) {
//               console.log(`Error fetching timesheet data for ${employeeName}:`, err);
//               reject(err);
//             } else {
//               const tableRows = result
//                 .map((row) => {
//                   return `<tr>
//                     <td>${row.first_name}</td>
//                     <td>${row.title}</td>
//                     <td>${row.task_title}</td>
//                     <td>${row.hours}</td>
//                     <td>${row.description}</td>
//                     <td>${row.actual_hours}</td>
//                   </tr>`;
//                 })
//                 .join("");

//               if (tableRows) {
//                 emailContent += `
//                   <p>Employee Name: <b>${employeeName}</b></p>
//                   <table>
//                     <tr>
//                       <th>First Name</th>
//                       <th>Project</th>
//                       <th>Task</th>
//                       <th>Hrs.</th>
//                       <th>Description</th>
//                       <th>Total Hrs.</th>
//                     </tr>
//                     ${tableRows}
//                   </table><br/>`;
//               }
//               resolve(result);
//             }
//           }
//         );
//       });
//     });

//     Promise.all(emailPromises)
//       .then((results) => {
//         emailContent += `
//           <br/>
//           <p>Regards</p>
//           <p>Admin</p>`;

//         const API_KEY = "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";

//         sgMail.setApiKey(API_KEY);

//         const data = {
//           to: ["syed@unitdtechnologies.com","moin@unitdtechnologies.com","gobi@unitdtechnologies.com","andhuna@unitdtechnologies.com","muthumari@unitdtechnologies.com","jasmine@unitdtechnologies.com","nabeela@unitdtechnologies.com"],
//         // to: ["meera@unitdtechnologies.com"],
//           from: "notification@unitdtechnologies.com",
//           subject: ` ${currentDate} UTS Tasks Overview`,
//           templateId: "d-4e915bf997e64593806cdb07cc1eac41",
//           dynamicTemplateData: {
//             currentDate: currentDate,
//             employees: employees.map((employee, index) => ({
//               name: employee.name,
//               timesheetData: results[index],
//             })),
//           },
//         };

//         sgMail
//           .send(data)
//           .then(() => console.log("email sent ..."))
//           .catch((error) => console.log(error));
//       })
//       .catch((error) => {
//         console.error("Error sending emails:", error);
//       });
//   },
//   {
//     timezone: "Asia/Kolkata",
//   }
// );

// weekly timesheet emails

const today = date.getDay();
//const diff = date.getDate() - today + (today === 1 ? 0 : today === 0 ? -6 : 1);
const diff = date.getDate() - today + (today === 0 ? -6 : 1);

const startOfWeek = new Date(date); // Create a new date object for the start of the week
startOfWeek.setDate(diff);

const endOfWeek = new Date(date); // Create a new date object for the end of the week
endOfWeek.setDate(diff + 5);

const startDay = String(startOfWeek.getDate()).padStart(2, "0");
const startMonth = String(startOfWeek.getMonth() + 1).padStart(2, "0");
const startYear = startOfWeek.getFullYear();
const startDate = `${startYear}-${startMonth}-${startDay}`;

const endDay = String(endOfWeek.getDate()).padStart(2, "0");
const endMonth = String(endOfWeek.getMonth() + 1).padStart(2, "0");
const endYear = endOfWeek.getFullYear();
const endDate = `${endYear}-${endMonth}-${endDay}`;

cron.schedule(
    "0 20 * * 6",
    () => {
      let emailContent = `
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid black;
          }
          th, td {
            border: 1px solid black;
            padding: 5px;
            text-align: left;
          }
          img {
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
        </style>
  
        <p>Dear Team,</p>
        <br/>
        <p>Please find this week's timesheet details:</p>`;
        
        let totalHours;
  
      const emailPromises = employees.map((employee) => {
        const employeeName = employee.name;
        
        
        return new Promise((resolve, reject) => {
          db.query(
            `SELECT 
              pt.timesheet_title,
              t.task_title,
              pt.date,
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
            WHERE pt.date BETWEEN '${startDate}' AND '${endDate}' AND e.first_name = '${employeeName}'`,
            (err, result) => {
              if (err) {
                console.log(`Error fetching timesheet data for ${employeeName}:`, err);
                reject(err);
              } else {
                //const totalHours = totalHours = result.reduce((acc, row) => acc + (parseFloat(row.hours) || 0), 0);
                const employeeTotalHours = result.reduce((acc, row) => acc + (+row.hours || 0), 0);
                totalHours = (totalHours || 0) + employeeTotalHours;
                const tableRows = result
                  .map((row,index) => {
                    return `<tr>
                      <td>${index+1}</td>
                      <td>${row.title}</td>
                      <td>${row.first_name}</td>
                      <td>${row.task_title}</td>
                      <td>${row.hours}</td>
                    </tr>`;
                  })
                  .join("");
  
                if (tableRows) {
                  emailContent += `
                    <p>Employee Name: <b>${employeeName}</b>  Total Hrs(1 Week):${totalHours} </p>
                    <table>
                      <tr>
                        <th>S.No</th>
                        <th>Project</th>
                        <th>Name</th>
                        <th>Task</th>
                        <th>Hrs.</th>
                      </tr>
                      ${tableRows}
                    </table><br/>`;
                }
                resolve(result);
              }
            }
          );
        });
      });
  
      Promise.all(emailPromises)
        .then((results) => {
          emailContent += `
            <br/>
            <p>Regards</p>
            <p>Admin</p>`;
  
          const API_KEY = "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";
          sgMail.setApiKey(API_KEY);
  
          const data = {
            to: ["syed@unitdtechnologies.com","gobi@unitdtechnologies.com","andhuna@unitdtechnologies.com","muthumari@unitdtechnologies.com","jasmine@unitdtechnologies.com","nabeela@unitdtechnologies.com","mirzath@unitdtechnologies.com","bushra@unitdtechnologies.com", "ponmalar@unitdtechnologies.com"],
            from: "notification@unitdtechnologies.com",
            subject: `${startDate} - ${endDate} UTS Tasks Overview`,
            templateId: "d-e9f0c8e8cfc44f6eab2d46101cdf6ebd",
            dynamicTemplateData: {
              startDate: startDate,
              endDate:endDate,
              employees: employees.map((employee, index) => ({
                name: employee.name,
                total_hours: results[index].reduce((acc, row) => acc + (+row.hours || 0), 0),
                timesheetData: results[index],
              })),
            },
          };
  
          sgMail
            .send(data)
            .then(() => console.log("email sent ..."))
            .catch((error) => console.log(error));
        })
        .catch((error) => {
          console.error("Error sending emails:", error);
        });
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
  

const SENDGRID_API_KEY = "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";
sgMail.setApiKey(SENDGRID_API_KEY);

const lead_id = process.argv[2];
const follow_up_type = process.argv[3];

const emailContents = {
  followup1: 'Hi',
  followup2: 'Hello',
  followup3: 'Welcome'
};

async function sendFollowUpEmail(follow_up_type) {
  const emailContent = emailContents[follow_up_type];
  if (!emailContent) {
    console.log(`No email content found for follow-up type = ${follow_up_type}`);
    return;
  }

  const msg = {
    to: 'admin@unitdtechnologies.com',
      from: 'notification@unitdtechnologies.com',
      subject: `Follow-Up Email: ${follow_up_type}`,
    text: emailContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`Follow-up email (${follow_up_type}) sent to lead_id = ${lead_id}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendFollowUpEmail(follow_up_type);

cron.schedule(
  "0 09 * * *", 
  async () => {
    try {
      const response = await axios.get('http://vacrm.smartprosoft.com/admin/index.php?_topRm=project&module=project_task&_spAction=sendFollowUpSMS&showHTML=0');
      
      console.log('Successfully triggered the function by visiting the URL.');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error triggering the function by visiting the URL:', error.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);


sgMail.setApiKey("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");


cron.schedule(
  "0 9 * * 6", // Every Saturday at 9 AM
  () => {
    db.query(
      "SELECT employee_id, first_name FROM employee WHERE employee_id != ''",
      (err, employees) => {
        if (err) {
          console.error("Error fetching employees:", err);
          return;
        }

        const employeeIds = employees.map(emp => emp.employee_id);
        const aggregatedLeaveSummary = {};
        const detailedLeaveData = {};

        // ==============================
        // SUMMARY QUERY
        // ==============================
     const summaryQuery = `
SELECT
    e.employee_id,
    e.first_name,

    COALESCE(SUM(
        CASE
            WHEN l.leave_type = 'permission'
            AND YEAR(l.from_date) = YEAR(CURDATE())
            AND MONTH(l.from_date) = MONTH(CURDATE())
            THEN l.no_of_days
            ELSE 0
        END
    ), 0) AS permission_this_month,

    COALESCE(SUM(
        CASE
            WHEN l.leave_type = 'permission'
            AND YEAR(l.from_date) = YEAR(CURDATE())
            THEN l.no_of_days
            ELSE 0
        END
    ), 0) AS permission_this_year,

    COALESCE(SUM(
        CASE
            WHEN l.leave_type != 'permission'
            AND YEAR(l.from_date) = YEAR(CURDATE())
            AND MONTH(l.from_date) = MONTH(CURDATE())
            THEN l.no_of_days
            ELSE 0
        END
    ), 0) AS other_leaves_this_month,

    COALESCE(SUM(
        CASE
            WHEN l.leave_type != 'permission'
            AND YEAR(l.from_date) = YEAR(CURDATE())
            THEN l.no_of_days
            ELSE 0
        END
    ), 0) AS other_leaves_this_year

FROM employee e
LEFT JOIN empleave l
    ON e.employee_id = l.employee_id
WHERE e.employee_id != ''
GROUP BY e.employee_id, e.first_name
ORDER BY e.first_name
`;

        db.query(summaryQuery, [employeeIds], (err, summaryResult) => {
          if (err) {
            console.error("Error fetching leave summary:", err);
            return;
          }

          summaryResult.forEach(row => {
            aggregatedLeaveSummary[row.employee_id] = row;
          });

          // ==============================
          // EMAIL HTML
          // ==============================
          let htmlContent = `
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #000; padding: 6px; }
            </style>

            <p>Dear Team,</p>
            <p>Please find below the employee leave & timesheet overview:</p>

            <h3>Monthly and Yearly Leave Summary</h3>

            <table>
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Permission (Month)</th>
                  <th>Permission (Year)</th>
                  <th>Other Leaves (Month)</th>
                  <th>Other Leaves (Year)</th>
                </tr>
              </thead>
              <tbody>
          `;

          Object.values(aggregatedLeaveSummary).forEach(row => {
            htmlContent += `
              <tr>
                <td>${row.first_name}</td>
                <td>${row.permission_this_month}</td>
                <td>${row.permission_this_year}</td>
                <td>${row.other_leaves_this_month}</td>
                <td>${row.other_leaves_this_year}</td>
              </tr>
            `;
          });

          htmlContent += `
              </tbody>
            </table>

            <br/>
            <p>Regards,<br/><strong>Admin</strong></p>
          `;

          // ==============================
          // NODEMAILER TRANSPORTER
          // ==============================
          const transporter = nodemailer.createTransport({
            host: "premium128.web-hosting.com",
            port: 587,
            secure: false,
            auth: {
              user: "notification@unitdtechnologies.com",
              pass: "notification777#",
            },
          });

          // ==============================
          // SEND EMAIL
          // ==============================
          transporter.sendMail(
            {
              from: '"Notification" <notification@unitdtechnologies.com>',
              to: [
                "syed@unitdtechnologies.com",
                "gobi@unitdtechnologies.com",
                "andhuna@unitdtechnologies.com",
                "muthumari@unitdtechnologies.com",
                "jasmine@unitdtechnologies.com",
                "nabeela@unitdtechnologies.com",
                "mirzath@unitdtechnologies.com","bushra@unitdtechnologies.com", "ponmalar@unitdtechnologies.com",
              ].join(","),

              subject: `${new Date().toLocaleDateString()} | UTS Employee Leave & Timesheet Overview`,
              html: htmlContent,
            },
            (err, info) => {
              if (err) {
                console.error("Email send error:", err);
              } else {
                console.log("Email sent successfully:", info.response);
              }
            }
          );
        });
      }
    );
  },
  {
    timezone: "Asia/Kolkata",
  }
);


cron.schedule(
  "45 15 * * 1-6", // Runs at 2:33 PM Monday to Saturday
  () => {
    const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
    const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");

    let emailContent = `
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
          border: 1px solid black;
        }
        th, td {
          border: 1px solid black;
          padding: 5px;
          text-align: left;
        }
      </style>
      <p>Dear Team,</p>
      <br/>
      <p>Please find the current month's total leave summary for each employee:</p>
      <table>
        <tr>
          <th>Employee Name</th>
          <th>Total Leaves</th>
        </tr>`;

    const query = `
      SELECT e.first_name AS employee_name, 
             COUNT(l.leave_date) AS total_leaves
      FROM employee e
      LEFT JOIN leaves l ON e.employee_id = l.employee_id
        AND l.leave_date BETWEEN '${currentMonthStart}' AND '${currentMonthEnd}'
      GROUP BY e.first_name
      ORDER BY e.first_name`;

    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching leave data:", err);
        return;
      }

      console.log("Leave data fetched:", result);

      // Construct table rows
      const tableRows = result
        .map(
          (row) => `
          <tr>
            <td>${row.employee_name}</td>
            <td>${row.total_leaves || 0}</td>
          </tr>`
        )
        .join("");

      emailContent += tableRows;
      emailContent += `
        </table>
        <br/>
        <p>Regards,</p>
        <p>Admin</p>`;

      const API_KEY = "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";
      sgMail.setApiKey(API_KEY);

      const data = {
        to: ["andhuna@unitdtechnologies.com"],
        from: "notification@unitdtechnologies.com",
        subject: `Employee Monthly Leave Summary for ${moment().format("MMMM YYYY")}`,
        html: emailContent,
      };

      sgMail
        .send(data)
        .then(() => console.log("Email sent successfully"))
        .catch((error) => console.error("Error sending email:", error));
    });
  },
  {
    timezone: "Asia/Kolkata",
  }
);


app.post("/send-leave-approvals", (req, res) => {
  const query = `
    SELECT 
      e.first_name AS name,
      e.email,
      el.from_date,
      el.to_date,
      el.leave_type
    FROM empleave el
    JOIN employee e ON el.employee_id = e.employee_id
    where e.email = ${db.escape(req.body.email)}
      AND el.from_date = CURDATE()
  `;

  db.query(query, async (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Database query failed");
    }

    if (results.length === 0) {
      return res.status(200).send("No approved leaves starting today.");
    }

    try {
      const sendPromises = results.map((row) => {
        return sgMail.send({
          to: row.email,
          from: "notification@unitdtechnologies.com",
          templateId: "d-68846bc3e0854e53add5bf3bbb1eb289",
          dynamicTemplateData: {
            name: row.name,
            fromDate: row.from_date,
            toDate: row.to_date,
            leaveType: row.leave_type,
          },
        });
      });

      await Promise.all(sendPromises);
      res.send("Leave approval emails sent successfully.");
    } catch (error) {
      console.error("SendGrid error:", error);
      res.status(500).send("Failed to send emails.");
    }
  });
});
// ==============================
// MONTHLY WORKING HOURS SUMMARY (1st of every month, 8 PM, via SMTP)
// Fully dynamic — pulls employees and hours live from the database
// ==============================

const monthlyHoursTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "premium128.web-hosting.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USERNAME || "notification@unitdtechnologies.com",
    pass: process.env.SMTP_PASSWORD || "notification777#",
  },
});

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

cron.schedule(
  "0 20 1 * *", // 8:00 PM on the 1st of every month
  () => {
    const prevMonthStart = moment().subtract(1, "months").startOf("month");
    const prevMonthEnd = moment().subtract(1, "months").endOf("month");
    const monthLabel = prevMonthStart.format("MMMM YYYY");
    const startStr = prevMonthStart.format("YYYY-MM-DD");
    const endStr = prevMonthEnd.format("YYYY-MM-DD");

    // Pull every employee with an email, and their timesheet hours for last month.
    // LEFT JOIN keeps employees even if they logged zero hours that month.
    const query = `
      SELECT
        e.employee_id,
        e.first_name,
        e.email,
        pt.date,
        pt.hours
      FROM employee e
      LEFT JOIN project_timesheet pt
        ON pt.employee_id = e.employee_id
        AND pt.date BETWEEN ? AND ?
      WHERE e.email IS NOT NULL AND e.email != ''
      ORDER BY e.first_name
    `;

    db.query(query, [startStr, endStr], (err, rows) => {
      if (err) {
        console.error("Monthly hours summary query failed:", err);
        return;
      }

      // Build per-employee weekly totals dynamically from whatever employees exist
      const employees = {}; // employee_id -> { name, email, weeks: [0,0,0,0] }

      rows.forEach((row) => {
        if (!employees[row.employee_id]) {
          employees[row.employee_id] = {
            name: row.first_name || "(No name)",
            email: row.email,
            weeks: [0, 0, 0, 0],
          };
        }

        if (row.date && row.hours) {
          const dayOfMonth = moment(row.date, "YYYY-MM-DD").date();
          let bucket = 3;
          if (dayOfMonth <= 7) bucket = 0;
          else if (dayOfMonth <= 14) bucket = 1;
          else if (dayOfMonth <= 21) bucket = 2;
          employees[row.employee_id].weeks[bucket] += Number(row.hours) || 0;
        }
      });

      const employeeList = Object.values(employees);

      if (employeeList.length === 0) {
        console.log("Monthly hours summary: no employees found, skipping email.");
        return;
      }

      // Build table rows + column totals
      const weekTotals = [0, 0, 0, 0];
      let grandTotal = 0;

      const bodyRows = employeeList
        .map((emp) => {
          const rowTotal = emp.weeks.reduce((a, b) => a + b, 0);
          emp.weeks.forEach((h, i) => (weekTotals[i] += h));
          grandTotal += rowTotal;

          return `
            <tr>
              <td style="border:1px solid #ccc; padding:8px;">${emp.name}</td>
              <td style="border:1px solid #ccc; padding:8px;">${round1(emp.weeks[0])}</td>
              <td style="border:1px solid #ccc; padding:8px;">${round1(emp.weeks[1])}</td>
              <td style="border:1px solid #ccc; padding:8px;">${round1(emp.weeks[2])}</td>
              <td style="border:1px solid #ccc; padding:8px;">${round1(emp.weeks[3])}</td>
              <td style="border:1px solid #ccc; padding:8px;"><b>${round1(rowTotal)}</b></td>
            </tr>`;
        })
        .join("");

      const emailContent = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="margin-top:0;">${monthLabel} - UTS Monthly Working Hours Summary</h2>
          <hr/>
          <p>Dear Team,</p>
          <p>Please find below the working hours summary for each staff for ${monthLabel} (Week 1 to Week 4).</p>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th style="border:1px solid #ccc; padding:8px; text-align:left;">Staff name</th>
                <th style="border:1px solid #ccc; padding:8px; text-align:left;">Week 1</th>
                <th style="border:1px solid #ccc; padding:8px; text-align:left;">Week 2</th>
                <th style="border:1px solid #ccc; padding:8px; text-align:left;">Week 3</th>
                <th style="border:1px solid #ccc; padding:8px; text-align:left;">Week 4</th>
                <th style="border:1px solid #ccc; padding:8px; text-align:left; color:#2563eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${bodyRows}
              <tr>
                <td style="border:1px solid #ccc; padding:8px;"><b>Total</b></td>
                <td style="border:1px solid #ccc; padding:8px;"><b>${round1(weekTotals[0])}</b></td>
                <td style="border:1px solid #ccc; padding:8px;"><b>${round1(weekTotals[1])}</b></td>
                <td style="border:1px solid #ccc; padding:8px;"><b>${round1(weekTotals[2])}</b></td>
                <td style="border:1px solid #ccc; padding:8px;"><b>${round1(weekTotals[3])}</b></td>
                <td style="border:1px solid #ccc; padding:8px; color:#2563eb;"><b>${round1(grandTotal)}</b></td>
              </tr>
            </tbody>
          </table>
          <p style="color:#888; font-size:13px;">Note: the hours are calculated based on logged working time. Please reach out to your manager for any discrepancies.</p>
          <p>Regards,<br/>Admin team</p>
        </div>
      `;

      monthlyHoursTransporter.sendMail(
        {
          from: process.env.SMTP_FROM || "notification@unitdtechnologies.com",
          replyTo: process.env.SMTP_REPLY_TO || "notification@unitdtechnologies.com",
          to: employeeList.map((e) => e.email).join(","),
          subject: `${monthLabel} - UTS Monthly Working Hours Summary`,
          html: emailContent,
        },
        (err, info) => {
          if (err) {
            console.error("Monthly hours summary email failed:", err);
          } else {
            console.log("Monthly hours summary email sent:", info.response);
          }
        }
      );
    });
  },
  {
    timezone: "Asia/Kolkata",
  }
);
// ==============================
// TEMPORARY TEST ROUTE — remove after confirming the monthly summary works
// Visit this URL in your browser to trigger the same logic manually,
// using LAST month's real data, without waiting for the schedule.
// ==============================
app.get("/test-monthly-hours-summary", (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null;
  const month = req.query.month ? parseInt(req.query.month) - 1 : null; // JS months are 0-indexed

  const targetMonth = (year && month !== null)
    ? moment().year(year).month(month)
    : moment().subtract(1, "months");

  const prevMonthStart = targetMonth.clone().startOf("month");
  const prevMonthEnd = targetMonth.clone().endOf("month");
  const monthLabel = prevMonthStart.format("MMMM YYYY");
  const startStr = prevMonthStart.format("YYYY-MM-DD");
  const endStr = prevMonthEnd.format("YYYY-MM-DD");

  const query = `
    SELECT
      e.employee_id,
      e.first_name,
      e.email,
      pt.date,
      pt.hours
    FROM employee e
    LEFT JOIN project_timesheet pt
      ON pt.employee_id = e.employee_id
      AND pt.date BETWEEN ? AND ?
    WHERE e.email IS NOT NULL AND e.email != ''
    ORDER BY e.first_name
  `;

  db.query(query, [startStr, endStr], (err, rows) => {
    if (err) {
      console.error("Test query failed:", err);
      return res.status(500).send("Query failed: " + err.message);
    }

    const employees = {};
    rows.forEach((row) => {
      if (!employees[row.employee_id]) {
        employees[row.employee_id] = {
          name: row.first_name || "(No name)",
          email: row.email,
          weeks: [0, 0, 0, 0],
        };
      }
      if (row.date && row.hours) {
        const dayOfMonth = moment(row.date, "YYYY-MM-DD").date();
        let bucket = 3;
        if (dayOfMonth <= 7) bucket = 0;
        else if (dayOfMonth <= 14) bucket = 1;
        else if (dayOfMonth <= 21) bucket = 2;
        employees[row.employee_id].weeks[bucket] += Number(row.hours) || 0;
      }
    });

    const employeeList = Object.values(employees);
    const weekTotals = [0, 0, 0, 0];
    let grandTotal = 0;

    const bodyRows = employeeList
      .map((emp) => {
        const rowTotal = emp.weeks.reduce((a, b) => a + b, 0);
        emp.weeks.forEach((h, i) => (weekTotals[i] += h));
        grandTotal += rowTotal;
        return `<tr><td>${emp.name}</td><td>${emp.weeks[0].toFixed(2)}</td><td>${emp.weeks[1].toFixed(2)}</td><td>${emp.weeks[2].toFixed(2)}</td><td>${emp.weeks[3].toFixed(2)}</td><td><b>${rowTotal.toFixed(2)}</b></td></tr>`;
      })
      .join("");

    const html = `
      <h2>${monthLabel} - TEST PREVIEW (not sent as email)</h2>
      <p>Date range checked: ${startStr} to ${endStr}</p>
      <table border="1" cellpadding="6" style="border-collapse: collapse;">
        <tr><th>Staff name</th><th>Week 1</th><th>Week 2</th><th>Week 3</th><th>Week 4</th><th>Total</th></tr>
        ${bodyRows}
        <tr><td><b>Total</b></td><td><b>${weekTotals[0].toFixed(2)}</b></td><td><b>${weekTotals[1].toFixed(2)}</b></td><td><b>${weekTotals[2].toFixed(2)}</b></td><td><b>${weekTotals[3].toFixed(2)}</b></td><td><b>${grandTotal.toFixed(2)}</b></td></tr>
      </table>
      <p>Recipients (${employeeList.length}): ${employeeList.map(e => e.email).join(", ")}</p>
    `;

    res.send(html);
  });
});
module.exports = app;


