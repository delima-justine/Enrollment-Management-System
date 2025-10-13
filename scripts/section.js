const sectionEndpoint = "http://localhost/Enrollment-Management-System/php/section.php";
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
    alert(responseText);
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
      alert(responseText);
      displaySections();
    });

    updatedRow.length = 0; // clear the array.
  } else {
    // Edit mode
    button.textContent = "Save";
    cells[0].focus();
    updatedRow.length = 0; // clear the array.
  }
}

// Delete Section
function deleteSection(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const sectionId = cells[0].innerHTML;
  
  fetch(sectionEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `section_id=${sectionId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displaySections();
  })
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

// Display Sections
displaySections();