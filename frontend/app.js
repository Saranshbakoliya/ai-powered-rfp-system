const apiBase = 'http://localhost:4000/api';

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

const rfpText = document.getElementById('rfpText');
const createRfpBtn = document.getElementById('createRfpBtn');
const rfpResult = document.getElementById('rfpResult');

const vendorName = document.getElementById('vendorName');
const vendorEmail = document.getElementById('vendorEmail');
const vendorCategory = document.getElementById('vendorCategory');
const vendorNotes = document.getElementById('vendorNotes');
const addVendorBtn = document.getElementById('addVendorBtn');
const refreshVendorsBtn = document.getElementById('refreshVendorsBtn');
const vendorList = document.getElementById('vendorList');

const rfpIdForProposals = document.getElementById('rfpIdForProposals');
const vendorIdForEmailProposal = document.getElementById('vendorIdForEmailProposal');
const vendorEmailBody = document.getElementById('vendorEmailBody');
const createProposalFromEmailBtn = document.getElementById('createProposalFromEmailBtn');
const loadProposalsBtn = document.getElementById('loadProposalsBtn');
const proposalsResult = document.getElementById('proposalsResult');
const compareBtn = document.getElementById('compareBtn');
const comparisonResult = document.getElementById('comparisonResult');

const pollRfpId = document.getElementById('pollRfpId');
const pollVendorId = document.getElementById('pollVendorId');
const pollEmailBtn = document.getElementById('pollEmailBtn');

createRfpBtn.addEventListener('click', async () => {
  try {
    const data = await postJSON(`${apiBase}/rfps/from-text`, { text: rfpText.value });
    rfpResult.textContent = JSON.stringify(data, null, 2);
    alert('RFP created with id ' + data.rfp.id);
  } catch (err) {
    console.error(err);
    alert('Error creating RFP: ' + err.message);
  }
});

async function loadVendors() {
  try {
    const data = await getJSON(`${apiBase}/vendors`);
    vendorList.innerHTML = '';
    data.vendors.forEach(v => {
      const li = document.createElement('li');
      li.textContent = `#${v.id} ${v.name} <${v.email}>`;
      vendorList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert('Error loading vendors: ' + err.message);
  }
}

addVendorBtn.addEventListener('click', async () => {
  try {
    await postJSON(`${apiBase}/vendors`, {
      name: vendorName.value,
      email: vendorEmail.value,
      category: vendorCategory.value,
      notes: vendorNotes.value
    });
    vendorName.value = '';
    vendorEmail.value = '';
    vendorCategory.value = '';
    vendorNotes.value = '';
    await loadVendors();
  } catch (err) {
    console.error(err);
    alert('Error adding vendor: ' + err.message);
  }
});

refreshVendorsBtn.addEventListener('click', loadVendors);

loadProposalsBtn.addEventListener('click', async () => {
  try {
    const rfpId = rfpIdForProposals.value;
    const data = await getJSON(`${apiBase}/proposals/rfp/${rfpId}`);
    proposalsResult.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
    alert('Error loading proposals: ' + err.message);
  }
});

createProposalFromEmailBtn.addEventListener('click', async () => {
  try {
    const rfpId = rfpIdForProposals.value;
    const vendorId = vendorIdForEmailProposal.value;
    const emailBody = vendorEmailBody.value;
    const data = await postJSON(`${apiBase}/proposals/from-email`, {
      rfp_id: Number(rfpId),
      vendor_id: Number(vendorId),
      email_body: emailBody
    });
    alert('Proposal created with id ' + data.proposal_id);
  } catch (err) {
    console.error(err);
    alert('Error creating proposal: ' + err.message);
  }
});

compareBtn.addEventListener('click', async () => {
  try {
    const rfpId = rfpIdForProposals.value;
    const data = await postJSON(`${apiBase}/proposals/rfp/${rfpId}/compare`, {});
    comparisonResult.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
    alert('Error comparing proposals: ' + err.message);
  }
});

pollEmailBtn.addEventListener('click', async () => {
  try {
    const rfpId = pollRfpId.value;
    const vendorId = pollVendorId.value;
    const data = await postJSON(`${apiBase}/email/poll`, {
      rfp_id: Number(rfpId),
      vendor_id: Number(vendorId)
    });
    alert('Emails processed: ' + data.emails_processed + ', proposals created: ' + data.proposals_created.length);
  } catch (err) {
    console.error(err);
    alert('Error polling email: ' + err.message);
  }
});

loadVendors().catch(console.error);
