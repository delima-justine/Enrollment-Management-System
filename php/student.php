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
     SELECT * FROM tbl_student
     WHERE student_no LIKE ?
     ORDER BY student_id DESC 
    ");

    $search_param = "%$search%";
    $stmt->bind_param("s", $search_param);
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_student ORDER BY student_id DESC");
  }

  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'student_id'=>$row["student_id"],
      'student_no'=>$row["student_no"],
      'last_name'=>$row["last_name"],
      'first_name'=>$row["first_name"],
      'email'=>$row["email"],
      'gender'=>$row["gender"],
      'year_level'=>$row['year_level'],
      'program_id'=>$row['program_id']
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $student_no = $_POST['student_no'];
  $last_name = $_POST['last_name'];
  $first_name = $_POST['first_name'];
  $email = $_POST['email'];
  $gender = $_POST['gender'];
  $year_level = $_POST['year_level'];
  $program_id = $_POST['program_id'];

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_student(student_no, last_name, first_name, email, gender,
                        year_level, program_id )
                        VALUES(?, ?, ?, ?, ?, ?, ?)");

  $stmt->bind_param("sssssii", 
    $student_no, $last_name, $first_name, $email, $gender, $year_level,
      $program_id);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success  :D";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $student_id = $_PATCH['student_id'] ?? "";
  $new_student_no = $_PATCH['student_no'] ?? "";
  $new_last_name = $_PATCH['last_name'] ?? "";
  $new_first_name = $_PATCH['first_name'] ?? "";
  $new_email = $_PATCH['email'] ?? "";
  $new_gender = $_PATCH['gender'] ?? "";
  $new_year_level = $_PATCH['year_level'] ?? "";
  $new_program_id = $_PATCH['program_id'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_student
          SET student_no = ?,
          last_name = ?,
          first_name = ?,
          email = ?,
          gender = ?,
          year_level = ?,
          program_id = ?
          WHERE student_id = ?;
  ");

  $stmt->bind_param("sssssiii", 
    $new_student_no, 
    $new_last_name, 
    $new_first_name, 
    $new_email, 
    $new_gender, 
    $new_year_level,
    $new_program_id,
    $student_id
  );

  $stmt->execute();

  if($stmt->error) {
    die('There is a problem with the process.');
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $student_id = $_DELETE["student_id"] ?? "";
  $stmt = $conn->prepare("DELETE FROM tbl_student WHERE student_id = ?");
  $stmt->bind_param('i', $student_id);
  $stmt->execute();

  if($stmt->error) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>