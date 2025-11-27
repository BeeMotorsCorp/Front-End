<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    // Incluir conexão
    require_once __DIR__ . '/conexao.php';
    
    // Receber JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Dados inválidos');
    }
    
    $id_usuario = intval($input['usuario_id']);
    $itens = $input['itens'];
    $subtotal = floatval($input['subtotal']);
    $frete = floatval($input['frete']);
    $taxas = floatval($input['taxas']);
    $total = floatval($input['total']);
    
    if (!$id_usuario || empty($itens)) {
        throw new Exception('Dados incompletos');
    }
    
    // Verificar conexão
    if ($conn->connect_error) {
        throw new Exception('Erro de conexão ao banco de dados');
    }
    
    // Iniciar transação
    $conn->begin_transaction();
    
    // 1. Criar pedido
    $query = "INSERT INTO pedidos (id_usuario, subtotal, frete, taxas, total, status, data_pedido) 
              VALUES (?, ?, ?, ?, ?, 'pendente', NOW())";
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception('Erro ao preparar query: ' . $conn->error);
    }
    
    $stmt->bind_param('idddd', $id_usuario, $subtotal, $frete, $taxas, $total);
    if (!$stmt->execute()) {
        throw new Exception('Erro ao inserir pedido: ' . $stmt->error);
    }
    
    $id_pedido = $conn->insert_id;
    $stmt->close();
    
    // 2. Inserir itens do pedido
    $query_item = "INSERT INTO pedido_itens (id_pedido, id_produto, quantidade, preco_unitario, subtotal) 
                   VALUES (?, ?, ?, ?, ?)";
    
    $stmt_item = $conn->prepare($query_item);
    if (!$stmt_item) {
        throw new Exception('Erro ao preparar query de itens: ' . $conn->error);
    }
    
    foreach ($itens as $item) {
        $id_produto = intval($item['id']);
        $quantidade = intval($item['quantidade'] ?? 1);
        $preco = floatval($item['preco']);
        $subtotal_item = $preco * $quantidade;
        
        $stmt_item->bind_param('iiiii', $id_pedido, $id_produto, $quantidade, $preco, $subtotal_item);
        if (!$stmt_item->execute()) {
            throw new Exception('Erro ao inserir item: ' . $stmt_item->error);
        }
    }
    
    $stmt_item->close();
    
    // 3. Atualizar estoque
    foreach ($itens as $item) {
        $id_produto = intval($item['id']);
        $quantidade = intval($item['quantidade'] ?? 1);
        
        $query_estoque = "UPDATE produtos SET estoque = estoque - ? WHERE id = ?";
        $stmt_estoque = $conn->prepare($query_estoque);
        if (!$stmt_estoque) {
            throw new Exception('Erro ao preparar query de estoque: ' . $conn->error);
        }
        
        $stmt_estoque->bind_param('ii', $quantidade, $id_produto);
        if (!$stmt_estoque->execute()) {
            throw new Exception('Erro ao atualizar estoque: ' . $stmt_estoque->error);
        }
        $stmt_estoque->close();
    }
    
    // Confirmar transação
    $conn->commit();
    
    // Resposta de sucesso
    echo json_encode([
        'sucesso' => true,
        'pedido_id' => $id_pedido,
        'mensagem' => 'Pedido salvo com sucesso'
    ]);
    
} catch (Exception $e) {
    // Reverter transação em caso de erro
    if (isset($conn)) {
        $conn->rollback();
    }
    
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ]);
    
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>