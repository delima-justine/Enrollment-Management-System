const coursePrerequisiteEndpoint = "http://localhost/Enrollment-Management-System/php/course_prerequisite.php"
const courseIdInput = document.querySelector('#course_id_input');
const prereqCourseInput = document.querySelector('#prerequisite_course_id_input');
const coursePrerequisiteTable = document.querySelector("#table_body_course_prereq");

function checkField() {
  const addCoursePrereqBtn = document.querySelector('#add_course_prereq_btn');

  if(courseIdInput.value.trim().length &&
      prereqCourseInput.value.trim().length
  ) {
    addCoursePrereqBtn.disabled = false;
  } else {
    addCoursePrereqBtn.disabled = true;
  }
}

function displayPrerequisiteCourses() {
  fetch(coursePrerequisiteEndpoint)
  .then((response) => response.json())
  .then((courses)=> {
    coursePrerequisiteTable.innerHTML = "";

    for(const course of courses) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.prereq_course_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editCoursePrerequisite(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteCoursePrerequisite(this)">
            Delete
          </button>
        </td>
      `
      coursePrerequisiteTable.append(row);
    }
  });
}

// Add new dourse prereq
function addCoursePrerequisite() {
  fetch(coursePrerequisiteEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `course_id=${courseIdInput.value}&` +
          `prereq_course_id=${prereqCourseInput.value}&`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayPrerequisiteCourses(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit a department
function editCoursePrerequisite(button) {
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
      prereq_course_id: cells[1].innerHTML,
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(coursePrerequisiteEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `course_id=${updatedRow[0].course_id}&` +
        `prereq_course_id=${updatedRow[0].prereq_course_id}&`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayPrerequisiteCourses();
    });

    updatedRow.length = 0; // clear the array.
  } else {
    // Edit mode
    button.textContent = "Save";
    cells[0].focus();
    updatedRow.length = 0; // clear the array.
  }
}

// Delete a department
function deleteCoursePrerequisite(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const courseId = cells[0].innerHTML;
  
  fetch(coursePrerequisiteEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `course_id=${courseId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayPrerequisiteCourses();
  })
}

// Display instructors to the table.
displayPrerequisiteCourses();