<?php 
header('Content-Type: application/json'); // Readable format for JSON in Web.
// allow 4 methods for CRUD.
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE');
header("Access-Control-Allow-Origin: *"); // Allows VS Code Go Live to fetch data

$database = "localhost";
$username = "root";
$password = "";
$dbname = "dbenrollment";

// Connect to DB
$conn = new mysqli($database, $username, $password, $dbname);
$sort = isset($_GET['sort']) ? trim($_GET['sort']): '';

// Check connection
if($conn->connect_error) {
  die("Connection Failed " . $conn->connect_error);
} else if($_SERVER['REQUEST_METHOD'] === 'GET') {
  $response = [];

  $search = isset($_GET['search']) ? trim($_GET['search']): '';

  if(!empty($search)) {
    $stmt = $conn->prepare("
     SELECT * FROM tbl_room
     WHERE room_code LIKE ?
     ORDER BY room_id DESC 
    "); 

    $search_param = "%$search%";
    $stmt->bind_param("s", $search_param);
  } else if($sort === "ascending") {
     $stmt = $conn->prepare("SELECT * FROM tbl_room ORDER BY room_id ASC");
  } else if($sort === "descending") {
     $stmt = $conn->prepare("SELECT * FROM tbl_room ORDER BY room_id DESC"); 
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_room ORDER BY room_id DESC");
  }

  
  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'room_id'=>$row["room_id"],
      'building'=>$row["building"],
      'room_code'=>$row["room_code"],
      'capacity'=>$row["capacity"]
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $building = $_POST['building'];
  $room_code = $_POST['room_code'];
  $capacity = $_POST['capacity'];

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_room(
                          building, 
                          room_code, 
                          capacity
                        )
                        VALUES(?, ?, ?)");

  $stmt->bind_param("ssi", $building, $room_code, $capacity);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $room_id = $_PATCH['room_id'] ?? "";
  $new_building = $_PATCH['building'] ?? "";
  $new_room_code = $_PATCH['room_code'] ?? "";
  $new_capacity = $_PATCH['capacity'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_room
          SET building = ?,
          room_code = ?,
          capacity = ?
          WHERE room_id = ?;
  ");

  $stmt->bind_param("ssii", 
    $new_building,
    $new_room_code,
    $new_capacity,
    $room_id
  );

  $stmt->execute();

  if(!$stmt) {
    die("Prepare failed: (" . $conn->errno . ") " . $conn->error);
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $room_id = $_DELETE['room_id'] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_room WHERE room_id = ?");
  $stmt->bind_param('i', $room_id);
  $stmt->execute();

  if(!$stmt) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>