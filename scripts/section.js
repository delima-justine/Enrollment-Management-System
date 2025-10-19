const sectionEndpoint = "http://localhost/Enrollment-Management-System/php/section.php";
const courseEndpoint = "http://localhost/Enrollment-Management-System/php/course.php";
const termEndpoint = "http://localhost/Enrollment-Management-System/php/term.php"
const instructorEndpoint = "http://localhost/Enrollment-Management-System/php/instructor.php";
const roomEndpoint = "http://localhost/Enrollment-Management-System/php/room.php"
const sectionCodeInput = document.querySelector('#section_code_input');
const courseIdInput = document.querySelector('#course_id_input');
const termIdInput= document.querySelector('#term_id_input'); 
const instructorIdInput = document.querySelector('#instructor_id_input');
const dayPatternInput = document.querySelector('#day_input');
const startTimeInput = document.querySelector('#start_time_input');
const endTimeInput = document.querySelector('#end_time_input');
const roomIdInput = document.querySelector('#room_id_input');
const maxCapacityInput = document.querySelector('#max_capacity_input');
const sectionTable = document.querySelector("#table_body_section");
const sectionTableContainer = document.querySelector("#section_table");

function checkField() {
  const addSectionBtn = document.querySelector('#add_section_btn');

  if(sectionCodeInput.value.trim().length &&
      courseIdInput.value.trim().length &&
      termIdInput.value.trim().length &&
      instructorIdInput .value.trim().length &&
      dayPatternInput.value.trim().length &&
      endTimeInput.value.trim().length &&
      roomIdInput.value.trim().length &&
      maxCapacityInput.value.trim().length
  ) {
    addSectionBtn.disabled = false;
  } else {
    addSectionBtn.disabled = true;
  }
}

function displaySections() {
  fetch(sectionEndpoint)
  .then((response) => response.json())
  .then((sections)=> {
    sectionTable.innerHTML = "";

    for(const section of sections) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${section.section_id}</td>
        <td>${section.section_code}</td>
        <td>${section.course_id}</td>
        <td>${section.term_id}</td>
        <td>${section.instructor_id}</td>
        <td>${section.day_pattern}</td>
        <td>${section.start_time}</td>
        <td>${section.end_time}</td>
        <td>${section.room_id}</td>
        <td>${section.max_capacity}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editSection(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteSection(this)">
            Delete
          </button>
        </td>
      `
      sectionTable.append(row);
    }
  });
}

function addSection() {
  fetch(sectionEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `section_code=${sectionCodeInput.value}&` +
          `course_id=${courseIdInput.value}&term_id=${termIdInput.value}&` +
          `instructor_id=${instructorIdInput.value}&day_pattern=${dayPatternInput.value}&` +
          `start_time=${startTimeInput.value}&end_time=${endTimeInput.value}&` +
          `room_id=${roomIdInput.value}&max_capacity=${maxCapacityInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    Swal.fire("Success", `${responseText}`, "success");
    displaySections(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit Section
function editSection(button) {
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
      section_id: cells[0].innerHTML, 
      section_code: cells[1].innerHTML,
      course_id: cells[2].innerHTML,
      term_id: cells[3].innerHTML,
      instructor_id: cells[4].innerHTML,
      day_pattern: cells[5].innerHTML,
      start_time: cells[6].innerHTML,
      end_time: cells[7].innerHTML,
      room_id: cells[8].innerHTML,
      max_capacity: cells[9].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(sectionEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `section_id=${updatedRow[0].section_id}&section_code=${updatedRow[0].section_code}&` +
          `course_id=${updatedRow[0].course_id}&term_id=${updatedRow[0].term_id}&` +
          `instructor_id=${updatedRow[0].instructor_id}&day_pattern=${updatedRow[0].day_pattern}&` +
          `start_time=${updatedRow[0].start_time}&end_time=${updatedRow[0].end_time}&` +
          `room_id=${updatedRow[0].room_id}&max_capacity=${updatedRow[0].max_capacity}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      Swal.fire("Success", `${responseText}`, "success");
      displaySections();
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

// Delete Section
function deleteSection(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const sectionId = cells[0].innerHTML;

  Swal.fire({
    title: "Do you want to delete this data?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
       fetch(sectionEndpoint, {
        method: 'DELETE',
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        body: `section_id=${sectionId}`,
      })
      .then((response) => response.text())
      .then(() => {
        Swal.fire("Deleted", "", "success");
        displaySections();
      })
    }
  });
}

function searchSection() {
  const searchInput = document.querySelector('#search_input');

  fetch(sectionEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((sections)=> {
    if(!sections || sections.length === 0) {
      sectionTable.innerHTML = "No Data Found.";
      return;
    }

    sectionTable.innerHTML = "";

    for(const section of sections) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${section.section_id}</td>
        <td>${section.section_code}</td>
        <td>${section.course_id}</td>
        <td>${section.term_id}</td>
        <td>${section.instructor_id}</td>
        <td>${section.day_pattern}</td>
        <td>${section.start_time}</td>
        <td>${section.end_time}</td>
        <td>${section.room_id}</td>
        <td>${section.max_capacity}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editSection(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteSection(this)">
            Delete
          </button>
        </td>
      `
      sectionTable.append(row);
    }
  });
}

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = sectionTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Sections" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Sections"];

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
  XLSX.writeFile(file, `sections[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "section_id" },
    { header: "Section Code", dataKey: "section_code" },
    { header: "Course ID", dataKey: "course_id" },
    { header: "Term ID", dataKey: "term_id" },
    { header: "Instructor ID", dataKey: "instructor_id" },
    { header: "Day", dataKey: "day" },
    { header: "Start Time", dataKey: "start_time" },
    { header: "End Time ", dataKey: "end_time" },
    { header: "Room ID", dataKey: "room_id" },
    { header: "Max Capacity", dataKey: "max_capacity" },
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#section_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      section_id: cells[0].innerText,
      section_code: cells[1].innerText,
      course_id: cells[2].innerText, 
      term_id: cells[3].innerText,
      instructor_id: cells[4].innerText,
      day: cells[5].innerText,
      start_time: cells[6].innerText,
      end_time: cells[7].innerText,
      room_id: cells[8].innerText,
      max_capacity: cells[9].innerText,
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`sections[${dateToday}].pdf`);
}

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(sectionEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
  .then((response) => response.json())
  .then((sections)=> {
    sectionTable.innerHTML = "";

    for(const section of sections) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${section.section_id}</td>
        <td>${section.section_code}</td>
        <td>${section.course_id}</td>
        <td>${section.term_id}</td>
        <td>${section.instructor_id}</td>
        <td>${section.day_pattern}</td>
        <td>${section.start_time}</td>
        <td>${section.end_time}</td>
        <td>${section.room_id}</td>
        <td>${section.max_capacity}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editSection(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteSection(this)">
            Delete
          </button>
        </td>
      `
      sectionTable.append(row);
    }
  });
}

function displayCourses() {
  fetch(courseEndpoint) 
  .then((response) => response.json())
  .then((courses) => {
    for(const course of courses) {
      const option = document.createElement('option');
      option.value = course.course_id;
      option.innerHTML = course.course_title;

      courseIdInput.append(option);
    }
  });
}

function displayTerms() {
  fetch(termEndpoint + `?sort=ascending`) 
  .then((response) => response.json())
  .then((terms) => {
    for(const term of terms) {
      const option = document.createElement('option');
      option.value = term.term_id;
      option.innerHTML = term.term_code;

      termIdInput.append(option);
    }
  });
}

function displayInstructors() {
  fetch(instructorEndpoint + `?sort=ascending`) 
  .then((response) => response.json())
  .then((instructors) => {
    for(const instructor of instructors) {
      const option = document.createElement('option');
      const fullname = `${instructor.last_name}, ${instructor.first_name}`;
      option.value = instructor.instructor_id;
      option.innerHTML = fullname;

      instructorIdInput.append(option);
    }
  });
}

function displayRooms() {
  fetch(roomEndpoint + `?sort=ascending`) 
  .then((response) => response.json())
  .then((rooms) => {
    for(const room of rooms) {
      const option = document.createElement('option');
      const fullname = `${room.building} - ${room.room_code}`;
      option.value = room.room_id;
      option.innerHTML = fullname;

      roomIdInput.append(option);
    }
  });
}

// Display rooms
displayRooms();

// Display instructors
displayInstructors();

//Display terms
displayTerms();

// Display courses in dropdown
displayCourses();

// Display Sections
displaySections();