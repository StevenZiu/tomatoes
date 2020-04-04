var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
const cors = require("cors")
const mysql = require("mysql")
const chalk = require("chalk")
const sanitizer = require("express-sanitizer")
const bearerToken = require("express-bearer-token")
const { connectDB } = require("./services/connectDB")
require("dotenv").config()

var indexRouter = require("./routes/index")

var app = express()

// cors
app.use(cors())
app.use(bearerToken())

// connect database
connectDB(app)

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(logger("dev"))
app.use(express.json())

// sanitizer
app.use(sanitizer())

app.use(
  express.urlencoded({
    extended: false,
  })
)
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
// health route
app.use("/health", (req, res, next) => {
  res.status(200).send("server ok")
})
app.use("/api/v1", indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
