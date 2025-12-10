
const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


function extractJsonFromText(text) {
  if (!text) {
    throw new Error("Empty AI response");
  }

  
  const fenced = text.match(/```json([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    text = fenced[1].trim();
  }

  
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const jsonCandidate = text.slice(start, end + 1);
    return JSON.parse(jsonCandidate);
  }

  
  return JSON.parse(text);
}


async function callModel(systemPrompt, userPrompt) {
  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  return completion.choices[0].message.content;
}



async function generateStructuredRfp(naturalLanguageText) {
  const systemPrompt = `
You are an assistant that turns free-form procurement needs into a JSON RFP object.

Return ONLY a JSON object, no markdown fences, no explanation.

Schema:

{
  "title": string,
  "description": string,
  "budget": number | null,
  "currency": string | null,
  "delivery_deadline": string | null,
  "payment_terms": string | null,
  "warranty": string | null,
  "items": [
    {
      "name": string,
      "quantity": number,
      "specifications": string
    }
  ]
}
`.trim();

  const userPrompt = `
Turn this requirement into an RFP JSON:

${naturalLanguageText}
`.trim();

  const raw = await callModel(systemPrompt, userPrompt);

  try {
    const parsed = extractJsonFromText(raw);
    return parsed;
  } catch (err) {
    console.error("Failed to parse RFP JSON from Groq:", err, "\nRAW:", raw);
    throw new Error("AI did not return valid JSON for RFP");
  }
}


async function parseVendorResponse(emailBody) {
  const systemPrompt = `
You are an assistant that extracts structured proposal information from messy vendor emails.

Return ONLY a JSON object, no markdown fences, no explanation.

Schema:

{
  "price_total": number | null,
  "currency": string | null,
  "delivery_time": string | null,
  "payment_terms": string | null,
  "warranty": string | null,
  "items": [
    {
      "name": string,
      "quantity": number | null,
      "unit_price": number | null,
      "total_price": number | null,
      "notes": string | null
    }
  ],
  "notes": string | null
}
`.trim();

  const userPrompt = `
Extract structured proposal data from the following vendor email:

${emailBody}
`.trim();

  const raw = await callModel(systemPrompt, userPrompt);

  try {
    return extractJsonFromText(raw);
  } catch (err) {
    console.error("Failed to parse Proposal JSON from Groq:", err, "\nRAW:", raw);
    throw new Error("AI did not return valid JSON for proposal");
  }
}



async function compareProposals(rfp, proposalsWithVendor) {
  const systemPrompt = `
You are an expert procurement assistant.

You will be given:
- The original RFP as JSON
- A list of proposals with vendor names and structured data

Return ONLY a JSON object with this shape, no markdown, no explanation:

{
  "recommendations": [
    {
      "vendor_id": number,
      "vendor_name": string,
      "score": number,           // 0–1
      "rationale": string
    }
  ],
  "overall_summary": string
}

Score higher for:
- Lower total price (within budget)
- Better delivery_time
- Clear payment_terms
- Better warranty
- Overall completeness vs the RFP.
`.trim();

  const userPrompt = `
RFP JSON:
${JSON.stringify(rfp, null, 2)}

Proposals:
${JSON.stringify(proposalsWithVendor, null, 2)}
`.trim();

  const raw = await callModel(systemPrompt, userPrompt);

  try {
    return extractJsonFromText(raw);
  } catch (err) {
    console.error("Failed to parse Comparison JSON from Groq:", err, "\nRAW:", raw);
    throw new Error("AI did not return valid JSON for comparison");
  }
}

module.exports = {
  generateStructuredRfp,
  parseVendorResponse,
  compareProposals,
};
