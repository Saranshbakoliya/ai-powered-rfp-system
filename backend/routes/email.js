const express = require("express");
const db = require("../db");
const { pollInboxOnce } = require("../emailService");
const { parseVendorResponse } = require("../aiService");

const router = express.Router();


router.post("/send-rfp", (req, res) => {
  const { rfp_id, vendor_ids } = req.body;

  if (!rfp_id || !Array.isArray(vendor_ids) || vendor_ids.length === 0) {
    return res.status(400).json({ error: "rfp_id and vendor_ids[] are required" });
  }

  const placeholders = vendor_ids.map(() => "?").join(",");

  db.all(
    `SELECT * FROM vendors WHERE id IN (${placeholders})`,
    vendor_ids,
    async (err, vendors) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to load vendors" });
      }

      if (!vendors || vendors.length === 0) {
        return res.json({
          message: "No vendors found for given vendor_ids. No emails sent.",
        });
      }

      
      const rfpText =
        `RFP ID: ${rfp_id}\n\n` +
        `This is an RFP request sent from the AI-powered RFP system.\n` +
        `Please reply with your total price, delivery time, warranty, and payment terms.\n`;

      
      console.log("\n\n===== MOCK EMAIL SENDING START =====");
      console.log("RFP ID:", rfp_id);

      vendors.forEach((v) => {
        console.log("\n--- Email to Vendor ---");
        console.log("To:", v.email);
        console.log("Subject:", `RFP Request (ID ${rfp_id})`);
        console.log("Body:\n" + rfpText);
        console.log("------------------------------");
      });

      console.log("===== MOCK EMAIL SENDING END =====\n\n");

      return res.json({
        message: "RFP emails 'sent' in demo mode (logged to console).",
        sent_to: vendors.map((v) => ({ id: v.id, email: v.email })),
      });
    }
  );
});


router.post("/poll", async (req, res) => {
  const { rfp_id, vendor_id } = req.body;

  if (!rfp_id || !vendor_id) {
    return res.status(400).json({ error: "rfp_id and vendor_id are required" });
  }

  let emails = [];

  try {
    emails = await pollInboxOnce();
  } catch (e) {
    
    emails = [];
  }

  if (!emails.length) {
    return res.json({
      message: "No new emails found (IMAP disabled — demo mode).",
      emails_processed: 0,
      proposals_created: [],
    });
  }

  const proposalsCreated = [];
  let createdCount = 0;

  for (const email of emails) {
    try {
      const parsed = await parseVendorResponse(email.text || email.subject);
      const itemsJson = JSON.stringify(parsed.items || []);

      const sql = `
        INSERT INTO proposals (
          rfp_id,
          vendor_id,
          price_total,
          currency,
          delivery_time,
          payment_terms,
          warranty,
          items_json,
          notes,
          raw_text,
          score,
          ai_summary,
          email_message_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await new Promise((resolve, reject) => {
        db.run(
          sql,
          [
            rfp_id,
            vendor_id,
            parsed.price_total || null,
            parsed.currency || null,
            parsed.delivery_time || null,
            parsed.payment_terms || null,
            parsed.warranty || null,
            itemsJson,
            parsed.notes || null,
            email.text || email.subject || "",
            null,
            null,
            null,
          ],
          function (err) {
            if (err) return reject(err);

            proposalsCreated.push({ proposal_id: this.lastID });
            createdCount++;
            resolve();
          }
        );
      });
    } catch (err) {
    }
  }

  return res.json({
    message: "Inbox polled (demo mode).",
    emails_processed: emails.length,
    proposals_created: proposalsCreated,
  });
});

module.exports = router;
