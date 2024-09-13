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
    die(json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados: ' . $conn->connect_error]));
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
    exit;
}

$sql = "UPDATE pedidos SET dia = ?, hora = ?, nome = ?, qtd = ?, cortar = ?, preco = ?, notas = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('sssdsdsi', $data['dia'], $data['hora'], $data['nome'], $data['qtd'], $data['cortar'], $data['preco'], $data['notas'], $data['id']);


if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o pedido']);
}

$stmt->close();
$conn->close();
?>
