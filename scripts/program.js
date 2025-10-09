const programEndpoint = "http://localhost/Enrollment-Management-System/php/program.php"

function displayPrograms() {
  const programTable = document.querySelector("#table_body_program");

  fetch(programEndpoint)
  .then((response) => response.json())
  .then((programs)=> {
    programTable.innerHTML = "";

    for(const program of programs) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${program.program_id}</td>
        <td>${program.program_code}</td>
        <td>${program.program_name}</td>
        <td>${program.dept_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editProgram(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteProgram(this)">
            Delete
          </button>
        </td>
      `
      programTable.append(row);
    }
  });
}

// Add new department
function addProgram() {
  const programCodeInput = document.querySelector('#program_code_input');
  const programNameInput = document.querySelector('#program_name_input');
  const departmentIdInput = document.querySelector('#dept_id_input');

  fetch(programEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `program_code=${programCodeInput.value}&` +
          `program_name=${programNameInput.value}&` +
          `dept_id=${departmentIdInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayPrograms(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit a department
function editProgram(button) {
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
      program_id: cells[0].innerHTML, 
      program_code: cells[1].innerHTML,
      program_name: cells[2].innerHTML,
      dept_id: cells[3].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(programEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `program_id=${updatedRow[0].program_id}&` +
        `program_code=${updatedRow[0].program_code}&` +
        `program_name=${updatedRow[0].program_name}&` +
        `dept_id=${updatedRow[0].dept_id}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayPrograms();
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
function deleteProgram(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const programId = cells[0].innerHTML;
  
  fetch(programEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `program_id=${programId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayPrograms();
  })
}

// Display instructors to the table.
displayPrograms();