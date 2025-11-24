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

// Log de debug (OPCIONAL)
$logFile = __DIR__ . '/debug_login.log';
function logDebug($msg) {
    global $logFile;
    file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logDebug("=== LOGIN.PHP INICIADO ===");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(["status" => "erro", "mensagem" => "Método não permitido"]);
    exit;
}

try {
    // Ler dados
    $json = file_get_contents("php://input");
    logDebug("JSON recebido: " . $json);
    
    if (empty($json)) {
        throw new Exception("Nenhum dado recebido");
    }
    
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido");
    }
    
    // Validar campos
    if (empty($data['usuario']) || empty($data['senha'])) {
        throw new Exception("Usuário e senha são obrigatórios");
    }
    
    $usuario = trim($data['usuario']);
    $senha = $data['senha'];
    
    logDebug("Tentativa de login - Usuario: $usuario");
    
    // ===== USAR O ARQUIVO DE CONEXÃO =====
    include "conexao.php";
    
    if (!isset($conn)) {
        throw new Exception("Erro ao incluir conexao.php");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    logDebug("Conectado ao banco");
    
    // Buscar usuário
    $stmt = $conn->prepare("SELECT id, nome, senha FROM usuarios WHERE usuario = ? LIMIT 1");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        logDebug("Usuário não encontrado");
        $stmt->close();
        $conn->close();
        throw new Exception("Usuário ou senha incorretos");
    }
    
    $row = $result->fetch_assoc();
    $stmt->close();
    $conn->close();
    
    // Verificar senha
    if (password_verify($senha, $row["senha"])) {
        logDebug("Login bem-sucedido - ID: " . $row["id"]);
        
        ob_clean();
        http_response_code(200);
        
        $resposta = [
            "status" => "ok",
            "usuario_id" => $row["id"],
            "usuario_nome" => $row["nome"]
        ];
        
        logDebug("Enviando resposta: " . json_encode($resposta));
        echo json_encode($resposta);
        
    } else {
        logDebug("Senha incorreta");
        throw new Exception("Usuário ou senha incorretos");
    }
    
} catch (Exception $e) {
    logDebug("ERRO: " . $e->getMessage());
    
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
    
    ob_clean();
    http_response_code(401);
    
    echo json_encode([
        "status" => "erro",
        "mensagem" => $e->getMessage()
    ]);
}

exit;
?>