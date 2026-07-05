const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      origin.includes("vercel.app") ||
      origin.includes("localhost")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

app.use(express.json());
require("./config/database");

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Server Inventori UMKM berjalan!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
