var express = require("express");
const sgMail = require("@sendgrid/mail");
const db = require("./config/Database.js");
var app = express();
var fs = require("fs");
var http = require("http");
var https = require("https");
const fileUpload = require("express-fileupload");
const cron = require("node-cron");
var privateKey = fs.readFileSync("sslcrt/server.key", "utf8");
var certificate = fs.readFileSync("sslcrt/server.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };

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
const vehicle = require("./routes/vehicle.js");
const attendance = require("./routes/attendance.js");
const usergroup = require("./routes/usergroup.js");
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
app.use("/attendance", attendance);
app.use("/usergroup", usergroup);
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

const date = new Date();

let currentDay = String(date.getDate()).padStart(2, "0");

let currentMonth = String(date.getMonth() + 1).padStart(2, "0");

let currentYear = date.getFullYear();

let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;

const employees = [
  {
    name: "Moin",
  },
  {
    name: "Gobi",
  },
    {
    name: "Renuka",
  },
    {
    name: "Rafi",
  },
    {
    name: "Meera",
  },
    {
    name: "Sulfiya",
  },
    {
    name: "Muthumari",
  },
    {
    name: "Gokila",
  },
    {
    name: "Jasmine",
  },
    {
    name: "Sabina",
  },
  {
    name: "Sujitha"
  }
];

cron.schedule(
  "14 17 * * 1-6",
  () => {
    const todayDate = new Date().toISOString().slice(0, 10); // Rename currentDate to todayDate
    const currentDay = new Date().getDay();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - currentDay);
    const weekStartDate = weekStart.toISOString().slice(0, 10);

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
      <p>Please find today's timesheet details:</p>`;
      
    const emailPromises = employees.map((employee) => {
      const employeeName = employee.name;

      const todayQuery = new Promise((resolve, reject) => {
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
          WHERE pt.date = '${todayDate}' AND e.first_name = '${employeeName}'`,
          (err, result) => {
            if (err) {
              console.log(`Error fetching today's timesheet data for ${employeeName}:`, err);
              reject(err);
            } else {
              console.log(`Result for ${employeeName}:`, result);
             const totalHoursToday = result.reduce((total, row) => total + row.hours, 0);
              const tableRows = result
                .map((row) => {
                  return `<tr>
                    <td>${row.first_name}</td>
                    <td>${row.title}</td>
                    <td>${row.task_title}</td>
                    <td>${row.hours}</td>
                    <td>${row.description}</td>
                    <td>${row.actual_hours}</td>
                  </tr>`;
                })
                .join("");

              if (tableRows) {
                emailContent += `
                  <p>Employee Name: <b>${employeeName}</b></p>
                  <p>Total Hours Today: ${totalHoursToday} hrs</p>
                  <table>
                    <tr>
                      <th>First Name</th>
                      <th>Project</th>
                      <th>Task</th>
                      <th>Hrs.</th>
                      <th>Description</th>
                      <th>Total Hrs.</th>
                    </tr>
                    ${tableRows}
                  </table><br/>`;
              }

              resolve({ totalHoursToday, tableRows }); // Resolve an object containing both total hours and table rows
            }
          }
        );
      });

      // Query for current week's total hours
      const currentWeekQuery = new Promise((resolve, reject) => {
        db.query(
          `SELECT 
            SUM(p.hours) AS total_week_hours
           FROM project_timesheet p
           LEFT JOIN employee e ON p.employee_id = e.employee_id
           WHERE date BETWEEN '${weekStartDate}' AND '${todayDate}' AND e.first_name = '${employeeName}'`,
          (err, result) => {
            if (err) {
              console.log(`Error fetching current week's total hours for ${employeeName}:`, err);
              reject(err);
            } else {
              const totalHoursWeek = result[0].total_week_hours || 0;
              resolve(totalHoursWeek);
            }
          }
        );
      });

      return Promise.all([todayQuery, currentWeekQuery]);
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
          to: ["sulfiya@unitdtechnologies.com"],
          from: "notification@unitdtechnologies.com",
          subject: ` ${todayDate} UTS Tasks Overview`,
          templateId: "d-3250d5edacd24616962f998dedb313d6",
          dynamicTemplateData: {
            currentDate: todayDate,
            employees: employees.map((employee, index) => ({
              name: employee.name,
              weekStartDate: weekStartDate,
              timesheetData: results[index][0],
              total_hours: results[index][0].totalHoursToday,
              total_hours_week: results[index][1], // Using current week's total hours
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
            to: ["sulfiya@unitdtechnologies.com"],
            from: "notification@unitdtechnologies.com",
            subject: `${startDate} - ${endDate} UTS Tasks Overview`,
            templateId: "d-42189235e44545b4bd9fdba9a5b9b31e",
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

module.exports = app;
