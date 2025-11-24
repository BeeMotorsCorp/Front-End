<?php
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(0);
ini_set('display_errors', 0);

// Log de debug (OPCIONAL - comente se não quiser)
$logFile = __DIR__ . '/debug_cadastro.log';
function logDebug($msg) {
    global $logFile;
    file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logDebug("=== CADASTRAR.PHP INICIADO ===");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(["status" => "erro", "mensagem" => "Método não permitido"]);
    exit;
}

try {
    // Ler dados do POST
    $json = file_get_contents("php://input");
    logDebug("JSON recebido: " . $json);
    
    if (empty($json)) {
        throw new Exception("Nenhum dado recebido");
    }
    
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido");
    }
    
    // Validar campos obrigatórios
    $campos = ['nome', 'sobrenome', 'cpf', 'usuario', 'senha'];
    foreach ($campos as $campo) {
        if (empty($data[$campo])) {
            throw new Exception("Campo '$campo' é obrigatório");
        }
    }
    
    $nome = trim($data["nome"]);
    $sobrenome = trim($data["sobrenome"]);
    $cpf = trim($data["cpf"]);
    $usuario = trim($data["usuario"]);
    $senha = $data["senha"];
    
    logDebug("Usuario: $usuario");
    
    // ===== USAR O ARQUIVO DE CONEXÃO =====
    include "conexao.php";
    
    if (!isset($conn)) {
        throw new Exception("Erro ao incluir conexao.php");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    logDebug("Conectado ao banco");
    
    // Verificar se usuário/CPF já existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ? OR cpf = ?");
    $stmt->bind_param("ss", $usuario, $cpf);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $stmt->close();
        $conn->close();
        throw new Exception("Usuário ou CPF já cadastrado");
    }
    $stmt->close();
    
    // Criptografar senha
    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
    logDebug("Senha criptografada");
    
    // Inserir no banco
    $stmt = $conn->prepare(
        "INSERT INTO usuarios (nome, sobrenome, cpf, usuario, senha) 
         VALUES (?, ?, ?, ?, ?)"
    );
    
    $stmt->bind_param("sssss", $nome, $sobrenome, $cpf, $usuario, $senha_hash);
    
    if ($stmt->execute()) {
        $id = $conn->insert_id;
        logDebug("Cadastrado com ID: $id");
        
        $stmt->close();
        $conn->close();
        
        // Limpar buffer e enviar resposta
        ob_clean();
        http_response_code(200);
        
        $resposta = [
            "status" => "ok",
            "mensagem" => "Cadastro realizado com sucesso!",
            "usuario_id" => $id
        ];
        
        logDebug("Enviando resposta: " . json_encode($resposta));
        echo json_encode($resposta);
        
    } else {
        throw new Exception("Erro ao cadastrar: " . $stmt->error);
    }
    
} catch (Exception $e) {
    logDebug("ERRO: " . $e->getMessage());
    
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
    
    ob_clean();
    http_response_code(400);
    
    echo json_encode([
        "status" => "erro",
        "mensagem" => $e->getMessage()
    ]);
}

exit;
?>