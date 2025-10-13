const termEndpoint = "http://localhost/Enrollment-Management-System/php/term.php"
const termCodeInput = document.querySelector('#term_code_input');
const startDateInput = document.querySelector('#start_date_input');
const endDateInput = document.querySelector('#end_date_input');
const termTable = document.querySelector("#table_body_term");
const termTableContainer = document.querySelector("#term_table");

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

function searchTerm() {
  const searchInput = document.querySelector('#search_input');

  fetch(termEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((terms)=> {
    if(!terms || terms.length === 0) {
      termTable.innerHTML = "No Data Found.";
      return;
    }

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

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = termTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Terms" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Terms"];

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
  XLSX.writeFile(file, `terms[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "term_id" },
    { header: "Start Date", dataKey: "start_date" },
    { header: "End Date", dataKey: "end_date" },
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#term_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      term_id: cells[0].innerText,
      start_date: cells[1].innerText,
      end_date: cells[2].innerText
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`terms[${dateToday}].pdf`);
}

// Display terms to the table.
displayTerms();