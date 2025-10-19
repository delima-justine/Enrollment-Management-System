const studentEndpoint = "http://localhost/Enrollment-Management-System/php/student.php"
const studentNumInput = document.querySelector('#student_num_input');
const lastNameInput = document.querySelector('#last_name_input');
const firstNameInput = document.querySelector('#first_name_input'); 
const middleNameInput = document.querySelector('#middle_name_input');
const emailInput = document.querySelector('#email_input');
const genderInput = document.querySelector('#gender_input');
const yearLevelInput = document.querySelector('#year_level_input');
const programIdInput = document.querySelector('#program_id_input');
const birthdateInput = document.querySelector('#birthdate_input');
const studTable = document.querySelector("#table_body_student");
const studTableContainer = document.querySelector('#student_table');

function checkField() {
  const addStudentBtn = document.querySelector('#add_student_btn');

  if(studentNumInput.value.trim().length &&
      lastNameInput.value.trim().length &&
      emailInput.value.trim().length &&
      genderInput.value.trim().length &&
      yearLevelInput.value.trim().length &&
      programIdInput.value.trim().length &&
      birthdateInput.value.trim().length
  ) {
    addStudentBtn.disabled = false;
  } else {
    addStudentBtn.disabled = true;
  }
}

function resetFields() {
  const myForm = document.querySelector('#form_container');
  const inputFields = myForm.querySelectorAll('input');

  inputFields.forEach(field => {
    field.value = '';
  })
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
        <td>${student.middle_name}</td>
        <td>${student.email}</td>
        <td>${student.birthdate}</td>
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
          `year_level=${yearLevelInput.value}&program_id=${programIdInput.value}&` +
          `middle_name=${middleNameInput.value}&birthdate=${birthdateInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    Swal.fire("Success", `${responseText}`, "success");
    resetFields(); // clear fields
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
      middle_name: cells[4].innerHTML,
      email: cells[5].innerHTML,
      birthdate: cells[6].innerHTML,
      gender: cells[7].innerHTML,
      year_level: cells[8].innerHTML,
      program_id: cells[9].innerHTML,
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
          `year_level=${updatedRow[0].year_level}&program_id=${updatedRow[0].program_id}&` +
          `middle_name=${updatedRow[0].middle_name}&birthdate=${updatedRow[0].birthdate}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      Swal.fire("Success", `${responseText}`, "success");
      displayStudents();
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

// Delete Student
function deleteStudent(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const studentId = cells[0].innerHTML;

  Swal.fire({
    title: "Do you want to delete this data?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
        fetch(studentEndpoint, {
          method: 'DELETE',
          headers: {
            "Content-type": "application/x-www-form-urlencoded",
          },
          body: `student_id=${studentId}`,
        })
        .then((response) => response.text())
        .then(() => {
          Swal.fire("Deleted", "", "success");
          displayStudents();
      })
    }
  });
}

function searchStudentId() {
  const searchInput = document.querySelector('#search_input');

  fetch(studentEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((students)=> {
    if(!students || students.length === 0) {
      studTable.innerHTML = "No Data Found.";
      return;
    }
    
    studTable.innerHTML = "";

    for(const student of students) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.student_no}</td>
        <td>${student.last_name}</td>
        <td>${student.first_name}</td>
        <td>${student.middle_name}</td>
        <td>${student.email}</td>
        <td>${student.birthdate}</td>
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

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = studTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Students" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Students"];

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
  XLSX.writeFile(file, `students[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "student_id" },
    { header: "Student No.", dataKey: "student_no" },
    { header: "Last Name", dataKey: "last_name" },
    { header: "First Name", dataKey: "first_name" },
    { header: "Middle Name", dataKey: "middle_name"},
    { header: "Email", dataKey: "email" },
    { header: "Birthdate", dataKey: "birthdate" },
    { header: "Gender", dataKey: "gender" },
    { header: "Year Level", dataKey: "year_level" },
    { header: "Program ID", dataKey: "program_id" }
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#student_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      student_id: cells[0].innerText,
      student_no: cells[1].innerText,  
      last_name: cells[2].innerText, 
      first_name: cells[3].innerText,
      middle_name: cells[4].innerText,
      email: cells[5].innerText,
      birthdate: cells[6].innerText,
      gender: cells[7].innerText,
      year_level: cells[8].innerText,
      program_id: cells[9].innerText
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`students[${dateToday}].pdf`);
}

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(studentEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
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
        <td>${student.middle_name}</td>
        <td>${student.email}</td>
        <td>${student.birthdate}</td>
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