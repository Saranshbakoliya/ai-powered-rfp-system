

const express = require("express");
const router = express.Router();


let nextProposalId = 1;
const proposals = [];

router.get("/rfp/:rfpId", (req, res) => {
  const rfpId = Number(req.params.rfpId);
  const list = proposals.filter((p) => p.rfp_id === rfpId);
  res.json({
    rfp_id: rfpId,
    proposals: list,
  });
});

router.post("/from-email", (req, res) => {
  try {
    console.log(">>> POST /api/proposals/from-email");
    console.log("Body:", req.body);

    const { rfp_id, vendor_id, email_body } = req.body;

    if (!rfp_id || !vendor_id || !email_body) {
      return res.status(400).json({
        error: "rfp_id, vendor_id and email_body are required",
      });
    }

    const lower = email_body.toLowerCase();

    
    const priceMatch = lower.match(/(?:total\s*)?(?:price\s*)?[:\-]?\s*([\d,]+)/);
    const total_price = priceMatch
      ? Number(priceMatch[1].replace(/,/g, ""))
      : null;

    const deliveryMatch = lower.match(/(\d+)\s*day/);
    const delivery_days = deliveryMatch ? Number(deliveryMatch[1]) : null;

    const warrantyMatch = lower.match(/(\d+(\.\d+)?)\s*year/);
    const warranty = warrantyMatch ? warrantyMatch[1] : null;

    const paymentMatch = lower.match(/net\s*\d+/);
    const payment_terms = paymentMatch ? paymentMatch[0] : null;

    const proposal = {
      proposal_id: nextProposalId++,
      rfp_id: Number(rfp_id),
      vendor_id: Number(vendor_id),
      email_body,
      total_price,
      delivery_days,
      warranty,
      payment_terms,
    };

    proposals.push(proposal);

    res.json({
      message: "Proposal created from email",
      proposal_id: proposal.proposal_id,
      proposal,
    });
  } catch (err) {
    console.error("Error in /api/proposals/from-email:", err);
    res.status(500).json({ error: "Internal server error while creating proposal" });
  }
});


router.post("/rfp/:rfpId/compare", (req, res) => {
  const rfpId = Number(req.params.rfpId);
  const rfpProposals = proposals.filter((p) => p.rfp_id === rfpId);

  if (!rfpProposals.length) {
    return res.status(400).json({ error: "No proposals found for this RFP" });
  }

  const withPrice = rfpProposals.filter(
    (p) => typeof p.total_price === "number" && !Number.isNaN(p.total_price)
  );

  let recommended = null;
  let explanation = "No pricing found, cannot recommend a best vendor.";

  if (withPrice.length) {
    recommended = withPrice.reduce((best, p) =>
      p.total_price < best.total_price ? p : best,
      withPrice[0]
    );
    explanation = `Recommended vendor_id ${recommended.vendor_id} with lowest total_price ${recommended.total_price}.`;
  }

  res.json({
    rfp_id: rfpId,
    proposals: rfpProposals,
    recommended,
    explanation,
  });
});

module.exports = router;
