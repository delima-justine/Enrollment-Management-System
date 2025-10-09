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

  $stmt = $conn->prepare("SELECT * FROM tbl_course_prerequisite");
  $stmt->execute();

  if(!$stmt) {
    die("There is an error.");
  }

  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'course_id'=>$row["course_id"],
      'prereq_course_id'=>$row["prereq_course_id"]
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $course_id = $_POST['course_id'];
  $prereq_course_id = $_POST['prereq_course_id'];

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_course_prerequisite(
                          course_id, 
                          prereq_course_id
                        )
                        VALUES(?, ?)");

  $stmt->bind_param("ii", $course_id, $prereq_course_id);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  // $course_id = $_PATCH['course_id'];
  $course_id = $_PATCH['course_id'] ?? "";
  $new_prereq_course_id = $_PATCH['prereq_course_id'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_course_prerequisite
          SET prereq_course_id = ?
          WHERE course_id = ?;
  ");

  $stmt->bind_param("ii", $new_prereq_course_id, $course_id);

  $stmt->execute();

  if(!$stmt) {
    die("Prepare failed: (" . $conn->errno . ") " . $conn->error);
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $course_id = $_DELETE['course_id'] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_course_prerequisite WHERE course_id = ?");
  $stmt->bind_param('i', $course_id);
  $stmt->execute();

  if(!$stmt) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>