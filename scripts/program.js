const programEndpoint = "http://localhost/Enrollment-Management-System/php/program.php"
const programCodeInput = document.querySelector('#program_code_input');
const programNameInput = document.querySelector('#program_name_input');
const departmentIdInput = document.querySelector('#dept_id_input');
const programTable = document.querySelector("#table_body_program");
const programTableContainer = document.querySelector("#program_table");

function checkField() {
  const addProgramBtn = document.querySelector('#add_program_btn');

  if(programCodeInput.value.trim().length &&
      programNameInput.value.trim().length &&
      departmentIdInput.value.trim().length
  ) {
    addProgramBtn.disabled = false;
  } else {
    addProgramBtn.disabled = true;
  }
}

function displayPrograms() {
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

function searchProgram() {
  const searchInput = document.querySelector('#search_input');

  fetch(programEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((programs)=> {
    if(!programs || programs.length === 0) {
      programTable.innerHTML = "No Data Found.";
      return;
    }

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

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = programTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Programs" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Programs"];

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
  XLSX.writeFile(file, `programs[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "program_id" },
    { header: "Program Code", dataKey: "program_code" },
    { header: "Program Name", dataKey: "program_name" },
    { header: "Department ID", dataKey: "dept_id" },
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#program_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      program_id: cells[0].innerText,
      program_code: cells[1].innerText,
      program_name: cells[2].innerText,  
      dept_id: cells[3].innerText
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`programs[${dateToday}].pdf`);
}

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(programEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
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

// Display instructors to the table.
displayPrograms();