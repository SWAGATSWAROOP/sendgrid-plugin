const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res
      .status(400)
      .send({ error: "Missing required fields: to, subject, text" });
  }

  try {
    const htmlText = text.replace(/\n/g, "<br>");
    const msg = {
      to: to,
      from: "on-demand <pranjal@schoolhack.ai>",
      subject: subject,
      text: text,
      html: `${htmlText}`,
    };
    sgMail
      .send(msg)
      .then(() => {
        res.json("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
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
