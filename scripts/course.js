const courseEndpoint = "http://localhost/Enrollment-Management-System/php/course.php";

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
          class="btn btn-warning"
          onclick="editCourse(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
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

  fetch(courseEndpoint, {
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
    clearInput();
    displayCourses(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit Course
function editCourse(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const isEditable = cells[0].contentEditable === "true";
  const updatedRow = [];

  cells.forEach(cell => {
    // toggles editable cell.
    cell.contentEditable = isEditable ? 'false' : 'true';
  });

  // appends the array.
  updatedRow.push({
      course_id: cells[0].innerHTML, 
      course_code: cells[1].innerHTML,
      course_title: cells[2].innerHTML,
      units: cells[3].innerHTML,
      lecture_hours: cells[4].innerHTML,
      lab_hours: cells[5].innerHTML,
      dept_id: cells[6].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(courseEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `course_id=${updatedRow[0].course_id}&` +
        `course_code=${updatedRow[0].course_code}&` +
        `course_title=${updatedRow[0].course_title}&` +
        `units=${updatedRow[0].units}&lecture_hours=${updatedRow[0].lecture_hours}&` +
        `lab_hours=${updatedRow[0].lab_hours}&dept_id=${updatedRow[0].dept_id}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayCourses();
    });

    updatedRow.length = 0; // clear the array.
  } else {
    // Edit mode
    button.textContent = "Save";
    cells[0].focus();
    updatedRow.length = 0; // clear the array.
  }
}

// Delete Course
function deleteRow(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const courseId = cells[0].innerHTML;
  
  fetch(courseEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `course_id=${courseId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayCourses(); // updates course table
  })
}

// Clear the input fields.
function clearInput() {
  const courseCodeInput = document.querySelector('#course_code_input');
  const courseTitleInput = document.querySelector('#course_title_input');
  const unitsInput = document.querySelector('#units_input');
  const lectureHrsInput = document.querySelector('#lecture_hrs_input');
  const labHrsInput = document.querySelector('#lab_hrs_input');
  const departmentIdInput = document.querySelector('#dept_id_input');

  courseCodeInput.value = "";
  courseTitleInput.value = "";
  unitsInput.value = "";
  lectureHrsInput.value = "";
  labHrsInput.value = "";
  departmentIdInput.value = "";
}

// Display courses inside the table
displayCourses();