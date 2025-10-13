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
     SELECT * FROM tbl_course
     WHERE course_title LIKE ?
     ORDER BY course_id DESC 
    ");

    $course_title = "%$search%";
    $stmt->bind_param("s", $course_title);
  } else if($sort === "ascending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_course ORDER BY course_id ASC");
  } else if($sort === "descending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_course ORDER BY course_id DESC");
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_course ORDER BY course_id DESC");
  }

  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'course_id'=>$row["course_id"],
      'course_code'=>$row["course_code"],
      'course_title'=>$row["course_title"],
      'units'=>$row["units"],
      'lecture_hours'=>$row["lecture_hours"],
      'lab_hours'=>$row["lab_hours"],
      'dept_id'=>$row['dept_id'] 
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $course_code = $_POST['course_code'];
  $course_title = $_POST['course_title'];
  $units = $_POST['units'];
  $lecture_hours = $_POST['lecture_hours'];
  $lab_hours = $_POST['lab_hours'];
  $dept_id = $_POST['dept_id'];

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_course(course_code, course_title, units,
                        lecture_hours, lab_hours, dept_id)
                        VALUES(?, ?, ?, ?, ?, ?)");

  $stmt->bind_param("ssiiii", 
    $course_code, $course_title, $units, $lecture_hours, $lab_hours, $dept_id);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success  :D";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $course_id = $_PATCH['course_id'];
  $new_course_code = $_PATCH['course_code'] ?? "";
  $new_course_title = $_PATCH['course_title'] ?? "";
  $new_units = $_PATCH['units'] ?? "";
  $new_lecture_hours = $_PATCH['lecture_hours'] ?? "";
  $new_lab_hours = $_PATCH['lab_hours'] ?? "";
  $new_dept_id = $_PATCH['dept_id'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_course
          SET course_code = ?,
          course_title = ?,
          units = ?,
          lecture_hours = ?,
          lab_hours = ?,
          dept_id = ?
          WHERE course_id = ?;
  ");

  $stmt->bind_param("ssiiiii", $new_course_code, $new_course_title, $new_units, 
    $new_lecture_hours, $new_lab_hours, $new_dept_id, $course_id);


  $stmt->execute();

  if($stmt->error) {
    die('There is a problem with the process.');
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $course_id = $_DELETE["course_id"] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_course WHERE course_id = ?");
  $stmt->bind_param('i', $course_id);
  $stmt->execute();

  if($stmt->error) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>