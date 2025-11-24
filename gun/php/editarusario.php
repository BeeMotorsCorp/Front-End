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
    $campos = ['id', 'nome', 'sobrenome'];
    foreach ($campos as $campo) {
        if (empty($data[$campo])) {
            throw new Exception("Campo '$campo' é obrigatório");
        }
    }
    
    $id = intval($data['id']);
    $nome = trim($data['nome']);
    $sobrenome = trim($data['sobrenome']);
    
    // USAR O ARQUIVO DE CONEXÃO
    include "conexao.php";
    
    if (!isset($conn)) {
        throw new Exception("Erro ao incluir conexao.php");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    // Atualizar dados do usuário
    $stmt = $conn->prepare(
        "UPDATE usuarios SET nome = ?, sobrenome = ? WHERE id = ?"
    );
    
    $stmt->bind_param("ssi", $nome, $sobrenome, $id);
    
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        
        ob_clean();
        http_response_code(200);
        
        $resposta = [
            "status" => "ok",
            "mensagem" => "Dados atualizados com sucesso!",
            "nome" => $nome,
            "sobrenome" => $sobrenome
        ];
        
        echo json_encode($resposta);
        
    } else {
        throw new Exception("Erro ao atualizar: " . $stmt->error);
    }
    
} catch (Exception $e) {
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