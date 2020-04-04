// TODO: need user api to get user information
const express = require("express")
const router = express.Router()

router.get("/", (req, res, next) => {
  const { user_id, user_email } = req
  const sql = `select first_name, last_name, register_at, update_at, profile_photo, email_address from users where user_id = '${user_id}'`
  const db = req.app.db
  db.query(sql, (err, result, field) => {
    if (err) {
      res.status(500).send("server error")
      console.log(err.sqlMessage)
      return
    }
    res.status(201).send({ ...result[0], user_id })
  })
})

module.exports = router
