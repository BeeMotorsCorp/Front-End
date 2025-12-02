<?php
// buscar-clientes.php
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

try {
    // Buscar usando a VIEW
    $sql = "SELECT * FROM vw_usuarios_nome_completo ORDER BY data_criacao DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'sucesso' => true,
        'clientes' => $clientes,
        'total' => count($clientes)
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ]);
}
?>