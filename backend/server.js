

require("dotenv").config(); 

const express = require("express");
const cors = require("cors");


const PORT = 4000;


console.log(">>> Using server.js from backend folder");
console.log(">>> PORT is forced to 4000");


require("./db");

const rfpRoutes = require("./routes/rfp");
const vendorRoutes = require("./routes/vendor");
const proposalRoutes = require("./routes/proposal");
const emailRoutes = require("./routes/email");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/rfps", rfpRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/email", emailRoutes);


app.get("/", (req, res) => {
  res.json({ status: "OK", message: "RFP backend running on port " + PORT });
});


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});


app.listen(PORT, () => {
  console.log(`>>> Backend listening on http://localhost:${PORT}`);
});
