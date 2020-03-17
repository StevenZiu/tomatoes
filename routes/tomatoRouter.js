const express = require("express");
const router = express.Router();

// create new tomato
router.post("/create", (req, res, next) => {
  const { user_email, user_id } = req;
  let {
    projectId = 0,
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
  // FIXME: better sanitizer, projectId is not sanitized
  // sanitize data
  tomatoTitle = req.sanitize(tomatoTitle);
  // TODO: need to support rich text
  tomatoDescription = req.sanitize(tomatoDescription);
  startAt = req.sanitize(startAt);
  endAt = req.sanitize(endAt);
  const db = req.app.db;
  const createTomato = `insert into tomatos (user_id, project_id, tomato_title, tomato_description, start_at, end_at) values 
  ('${user_id}', '${projectId}', '${tomatoTitle}', '${tomatoDescription}', FROM_UNIXTIME(${startAt} * 0.001), FROM_UNIXTIME(${endAt} * 0.001))`;
  db.query(createTomato, (err, result) => {
    if (err) {
      res.status(500).send("Server Error");
      console.log(err.sqlMessage);
    } else if (result.affectedRows === 1) {
      res.status(201).send("Tomato created");
    }
  });
});

// delete tomato by tomato id
router.delete("/", (req, res, next) => {
  const { tomatoId } = req.body;
  const user_id = req.user_id;
  const db = req.app.db;
  // only creator can delete the tomato or admin
  const deleteTomato = `delete from tomatos where tomato_id = '${tomatoId}' and user_id = '${user_id}'`;
  db.query(deleteTomato, (err, result) => {
    if (err) {
      res.status(500).send("server error");
      console.log(err.sqlMessage);
      return;
    } else if (result.affectedRows === 1) {
      res.status(201).send("deleted tomato");
      return;
    }
    res.status(201).send("target tomato not found");
  });
});

// FIXME: how to check update fields
// update tomato by tomato id
router.put("/", (req, res, next) => {
  const {
    tomatoTitle = null,
    tomatoDescription = null,
    tomatoId = null
  } = req.body;
  if (tomatoTitle !== null && tomatoDescription !== null && tomatoId !== null) {
    const db = req.app.db;
    const userId = req.user_id;
    const updateTomato = `update tomatos set tomato_title = '${tomatoTitle}', tomato_description = '${tomatoDescription}' where tomato_id = '${tomatoId}' and user_id = '${userId}'`;
    db.query(updateTomato, (err, result) => {
      if (err) {
        res.status(500).send("Server Error");
        console.log(err.sqlMessage);
      } else if (result.affectedRows === 1) {
        res.status(201).send("Tomato updated");
      } else {
        res.status(200).send("target tomato not found");
      }
    });
  } else {
    res.status(400).send("missing information");
  }
});

// get all tomatos by user id
router.get("/", (req, res, next) => {
  const user_id = req.user_id;
  const db = req.app.db;
  const getAllTomatos = `select * from tomatos where user_id = '${user_id}'`;
  db.query(getAllTomatos, (err, results) => {
    if (err) {
      res.status(500).send("Server error");
      console.log(err.sqlMessage);
    } else {
      res.status(200).send(results);
    }
  });
});

// get tomato by tomato id
router.get("/:tomatoId", (req, res, next) => {
  const user_id = req.user_id;
  const db = req.app.db;
  const tomatoId = req.params.tomatoId;
  const getAllTomatos = `select * from tomatos where user_id = '${user_id}' and tomato_id = '${tomatoId}'`;
  db.query(getAllTomatos, (err, results) => {
    if (err) {
      res.status(500).send("Server error");
      console.log(err.sqlMessage);
    } else {
      res.status(200).send(results);
    }
  });
});

// get all tomatos by project id
router.get("/project/:projectID", (req, res, next) => {
  const user_id = req.user_id;
  const db = req.app.db;
  const projectID = req.params.projectID;
  const getAllTomatos = `select * from tomatos where user_id = '${user_id}' and project_id = '${projectID}'`;
  db.query(getAllTomatos, (err, results) => {
    if (err) {
      res.status(500).send("Server error");
      console.log(err.sqlMessage);
    } else {
      res.status(200).send(results);
    }
  });
});

module.exports = router;
