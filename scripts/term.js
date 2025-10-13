const termEndpoint = "http://localhost/Enrollment-Management-System/php/term.php"
const termCodeInput = document.querySelector('#term_code_input');
const startDateInput = document.querySelector('#start_date_input');
const endDateInput = document.querySelector('#end_date_input');
const termTable = document.querySelector("#table_body_program");

function checkField() {
  const addTermBtn = document.querySelector('#add_term_btn');

  if(termCodeInput.value.trim().length &&
      startDateInput.value.trim().length &&
      endDateInput.value.trim().length
  ) {
    addTermBtn.disabled = false;
  } else {
    addTermBtn.disabled = true;
  }
}

function displayTerms() {
  fetch(termEndpoint)
  .then((response) => response.json())
  .then((terms)=> {
    termTable.innerHTML = "";

    for(const term of terms) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${term.term_id}</td>
        <td>${term.term_code}</td>
        <td>${term.start_date}</td>
        <td>${term.end_date}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editTerm(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteTerm(this)">
            Delete
          </button>
        </td>
      `
      termTable.append(row);
    }
  });
}

// Add new department
function addTerm() {
  fetch(termEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `term_code=${termCodeInput.value}&` +
          `start_date=${startDateInput.value}&` +
          `end_date=${endDateInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    alert(responseText);
    displayTerms(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit a department
function editTerm(button) {
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
      term_id: cells[0].innerHTML, 
      term_code: cells[1].innerHTML,
      start_date: cells[2].innerHTML,
      end_date: cells[3].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(termEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `term_id=${updatedRow[0].term_id}&` +
        `term_code=${updatedRow[0].term_code}&` +
        `start_date=${updatedRow[0].start_date}&` +
        `end_date=${updatedRow[0].end_date}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      alert(responseText);
      displayTerms();
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
function deleteTerm(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const termId = cells[0].innerHTML;
  
  fetch(termEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `term_id=${termId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayTerms();
  })
}

// Display instructors to the table.
displayTerms();