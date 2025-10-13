const coursePrerequisiteEndpoint = "http://localhost/Enrollment-Management-System/php/course_prerequisite.php"
const courseIdInput = document.querySelector('#course_id_input');
const prereqCourseInput = document.querySelector('#prerequisite_course_id_input');
const coursePrerequisiteTable = document.querySelector("#table_body_course_prereq");
const coursePrerequisiteTableContainer = document.querySelector("#course_prereq_table");

function checkField() {
  const addCoursePrereqBtn = document.querySelector('#add_course_prereq_btn');

  if(courseIdInput.value.trim().length &&
      prereqCourseInput.value.trim().length
  ) {
    addCoursePrereqBtn.disabled = false;
  } else {
    addCoursePrereqBtn.disabled = true;
  }
}

function displayPrerequisiteCourses() {
  fetch(coursePrerequisiteEndpoint)
  .then((response) => response.json())
  .then((courses)=> {
    coursePrerequisiteTable.innerHTML = "";

    for(const course of courses) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.prereq_course_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editCoursePrerequisite(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteCoursePrerequisite(this)">
            Delete
          </button>
        </td>
      `
      coursePrerequisiteTable.append(row);
    }
  });
}

// Add new dourse prereq
function addCoursePrerequisite() {
  fetch(coursePrerequisiteEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `course_id=${courseIdInput.value}&` +
          `prereq_course_id=${prereqCourseInput.value}&`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayPrerequisiteCourses(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit a department
function editCoursePrerequisite(button) {
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
      course_id: cells[0].innerHTML, 
      prereq_course_id: cells[1].innerHTML,
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(coursePrerequisiteEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `course_id=${updatedRow[0].course_id}&` +
        `prereq_course_id=${updatedRow[0].prereq_course_id}&`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayPrerequisiteCourses();
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
function deleteCoursePrerequisite(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const courseId = cells[0].innerHTML;
  
  fetch(coursePrerequisiteEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `course_id=${courseId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayPrerequisiteCourses();
  })
}

function searchCourse() {
  const searchInput = document.querySelector('#search_input');

  fetch(coursePrerequisiteEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((courses)=> {
    if(!courses || courses.length === 0) {
      coursePrerequisiteTable.innerHTML = "No Data Found.";
      return;
    }
    
    coursePrerequisiteTable.innerHTML = "";

    for(const course of courses) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.prereq_course_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editCoursePrerequisite(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteCoursePrerequisite(this)">
            Delete
          </button>
        </td>
      `
      coursePrerequisiteTable.append(row);
    }
  });
}

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = coursePrerequisiteTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Course Prerequisites" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Course Prerequisites"];

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
  XLSX.writeFile(file, `course_prerequisites[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "Course ID", dataKey: "course_id" },
    { header: "Prerequisite Course ID", dataKey: "prereq_course_id" }
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#course_prereq_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      course_id: cells[0].innerText,
      prereq_course_id: cells[1].innerText
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`course_prerequisites[${dateToday}].pdf`);
}

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(coursePrerequisiteEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
  .then((response) => response.json())
  .then((courses)=> {
    coursePrerequisiteTable.innerHTML = "";

    for(const course of courses) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.prereq_course_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editCoursePrerequisite(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteCoursePrerequisite(this)">
            Delete
          </button>
        </td>
      `
      coursePrerequisiteTable.append(row);
    }
  });
}

// Display course prerequisites to the table.
displayPrerequisiteCourses();