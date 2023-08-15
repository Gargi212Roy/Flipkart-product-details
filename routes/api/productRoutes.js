const express = require("express");
const router = express.Router();

const {
  createProductDetails,
} = require("../../controllers/productControllers");
const { authenticate } = require("../../middlewares/authenticate");

router.post("/", authenticate, createProductDetails);

module.exports = router;
