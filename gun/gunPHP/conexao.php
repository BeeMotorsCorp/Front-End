<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Configurações de conexão com o banco de dados
$host = "";
$usuario = "AdminSportGun";
$senha = "yQKMl.T51W4vExZ9";
$banco = "sport_gun";

// Cria uma nova conexão MySQLi
$conn = new mysqli($host, $usuario, $senha, $banco);


// Verifica se a conexão foi estabelecida com sucesso
if ($conn->connect_error) {
    die(json_encode([
        "status" => "erro",
        "mensagem" => "Falha na conexão: " . $conn->connect_error
    ]));
}
?>