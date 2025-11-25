<?php
// NÃO chamar ob_start() aqui! Deixa para quem incluir

// Configurações de erros
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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
    
    // SUCESSO - não fazer echo aqui!
    
} catch (Exception $e) {
    // Lançar erro para quem incluir tratar
    throw $e;
}

// Não feche ?>
// (deixar sem fechar evita espaços em branco no final)