const express = require("express");

const { signUpUser, logInUser } = require("../../controllers/authControllers");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", logInUser);

module.exports = router;
