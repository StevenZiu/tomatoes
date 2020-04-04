const express = require("express")
const router = express.Router()
const authRouter = require("./authRouter")
const verifyToken = require("../middlewares/verifyToken")
const tomatoRouter = require("./tomatoRouter")
const projectRouter = require("./projectRouter")
const userRouter = require("./user")

// unprotected router
router.use("/auth", authRouter)

// protected router
router.all("*", verifyToken)
router.use("/user", userRouter)
router.use("/project", projectRouter)
router.use("/tomato", tomatoRouter)

module.exports = router
