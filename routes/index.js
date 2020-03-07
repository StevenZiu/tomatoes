const express = require('express');
const router = express.Router();
const authRouter = require('./authRouter')

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.use('/auth', authRouter)

module.exports = router;