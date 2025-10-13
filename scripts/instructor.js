const instructorEndpoint = "http://localhost/Enrollment-Management-System/php/instructor.php"
const instructorTable = document.querySelector("#table_body_instructor");
const instructorTableContainer = document.querySelector("#instructor_table");
const lastNameInput = document.querySelector('#last_name_input');
const firstNameInput = document.querySelector('#first_name_input');
const emailInput = document.querySelector('#email_input');
const departmentIdInput = document.querySelector('#dept_id_input');

function checkField() {
  const addInstructorBtn = document.querySelector('#add_instructor_btn');

  if(lastNameInput.value.trim().length &&
      firstNameInput.value.trim().length &&
      emailInput.value.trim().length &&
      departmentIdInput.value.trim().length
  ) {
    addInstructorBtn .disabled = false;
  } else {
    addInstructorBtn .disabled = true;
  }
}

function displayInstructors() {
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
  fetch(instructorEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `last_name=${lastNameInput.value}&` +
          `first_name=${firstNameInput.value}&` +
          `email=${emailInput.value}&dept_id=${departmentIdInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    Swal.fire("Success", `${responseText}`, "success");
    displayInstructors(); // updates the table
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
      Swal.fire("Success", `${responseText}`, "success");
      displayInstructors();
    });

    updatedRow.length = 0; // clear the array.
  } else {
    // Edit mode
    button.textContent = "Save";
    cells[0].focus();

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      icon: "info",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast'
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'info',
      title: 'Edit Mode Activated'
    });

    updatedRow.length = 0; // clear the array.
  }
}

// Delete a department
function deleteInstructor(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const instructorId= cells[0].innerHTML;

  Swal.fire({
    title: "Do you want to delete this data?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(instructorEndpoint, {
        method: 'DELETE',
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        body: `instructor_id=${instructorId}`,
      })
      .then((response) => response.text())
      .then(() => {
        Swal.fire("Deleted", "", "success");
        displayInstructors();
      })
    }
  });
}

function searchInstructor() {
  const searchInput = document.querySelector('#search_input');

  fetch(instructorEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((instructors)=> {
    if(!instructors || instructors.length === 0) {
      instructorTable.innerHTML = "No Data Found.";
      return;
    }

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

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = instructorTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Instructors" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Instructors"];

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
  XLSX.writeFile(file, `instructors[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF(); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "instructor_id" },
    { header: "Last Name", dataKey: "last_name" },
    { header: "First Name", dataKey: "first_name" },
    { header: "Email", dataKey: "email" },
    { header: "Department ID", dataKey: "department_id" }
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#instructor_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      instructor_id: cells[0].innerText,
      last_name: cells[1].innerText,  // corresponds to Course Code
      first_name: cells[2].innerText,  // corresponds to Course Name
      email: cells[3].innerText,
      department_id: cells[4].innerText
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`courses[${dateToday}].pdf`);
}

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(instructorEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
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

// Display instructors to the table.
displayInstructors();