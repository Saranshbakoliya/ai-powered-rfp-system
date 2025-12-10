
const express = require("express");
const router = express.Router();

let nextRfpId = 1;
const rfpStore = []; 


function parseRfpFromText(text) {
  const lower = text.toLowerCase();

  const budgetMatch = lower.match(/budget[^0-9]*([\d,]+)/);
  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, "")) : null;

  const deliveryMatch = lower.match(/(\d+)\s*day/);
  const deliveryDays = deliveryMatch ? Number(deliveryMatch[1]) : null;

  const warrantyMatch = lower.match(/(\d+)\s*year/);
  const warrantyYears = warrantyMatch ? Number(warrantyMatch[1]) : null;

  const paymentMatch = lower.match(/net\s*\d+/);
  const paymentTerms = paymentMatch ? paymentMatch[0] : null;

  const items = [];

  const laptopMatch = lower.match(/(\d+)\s+laptops?/);
  if (laptopMatch) {
    items.push({ name: "laptop", quantity: Number(laptopMatch[1]) });
  }

  const monitorMatch = lower.match(/(\d+)\s+monitors?/);
  if (monitorMatch) {
    items.push({ name: "monitor", quantity: Number(monitorMatch[1]) });
  }

  return {
    items,
    budget,
    deliveryDays,
    warrantyYears,
    paymentTerms,
    rawText: text,
  };
}


router.get("/", (req, res) => {
  res.json({
    message: "RFP routes are working",
    rfps: rfpStore,
  });
});


function handleCreateRfp(req, res) {
  console.log(">>> RFP from text handler hit");
  console.log("Request body:", req.body);

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      error: "Missing 'text' field in request body",
    });
  }

  const structuredRfp = parseRfpFromText(text);

  const id = nextRfpId++;
  const rfpRecord = { id, ...structuredRfp };
  rfpStore.push(rfpRecord);

  res.json({
    message: "RFP created successfully",
    id,          
    rfp: rfpRecord,
  });
}

router.post("/create", handleCreateRfp);


router.post("/from-text", handleCreateRfp);

module.exports = router;
