<?php
// teste-minimo.php - Teste ultra simples
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    "status" => "funcionando",
    "teste" => "PHP está OK"
]);
exit;
?>