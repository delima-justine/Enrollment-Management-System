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

  if(!empty($search)) {
    $stmt = $conn->prepare("
     SELECT * FROM tbl_instructor
     WHERE first_name LIKE ?
     ORDER BY instructor_id DESC 
    ");

    $first_name = "%$search%";
    $stmt->bind_param("s", $first_name);
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_instructor ORDER BY instructor_id DESC");
  }

  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'instructor_id'=>$row["instructor_id"],
      'last_name'=>$row["last_name"],
      'first_name'=>$row["first_name"],
      'email'=>$row["email"],
      'dept_id'=>$row["dept_id"]
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $last_name = $_POST['last_name'];
  $first_name = $_POST['first_name'];
  $email = $_POST['email'];
  $dept_id = $_POST['dept_id'];

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_instructor(
                          last_name, 
                          first_name, 
                          email, 
                          dept_id
                        )
                        VALUES(?, ?, ?, ?)");

  $stmt->bind_param("sssi", $last_name, $first_name, $email, $dept_id);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success  :D";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $instructor_id = $_PATCH['instructor_id'] ?? "";
  $new_last_name = $_PATCH['last_name'] ?? "";
  $new_first_name = $_PATCH['first_name'] ?? "";
  $new_email = $_PATCH['email'] ?? "";
  $new_dept_id = $_PATCH['dept_id'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_instructor
          SET last_name = ?,
          first_name = ?,
          email = ?,
          dept_id = ?
          WHERE instructor_id = ?;
  ");

  $stmt->bind_param("sssii", 
    $new_last_name, 
    $new_first_name, 
    $new_email, 
    $new_dept_id,
    $instructor_id
  );

  $stmt->execute();

  if(!$stmt) {
    die("Prepare failed: (" . $conn->errno . ") " . $conn->error);
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $instructor_id = $_DELETE["instructor_id"] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_instructor WHERE instructor_id = ?");
  $stmt->bind_param('i', $instructor_id);
  $stmt->execute();

  if($stmt->error) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>