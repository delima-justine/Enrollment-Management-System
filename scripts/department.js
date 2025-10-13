const departmentEndpoint = "http://localhost/Enrollment-Management-System/php/department.php"
const deptCodeInput = document.querySelector('#department_code_input');
const deptNameInput = document.querySelector('#department_name_input');
const deptTable = document.querySelector("#table_body_dept");
const deptTableContainer = document.querySelector('#dept_table');

function checkField() {
  const addDepartmentBtn = document.querySelector('#add_dept_btn');

  if(deptCodeInput.value.trim().length &&
      deptNameInput.value.trim().length
  ) {
    addDepartmentBtn.disabled = false;
  } else {
    addDepartmentBtn.disabled = true;
  }
}

function displayDepartments() {
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

function searchDepartment() {
  const searchInput = document.querySelector('#search_input');

  fetch(departmentEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((departments)=> {
    if(!departments || departments.length === 0) {
      deptTable.innerHTML = "No Data Found.";
      return;
    }

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

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = deptTableContainer.cloneNode(true);

  // Remove Edit and Delete columns from header
  const headerRow = clonedTable.querySelector("thead tr");
  headerRow.deleteCell(-1); // Delete last cell (Delete)
  headerRow.deleteCell(-1); // Delete second last cell (Edit)

  // Remove Edit and Delete cells from each row
  const rows = clonedTable.querySelectorAll("tbody tr");
  rows.forEach(row => {
    row.deleteCell(-1); // Delete last cell (Delete)
    row.deleteCell(-1); // Delete second last cell (Edit)
  });

  // Convert cleaned table to workbook
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Departments" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Departments"];

  // Auto column width
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const colWidths = data[0].map((_, colIndex) => {
    const maxLength = data.reduce((acc, row) => {
      const cell = row[colIndex] ? row[colIndex].toString() : "";
      return Math.max(acc, cell.length);
    }, 10);
    return { wch: maxLength + 2 };
  });
  ws['!cols'] = colWidths;

  // Export file
  XLSX.writeFile(file, `departments[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "department_id" },
    { header: "Department Code", dataKey: "department_code" },
    { header: "Department Name", dataKey: "department_name" }
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#dept_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      department_id: cells[0].innerText,
      department_code: cells[1].innerText,  // corresponds to Course Code
      department_name: cells[2].innerText,  // corresponds to Course Name
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`departments[${dateToday}].pdf`);
}

// Display departments to the table.
displayDepartments();