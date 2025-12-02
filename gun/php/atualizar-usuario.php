<?php
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    // Ler dados do POST
    $json = file_get_contents("php://input");
    
    if (empty($json)) {
        throw new Exception("Nenhum dado recebido");
    }
    
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido");
    }
    
    // Validar campos obrigatórios
    if (empty($data['id']) || empty($data['nome']) || empty($data['sobrenome'])) {
        throw new Exception("ID, nome e sobrenome são obrigatórios");
    }
    
    $id = intval($data['id']);
    $nome = trim($data['nome']);
    $sobrenome = trim($data['sobrenome']);
    $email = !empty($data['email']) ? trim($data['email']) : null;
    $telefone = !empty($data['telefone']) ? trim($data['telefone']) : null;
    
    // Validar email se fornecido
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }
    
    // Incluir conexão
    include "conexao.php";
    
    if (!isset($conn)) {
        throw new Exception("Erro ao incluir conexao.php");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    // Verificar se usuário existe
    $stmtCheck = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmtCheck->bind_param("i", $id);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    
    if ($resultCheck->num_rows === 0) {
        $stmtCheck->close();
        throw new Exception("Usuário não encontrado");
    }
    $stmtCheck->close();
    
    // Se email foi fornecido, verificar se já existe para outro usuário
    if ($email) {
        $stmtEmail = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
        $stmtEmail->bind_param("si", $email, $id);
        $stmtEmail->execute();
        $resultEmail = $stmtEmail->get_result();
        
        if ($resultEmail->num_rows > 0) {
            $stmtEmail->close();
            throw new Exception("Este email já está cadastrado");
        }
        $stmtEmail->close();
    }
    
    // Preparar a query de atualização dinamicamente
    $campos_atualizacao = ["nome = ?", "sobrenome = ?"];
    $tipos = "ss";
    $params = [$nome, $sobrenome];
    
    if ($email) {
        $campos_atualizacao[] = "email = ?";
        $tipos .= "s";
        $params[] = $email;
    }
    
    if ($telefone) {
        $campos_atualizacao[] = "telefone = ?";
        $tipos .= "s";
        $params[] = $telefone;
    }
    
    $tipos .= "i"; // Para o ID no WHERE
    $params[] = $id;
    
    $sql = "UPDATE usuarios SET " . implode(", ", $campos_atualizacao) . " WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Erro prepare: " . $conn->error);
    }
    
    $stmt->bind_param($tipos, ...$params);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao atualizar: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
    ob_end_clean();
    http_response_code(200);
    
    $resposta = [
        "status" => "ok",
        "mensagem" => "Dados atualizados com sucesso!",
        "nome" => $nome,
        "sobrenome" => $sobrenome,
        "email" => $email,
        "telefone" => $telefone
    ];
    
    echo json_encode($resposta);
    
} catch (Exception $e) {
    if (isset($conn)) {
        try {
            if (is_object($conn) && method_exists($conn, 'close')) {
                @$conn->close();
            }
        } catch (Exception $closeError) {
            // Silenciosamente ignorar erro ao fechar
        }
    }
    
    ob_end_clean();
    http_response_code(400);
    
    echo json_encode([
        "status" => "erro",
        "mensagem" => $e->getMessage()
    ]);
}

exit;