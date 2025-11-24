<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

// Teste simples para verificar se PHP responde corretamente
echo json_encode([
    "status" => "ok",
    "mensagem" => "PHP está funcionando corretamente!",
    "timestamp" => date('Y-m-d H:i:s'),
    "servidor" => $_SERVER['SERVER_SOFTWARE']
]);
?>
