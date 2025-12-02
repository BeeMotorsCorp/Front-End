<?php
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit;
}
 // Incluir conexão
    include "conexao.php";
    
    if (!isset($conn)) {
        throw new Exception("Erro ao incluir conexao.php");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    // Verificar se usuario_id foi fornecido
    if (empty($_GET['usuario_id'])) {
        throw new Exception("ID do usuário não fornecido");
    }
    
    $usuario_id = intval($_GET['usuario_id']);
    
    // Incluir conexão
    include "conexao.php";
    
    if (!isset($conn)) {
        throw new Exception("Erro ao conectar com o banco");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    // Buscar dados do usuário
    $stmt = $conn->prepare(
        "SELECT id, nome, sobrenome, email, telefone, cpf 
         FROM usuarios WHERE id = ?"
    );
    
    if (!$stmt) {
        throw new Exception("Erro ao preparar statement: " . $conn->error);
    }
    
    $stmt->bind_param("i", $usuario_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar query: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        throw new Exception("Usuário não encontrado");
    }
    
    $usuario = $result->fetch_assoc();
    $stmt->close();
    $conn->close();
    
    ob_end_clean();
    http_response_code(200);
    
    echo json_encode([
        "sucesso" => true,
        "usuario" => [
            "id" => $usuario['id'],
            "nome" => $usuario['nome'],
            "sobrenome" => $usuario['sobrenome'],
            "email" => $usuario['email'],
            "telefone" => $usuario['telefone'],
            "cpf" => $usuario['cpf']
        ]
    ]);
    
} catch (Exception $e) {
    if (isset($conn)) {
        @$conn->close();
    }
    
    ob_end_clean();
    http_response_code(400);
    
    echo json_encode([
        "sucesso" => false,
        "erro" => $e->getMessage()
    ]);
}

exit;
?>