const express = require("express");
const router = express.Router();

// create project
router.post("/", (req, res, next) => {
  let { projectName = "", projectDescription = "" } = req.body;
  const db = req.app.db;
  const user_id = req.user_id;
  // check parameters
  if (projectDescription === "" || projectName === "") {
    res.status(400).send("missing information");
    return;
  }
  // santinize
  projectName = req.sanitize(projectName);
  projectDescription = req.sanitize(projectDescription);
  const createProject = `insert into projects (user_id, project_name, project_description) values ('${user_id}', '${projectName}', '${projectDescription}')`;
  db.query(createProject, (err, result) => {
    if (err) {
      res.status(500).send("Server error");
      console.log(err.sqlMessage);
    } else if (result.affectedRows === 1) {
      res.status(201).send("Project created");
    } else {
      res.status(200).send("project created failed, check db");
    }
  });
});

// delete project
router.delete("/", (req, res, next) => {
  let { projectId = "" } = req.body;
  const db = req.app.db;
  const user_id = req.user_id;
  // check parameters
  if (projectId === "") {
    res.status(400).send("missing information");
    return;
  }
  // santinize
  projectId = req.sanitize(projectId);
  // only the creator can delete the project
  const deleteProject = `delete from projects where user_id = '${user_id}' and project_id = '${projectId}'`;
  db.query(deleteProject, (err, result) => {
    if (err) {
      res.status(500).send("Server error");
      console.log(err.sqlMessage);
    } else if (result.affectedRows === 1) {
      res.status(201).send("Project deleted");
    } else {
      res.status(200).send("target project not found");
    }
  });
});

// update the project
router.put("/", (req, res, next) => {
  let { projectId = "", projectName = "", projectDescription = "" } = req.body;
  if (projectId === "" || projectDescription === "" || projectName === "") {
    res.status(400).send("missing information");
    return;
  }
  projectName = req.sanitize(projectName);
  projectDescription = req.sanitize(projectDescription);
  projectId = req.sanitize(projectId);
  const db = req.app.db;
  const user_id = req.user_id;
  const updateProject = `update projects set project_name = '${projectName}', project_description = '${projectDescription}' where project_id = '${projectId}' and user_id = '${user_id}'`;
  db.query(updateProject, (err, result) => {
    if (err) {
      res.status(500).send("server error");
      console.log(err.sqlMessage);
    } else if (result.affectedRows === 1) {
      res.status(200).send("project updated");
    } else {
      res.status(200).send("target project not found");
    }
  });
});

// get project
router.get("/", (req, res, next) => {
  const user_id = req.user_id;
  const getProject = `select * from projects where user_id = '${user_id}'`;
  const db = req.app.db;
  db.query(getProject, (err, result) => {
    if (err) {
      res.status(500).send("server error");
    } else {
      res.status(200).send(result);
    }
  });
});

module.exports = router;
