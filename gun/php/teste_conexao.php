<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Incluir conexão
require_once 'conexao.php';

// Pegar ação
$acao = $_GET['acao'] ?? 'testar';

// Função para retornar JSON
function retornar($sucesso, $dados) {
    echo json_encode(array_merge(['sucesso' => $sucesso], $dados));
    exit;
}

// ==================== TESTAR CONEXÃO ====================
if ($acao == 'testar') {
    if ($conn->connect_error) {
        retornar(false, [
            'mensagem' => 'Erro na conexão: ' . $conn->connect_error
        ]);
    }
    
    // Pegar versão do MySQL
    $result = $conn->query("SELECT VERSION() as versao");
    $versao = $result->fetch_assoc()['versao'];
    
    retornar(true, [
        'servidor' => $conn->host_info,
        'banco' => 'sport_gun',
        'charset' => $conn->character_set_name(),
        'versao' => $versao
    ]);
}

// ==================== LISTAR PRODUTOS ====================
if ($acao == 'listar') {
    $query = "SELECT * FROM produtos ORDER BY created_at DESC";
    $result = $conn->query($query);
    
    if (!$result) {
        retornar(false, [
            'mensagem' => 'Erro na query: ' . $conn->error
        ]);
    }
    
    $produtos = [];
    while ($row = $result->fetch_assoc()) {
        $produtos[] = $row;
    }
    
    retornar(true, [
        'total' => count($produtos),
        'produtos' => $produtos
    ]);
}

// ==================== INSERIR PRODUTO DE TESTE ====================
if ($acao == 'inserir') {
    $nome = 'Produto Teste ' . date('H:i:s');
    $descricao = 'Este é um produto de teste criado em ' . date('d/m/Y H:i:s');
    $preco = rand(100, 5000) / 10; // Preço aleatório entre 10 e 500
    $estoque = rand(1, 50);
    $calibre = '9mm';
    $capacidade = '15+1';
    $peso = '650';
    $marca = 'Teste';
    $categoria = 'pistola';
    $badge = 'novo';
    $imagem = '';
    $disponivel = 1;
    
    $query = "INSERT INTO produtos 
              (nome, descricao, preco, estoque, calibre, capacidade, peso, marca, categoria, badge, imagem, disponivel) 
              VALUES 
              ('$nome', '$descricao', $preco, $estoque, '$calibre', '$capacidade', '$peso', '$marca', '$categoria', '$badge', '$imagem', $disponivel)";
    
    if ($conn->query($query)) {
        $id = $conn->insert_id;
        
        // Buscar o produto inserido
        $result = $conn->query("SELECT * FROM produtos WHERE id = $id");
        $produto = $result->fetch_assoc();
        
        retornar(true, [
            'id' => $id,
            'produto' => $produto,
            'mensagem' => 'Produto inserido com sucesso!'
        ]);
    } else {
        retornar(false, [
            'mensagem' => 'Erro ao inserir: ' . $conn->error
        ]);
    }
}

// ==================== LIMPAR PRODUTOS DE TESTE ====================
if ($acao == 'limpar') {
    $query = "DELETE FROM produtos WHERE nome LIKE 'Produto Teste%'";
    
    if ($conn->query($query)) {
        $deletados = $conn->affected_rows;
        
        retornar(true, [
            'deletados' => $deletados,
            'mensagem' => 'Produtos de teste deletados com sucesso!'
        ]);
    } else {
        retornar(false, [
            'mensagem' => 'Erro ao deletar: ' . $conn->error
        ]);
    }
}

$conn->close();
?>