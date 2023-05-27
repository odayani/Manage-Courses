const coursesTable = document.getElementById('table1');
const studentsTable = document.getElementById('table2');

// state.actions === "add" | "edit" | "edit_student"
const state = { courses: {}, action: null, editCourseId: null, currentCourseStudent: {}, editStudentId: null };

// Holds the course data and return HTML code to fill it in the table
const getCourseTableRow = ({ id, name, lecturer, startDate, endDate, prerequisiteCourses }) => {
  return `<tr>
    <th scope="row">${id}</th>
    <td>${name}</td>
    <td>${lecturer}</td>
    <td>${startDate}</td>
    <td>${endDate}</td>
    <td>${prerequisiteCourses}</td>
    <td><button class="btn bg-primary text-white" data-bs-toggle="modal" data-bs-target="#manageStudentsModal"
    onClick="openManageStudentsModal('${id}')">Students list</button></td>
    <td><button data-bs-toggle="modal" data-bs-target="#courseModal"
    onclick="openEditCourseModal('${id}', '${name}', '${lecturer}', '${startDate}', '${endDate}', '${prerequisiteCourses}')"
    class="btn bg-primary text-white">Manage course</button></td>
    <td><button class="btn bg-danger text-white btn-sm" onclick="deleteCourse('${id}')">Delete</button></td>
    </tr>`
}

// Get courses data oneby one and fill the table 
const fillCoursesTable = () => {
  coursesTable.innerHTML = '';
  for (const courseId in state.courses) {
    let course = state.courses[courseId];
    let id = course.id;
    let name = course.name;
    let lecturer = course.lecturer;
    let startDate = course.start_date;
    let endDate = course.end_date;
    let prerequisiteCourses = course.prerequisite_course;
    let students = course.students;

    // Use the variables as needed
    const newContent = getCourseTableRow({ id, name, lecturer, startDate, endDate, prerequisiteCourses });
    coursesTable.innerHTML += newContent;
  }
}

// Get the HTML Tags from the input form
const getCourseInputTags = () => {
  const courseNumberTag = document.getElementById('courseNumber');
  const courseNameTag = document.getElementById('courseName');
  const lecturerNameTag = document.getElementById('lecturerName');
  const startDateTag = document.getElementById('startDate');
  const endDateTag = document.getElementById('endDate');
  const prerequisiteCoursesTag = document.getElementById('prerequisiteCourses');
  return { courseNumberTag, courseNameTag, lecturerNameTag, startDateTag, endDateTag, prerequisiteCoursesTag }
}

// Get the data that the user input in the form
const getCourseInputsValues = () => {
  const { courseNumberTag, courseNameTag, lecturerNameTag, startDateTag, endDateTag, prerequisiteCoursesTag } = getCourseInputTags();

  return {
    id: courseNumberTag.value.toString(),
    name: courseNameTag.value.toString(),
    lecturer: lecturerNameTag.value.toString(),
    start_date: startDateTag.value.toString(),
    end_date: endDateTag.value.toString(),
    prerequisite_course: prerequisiteCoursesTag.value.toString().split(','),
    students: {},
    
  }
}

// Clear the input tags
const clearCoursesInputTag = () => {
  const inputTags = getCourseInputTags();
  for (const key of Object.keys(inputTags)) {
    inputTags[key].value = '';
  }
}

// Close the add course form
const closeCourseModal = () => {
  const closeBtn = document.getElementById('closeAddModal')
  if (closeBtn) { closeBtn.click(); }
}

// Fill the data when user want to edit course
const fillCourseEditValues = (id, name, lecturer, startDate, endDate, prerequisiteCourses) => {
  const { courseNumberTag, courseNameTag, lecturerNameTag, startDateTag, endDateTag, prerequisiteCoursesTag } = getCourseInputTags();
  courseNumberTag.value = id;
  courseNameTag.value = name;
  lecturerNameTag.value = lecturer;
  startDateTag.value = startDate;
  endDateTag.value = endDate;
  prerequisiteCoursesTag.value = prerequisiteCourses;
}

// Disable the option to change the courseID
const setCourseInputDisable = (disabled) => {
  document.getElementById('courseNumber').disabled = disabled;
}

//Get the title tag of the form that will be open (course form \ students form)
const getTitleTags = () => {
  const titleTag = document.getElementById('courseModalTitle')
  const buttonTitleTag = document.getElementById('courseModalButton')
  return { titleTag, buttonTitleTag }
}

// Open the form to add new course
const openAddCourseModal = () => {
  state.action = 'add'
  const { titleTag, buttonTitleTag } = getTitleTags()
  titleTag.innerText = 'Add course'
  buttonTitleTag.innerText = 'Submit'
  setCourseInputDisable(false)
  clearCoursesInputTag()
}

// Open the form to add new course
const openEditCourseModal = (id, name, lecturer, startDate, endDate, prerequisiteCourses) => {
  state.action = 'edit'
  state.editCourseId = id;
  const { titleTag, buttonTitleTag } = getTitleTags()
  titleTag.innerText = 'Edit course'
  buttonTitleTag.innerText = 'Edit'
  setCourseInputDisable(true)
  fillCourseEditValues(id, name, lecturer, startDate, endDate, prerequisiteCourses)
}

// CRUD

// Get the courses from the server
const getExistsCourses = async () => {
  try {
    const response = await fetch('http://localhost:3001/courses');
    const body = await response.json()
    state.courses = body;
    fillCoursesTable();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Submit form based on state
const submitCourseForm = async () => {
  const method = state.action === "add" ? "POST" : "PUT";
  let route = 'http://localhost:3001/courses';
  if (state.action === "edit") {
    route += '/' + state.editCourseId;
  }
  console.log(route)
  await addEditCourse(method, route)
  state.action = null;
  state.editCourseId = null;
};

// Add/Edit Course
const addEditCourse = async (method, route) => {
  const courseValues = getCourseInputsValues()

  // Fetch
  const response = await fetch(route, {
    method,
    body: JSON.stringify(courseValues),
    headers: {
      Accept: 'application/json', 'Content-Type': 'application/json',
    },
  })
  closeCourseModal()

  if (response.status === 403) {
    alert('ID already exists');
  }
  else if (response.status === 400) {
    alert('Missing data, please check your and try again..');
  }
  else { // success
    state.courses[courseValues.id] = courseValues;
    fillCoursesTable();
  }
}

// Delete course
const deleteCourse = async (id) => {
  try {
    const response = await fetch('http://localhost:3001/courses/' + id, { method: 'DELETE' });
    if (response.status === 403) {
      alert('ID already exists');
    } else {
      delete state.courses[id]
      fillCoursesTable()
    }
  } catch (error) {
    alert('Could not delete...');
  }
}

// manage students
const setStudentIdInputDisable = (disabled) => {
  document.getElementById('studentId').disabled = disabled;
}

// Get the HTML form studentsID
const getStudentInputTags = () => {
  const studentIdTag = document.getElementById('studentId');
  const studentFirstNameTag = document.getElementById('studentFirstName');
  const studentSecondNameTag = document.getElementById('studentSecondName');
  const studentImageUrlTag = document.getElementById('studentImageUrl');
  const studentScoreTag = document.getElementById('studentScore');

  return { studentIdTag, studentFirstNameTag, studentSecondNameTag, studentImageUrlTag, studentScoreTag }
}

// Get the values of student from the form inputs
const getStudentInputsValues = () => {
  const { studentIdTag, studentFirstNameTag, studentSecondNameTag, studentImageUrlTag, studentScoreTag } = getStudentInputTags()

  return {
    id: studentIdTag.value.toString(),
    first_name: studentFirstNameTag.value.toString(),
    second_name: studentSecondNameTag.value.toString(),
    image: studentImageUrlTag.value.toString(),
    score: Number(studentScoreTag.value),
  }
}

// Clear the tags 
const clearStudentInputTag = () => {
  const inputTags = getStudentInputTags();
  for (const key of Object.keys(inputTags)) {
    inputTags[key].value = '';
  }
}

// Fill the 
// const fillStudentEditValues = ({ id, first_name, second_name, score, image }) => {
//   const { studentIdTag, studentFirstNameTag, studentSecondNameTag, studentImageUrlTag, studentScoreTag } = getStudentInputTags()

//   studentIdTag.value = id;
//   studentFirstNameTag.value = first_name;
//   studentSecondNameTag.value = second_name;
//   studentImageUrlTag.value = image;
//   studentScoreTag.value = score;
// }

// Close the add student form
const closeStudentsModal = () => {
  const closeBtn = document.getElementById('closeStudentsModal')
  if (closeBtn) {
    closeBtn.click();
  }
}

// Open the manage studnets form
const openManageStudentsModal = (courseId) => {
  clearStudentInputTag()
  state.editCourseId = courseId;
  state.currentCourseStudent = state.courses[courseId].students;
  setStudentIdInputDisable(false);
  fillStudentsTable();
}

// Holds HTML data of one student 
const getStudentTableRow = ({ id, first_name, second_name, score, image }) => {
  return `<tr>
    <th scope="row">${id}</th>
    <td><img classname="img-fluid" style="max-width: 100px;" src="${image}"/></td>
    <td>${first_name}</td>
    <td>${second_name}</td>
    <td>${score}</td>
    <td><button type="button" class="btn bg-danger text-white btn-sm" onclick="deleteStudent('${id}')">Delete</button></td>
    </tr>`
}
            // <td><button type="button" class="btn bg-primary text-white" onClick="fillEditStudentValues('${id}')">Edit</button></td>

// Fills the student table one by one 
const fillStudentsTable = () => {
  studentsTable.innerHTML = '';
  for (const studentId in state.currentCourseStudent) {
    const student = state.currentCourseStudent[studentId];
    // Use the variables as needed
    const newContent = getStudentTableRow(student)
    studentsTable.innerHTML += newContent;
  }
}

// Manage students data
const submitManageStudentsForm = async () => {
  const student = getStudentInputsValues()

  const method = state.action === "edit_student" ? "PUT" : "POST";
  let route = `http://localhost:3001/courses/${state.editCourseId}/students`;
  if (method === "PUT") {
    route += `/${student.id}`;
  }
  await addEditStudent(method, route, student);


  // onclose
  // state.currentCourseStudent = {}
  // state.editCourseId = null;
}

// Send POST request for add new student and make validation on the inputs
const addEditStudent = async (method, route, student) => {
  const { id, first_name, second_name, score, image } = student;

  state.currentCourseStudent[id] = { id, first_name, second_name, score, image }

  // Fetch
  const response = await fetch(route, {
    method,
    body: JSON.stringify({ id, first_name, second_name, score, image }),
    headers: {
      Accept: 'application/json', 'Content-Type': 'application/json',
    },
  })
  if (response.status === 403) {
    alert('ID already exists');
  }
  else if (response.status === 400) {
    alert('Missing data, please check your and try again..');
  }
  else { // success
    setStudentIdInputDisable(false);
    clearStudentInputTag();
    fillStudentsTable();

    state.editStudentId = null;
    state.action = null;

  }
}

// Send DELETE request for delete students from list
const deleteStudent = async (id) => {
  // fetch delete
  // send to server StudentId - id + courseId - state.courseId

  try {
    const route = `http://localhost:3001/courses/${state.editCourseId}/students/${id}`;
    const response = await fetch(route, { method: 'DELETE' });
    if (response.status === 403) {
      alert('ID already exists');
    } else {
      delete state.currentCourseStudent[id]
      fillStudentsTable();
    }
  } catch (error) {
    alert('Could not delete...');
  }
}
