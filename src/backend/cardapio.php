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

$sql = "SELECT id, prato, Meia_dose, dose, kg, Meio_Kg, leitao_inteiro, meio_leitao, cortar FROM cardapio";
$result = $conn->query($sql);

$cardapio = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $cardapio[] = $row;
    }
}

echo json_encode($cardapio);

$conn->close();
?>