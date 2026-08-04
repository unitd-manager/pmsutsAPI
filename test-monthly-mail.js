// test-monthly-mail.js
// Put this file in the SAME folder as App.js (so ./config/Database.js resolves),
// then run it manually to check the monthly mail output — no need to wait for
// the 1st of the month / 8 PM cron trigger.
//
// Usage:
//   node test-monthly-mail.js preview
//       -> builds the HTML and saves it to monthly-mail-preview.html
//          (open that file in your browser, no email is sent, no SendGrid cost)
//
//   node test-monthly-mail.js send you@yourcompany.com
//       -> builds the HTML and actually sends ONE real test email to the
//          address you give it (does not touch the real admin/cc list)
//
//   node test-monthly-mail.js send you@yourcompany.com 2026-06
//       -> same as above, but for a specific month (YYYY-MM) instead of
//          "last month" (relative to today). Handy since it's early August 2026,
//          so relative "last month" will be July 2026 — pass 2026-06 etc.
//          to test other months that actually have data.

const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const db = require("./config/Database.js");

const mode = process.argv[2]; // "preview" or "send"
const sendTo = process.argv[3]; // email, only used when mode === "send"
const monthArg = mode === "send" ? process.argv[4] : process.argv[3]; // optional YYYY-MM

if (!mode || (mode !== "preview" && mode !== "send")) {
  console.log("Usage:");
  console.log("  node test-monthly-mail.js preview [YYYY-MM]");
  console.log("  node test-monthly-mail.js send you@yourcompany.com [YYYY-MM]");
  process.exit(1);
}

if (mode === "send" && !sendTo) {
  console.log("Please provide a test recipient email:");
  console.log("  node test-monthly-mail.js send you@yourcompany.com");
  process.exit(1);
}

// ---- Work out the month to report on ----
let startOfMonth, endOfMonth;
if (monthArg && /^\d{4}-\d{2}$/.test(monthArg)) {
  const [y, m] = monthArg.split("-").map(Number);
  startOfMonth = new Date(y, m - 1, 1);
  endOfMonth = new Date(y, m, 0);
} else {
  const reportDate = new Date();
  startOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth() - 1, 1);
  endOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth(), 0);
}

const startDate = startOfMonth.toISOString().slice(0, 10);
const endDate = endOfMonth.toISOString().slice(0, 10);
const daysInMonth = endOfMonth.getDate();
const monthLabel = startOfMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

console.log(`Building monthly report for ${monthLabel} (${startDate} to ${endDate})...`);

const weekBoundaries = [
  { week: 1, from: 1, to: 7 },
  { week: 2, from: 8, to: 14 },
  { week: 3, from: 15, to: 21 },
  { week: 4, from: 22, to: daysInMonth },
];

const getWeekIndex = (dayOfMonth) => {
  const w = weekBoundaries.find((b) => dayOfMonth >= b.from && dayOfMonth <= b.to);
  return w ? w.week : 4;
};

db.query(
  `SELECT
    e.employee_id,
    e.first_name,
    e.email,
    pt.date,
    pt.hours
  FROM employee e
  LEFT JOIN project_timesheet pt
    ON pt.employee_id = e.employee_id
    AND pt.date BETWEEN '${startDate}' AND '${endDate}'
  ORDER BY e.first_name, pt.date`,
  (err, rows) => {
    if (err) {
      console.error("Query failed:", err);
      process.exit(1);
    }

    console.log(`Got ${rows.length} timesheet rows for ${monthLabel}.`);

    const employeeMap = new Map();
    rows.forEach((row) => {
      if (!employeeMap.has(row.employee_id)) {
        employeeMap.set(row.employee_id, {
          name: row.first_name,
          email: row.email,
          week1: 0,
          week2: 0,
          week3: 0,
          week4: 0,
          total: 0,
        });
      }
      if (row.date && row.hours) {
        const entry = employeeMap.get(row.employee_id);
        const dayOfMonth = new Date(row.date).getDate();
        const weekIndex = getWeekIndex(dayOfMonth);
        const hours = Number(row.hours) || 0;
        entry[`week${weekIndex}`] += hours;
        entry.total += hours;
      }
    });

    const employees = Array.from(employeeMap.values()).map((e) => ({
      name: e.name,
      email: e.email,
      week1: Math.round(e.week1 * 100) / 100,
      week2: Math.round(e.week2 * 100) / 100,
      week3: Math.round(e.week3 * 100) / 100,
      week4: Math.round(e.week4 * 100) / 100,
      total: Math.round(e.total * 100) / 100,
    }));

    console.table(employees.map(({ email, ...rest }) => rest));

    const columnTotals = employees.reduce(
      (acc, e) => {
        acc.week1 += e.week1;
        acc.week2 += e.week2;
        acc.week3 += e.week3;
        acc.week4 += e.week4;
        acc.total += e.total;
        return acc;
      },
      { week1: 0, week2: 0, week3: 0, week4: 0, total: 0 }
    );

    const employeeRows = employees
      .map(
        (e) => `
          <tr>
            <td>${e.name}</td>
            <td style="text-align:center;">${e.week1}</td>
            <td style="text-align:center;">${e.week2}</td>
            <td style="text-align:center;">${e.week3}</td>
            <td style="text-align:center;">${e.week4}</td>
            <td style="text-align:center;"><b>${e.total}</b></td>
          </tr>`
      )
      .join("");

    const emailContent = `
      <style>
        table { border-collapse: collapse; width: 100%; border: 1px solid #ccc; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #0b2e6f; color: #fff; }
        tfoot td { background: #eef2fb; font-weight: bold; }
      </style>
      <p>Dear Team,</p>
      <p>Please find below the working hours summary for each staff for ${monthLabel} (Week 1 to Week 4).</p>
      <p>This includes the total hours worked by each team member.</p>
      <table>
        <thead>
          <tr>
            <th>Staff Name</th>
            <th style="text-align:center;">Week 1 (Hrs)</th>
            <th style="text-align:center;">Week 2 (Hrs)</th>
            <th style="text-align:center;">Week 3 (Hrs)</th>
            <th style="text-align:center;">Week 4 (Hrs)</th>
            <th style="text-align:center;">Total (Hrs)</th>
          </tr>
        </thead>
        <tbody>
          ${employeeRows}
        </tbody>
        <tfoot>
          <tr>
            <td>Total (Hrs)</td>
            <td style="text-align:center;">${Math.round(columnTotals.week1 * 100) / 100}</td>
            <td style="text-align:center;">${Math.round(columnTotals.week2 * 100) / 100}</td>
            <td style="text-align:center;">${Math.round(columnTotals.week3 * 100) / 100}</td>
            <td style="text-align:center;">${Math.round(columnTotals.week4 * 100) / 100}</td>
            <td style="text-align:center;">${Math.round(columnTotals.total * 100) / 100}</td>
          </tr>
        </tfoot>
      </table>
      <br/>
      <p><b>Note:</b> The hours are calculated based on logged working time. Please reach out to your manager for any discrepancies.</p>
      <br/>
      <p>Regards,</p>
      <p><b>Admin Team</b></p>`;

    if (mode === "preview") {
      fs.writeFileSync("monthly-mail-preview.html", emailContent, "utf8");
      console.log("Saved: monthly-mail-preview.html — open it in your browser to see the exact mail layout.");
      process.exit(0);
    }

    // mode === "send"
    const API_KEY = "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";
    sgMail.setApiKey(API_KEY);

    sgMail
      .send({
        to: [sendTo],
        from: "notification@unitdtechnologies.com",
        subject: `[TEST] ${monthLabel} - UTS Monthly Working Hours Summary`,
        html: emailContent,
      })
      .then(() => {
        console.log(`Test email sent to ${sendTo}. Check the inbox.`);
        process.exit(0);
      })
      .catch((error) => {
        console.error("SendGrid error:", error.response ? error.response.body : error);
        process.exit(1);
      });
  }
);