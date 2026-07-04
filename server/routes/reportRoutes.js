const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/dashboard", ctrl.getDashboard);
router.get("/stock", ctrl.getStockReport);

module.exports = router;
