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
if (!isset($data['prato'])) {
    echo json_encode(['success' => false, 'message' => 'Nome do prato não fornecido']);
    exit;
}

// Preparar a consulta SQL
$sql = "INSERT INTO cardapio (prato, Meia_dose, dose, kg, Meio_Kg, leitao_inteiro, meio_leitao, cortar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('sddddddd', $data['prato'], $data['Meia_dose'], $data['dose'], $data['kg'], $data['Meio_Kg'], $data['leitao_inteiro'], $data['meio_leitao'], $data['cortar']);

// Executar a consulta
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao adicionar o prato: ' . $stmt->error]);
}

// Fechar a conexão
$stmt->close();
$conn->close();
?>
