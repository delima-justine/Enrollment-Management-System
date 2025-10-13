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
     SELECT * FROM tbl_enrollment
     WHERE student_id LIKE ?
     ORDER BY student_id DESC 
    "); 

    $search_param = "%$search%";
    $stmt->bind_param("s", $search_param);
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_enrollment ORDER BY enrollment_id DESC");
  }

  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'enrollment_id'=>$row["enrollment_id"],
      'student_id'=>$row["student_id"],
      'section_id'=>$row["section_id"],
      'date_enrolled'=>$row["date_enrolled"],
      'status'=>$row["status"],
      'letter_grade'=>$row["letter_grade"]
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $student_id= $_POST['student_id'];
  $section_id = $_POST['section_id'];
  $date_enrolled = $_POST['date_enrolled'];
  $status = $_POST['status'];
  $letter_grade = $_POST['letter_grade'];

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_enrollment(
                        student_id, 
                        section_id, 
                        date_enrolled, 
                        status, 
                        letter_grade)
                        VALUES(?, ?, ?, ?, ?)");

  $stmt->bind_param("iisss", 
    $student_id, $section_id, $date_enrolled, $status, $letter_grade);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success  :D";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $enrollment_id = $_PATCH['enrollment_id'] ?? "";
  $new_student_id= $_PATCH['student_id'] ?? "";
  $new_section_id = $_PATCH['section_id'] ?? "";
  $new_date_enrolled = $_PATCH['date_enrolled'] ?? "";
  $new_status = $_PATCH['status'] ?? "";
  $new_letter_grade = $_PATCH['letter_grade'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_enrollment
          SET student_id = ?,
          section_id = ?,
          date_enrolled = ?,
          status = ?,
          letter_grade = ?
          WHERE enrollment_id = ?;
  ");

  $stmt->bind_param("iisssi", 
    $new_student_id, 
    $new_section_id, 
    $new_date_enrolled, 
    $new_status, 
    $new_letter_grade, 
    $enrollment_id,
  );

  $stmt->execute();

  if($stmt->error) {
    die('There is a problem with the process.');
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $enrollment_id = $_DELETE["enrollment_id"] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_enrollment WHERE enrollment_id = ?");
  $stmt->bind_param('i', $enrollment_id);
  $stmt->execute();

  if($stmt->error) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>