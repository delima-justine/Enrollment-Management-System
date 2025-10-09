const instructorEndpoint = "http://localhost/Enrollment-Management-System/php/instructor.php"

function displayInstructors() {
  const instructorTable = document.querySelector("#table_body_instructor");

  fetch(instructorEndpoint)
  .then((response) => response.json())
  .then((instructors)=> {
    instructorTable.innerHTML = "";

    for(const instructor of instructors) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${instructor.instructor_id}</td>
        <td>${instructor.last_name}</td>
        <td>${instructor.first_name}</td>
        <td>${instructor.email}</td>
        <td>${instructor.dept_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editInstructor(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteInstructor(this)">
            Delete
          </button>
        </td>
      `
      instructorTable.append(row);
    }
  });
}

// Add new department
function addInstructor() {
  const lastNameInput = document.querySelector('#last_name_input');
  const firstNameInput = document.querySelector('#first_name_input');
  const emailInput = document.querySelector('#email_input');
  const departmentIdInput = document.querySelector('#dept_id_input');

  fetch(instructorEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `last_name=${lastNameInput.value}&` +
          `first_name=${firstNameInput.value}&` +
          `email=${emailInput.value}&dept_id="${departmentIdInput.value}"`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayDepartments(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit a department
function editInstructor(button) {
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
      instructor_id: cells[0].innerHTML, 
      last_name: cells[1].innerHTML,
      first_name: cells[2].innerHTML,
      email: cells[3].innerHTML,
      dept_id: cells[4].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(instructorEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `instructor_id=${updatedRow[0].instructor_id}&` +
        `last_name=${updatedRow[0].last_name}&` +
        `first_name=${updatedRow[0].first_name}&` +
        `email=${updatedRow[0].email}&dept_id=${updatedRow[0].dept_id}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayInstructors();
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
function deleteInstructor(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const instructorId= cells[0].innerHTML;
  
  fetch(instructorEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `dept_id=${instructorId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayInstructors();
  })
}

// Display instructors to the table.
displayInstructors();