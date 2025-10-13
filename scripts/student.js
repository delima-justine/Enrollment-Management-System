const studentEndpoint = "http://localhost/Enrollment-Management-System/php/student.php"
const studentNumInput = document.querySelector('#student_num_input');
const lastNameInput = document.querySelector('#last_name_input');
const firstNameInput = document.querySelector('#first_name_input'); 
const emailInput = document.querySelector('#email_input');
const genderInput = document.querySelector('#gender_input');
const yearLevelInput = document.querySelector('#year_level_input');
const programIdInput = document.querySelector('#program_id_input');
const studTable = document.querySelector("#table_body_student");
const studTableContainer = document.querySelector('#student_table');

function checkField() {
  const addStudentBtn = document.querySelector('#add_student_btn');

  if(studentNumInput.value.trim().length &&
      lastNameInput.value.trim().length &&
      emailInput.value.trim().length &&
      genderInput.value.trim().length &&
      yearLevelInput.value.trim().length &&
      programIdInput.value.trim().length
  ) {
    addStudentBtn.disabled = false;
  } else {
    addStudentBtn.disabled = true;
  }
}

function displayStudents() {
  fetch(studentEndpoint)
  .then((response) => response.json())
  .then((students)=> {
    studTable.innerHTML = "";

    for(const student of students) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.student_no}</td>
        <td>${student.last_name}</td>
        <td>${student.first_name}</td>
        <td>${student.email}</td>
        <td>${student.gender}</td>
        <td>${student.year_level}</td>
        <td>${student.program_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editStudent(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteStudent(this)">
            Delete
          </button>
        </td>
      `
      studTable.append(row);
    }
  });
}

function addStudent() {
  fetch(studentEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `student_no=${studentNumInput.value}&` +
          `last_name=${lastNameInput.value}&first_name=${firstNameInput.value}&` +
          `email=${emailInput.value}&gender=${genderInput.value}&` +
          `year_level=${yearLevelInput.value}&program_id=${programIdInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayStudents(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit Student
function editStudent(button) {
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
      student_id: cells[0].innerHTML, 
      student_no: cells[1].innerHTML,
      last_name: cells[2].innerHTML,
      first_name: cells[3].innerHTML,
      email: cells[4].innerHTML,
      gender: cells[5].innerHTML,
      year_level: cells[6].innerHTML,
      program_id: cells[7].innerHTML,
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(studentEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `student_id=${updatedRow[0].student_id}&student_no=${updatedRow[0].student_no}&` +
          `last_name=${updatedRow[0].last_name}&first_name=${updatedRow[0].first_name}&` +
          `email=${updatedRow[0].email}&gender=${updatedRow[0].gender}&` +
          `year_level=${updatedRow[0].year_level}&program_id=${updatedRow[0].program_id}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayStudents();
    });

    updatedRow.length = 0; // clear the array.
  } else {
    // Edit mode
    button.textContent = "Save";
    cells[0].focus();
    updatedRow.length = 0; // clear the array.
  }
}

// Delete Student
function deleteStudent(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const studentId = cells[0].innerHTML;
  
  fetch(studentEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `student_id=${studentId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayStudents();
  })
}

function searchStudentId() {
  const searchInput = document.querySelector('#search_input');

  fetch(studentEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((students)=> {
    
    studTable.innerHTML = "";

    for(const student of students) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.student_no}</td>
        <td>${student.last_name}</td>
        <td>${student.first_name}</td>
        <td>${student.email}</td>
        <td>${student.gender}</td>
        <td>${student.year_level}</td>
        <td>${student.program_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editStudent(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteStudent(this)">
            Delete
          </button>
        </td>
      `
      studTable.append(row);
    }
  });
}

// Display students
displayStudents();