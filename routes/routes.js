// Define express
const express = require("express");
const path = require('path');
coursesRoutes = require("./courses");

// Define routes
const router = express.Router();
router.get("/", (req, res) => {
  res.sendFile(path.resolve('client/index.html'));
});

// Courses CRUD
router.get("/courses", coursesRoutes.read_courses);
router.post("/courses", coursesRoutes.create_courses);
router.put("/courses/:id", coursesRoutes.update_courses);
router.delete("/courses/:id", coursesRoutes.delete_courses);

// Students CRUD
router.post("/courses/:courseId/students", coursesRoutes.create_students);
router.put("/courses/:courseId/students/:id", coursesRoutes.update_students);
router.delete("/courses/:courseId/students/:id", coursesRoutes.delete_students);

module.exports = router;
