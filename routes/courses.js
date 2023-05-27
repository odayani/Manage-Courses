// Define fs
const fs = require('fs');
const dataPath = './data/data.json';

const state = { courses: {}, hasFetchedCourses: false };

// helpers
const updateCoursesFile = async (res) => {
  try {
    await fs.writeFileSync(dataPath, JSON.stringify(state.courses, null, 2), 'utf8')
    return res.status(200).send('action perfomed successfully');
  } catch (error) {
    return res.status(400).send('could not perform action');
  }
}

const fetch_courses = async () => {
  try {
    const courses = await fs.readFileSync(dataPath, 'utf8')
    state.courses = JSON.parse(courses);
    state.hasFetchedCourses = true;
  } catch (error) {
    return res.status(400).send('could not fetch courses');
  }
}

// CRUD exports

const read_courses = async (req, res) => {
  if (!state.hasFetchedCourses) { // means courses object is empty - fetch data
    try {
      await fetch_courses()
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  return res.status(200).send(state.courses);
}

const create_courses = async (req, res) => {
  // load state in case state isn't loaded
  try {
    if (!state.hasFetchedCourses) { await fetch_courses(); }

    const course = req.body;

    // Validate inputs
    if (!course.id || !course.name || !course.lecturer ||
      !course.start_date || !course.end_date || !course.prerequisite_course) {
      return res.status(400).send('Missing data, please check your input and try again..');
    }
    // validate that course id is not exists
    else if (state.courses[req.body.id]) {
      return res.status(403).send('Course ID is already taken. try again with other ID.');
    }
    // save course in db
    else {
      state.courses[course.id] = course;
      await updateCoursesFile(res)
    }
  } catch (error) {
    console.log(error)
  }
}

const update_courses = async (req, res) => {
  // load state in case state isn't loaded
  if (!state.hasFetchedCourses) { await fetch_courses(); }

  const course = req.body;

  // Validate inputs
  if (!course.id || !course.name || !course.lecturer ||
    !course.start_date || !course.end_date || !course.prerequisite_course || !course.students) {
    return res.status(400).send('Missing data, please check your input and try again..');
  }
  else if (!state.courses[course.id]) {
    return res.status(400).send('No course with given id');
  }
  else {
    state.courses[course.id] = course;
    await updateCoursesFile(res)
  }

}

const delete_courses = async (req, res) => {
  // load state in case state isn't loaded
  if (!state.hasFetchedCourses) { await fetch_courses(); }

  const courseId = req.params.id;

  if (state.courses[courseId]) {
    // delete
    delete state.courses[courseId]
    // write again
    await updateCoursesFile(res)

  } else {
    return res.status(403).send('Course ID is not exists. try again with other ID.'
    );
  }
}

const create_students = async (req, res) => {
  // load state in case state isn't loaded
  try {
    if (!state.hasFetchedCourses) { await fetch_courses(); }

    const courseId = req.params.courseId;
    const student = req.body;

    // Validate inputs
    if (!student.id || !student.first_name || !student.second_name || !student.image || student.score == undefined) {
      return res.status(400).send('Missing data, please check your input and try again..');
    }
    // validate that course id is exists
    else if (!state.courses[courseId]) {
      return res.status(403).send('Course ID does not exists.');
    }
    // validate that student id is not exists under course id
    else if (state.courses[courseId].students[student.id]) {
      return res.status(403).send('Stoudent ID is already taken. try again with other ID.');
    }
    // save course in db
    else {
      state.courses[courseId].students[student.id] = student;
      await updateCoursesFile(res)
    }
  } catch (error) {
    console.log(error)
  }
}

const update_students = async (req, res) => {
  // load state in case state isn't loaded
  if (!state.hasFetchedCourses) { await fetch_courses(); }
  
  const courseId = req.params.courseId;
  const student = req.body;

  // Validate inputs
  if (!student.id || !student.first_name || !student.second_name || !student.image || student.score == undefined) {
    return res.status(400).send('Missing data, please check your input and try again..');
  }
  // validate that course id is exists
  
  else if (!state.courses[courseId]) {
    return res.status(403).send('Course ID does not exists.');
  }
  // validate that student id is exists under course id
  else if (!state.courses[courseId].students[student.id]) {
    return res.status(403).send('Student ID is not exists under course id.');
  }
  // Change values
  else {
    state.courses[courseId].students[student.id] = student;
    await updateCoursesFile(res)
  }
}

const delete_students = async (req, res) => {
  // load state in case state isn't loaded
  if (!state.hasFetchedCourses) { await fetch_courses(); }

  const studentId = req.params.id;
  const courseId = req.params.courseId;

  if (state.courses[courseId].students[studentId]) {
    // delete
    delete state.courses[courseId].students[studentId]
    // write again
    await updateCoursesFile(res)
  } else {
    return res.status(403).send('Student Id does not exists under Course ID is not exists. try again with other ID.');
  }
}

module.exports = {
  read_courses,
  create_courses,
  update_courses,
  delete_courses,
  create_students,
  update_students,
  delete_students
};
