const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/stockController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", ctrl.getAll);
router.post("/in", ctrl.stockIn);
router.post("/out", ctrl.stockOut);

module.exports = router;
