const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const cors = require("cors");
const fileUpload = require("express-fileupload");

router.use(cors());
router.use(express.json());

router.use(
  fileUpload({
    createParentPath: true,
  })
);

/*
|--------------------------------------------------------------------------
| 1️⃣ Send Basic Email (Replacing SendGrid `/sendemail`)
|--------------------------------------------------------------------------
*/
router.post('/sendemail', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    // SMTP transporter - Premium Hosting
    const transporter = nodemailer.createTransport({
      host: "premium128.web-hosting.com",
      port: 587,
      secure: true,
      auth: {
        user: "notification@unitdtechnologies.com",
        pass: "notification777#",
      },
    });

    const htmlContent = `
        <div style="font-family: Arial; padding: 20px;">
          ${text}
        </div>
    `;

    await transporter.sendMail({
      from: '"Unitd Technologies" <notification@unitdtechnologies.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    });

    return res.status(200).send({
      msg: "Success",
      data: "Email Sent",
    });

  } catch (error) {
    console.error("Email Error:", error);
    return res.status(400).send({
      msg: "failed",
      data: error,
    });
  }
});


/*
|--------------------------------------------------------------------------
| 2️⃣ Contact Form Email (Smartwave HTML Template)
|--------------------------------------------------------------------------
*/
router.post("/sendMail", async (req, res) => {
  const { first_name, email, comments } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "premium128.web-hosting.com",
      port: 465,
      secure: true,
      auth: {
        user: "notification@unitdtechnologies.com",
        pass: "notification777#",
      },
    });

    const logoPath = "/www/wwwroot/66.29.149.122/SmartwaveEcomAPI/storage/uploads/smartwave.jpg";

    const htmlContent = `
      <div style="background: #eef3f8; padding: 25px; font-family: Arial;">
        <div style="max-width: 650px; margin: auto; background: white; border-radius: 12px; overflow: hidden;">
          
          <div style="background: #0f77c0; padding: 18px; display: flex; align-items: center;">
            <img src="cid:logo" alt="Smartwave Logo" style="height: 40px; margin-right: 10px;" />
            <h2 style="color: #ffffff; margin: 0;">Smartwave International</h2>
          </div>

          <div style="padding: 25px;">
            <p>Hello Admin,</p>
            <p>You have received a new enquiry.</p>

            <table style="width: 100%; border: 1px solid #ddd; border-radius: 8px;">
              <tr>
                <td style="padding: 12px; font-weight: bold;">Name:</td>
                <td style="padding: 12px;">${first_name}</td>
              </tr>
              <tr style="background:#f7f7f7;">
                <td style="padding: 12px; font-weight: bold;">Email:</td>
                <td style="padding: 12px;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold;">Message:</td>
                <td style="padding: 12px;">${comments}</td>
              </tr>
            </table>

            <p style="margin-top: 25px;">
              Regards,<br/>
              <strong>Super Admin</strong>
            </p>
          </div>

          <div style="background: #f4f7fb; text-align: center; padding: 12px;">
            <p style="font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Smartwave</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Super Admin" <notification@unitdtechnologies.com>',
      to: "meera@unitdtechnologies.com",
      subject: "New Contact Form Message",
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    });

    res.json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("Smartwave Email Error:", error);
    res.status(500).json({ success: false, message: "Email failed to send", error });
  }
});


/*
|--------------------------------------------------------------------------
| 3️⃣ Gmail SMTP Message (optional)
|--------------------------------------------------------------------------
*/
router.post("/sendMail2", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send({ success: false, message: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "meeera520@gmail.com",
        pass: "nqaermcdbpufougr",
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: "meera@unitdtechnologies.com",
      subject: `New message from ${name}`,
      html: `
        <div style="font-family: Arial; background: #f7f7f7; padding: 20px;">
          <h2 style="color: #007bff;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        </div>
      `,
    });

    return res.status(200).send({ success: true, message: "Mail sent successfully!" });

  } catch (error) {
    console.error("Mail sending error:", error);
    return res.status(500).send({ success: false, message: "Mail failed to send.", error });
  }
});

module.exports = router;
