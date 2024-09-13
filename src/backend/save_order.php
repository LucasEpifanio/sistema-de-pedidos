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

if (is_array($data)) {
    $success = true;
    $messages = [];
    
    foreach ($data as $item) {
        if (isset($item['nome']) && isset($item['dia']) && isset($item['hora']) && isset($item['produto']) && isset($item['qtd']) && isset($item['preco'])) {
            $nome = $conn->real_escape_string($item['nome']);
            $dia = $conn->real_escape_string($item['dia']);
            $hora = $conn->real_escape_string($item['hora']);
            $produto = $conn->real_escape_string($item['produto']);
            $qtd = $conn->real_escape_string($item['qtd']);
            $preco = $conn->real_escape_string($item['preco']);
            $notas = isset($item['notas']) ? $conn->real_escape_string($item['notas']) : '';
            $tipo = isset($item['tipo']) ? $conn->real_escape_string($item['tipo']) : '';
            $cortar = isset($item['cortar']) ? $conn->real_escape_string($item['cortar']) : '';

            // Adiciona a coluna "cortar" na query SQL
            $sql = "INSERT INTO pedidos (nome, dia, hora, produto, qtd, preco, notas, tipo, cortar) 
                    VALUES ('$nome', '$dia', '$hora', '$produto', '$qtd', '$preco', '$notas', '$tipo', '$cortar')";

            if (!$conn->query($sql)) {
                $success = false;
                $messages[] = "Erro ao salvar pedido: " . $conn->error;
            }
        } else {
            $missingFields = [];
            if (!isset($item['nome'])) $missingFields[] = 'nome';
            if (!isset($item['dia'])) $missingFields[] = 'dia';
            if (!isset($item['hora'])) $missingFields[] = 'hora';
            if (!isset($item['produto'])) $missingFields[] = 'produto';
            if (!isset($item['qtd'])) $missingFields[] = 'qtd';
            if (!isset($item['preco'])) $missingFields[] = 'preco';
            $success = false;
            $messages[] = "Dados incompletos para um dos pedidos. Faltando: " . implode(", ", $missingFields);
        }
    }

    if ($success) {
        echo json_encode(["success" => true, "message" => "Pedidos salvos com sucesso"]);
    } else {
        echo json_encode(["success" => false, "message" => implode(", ", $messages)]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Formato de dados inválido"]);
}

$conn->close();
?>
