<?php
// Configuração de erros
error_reporting(E_ALL);
ini_set('display_errors', 0); // 0 para produção, 1 para desenvolvimento

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Tratar OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações de conexão
define('DB_HOST', 'localhost');
define('DB_USER', 'AdminSportGun');
define('DB_PASS', 'yQKMl.T51W4vExZ9');
define('DB_NAME', 'sport_gun');
define('DB_CHARSET', 'utf8mb4');

// Criar conexão
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Verificar conexão
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    // Definir charset
    if (!$conn->set_charset(DB_CHARSET)) {
        throw new Exception("Erro ao definir charset: " . $conn->error);
    }
    
    // Sucesso (comentado para não aparecer no JSON)
    // echo json_encode(["status" => "ok", "message" => "Conectado com sucesso!"]);
    
} catch (Exception $e) {
    // Em caso de erro, retornar JSON e parar execução
    http_response_code(500);
    echo json_encode([
        "status" => "erro",
        "mensagem" => $e->getMessage()
    ]);
    exit;
}
?>