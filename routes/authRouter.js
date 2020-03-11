const express = require("express");
const router = express.Router();
const sha256 = require("sha256");
const jwt = require("jsonwebtoken");
const mailer = require("../services/mail");
const chalk = require("chalk");
// verify mail server
mailer.verify((err, success) => {
  if (err) {
    console.log(chalk.red("mail server connection fail"));
  } else if (success) {
    console.log(chalk.green("mail server is on"));
  }
});

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
router.post("/forgot-password", (req, res, next) => {
  const { email = null } = req.body;
  const cleanEmail = req.sanitize(email);
  if (cleanEmail === null || cleanEmail === "") {
    res.status(400).send("Email is missing");
    return;
  }
  const checkUserExistSql = `select * from Users where email_address = '${cleanEmail}'`;
  const db = req.app.db;
  db.query(checkUserExistSql, (err, result, field) => {
    if (err) {
      res.status(500).send("Server Error");
      console.log(err.sqlMessage);
      return;
    }
    if (result.length !== 0) {
      const passwordAsJWTSecret = result[0].login_password;
      jwt.sign(
        { cleanEmail },
        passwordAsJWTSecret,
        // token expires in 10 mins
        { expiresIn: "600", algorithm: "HS256" },
        async (err, token) => {
          if (err) {
            res.status(500).send("Server Error");
            console.log(`Generate reset jwt token failed: ${err}`);
            return;
          }
          // send the reset the password email
          let mailInfo;
          try {
            mailInfo = await mailer.sendMail({
              from: '"Tomato Notes Team👻" <tomatonotes1@gmail.com>', // sender address
              to: cleanEmail, // list of receivers
              subject: "Reset Password for Tomato Notes", // Subject line
              html: `
                <p>Please click the following link to reset your password for Tomato Notes: </p>
                <br/>
                <p>https://google.com?token=${token}</p>
                <br/>
                <p>The link will expire in 10 minutes, and you can only use this link to reset your password one time.</p>
                <br/>
                <p>Tomato Notes Team</p>
              `
            });
          } catch (err) {
            console.log(`mail sent fail: ${err}`);
          }

          if (mailInfo.messageId) {
            console.log(
              `reset mail sent: ${mailInfo.messageId}, for user: ${cleanEmail}`
            );
          } else {
            console.log(`mail sent fail for user: ${cleanEmail}`);
          }
        }
      );
    } else {
      // log to tell backend, someone is trying to reset the password for non-existing users
      console.log(
        chalk.red(
          `Warning: someone is trying to reset the password for non-existing user: ${cleanEmail}`
        )
      );
    }
    // return 200 anyway for client side
    res
      .status(200)
      .send(
        "If your email exists in our database, we will send an reset password email to that."
      );
  });
});
// reset password route

module.exports = router;
