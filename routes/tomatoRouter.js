const express = require("express");
const router = express.Router();
const sha256 = require("sha256");
const chalk = require("chalk");

router.post("/create", (req, res, next) => {
  res.status(201).send({ id: req.user_id, email: req.user_email });
});

module.exports = router;
