const courseEndpoint = "http://localhost/student_enrollment_system/php/course.php";

function displayCourses() {
  const courseTable = document.querySelector("#table_body_course");

  fetch(courseEndpoint)
  .then((response) => response.json())
  .then((courseList)=> {
    courseTable.innerHTML = ""

    for(const course of courseList) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.course_code}</td>
        <td>${course.course_title}</td>
        <td>${course.units}</td>
        <td>${course.lecture_hours}</td>
        <td>${course.lab_hours}</td>
        <td>${course.dept_id}</td>
        <td><button 
          type="button"
          onclick="editTable(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          onClick="deleteRow(this)">
            Delete
          </button>
        </td>
      `
      courseTable.append(row);
    }
  });
}

function addCourse() {
  const courseCodeInput = document.querySelector('#course_code_input');
  const courseTitleInput = document.querySelector('#course_title_input');
  const unitsInput = document.querySelector('#units_input');
  const lectureHrsInput = document.querySelector('#lecture_hrs_input');
  const labHrsInput = document.querySelector('#lab_hrs_input');
  const departmentIdInput = document.querySelector('#dept_id_input');

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `course_code=${courseCodeInput.value}&` +
          `course_title=${courseTitleInput.value}&` +
          `units=${unitsInput.value}&lecture_hours=${lectureHrsInput.value}&` +
          `lab_hours=${labHrsInput.value}&dept_id=${departmentIdInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayCourses(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Display courses inside the table
displayCourses();