const roomEndpoint = "http://localhost/Enrollment-Management-System/php/room.php"
const buildingInput = document.querySelector('#building_input');
const roomCodeInput = document.querySelector('#room_code_input');
const capacityInput = document.querySelector('#capacity_input');
const roomTable = document.querySelector("#table_body_room");
const roomTableContainer = document.querySelector("#room_table");

function checkField() {
  const addRoomBtn = document.querySelector('#add_room_btn');

  if(buildingInput.value.trim().length &&
      roomCodeInput.value.trim().length &&
      capacityInput.value.trim().length
  ) {
    addRoomBtn.disabled = false;
  } else {
    addRoomBtn.disabled = true;
  }
}

function displayRooms() {
  fetch(roomEndpoint)
  .then((response) => response.json())
  .then((rooms)=> {
    roomTable.innerHTML = "";

    for(const room of rooms) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${room.room_id}</td>
        <td>${room.building}</td>
        <td>${room.room_code}</td>
        <td>${room.capacity}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editRoom(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteRoom(this)">
            Delete
          </button>
        </td>
      `
      roomTable.append(row);
    }
  });
}

// Add new department
function addRoom() {
  fetch(roomEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `building=${buildingInput.value}&` +
          `room_code=${roomCodeInput.value}&` +
          `capacity=${capacityInput.value}`
  })
  .then((response) => response.text())
  .then(responseText => {
    Swal.fire("Success", `${responseText}`, "success");
    displayRooms(); // updates the table
  }).catch (error => {
    alert('console error.');
  })
}

// Edit a department
function editRoom(button) {
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
      room_id: cells[0].innerHTML, 
      building: cells[1].innerHTML,
      room_code: cells[2].innerHTML,
      capacity: cells[3].innerHTML
  });

  console.log(updatedRow); // prints the updated array.

  if (isEditable) {
    // Save mode
    button.textContent = "Edit";

    fetch(roomEndpoint, {
      method: 'PATCH',
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `room_id=${updatedRow[0].room_id}&` +
        `building=${updatedRow[0].building}&` +
        `room_code=${updatedRow[0].room_code}&` +
        `capacity=${updatedRow[0].capacity}`
    })
    .then((response) => response.text())
    .then((responseText) => {
      Swal.fire("Success", `${responseText}`, "success");
      displayRooms();
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
function deleteRoom(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const roomId = cells[0].innerHTML;

  Swal.fire({
    title: "Do you want to delete this data?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(roomEndpoint, {
        method: 'DELETE',
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        body: `room_id=${roomId}`,
      })
      .then((response) => response.text())
      .then(() => {
        Swal.fire("Deleted", "", "success");
        displayRooms();
      })
    }
  });
}

function searchRoom() {
  const searchInput = document.querySelector('#search_input');

  fetch(roomEndpoint + `?search=${encodeURIComponent(searchInput.value)}`)
  .then((response) => response.json())
  .then((rooms)=> {
    if(!rooms || rooms.length === 0) {
      roomTable.innerHTML = "No Data Found.";
      return;
    }

    roomTable.innerHTML = "";

    for(const room of rooms) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${room.room_id}</td>
        <td>${room.building}</td>
        <td>${room.room_code}</td>
        <td>${room.capacity}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editRoom(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteRoom(this)">
            Delete
          </button>
        </td>
      `
      roomTable.append(row);
    }
  });
}

function ExportTableToXLSX(type) {
  // Clone the original table
  const clonedTable = roomTableContainer.cloneNode(true);

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
  const file = XLSX.utils.table_to_book(clonedTable, { sheet: "Rooms" });
  const dateToday = new Date().toISOString().split('T')[0];
  const ws = file.Sheets["Rooms"];

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
  XLSX.writeFile(file, `rooms[${dateToday}].` + type);
}

function exportTableToPDF() {
  const doc = new jspdf.jsPDF({ orientation: "landscape"}); // Initialize jsPDF
  const dateToday = new Date().toISOString().split('T')[0];
  
  // Define which columns to include
  const columns = [
    { header: "#", dataKey: "room_id" },
    { header: "Building", dataKey: "building" },
    { header: "Room Code", dataKey: "room_code" },
    { header: "Capacity", dataKey: "capacity" },
  ];

  // Get data from your table or dynamically generate it
  const tableData = [];
  document.querySelectorAll("#room_table tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    tableData.push({
      room_id: cells[0].innerText,
      building: cells[1].innerText,
      room_code: cells[2].innerText,  
      capacity: cells[3].innerText
    });
  });

  // Generate the table with selected columns
  doc.autoTable({
    columns: columns,
    body: tableData,
  });

  // Save the PDF
  doc.save(`rooms[${dateToday}].pdf`);
}

function sortTable() {
  const sortDropdown = document.querySelector('#sort_drop_down');

  fetch(roomEndpoint + `?sort=${encodeURIComponent(sortDropdown.value)}`)
  .then((response) => response.json())
  .then((rooms)=> {
    roomTable.innerHTML = "";

    for(const room of rooms) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${room.room_id}</td>
        <td>${room.building}</td>
        <td>${room.room_code}</td>
        <td>${room.capacity}</td>
        <td><button 
          type="button"
          class="btn btn-warning"
          onclick="editRoom(this)">Edit</button></td>
       <td>
          <button 
          type="button"
          class="btn btn-danger"
          onClick="deleteRoom(this)">
            Delete
          </button>
        </td>
      `
      roomTable.append(row);
    }
  });
}

// Display rooms to the table.
displayRooms();