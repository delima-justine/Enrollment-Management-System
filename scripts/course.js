const courseEndpoint = "http://localhost/Enrollment-Management-System/php/course.php";
const courseCodeInput = document.querySelector('#course_code_input');
const courseTitleInput = document.querySelector('#course_title_input');
const unitsInput = document.querySelector('#units_input');
const lectureHrsInput = document.querySelector('#lecture_hrs_input');
const labHrsInput = document.querySelector('#lab_hrs_input');
const departmentIdInput = document.querySelector('#dept_id_input');
const courseTable = document.querySelector("#table_body_course");

function checkField() {
  const addCourseBtn = document.querySelector('#add_course_btn');

  if(courseCodeInput.value.trim().length &&
      courseTitleInput.value.trim().length &&
      unitsInput.value.trim().length &&
      lectureHrsInput.value.trim().length &&
      labHrsInput.value.trim().length &&
      departmentIdInput.value.trim().length
  ) {
    addCourseBtn.disabled = false;
  } else {
    addCourseBtn.disabled = true;
  }
}

function displayCourses() {
  fetch(courseEndpoint)
  .then((response) => response.json())
  .then((courseList)=> {
    courseTable.innerHTML = ""

    for(const course of courseList) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.course_code}</td>
        <td>${course.course_title}</td>
        <td>${course.units}</td>
        <td>${course.lecture_hours}</td>
        <td>${course.lab_hours}</td>
        <td>${course.dept_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editCourse(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteRow(this)">
            Delete
          </button>
        </td>
      `
      courseTable.append(row);
    }
  });
}

function addCourse() {
  fetch(courseEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `course_code=${courseCodeInput.value}&` +
          `course_title=${courseTitleInput.value}&` +
          `units=${unitsInput.value}&lecture_hours=${lectureHrsInput.value}&` +
          `lab_hours=${labHrsInput.value}&dept_id=${departmentIdInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    clearInput();
    displayCourses(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit Course
function editCourse(button) {
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
      course_code: cells[1].innerHTML,
      course_title: cells[2].innerHTML,
      units: cells[3].innerHTML,
      lecture_hours: cells[4].innerHTML,
      lab_hours: cells[5].innerHTML,
      dept_id: cells[6].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(courseEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `course_id=${updatedRow[0].course_id}&` +
        `course_code=${updatedRow[0].course_code}&` +
        `course_title=${updatedRow[0].course_title}&` +
        `units=${updatedRow[0].units}&lecture_hours=${updatedRow[0].lecture_hours}&` +
        `lab_hours=${updatedRow[0].lab_hours}&dept_id=${updatedRow[0].dept_id}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayCourses();
    });

    updatedRow.length = 0; // clear the array.
  } else {
    // Edit mode
    button.textContent = "Save";
    cells[0].focus();
    updatedRow.length = 0; // clear the array.
  }
}

// Delete Course
function deleteRow(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const courseId = cells[0].innerHTML;
  
  fetch(courseEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `course_id=${courseId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayCourses(); // updates course table
  })
}

// Clear the input fields.
function clearInput() {
  const courseCodeInput = document.querySelector('#course_code_input');
  const courseTitleInput = document.querySelector('#course_title_input');
  const unitsInput = document.querySelector('#units_input');
  const lectureHrsInput = document.querySelector('#lecture_hrs_input');
  const labHrsInput = document.querySelector('#lab_hrs_input');
  const departmentIdInput = document.querySelector('#dept_id_input');

  courseCodeInput.value = "";
  courseTitleInput.value = "";
  unitsInput.value = "";
  lectureHrsInput.value = "";
  labHrsInput.value = "";
  departmentIdInput.value = "";
}

function searchCourse() {
  const searchInput = document.querySelector('#search_input');

  fetch(courseEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((courseList)=> {
    if(!courseList || courseList.length === 0) {
      courseTable.innerHTML = "No Data Found.";
      return;
    }

    courseTable.innerHTML = ""

    for(const course of courseList) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.course_code}</td>
        <td>${course.course_title}</td>
        <td>${course.units}</td>
        <td>${course.lecture_hours}</td>
        <td>${course.lab_hours}</td>
        <td>${course.dept_id}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editCourse(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteRow(this)">
            Delete
          </button>
        </td>
      `
      courseTable.append(row);
    }
  });
}

function ExportTableToXLSX(type) {
  const courseTable = document.querySelector('#course_table');
  const file = XLSX.utils.table_to_book(courseTable, {sheet: "Courses"});
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Courses"];

  // --- Auto column width calculation ---
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Convert sheet to 2D array

  // Compute max width per column
  const colWidths = data[0].map((_, colIndex) => {
    const maxLength = data.reduce((acc, row) => {
      const cell = row[colIndex] ? row[colIndex].toString() : "";
      return Math.max(acc, cell.length);
    }, 10);
    return { wch: maxLength + 2 }; // Add padding
  });

  // Apply calculated widths
  ws['!cols'] = colWidths;

  XLSX.writeFile(file, `courses[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF(); // Initialize jsPDF
   const dateToday = new Date().toISOString().split('T')[0];
  const courseTable = document.querySelector('#course_table'); // Get your HTML table element

  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "course_id" },
    { header: "Course Code", dataKey: "code" },
    { header: "Course Name", dataKey: "name" },
    { header: "Units", dataKey: "units" },
    { header: "Lecture Hours", dataKey: "lecture_hours" },
    { header: "Lab Hours", dataKey: "lab_hours" },
    { header: "Department ID", dataKey: "department_id" },
    // Add or remove columns as needed
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#course_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      course_id: cells[0].innerText,
      code: cells[1].innerText,  // corresponds to Course Code
      name: cells[2].innerText,  // corresponds to Course Name
      units: cells[3].innerText,
      lecture_hours: cells[4].innerText,
      lab_hours: cells[5].innerText,
      department_id: cells[6].innerText
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

// Display courses inside the table
displayCourses();