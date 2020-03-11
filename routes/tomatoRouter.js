const express = require("express");
const router = express.Router();
const sha256 = require("sha256");
const chalk = require("chalk");

router.post("/create", (req, res, next) => {
  const { user_email, user_id } = req;
  let {
    projectId = null,
    tomatoTitle = "",
    tomatoDescription = "",
    startAt = "",
    endAt = ""
  } = req.body;
  // check data
  if (
    tomatoTitle === "" ||
    tomatoDescription === "" ||
    startAt === "" ||
    endAt === ""
  ) {
    res.status(400).send("missing information to create a tomato record");
  }
  // sanitize data
  projectId = req.sanitize(projectId);
  tomatoTitle = req.sanitize(tomatoTitle);
  // TODO: need to support rich text
  tomatoDescription = req.sanitize(tomatoDescription);
  startAt = req.sanitize(startAt);
  endAt = req.sanitize(endAt);
  const createTomato = `insert into tomatos (user_id, project_id, tomato_title, tomato_description, start_at, end_at) values 
  ('${user_id}', '${projectId}', '${tomatoTitle}', '${tomatoDescription}', FROM_UNIXTIME(${startAt} * 0.001), FROM_UNIXTIME(${endAt} * 0.001))`;
});

module.exports = router;
