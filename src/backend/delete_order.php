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

// Recebe os dados do pedido
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['dia']) && isset($data['cliente'])) {
    $dia = $conn->real_escape_string($data['dia']);
    $cliente = $conn->real_escape_string($data['cliente']);

    // Prepare SQL query based on provided filters
    if ($dia === 'Todos' && $cliente === 'Todos') {
        $sql = "DELETE FROM pedidos";
    } elseif ($dia === 'Todos') {
        $sql = "DELETE FROM pedidos WHERE nome = '$cliente'";
    } elseif ($cliente === 'Todos') {
        $sql = "DELETE FROM pedidos WHERE dia = '$dia'";
    } else {
        $sql = "DELETE FROM pedidos WHERE dia = '$dia' AND nome = '$cliente'";
    }

    // Execute SQL query
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Pedido(s) eliminado(s) com sucesso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao eliminar pedido: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Dados incompletos para eliminação"]);
}

$conn->close();
?>
