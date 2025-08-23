<?php
// Allow cross-origin (for local testing if needed)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

// Connect to MySQL database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "imt_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database Connection Failed: " . $conn->connect_error]));
}

// Get POST data
$firstName = $_POST['firstName'] ?? '';
$lastName = $_POST['lastName'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';
$terms = isset($_POST['terms']) ? 1 : 0;

// Validation
if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($password) || empty($confirmPassword)) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit();
}

if ($password !== $confirmPassword) {
    echo json_encode(["status" => "error", "message" => "Passwords do not match."]);
    exit();
}
// Hash the password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// SQL query
$sql = "INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare statement failed: " . $conn->error]);
    exit();
}


$stmt->bind_param("sssss", $firstName, $lastName, $email, $phone, $hashedPassword);
// Execute
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registration Successful!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration Failed: " . $stmt->error]);
}


$stmt->close();
$conn->close();
