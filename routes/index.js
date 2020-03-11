const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const verifyToken = require("../middlewares/verifyToken");
const tomatoRouter = require("./tomatoRouter");

router.get("/", function(req, res, next) {
  res.render("index", {
    title: "Express"
  });
});

// unprotected router
router.use("/auth", authRouter);

// protected router
router.all("*", verifyToken);

router.use("/tomato", tomatoRouter);

module.exports = router;
