const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://inventori-umkm.vercel.app/"],
    credentials: true,
  }),
);
app.use(express.json());
require("./config/database");

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Server inventori UMKM berjalan..." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
