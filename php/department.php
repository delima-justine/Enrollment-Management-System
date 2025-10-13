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
     SELECT * FROM tbl_department
     WHERE dept_name LIKE ? AND is_deleted = 0
     ORDER BY dept_id DESC 
    "); 

    $search_param = "%$search%";
    $stmt->bind_param("s", $search_param);
  } else if($sort === "ascending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_department 
                            WHERE is_deleted = 0 
                            ORDER BY dept_id ASC");
  } else if($sort === "descending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_department 
                            WHERE is_deleted = 0 
                            ORDER BY dept_id DESC"); 
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_department 
                            WHERE is_deleted = 0 
                            ORDER BY dept_id DESC");
  }

  $stmt->execute();
  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'dept_id'=>$row["dept_id"],
      'dept_code'=>$row["dept_code"],
      'dept_name'=>$row["dept_name"] 
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $dept_code = $_POST['dept_code'] ?? "";
  $dept_name = $_POST['dept_name'] ?? "";
  $is_deleted = 0;

  $stmt = $conn->prepare("INSERT INTO tbl_department(dept_code, dept_name, is_deleted)
                        VALUES(?, ?, ?)");

  $stmt->bind_param("ssi", $dept_code, $dept_name, $is_deleted);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success  :D";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $dept_id = $_PATCH['dept_id'];
  $new_dept_code = $_PATCH['dept_code'];
  $new_dept_name = $_PATCH['dept_name'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_department
          SET dept_code = ?,
          dept_name = ?
          WHERE dept_id = ?;
  ");

  $stmt->bind_param("ssi", $new_dept_code, $new_dept_name, $dept_id);

  $stmt->execute();

  if($stmt->error) {
    die('There is a problem with the process.');
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $dept_id = $_DELETE["dept_id"] ?? "";
  $stmt = $conn->prepare("UPDATE tbl_department 
                          SET is_deleted = 1
                          WHERE dept_id = ?");
  $stmt->bind_param('i', $dept_id);
  $stmt->execute();

  if($stmt->error) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>