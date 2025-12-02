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
    $campos_obrigatorios = ['nome', 'sobrenome', 'email', 'telefone', 'cpf', 'senha'];
    foreach ($campos_obrigatorios as $campo) {
        if (empty($data[$campo])) {
            throw new Exception("Campo '$campo' é obrigatório");
        }
    }
    
    $nome = trim($data['nome']);
    $sobrenome = trim($data['sobrenome']);
    $email = trim($data['email']);
    $telefone = trim($data['telefone']);
    $cpf = trim($data['cpf']);
    $senha = $data['senha'];
    
    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }
    
    // Validar senha (mínimo 6 caracteres)
    if (strlen($senha) < 6) {
        throw new Exception("Senha deve ter no mínimo 6 caracteres");
    }
    
    // Incluir conexão
    include "conexao.php";
    
    if (!isset($conn)) {
        throw new Exception("Erro ao incluir conexao.php");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    // Verificar se email já existe
    $stmtEmail = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    if (!$stmtEmail) {
        throw new Exception("Erro ao preparar statement: " . $conn->error);
    }
    
    $stmtEmail->bind_param("s", $email);
    $stmtEmail->execute();
    $resultEmail = $stmtEmail->get_result();
    
    if ($resultEmail->num_rows > 0) {
        $stmtEmail->close();
        throw new Exception("Este email já está cadastrado");
    }
    $stmtEmail->close();
    
    // Hash da senha
    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
    
    // Inserir novo usuário (sem o campo 'usuario')
    $stmt = $conn->prepare(
        "INSERT INTO usuarios (nome, sobrenome, email, telefone, cpf, senha) 
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    
    if (!$stmt) {
        throw new Exception("Erro ao preparar statement: " . $conn->error);
    }
    
    $stmt->bind_param("ssssss", $nome, $sobrenome, $email, $telefone, $cpf, $senha_hash);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao inserir usuário: " . $stmt->error);
    }
    
    $usuario_id = $stmt->insert_id;
    $stmt->close();
    $conn->close();
    
    ob_end_clean();
    http_response_code(200);
    
    echo json_encode([
        "status" => "ok",
        "mensagem" => "Cadastro realizado com sucesso! Redirecionando para login...",
        "usuario_id" => $usuario_id
    ]);
    
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
?>