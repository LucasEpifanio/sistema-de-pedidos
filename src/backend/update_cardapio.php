<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reactdb";

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados: ' . $conn->connect_error]));
}

// Receber os dados da requisição
$data = json_decode(file_get_contents('php://input'), true);

// Validar dados
if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
    exit;
}

// Preparar a consulta SQL
$sql = "UPDATE cardapio SET prato = ?, Meia_dose = ?, dose = ?, kg = ?, Meio_Kg = ?, leitao_inteiro = ?, meio_leitao = ?, cortar = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('sdddddddi', $data['prato'], $data['Meia_dose'], $data['dose'], $data['kg'], $data['Meio_Kg'], $data['leitao_inteiro'], $data['meio_leitao'], $data['cortar'], $data['id']);

// Executar a consulta
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o item']);
}

// Fechar a conexão
$stmt->close();
$conn->close();
?>
