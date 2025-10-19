const enrollmentEndpoint = "http://localhost/Enrollment-Management-System/php/enrollment.php"
const studentEndpoint = "http://localhost/Enrollment-Management-System/php/student.php"
const sectionEndpoint = "http://localhost/Enrollment-Management-System/php/section.php";
const studentIdInput = document.querySelector('#student_id_input');
const sectionIdInput = document.querySelector('#section_id_input');
const dateEnrolledInput = document.querySelector('#date_enrolled_input');
const statusInput = document.querySelector('#status_input');
const letterGradeInput = document.querySelector('#letter_grade_input');
const enrollmentTable = document.querySelector("#table_body_enrollment");
const enrollmentTableContainer = document.querySelector("#enrollment_table");

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
    Swal.fire("Success", `${responseText}`, "success");
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
      Swal.fire("Success", `${responseText}`, "success");
      displayEnrollments();
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
function deleteEnrollment(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const enrollmentId = cells[0].innerHTML;

  Swal.fire({
    title: "Do you want to delete this data?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
        fetch(enrollmentEndpoint, {
          method: 'DELETE',
          headers: {
            "Content-type": "application/x-www-form-urlencoded",
          },
          body: `enrollment_id=${enrollmentId}`,
        })
        .then((response) => response.text())
        .then(() => {
          Swal.fire("Deleted", "", "success");
          displayEnrollments();
      })
    }
  });
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

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = enrollmentTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Enrollments" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Enrollments"];

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
  XLSX.writeFile(file, `enrollments[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "enrollment_id" },
    { header: "Student ID", dataKey: "student_id" },
    { header: "Section ID", dataKey: "section_id" },
    { header: "Date Enrolled", dataKey: "date_enrolled" },
    { header: "Status", dataKey: "status" },
    { header: "Letter Grade", dataKey: "letter_grade" },
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#enrollment_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      enrollment_id: cells[0].innerText,
      student_id: cells[1].innerText,
      section_id: cells[2].innerText,
      date_enrolled: cells[3].innerText,
      status: cells[4].innerText,
      letter_grade: cells[5].innerText
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`enrollments[${dateToday}].pdf`);
}

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(enrollmentEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
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

function displayStudents() {
  fetch(studentEndpoint + `?sort=ascending`) 
  .then((response) => response.json())
  .then((students) => {
    for(const student of students) {
      const option = document.createElement('option');
      const fullname = `${student.last_name}, ${student.first_name} ${student.middle_name}`;
      option.value = student.student_id;
      option.innerHTML = `${fullname}`;

      studentIdInput.append(option);
    }
  });
}

function displaySections() {
  fetch(sectionEndpoint + `?sort=ascending`) 
  .then((response) => response.json())
  .then((sections) => {
    for(const section of sections) {
      const option = document.createElement('option');
      option.value = section.section_id;
      option.innerHTML = section.section_code;

      sectionIdInput.append(option);
    }
  });
}

// Display sections in the dropdown.
displaySections();

// Display students in the dropdown.
displayStudents();

// Display Enrollments to the table.
displayEnrollments();