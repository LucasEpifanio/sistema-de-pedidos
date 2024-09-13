<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reactdb";

// Cria a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Recebe os dados da planilha
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Dados inválidos ou não recebidos."]);
    exit();
}

// Prepara a consulta de inserção
$stmt = $conn->prepare("INSERT INTO pedidos (dia, hora, nome, qtd, produto, tipo, cortar, notas, preco) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Erro ao preparar a consulta."]);
    exit();
}

foreach ($data as $row) {
    $stmt->bind_param("sssssssss", $row['dia'], $row['hora'], $row['nome'], $row['qtd'], $row['produto'], $row['tipo'], $row['cortar'], $row['notas'], $row['preco']);
    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Erro ao executar a consulta."]);
        exit();
    }
}

$stmt->close();
$conn->close();
echo json_encode(["status" => "success"]);
?>
