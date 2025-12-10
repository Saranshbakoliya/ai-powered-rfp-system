

const nodemailer = require("nodemailer");
const Imap = require("imap");
const { simpleParser } = require("mailparser");



const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});



 
async function sendEmail({ to, subject, text }) {
  const from = process.env.SMTP_USER; 
  await smtpTransporter.sendMail({ from, to, subject, text });
}



function createImapClient() {
  return new Imap({
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT) || 993,
    tls: process.env.IMAP_TLS === "true",
  });
}


function pollInboxOnce() {
  return new Promise((resolve, reject) => {
    const imap = createImapClient();

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        imap.search(["UNSEEN"], (err, results) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          if (!results || results.length === 0) {
            imap.end();
            return resolve([]); 
          }

          const f = imap.fetch(results, { bodies: "" });
          const emails = [];

          f.on("message", (msg) => {
            msg.on("body", (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (!err && parsed) {
                  emails.push({
                    from: parsed.from?.text || "",
                    subject: parsed.subject || "",
                    text: parsed.text || "",
                  });
                }
              });
            });
          });

          f.once("error", (err) => {
            imap.end();
            reject(err);
          });

          f.once("end", () => {
            imap.end();
            resolve(emails);
          });
        });
      });
    });

    imap.once("error", (err) => {
      reject(err);
    });

    imap.connect();
  });
}

module.exports = {
  sendEmail,
  pollInboxOnce,
};
