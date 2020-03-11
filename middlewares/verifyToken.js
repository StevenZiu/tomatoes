const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const db = req.app.db;
  const token = req.token;
  if (token === undefined) {
    res.status(403).send("Token Verified Failed");
    return;
  }
  const JWTSecret = process.env.JWT_SECRET;
  jwt.verify(token, JWTSecret, (err, decoded) => {
    if (err) {
      console.log(err);
      res.status(403).send(`Token verified failed: ${err}`);
      return;
    }
    const decodedToken = jwt.decode(token);
    // attach the user information
    req.user_email = decoded.user_email;
    req.user_id = decoded.user_id;
    next();
  });
};

module.exports = verifyToken;
