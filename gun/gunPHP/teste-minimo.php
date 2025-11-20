<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

$conn = new mysqli("localhost", "AdminSportGun", "yQKMl.T51W4vExZ9", "sport_gun");

if ($conn->connect_error) {
    echo "❌ ERRO: " . $conn->connect_error . "";
} else {
    echo "✅ CONECTADO COM SUCESSO!";
    echo "Versão MySQL: " . $conn->server_info . "";
    
    // Testar tabelas
    $result = $conn->query("SHOW TABLES");
    echo "Tabelas no banco:";
    while ($row = $result->fetch_array()) {
        echo "" . $row[0] . "";
    }
    echo "";
}

$conn->close();
?>