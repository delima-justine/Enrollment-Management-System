const sectionEndpoint = "http://localhost/Enrollment-Management-System/php/section.php";

function displaySections() {
  const sectionTable = document.querySelector("#table_body_section");

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
          onclick="editSection(this)">Edit</button></td>
       <td>
          <button 
          type="button"
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
  const sectionCodeInput = document.querySelector('#section_code_input');
  const courseIdInput = document.querySelector('#course_id_input');
  const termIdInput= document.querySelector('#term_id_input'); 
  const instructorIdInput = document.querySelector('#instructor_id_input');
  const dayPatternInput = document.querySelector('#day_input');
  const startTimeInput = document.querySelector('#start_time_input');
  const endTimeInput = document.querySelector('#end_time_input');
  const roomIdInput = document.querySelector('#room_id_input');
  const maxCapacityInput = document.querySelector('#max_capacity_input');

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

// Display Sections
displaySections();