const express = require('express')
const router = express.Router()
const sha256 = require('sha256')
// login route
router.post('/register', (req, res, next) => {
  const {
    email = null,
      password = null,
      firstName = null,
      lastName = null
  } = req.body


  if (email === null || password === null || firstName === null || lastName === null) {
    res.status(400).send('Missing register information.')
  }

  const cleanEmail = req.sanitize(email)
  const cleanPassword = req.sanitize(password)
  const cleanFirstName = req.sanitize(firstName)
  const cleanLastName = req.sanitize(lastName)
  const hashPw = sha256(cleanPassword).substr(0, 20)
  const db = req.app.db
  console.log(cleanEmail)
  const sql = `select * from users where email_address = '${cleanEmail}'`

  db.query(sql, (err, results, field) => {

    if (err) {
      res.status(500).send('Server Error')
      // FIXME: handle server error better
      console.log(err.sqlMessage)
      return
    }

    if (results.length !== 0) {
      res.status(400).send('Email has already been taken.')
      return
    }

    const registerSql = `insert into users (first_name, last_name, email_address, login_password) values ('${cleanFirstName}', '${cleanLastName}', '${cleanEmail}', '${hashPw}')`
    db.query(registerSql, (err, results, field) => {
      if (err) {
        res.status(500).send('server Error')
        console.log(err.sqlMessage)
      }
      if (results.affectedRows === 1) {
        res.status(201).send('Register Success')
      }
    })
  })
})

module.exports = router