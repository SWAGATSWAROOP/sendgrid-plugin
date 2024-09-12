const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/send-email", async (req, res) => {
  console.log(req.body);
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res
      .status(400)
      .send({ error: "Missing required fields: to, subject, text" });
  }

  try {
    const msg = {
      to: to,
      from: "on-demand <info@on-demand.io>",
      subject: subject,
      text: text,
      html: `${text}`,
    };
    sgMail
      .send(msg)
      .then(() => {
        res.status(200).json({
          message: `Email has been sent successfully to the provided ${to}`,
        });
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
