const courseEndpoint = "http://localhost/Enrollment-Management-System/php/course.php";
const departmentEndpoint = "http://localhost/Enrollment-Management-System/php/department.php";
const courseCodeInput = document.querySelector('#course_code_input');
const courseTitleInput = document.querySelector('#course_title_input');
const unitsInput = document.querySelector('#units_input');
const lectureHrsInput = document.querySelector('#lecture_hrs_input');
const labHrsInput = document.querySelector('#lab_hrs_input');
const departmentIdInput = document.querySelector('#dept_id_input');
const courseTable = document.querySelector("#table_body_course");
const courseTableContainer = document.querySelector('#course_table')

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
        <td>
          <button 
          type="button"
          class="btn btn-warning"
          data-bs-toggle="modal"
          data-bs-target="#update_course_modal"
          onclick="editCourse(this)">
            Edit
          </button>
        </td>
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
    Swal.fire("Success", `${responseText}`, "success");
    clearInput();
    displayCourses(); // updates the table
  }).catch (error => {
    alert('console error.');
    console.log(error);
  })
}

// Edit Course
function editCourse(button) {
  // populate update modal inputs with values from the selected row
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const courseId = cells[0].innerText;

  document.querySelector('#new_course_code_input').value = cells[1].innerText;
  document.querySelector('#new_course_title_input').value = cells[2].innerText;
  document.querySelector('#new_units_input').value = cells[3].innerText;
  document.querySelector('#new_lecture_hrs_input').value = cells[4].innerText;
  document.querySelector('#new_lab_hrs_input').value = cells[5].innerText;
  document.querySelector('#new_dept_id_input').value = cells[6].innerText;

  // store course id on the modal's Update button
  const updateBtn = document.querySelector('#update_course_modal .btn-primary');
  updateBtn.dataset.courseId = courseId;
}

// Update Course
function updateCourse(button) {
  // read course id from Update button's dataset
  const updateBtn = document.querySelector('#update_course_modal .btn-primary');
  const COURSE_ID = updateBtn?.dataset?.courseId;
  if (!COURSE_ID) {
    Swal.fire("Error", "No course selected to update.", "error");
    return;
  }

  const newCourseCodeInput = document.querySelector('#new_course_code_input');
  const newCourseTitleInput = document.querySelector('#new_course_title_input');
  const newUnitsInput = document.querySelector('#new_units_input');
  const newLectureHrsInput = document.querySelector('#new_lecture_hrs_input');
  const newLabHrsInput = document.querySelector('#new_lab_hrs_input');
  const newDepartmentIdInput = document.querySelector('#new_dept_id_input');

  fetch(courseEndpoint, {
    method: 'PATCH',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `course_id=${COURSE_ID}&` +
      `course_code=${newCourseCodeInput.value}&` +
      `course_title=${newCourseTitleInput.value}&` +
      `units=${newUnitsInput.value}&lecture_hours=${newLectureHrsInput.value}&` +
      `lab_hours=${newLabHrsInput.value}&dept_id=${newDepartmentIdInput.value}`
  })
  .then((response) => response.text())
  .then((responseText) => {
    Swal.fire("Success", `${responseText}`, "success");
    displayCourses();
  });
}

// Delete Course
function deleteRow(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const courseId = cells[0].innerHTML;

  Swal.fire({
    title: "Do you want to delete this data?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Delete",
    // denyButtonText: `Cancel`
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(courseEndpoint, {
        method: 'DELETE',
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        body: `course_id=${courseId}`,
      })
      .then((response) => response.text())
      .then(() => {
        Swal.fire("Deleted", "", "success");
        displayCourses(); // updates course table
      })
    }
  });
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
  // Clone the original table
  const clonedTable = courseTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Courses" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Courses"];

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

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(courseEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
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

function displayDepartments() {
  const departmentDropdown = document.querySelector('#dept_id_input');
  const updateDepartmentDropdown = document.querySelector('#new_dept_id_input');

  fetch(departmentEndpoint) 
  .then((response) => response.json())
  .then((departments) => {
    for(const department of departments) {
      const option = document.createElement('option');
      option.value = department.dept_id;
      option.innerHTML = department.dept_name;

      departmentDropdown.append(option);
      updateDepartmentDropdown.append(option);
    }
  });
}

// appends department to the dropdown
displayDepartments();

// Display courses inside the table
displayCourses();