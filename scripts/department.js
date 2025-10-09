const departmentEndpoint = "http://localhost/Enrollment-Management-System/php/department.php"

function displayDepartments() {
  const deptTable = document.querySelector("#table_body_dept");

  fetch(departmentEndpoint)
  .then((response) => response.json())
  .then((departments)=> {
    deptTable.innerHTML = "";

    for(const department of departments) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${department.dept_id}</td>
        <td>${department.dept_code}</td>
        <td>${department.dept_name}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editDepartment(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteDepartment(this)">
            Delete
          </button>
        </td>
      `
      deptTable.append(row);
    }
  });
}

// Add new department
function addDepartment() {
  const deptCodeInput = document.querySelector('#department_code_input');
  const deptNameInput = document.querySelector('#department_name_input');

  fetch(departmentEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `dept_code=${deptCodeInput.value}&` +
          `dept_name=${deptNameInput.value}&`
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
function editDepartment(button) {
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
      dept_id: cells[0].innerHTML, 
      dept_code: cells[1].innerHTML,
      dept_title: cells[2].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(departmentEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `dept_id=${updatedRow[0].dept_id}&` +
        `dept_code=${updatedRow[0].dept_code}&` +
        `dept_name=${updatedRow[0].dept_title}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayDepartments();
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
function deleteDepartment(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const deptId = cells[0].innerHTML;
  
  fetch(departmentEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `dept_id=${deptId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayDepartments();
  })
}

// Display departments to the table.
displayDepartments();