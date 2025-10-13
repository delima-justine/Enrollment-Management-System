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
     SELECT * FROM tbl_term
     WHERE term_code LIKE ? AND is_deleted = 0
     ORDER BY term_id DESC 
    "); 

    $search_param = "%$search%";
    $stmt->bind_param("s", $search_param);
  } else if($sort === "ascending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_term 
                            WHERE is_deleted = 0
                            ORDER BY term_id ASC");
  } else if($sort === "descending") {
    $stmt = $conn->prepare("SELECT * FROM tbl_term 
                            WHERE is_deleted = 0
                            ORDER BY term_id DESC");
  } else {
    $stmt = $conn->prepare("SELECT * FROM tbl_term  
                            WHERE is_deleted = 0
                            ORDER BY term_id DESC");
  }

  $stmt->execute();

  if(!$stmt) {
    die("There is an error.");
  }

  $result = $stmt->get_result();

  while($row = $result->fetch_assoc()) {
    array_push($response, array(
      'term_id'=>$row["term_id"],
      'term_code'=>$row["term_code"],
      'start_date'=>$row["start_date"],
      'end_date'=>$row["end_date"]
    ));
  }

  echo json_encode($response);
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
  $term_code = $_POST['term_code'];
  $start_date = $_POST['start_date'];
  $end_date = $_POST['end_date'];
  $is_deleted = 0;

  $stmt = $conn->prepare("INSERT INTO 
                        tbl_term(
                          term_code, 
                          start_date, 
                          end_date,
                          is_deleted
                        )
                        VALUES(?, ?, ?, ?)");

  $stmt->bind_param("sssi", $term_code, $start_date, $end_date, $is_deleted);

  $stmt->execute();

  if(!$stmt) {
    die("Insertion error.");
  }

  echo "Insert success";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'PATCH') {
  parse_str(file_get_contents('php://input'), $_PATCH);

  $term_id = $_PATCH['term_id'] ?? "";
  $new_term_code = $_PATCH['term_code'] ?? "";
  $new_start_date = $_PATCH['start_date'] ?? "";
  $new_end_date = $_PATCH['end_date'] ?? "";

  $stmt = $conn->prepare("
          UPDATE tbl_term
          SET term_code = ?,
          start_date = ?,
          end_date = ?
          WHERE term_id = ?;
  ");

  $stmt->bind_param("sssi", 
    $new_term_code,
    $new_start_date,
    $new_end_date,
    $term_id
  );

  $stmt->execute();

  if(!$stmt) {
    die("Prepare failed: (" . $conn->errno . ") " . $conn->error);
  }

  echo "updated successfully.";
  $stmt->close();
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents('php://input'), $_DELETE);

  $term_id = $_DELETE['term_id'] ?? "";
  $stmt = $conn->prepare("UPDATE tbl_term 
                          SET is_deleted = 1
                          WHERE term_id = ?");
  $stmt->bind_param('i', $term_id);
  $stmt->execute();

  if(!$stmt) {
    die('There is a problem in deleting this one.');
  }

  echo 'deleted successfully.';
}

?>