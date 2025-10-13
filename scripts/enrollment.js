const enrollmentEndpoint = "http://localhost/Enrollment-Management-System/php/enrollment.php"
const studentIdInput = document.querySelector('#student_id_input');
const sectionIdInput = document.querySelector('#section_id_input');
const dateEnrolledInput = document.querySelector('#date_enrolled_input');
const statusInput = document.querySelector('#status_input');
const letterGradeInput = document.querySelector('#letter_grade_input');
const enrollmentTable = document.querySelector("#table_body_enrollment");

function checkField() {
  const addEnrollmentBtn = document.querySelector('#add_enrollment_btn');

  if(studentIdInput.value.trim().length &&
      sectionIdInput.value.trim().length &&
      dateEnrolledInput.value.trim().length &&
      statusInput.value.trim().length &&
      letterGradeInput.value.trim().length
  ) {
    addEnrollmentBtn .disabled = false;
  } else {
    addEnrollmentBtn .disabled = true;
  }
}

function displayEnrollments() {
  fetch(enrollmentEndpoint)
  .then((response) => response.json())
  .then((enrollments)=> {
    enrollmentTable.innerHTML = "";

    for(const enrollment of enrollments) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${enrollment.enrollment_id}</td>
        <td>${enrollment.student_id}</td>
        <td>${enrollment.section_id}</td>
        <td>${enrollment.date_enrolled}</td>
        <td>${enrollment.status}</td>
        <td>${enrollment.letter_grade}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editEnrollment(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteEnrollment(this)">
            Delete
          </button>
        </td>
      `
      enrollmentTable.append(row);
    }
  });
}

// Add new department
function addEnrollment() {
  fetch(enrollmentEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `student_id=${studentIdInput.value}&` +
          `section_id=${sectionIdInput.value}&` +
          `date_enrolled=${dateEnrolledInput.value}&` +
          `status=${statusInput.value}&letter_grade=${letterGradeInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayEnrollments(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit a department
function editEnrollment(button) {
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
      enrollment_id: cells[0].innerHTML, 
      student_id: cells[1].innerHTML,
      section_id: cells[2].innerHTML,
      date_enrolled: cells[3].innerHTML,
      status: cells[4].innerHTML,
      letter_grade: cells[5].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(enrollmentEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `enrollment_id=${updatedRow[0].enrollment_id}&` +
        `student_id=${updatedRow[0].student_id}&` +
        `section_id=${updatedRow[0].section_id}&` +
        `date_enrolled=${updatedRow[0].date_enrolled}&` +
        `status=${updatedRow[0].status}&letter_grade=${updatedRow[0].letter_grade}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayEnrollments();
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
function deleteEnrollment(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const enrollmentId = cells[0].innerHTML;
  
  fetch(enrollmentEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `enrollment_id=${enrollmentId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayEnrollments();
  })
}

function searchEnrollment() {
  const searchInput = document.querySelector('#search_input');

  fetch(enrollmentEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((enrollments)=> {
    if(!enrollments || enrollments.length === 0) {
      enrollmentTable.innerHTML = "No Data Found.";
      return;
    }

    enrollmentTable.innerHTML = "";

    for(const enrollment of enrollments) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${enrollment.enrollment_id}</td>
        <td>${enrollment.student_id}</td>
        <td>${enrollment.section_id}</td>
        <td>${enrollment.date_enrolled}</td>
        <td>${enrollment.status}</td>
        <td>${enrollment.letter_grade}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editEnrollment(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteEnrollment(this)">
            Delete
          </button>
        </td>
      `
      enrollmentTable.append(row);
    }
  });
}

// Display Enrollments to the table.
displayEnrollments();