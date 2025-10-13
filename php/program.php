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

// Check connection
if($conn->connect_error) {
  die("Connection Failed " . $conn->connect_error);
} else if($_SERVER['REQUEST_METHOD'] === 'GET') {
  $response = [];

  $search = isset($_GET['search']) ? trim($_GET['search']): '';
  $sort = isset($_GET['sort']) ? trim($_GET['sort']): '';

  if(!empty($search)) {
    $stmt = $conn->prepare("
     SELECT * FROM tbl_program
     WHERE program_name LIKE ?
     ORDER BY program_id DESC 
    "); 

    $search_param = "%$search%";
    $stmt->bind_param("s", $search_param);
  } else if($sort === "ascending") {
   $stmt = $conn->prepare("SELECT * FROM tbl_program ORDER BY program_id ASC");
  } else if($sort === "descending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_program ORDER BY program_id DESC");
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_program ORDER BY program_id DESC");
  }
 
  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'program_id'=>$row["program_id"],
      'program_code'=>$row["program_code"],
      'program_name'=>$row["program_name"],
      'dept_id'=>$row["dept_id"]
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $program_code = $_POST['program_code'];
  $program_name = $_POST['program_name'];
  $dept_id = $_POST['dept_id'];

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_program(
                          program_code, 
                          program_name, 
                          dept_id
                        )
                        VALUES(?, ?, ?)");

  $stmt->bind_param("ssi", $program_code, $program_name, $dept_id);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $program_id = $_PATCH['program_id'] ?? "";
  $new_program_code = $_PATCH['program_code'] ?? "";
  $new_program_name = $_PATCH['program_name'] ?? "";
  $new_dept_id = $_PATCH['dept_id'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_program
          SET program_code = ?,
          program_name = ?,
          dept_id = ?
          WHERE program_id = ?;
  ");

  $stmt->bind_param("ssii", 
    $new_program_code, 
    $new_program_name, 
    $new_dept_id,
    $program_id
  );

  $stmt->execute();

  if(!$stmt) {
    die("Prepare failed: (" . $conn->errno . ") " . $conn->error);
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $program_id = $_DELETE['program_id'] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_program WHERE program_id = ?");
  $stmt->bind_param('i', $program_id);
  $stmt->execute();

  if(!$stmt) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>