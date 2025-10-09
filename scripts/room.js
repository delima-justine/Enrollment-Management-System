const roomEndpoint = "http://localhost/Enrollment-Management-System/php/room.php"

function displayRooms() {
  const roomTable = document.querySelector("#table_body_room");

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
  const buildingInput = document.querySelector('#building_input');
  const roomCodeInput = document.querySelector('#room_code_input');
  const capacityInput = document.querySelector('#capacity_input');

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
    alert(responseText);
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
      alert(responseText);
      displayRooms();
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
function deleteRoom(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const roomId = cells[0].innerHTML;
  
  fetch(roomEndpoint, {
    method: 'DELETE',
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `room_id=${roomId}`,
  })
  .then((response) => response.text())
  .then((responseText) => {
    alert(responseText);
    displayRooms();
  })
}

// Display instructors to the table.
displayRooms();