const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const adoptionRequestRoutes = require("./routes/adoptionRequests");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api/requests", adoptionRequestRoutes);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PawHome server is running on port ${PORT}`);
});
