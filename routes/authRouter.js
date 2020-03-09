const express = require("express");
const router = express.Router();
const sha256 = require("sha256");
const jwt = require("jsonwebtoken");

// register route
router.post("/register", (req, res, next) => {
  const {
    email = null,
    password = null,
    firstName = null,
    lastName = null
  } = req.body;

  if (
    email === null ||
    password === null ||
    firstName === null ||
    lastName === null
  ) {
    res.status(400).send("Missing register information.");
  }

  const cleanEmail = req.sanitize(email);
  const cleanPassword = req.sanitize(password);
  const cleanFirstName = req.sanitize(firstName);
  const cleanLastName = req.sanitize(lastName);
  const hashPw = sha256(cleanPassword).substr(0, 20);
  const db = req.app.db;
  const sql = `select * from users where email_address = '${cleanEmail}'`;

  db.query(sql, (err, results, field) => {
    if (err) {
      res.status(500).send("Server Error");
      // FIXME: handle server error better
      console.log(err.sqlMessage);
      return;
    }

    if (results.length !== 0) {
      res.status(400).send("Email has already been taken.");
      return;
    }

    const registerSql = `insert into users (first_name, last_name, email_address, login_password) values ('${cleanFirstName}', '${cleanLastName}', '${cleanEmail}', '${hashPw}')`;
    db.query(registerSql, (err, results, field) => {
      if (err) {
        res.status(500).send("server Error");
        console.log(err.sqlMessage);
      }
      if (results.affectedRows === 1) {
        res.status(201).send("Register Success");
      }
    });
  });
});

// login route
router.post("/login", (req, res, next) => {
  const { email = null, password = null } = req.body;
  if (email === null || password === null) {
    res.status(400).send("Login information missing.");
    return;
  }
  const cleanEmail = req.sanitize(email);
  const cleanPassword = req.sanitize(password);
  const loginSql = `select * from Users where email_address='${cleanEmail}'`;
  const db = req.app.db;
  db.query(loginSql, (err, results, field) => {
    if (err) {
      res.status(500).send("Server Error");
      console.log(err.sqlMessage);
      return;
    }
    if (
      results.length !== 0 &&
      results[0].login_password === sha256(cleanPassword).substr(0, 20)
    ) {
      // login success, generate the jwt
      const userInfoInJwt = { user_id: results[0].user_id };
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500).send("Server Error");
        console.log("JWT secret missing");
        return;
      }
      jwt.sign(
        userInfoInJwt,
        secret,
        { expiresIn: "1h", algorithm: "HS256" },
        (err, token) => {
          if (err) {
            res.status(500).send("Server Error");
            console.log(err);
            return;
          }
          res.status(200).send(token);
          return;
        }
      );
    } else {
      res.status(400).send("Email or passowrd does not match.");
    }
  });
});

// TODO:
// forgot password route
// reset password route

module.exports = router;
