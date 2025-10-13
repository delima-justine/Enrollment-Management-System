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
     SELECT * FROM tbl_section
     WHERE section_code LIKE ?
     ORDER BY section_id DESC 
    "); 

    $search_param = "%$search%";
    $stmt->bind_param("s", $search_param);
  } else if($sort === "ascending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_section ORDER BY section_id ASC");
  } else if($sort === "descending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_section ORDER BY section_id DESC");
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_section ORDER BY section_id DESC");
  }
  
  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'section_id'=>$row["section_id"],
      'section_code'=>$row["section_code"],
      'course_id'=>$row["course_id"],
      'term_id'=>$row["term_id"],
      'instructor_id'=>$row["instructor_id"],
      'day_pattern'=>$row["day_pattern"],
      'start_time'=>$row['start_time'],
      'end_time'=>$row['end_time'],
      'room_id'=>$row['room_id'],
      'max_capacity'=>$row['max_capacity']
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  // $section_id = $_POST['section_id'];
  $section_code= $_POST['section_code'];
  $course_id= $_POST['course_id'];
  $term_id = $_POST['term_id'];
  $instructor_id = $_POST['instructor_id'];
  $day_pattern = $_POST['day_pattern'];
  $start_time = $_POST['start_time'];
  $end_time = $_POST['end_time'];
  $room_id = $_POST['room_id'];
  $max_capacity = $_POST['max_capacity'];
 
  $stmt = $conn->prepare("INSERT INTO 
                        tbl_section(
                        section_code,
                        course_id,
                        term_id,
                        instructor_id,
                        day_pattern,
                        start_time,
                        end_time,
                        room_id,
                        max_capacity
                        )
                        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");

  $stmt->bind_param("siiisssii", 
    $section_code, $course_id, $term_id, $instructor_id, $day_pattern,
    $start_time, $end_time, $room_id, $max_capacity
  );

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success  :D";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $section_id = $_PATCH['section_id'] ?? "";
  $new_section_code= $_PATCH['section_code'] ?? "";
  $new_course_id= $_PATCH['course_id'] ?? "";
  $new_term_id = $_PATCH['term_id'] ?? "";
  $new_instructor_id = $_PATCH['instructor_id'] ?? "";
  $new_day_pattern = $_PATCH['day_pattern'] ?? "";
  $new_start_time = $_PATCH['start_time'] ?? "";
  $new_end_time = $_PATCH['end_time'] ?? "";
  $new_room_id = $_PATCH['room_id'] ?? "";
  $new_max_capacity = $_PATCH['max_capacity'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_section
          SET section_code = ?,
          course_id = ?,
          term_id = ?,
          instructor_id = ?,
          day_pattern = ?,
          start_time = ?,
          end_time = ?,
          room_id = ?,
          max_capacity = ?
          WHERE section_id = ?;
  ");

  $stmt->bind_param("siiisssiii", 
    $new_section_code, $new_course_id, $new_term_id, $new_instructor_id, 
    $new_day_pattern, $new_start_time, $new_end_time, 
    $new_room_id, $new_max_capacity, $section_id
  );

  $stmt->execute();

  if($stmt->error) {
    die('There is a problem with the process.');
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $section_id = $_DELETE["section_id"] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_section WHERE section_id = ?");
  $stmt->bind_param('i', $section_id);
  $stmt->execute();

  if($stmt->error) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>