const express = require("express");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");

dotenv.config();

const app = express();
app.use(express.json());

app.post("/send-email", async (req, res) => {
  console.log(req.body);
  sgMail.setApiKey(req.body.apikey);
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res
      .status(400)
      .send({ error: "Missing required fields: to, subject, text" });
  }
  try {
    const emails = to.split(",").map((email) => email.trim());
    await Promise.all(
      emails.map(async (email) => {
        const msg = {
          to: email,
          from: req.body.from,
          subject: subject,
          text: text,
          html: `${text}`,
        };
        await sgMail.send(msg);
      })
    );

    return res.status(200).json({
      message: `Email has been sent successfully to the provided ${to}`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error sending email",
      error: error.message,
    });
  }
});

app.post("/send-email-with-attachement", async (req, res) => {
  const { to, subject, text, attachments } = req.body;
  sgMail.setApiKey(req.body.apikey);
  if (!to || !subject || !text) {
    return res.status(400).send({
      error: "Missing required fields: to, subject, text",
    });
  }

  try {
    const emails = to.split(",").map((email) => email.trim());

    // Download each attachment and convert to base64
    const attachmentFiles = await Promise.all(
      attachments.map(async (url) => {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const fileType = response.headers["content-type"];
        const fileName = url.split("/").pop();

        return {
          content: Buffer.from(response.data).toString("base64"),
          filename: fileName,
          type: fileType,
          disposition: "attachment",
        };
      })
    );

    // Send email to each recipient with attachments
    await Promise.all(
      emails.map((email) => {
        const msg = {
          to: email,
          from: req.body.from,
          subject: subject,
          text: text,
          html: text,
          attachments: attachmentFiles,
        };
        return sgMail.send(msg);
      })
    );

    return res.status(200).json({
      message: `Email has been sent successfully to ${to}`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({
      success: false,
      message: "Error sending email",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running of port ${PORT}`);
});
