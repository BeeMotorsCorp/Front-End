<?php
// TESTE DIRETO - Salve isso como teste_direto.php na mesma pasta do conexao.php

echo "<h1>Teste de Conexão MySQL</h1>";
echo "<hr>";

// Dados de conexão
$host = "localhost";
$usuario = "AdminSportGun";
$senha = "yQKMl.T51W4vExZ9";
$banco = "sport_gun";

echo "<h2>1. Testando conexão...</h2>";
echo "Host: $host<br>";
echo "Usuário: $usuario<br>";
echo "Banco: $banco<br>";
echo "<hr>";

// Tentar conectar
$conn = new mysqli($host, $usuario, $senha, $banco);

// Verificar erro
if ($conn->connect_error) {
    echo "<h2 style='color: red;'>❌ ERRO NA CONEXÃO!</h2>";
    echo "<p style='color: red;'>" . $conn->connect_error . "</p>";
    echo "<p>Código do erro: " . $conn->connect_errno . "</p>";
    
    // Diagnósticos
    echo "<h3>Diagnósticos:</h3>";
    echo "<ul>";
    
    if ($conn->connect_errno == 1045) {
        echo "<li>❌ <strong>Usuário ou senha incorretos</strong></li>";
        echo "<li>Verifique no phpMyAdmin se o usuário 'AdminSportGun' existe</li>";
        echo "<li>Verifique se a senha está correta</li>";
    }
    
    if ($conn->connect_errno == 1049) {
        echo "<li>❌ <strong>Banco de dados não existe</strong></li>";
        echo "<li>Execute o script SQL para criar o banco 'sport_gun'</li>";
    }
    
    if ($conn->connect_errno == 2002) {
        echo "<li>❌ <strong>MySQL não está rodando</strong></li>";
        echo "<li>Inicie o MySQL no XAMPP Control Panel</li>";
    }
    
    echo "</ul>";
    exit;
}

echo "<h2 style='color: green;'>✅ CONEXÃO OK!</h2>";
echo "<hr>";

// Informações da conexão
echo "<h2>2. Informações do servidor:</h2>";
echo "Versão MySQL: " . $conn->server_info . "<br>";
echo "Charset: " . $conn->character_set_name() . "<br>";
echo "Host info: " . $conn->host_info . "<br>";
echo "<hr>";

// Testar se a tabela existe
echo "<h2>3. Verificando tabela 'produtos'...</h2>";
$result = $conn->query("SHOW TABLES LIKE 'produtos'");

if ($result->num_rows > 0) {
    echo "<p style='color: green;'>✅ Tabela 'produtos' existe!</p>";
    
    // Contar produtos
    $count = $conn->query("SELECT COUNT(*) as total FROM produtos");
    $total = $count->fetch_assoc()['total'];
    echo "<p>Total de produtos: <strong>$total</strong></p>";
    
    // Estrutura da tabela
    echo "<h3>Estrutura da tabela:</h3>";
    $estrutura = $conn->query("DESCRIBE produtos");
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Chave</th><th>Padrão</th></tr>";
    while ($campo = $estrutura->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $campo['Field'] . "</td>";
        echo "<td>" . $campo['Type'] . "</td>";
        echo "<td>" . $campo['Null'] . "</td>";
        echo "<td>" . $campo['Key'] . "</td>";
        echo "<td>" . $campo['Default'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} else {
    echo "<p style='color: red;'>❌ Tabela 'produtos' NÃO existe!</p>";
    echo "<p>Execute o script SQL para criar a tabela.</p>";
}

echo "<hr>";
echo "<h2>4. Listando bancos disponíveis:</h2>";
$dbs = $conn->query("SHOW DATABASES");
echo "<ul>";
while ($db = $dbs->fetch_assoc()) {
    $dbname = $db['Database'];
    if ($dbname == 'sport_gun') {
        echo "<li style='color: green;'><strong>$dbname</strong> ✅</li>";
    } else {
        echo "<li>$dbname</li>";
    }
}
echo "</ul>";

$conn->close();

echo "<hr>";
echo "<h2 style='color: green;'>✅ TESTE COMPLETO!</h2>";
?>