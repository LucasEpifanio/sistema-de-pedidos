<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reactdb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $id = $conn->real_escape_string($data['id']);
    $sql = "DELETE FROM cardapio WHERE id = '$id'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Prato excluído com sucesso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao excluir o prato: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID não fornecido"]);
}

$conn->close();
?>
