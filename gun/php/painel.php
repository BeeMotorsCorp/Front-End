<?php
// painel.php - VERSÃO CORRIGIDA FINAL
error_reporting(0); // Desabilita notices para não quebrar JSON
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Trata OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Conexão com banco
    $conn = new mysqli("", "AdminSportGun", "yQKMl.T51W4vExZ9", "sport_gun");
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    
    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    // ===== GET - LISTAR OU BUSCAR =====
    if ($method === 'GET') {
        if ($id) {
            // Buscar produto específico
            $stmt = $conn->prepare("SELECT * FROM produtos WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                echo json_encode($result->fetch_assoc());
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Produto não encontrado"]);
            }
        } else {
            // Listar todos
            $result = $conn->query("SELECT * FROM produtos ORDER BY id DESC");
            
            if (!$result) {
                throw new Exception("Erro na query: " . $conn->error);
            }
            
            $produtos = [];
            while ($row = $result->fetch_assoc()) {
                $produtos[] = $row;
            }
            
            echo json_encode($produtos);
        }
    }
    
    // ===== POST - CRIAR =====
    else if ($method === 'POST') {
        $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
        $descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : '';
        $preco = isset($_POST['preco']) ? floatval($_POST['preco']) : 0;
        $estoque = isset($_POST['estoque']) ? intval($_POST['estoque']) : 0;
        $calibre = isset($_POST['calibre']) ? trim($_POST['calibre']) : '';
        $capacidade = isset($_POST['capacidade']) ? trim($_POST['capacidade']) : '';
        $peso = isset($_POST['peso']) ? trim($_POST['peso']) : '';
        $marca = isset($_POST['marca']) ? trim($_POST['marca']) : '';
        $categoria = isset($_POST['categoria']) ? trim($_POST['categoria']) : '';
        $badge = isset($_POST['badge']) ? trim($_POST['badge']) : '';
        $disponivel = (isset($_POST['disponivel']) && $_POST['disponivel'] === 'true') ? 1 : 0;
        $imagem = '';
        
        // Validação
        if (empty($nome)) {
            http_response_code(400);
            echo json_encode(["error" => "Nome é obrigatório"]);
            exit;
        }
        
        // Upload de imagem
        if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/';
            
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!in_array($_FILES['imagem']['type'], $tiposPermitidos)) {
                http_response_code(400);
                echo json_encode(["error" => "Tipo de arquivo não permitido"]);
                exit;
            }
            
            if ($_FILES['imagem']['size'] > 5242880) { // 5MB
                http_response_code(400);
                echo json_encode(["error" => "Arquivo muito grande (max 5MB)"]);
                exit;
            }
            
            $extensao = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
            $nomeArquivo = uniqid('produto_') . '.' . $extensao;
            $caminhoCompleto = $uploadDir . $nomeArquivo;
            
            if (move_uploaded_file($_FILES['imagem']['tmp_name'], $caminhoCompleto)) {
                $imagem = $caminhoCompleto;
            }
        }
        
        // Inserir no banco
        $stmt = $conn->prepare(
            "INSERT INTO produtos (nome, descricao, preco, estoque, calibre, capacidade, peso, marca, categoria, badge, imagem, disponivel) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        $stmt->bind_param(
            "ssdisssssssi",
            $nome, $descricao, $preco, $estoque, $calibre, $capacidade, 
            $peso, $marca, $categoria, $badge, $imagem, $disponivel
        );
        
        if ($stmt->execute()) {
            $novoId = $conn->insert_id;
            $result = $conn->query("SELECT * FROM produtos WHERE id = $novoId");
            $produto = $result->fetch_assoc();
            
            http_response_code(201);
            echo json_encode($produto);
        } else {
            throw new Exception("Erro ao inserir: " . $stmt->error);
        }
    }
    
    // ===== DELETE - DELETAR =====
    else if ($method === 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID não fornecido"]);
            exit;
        }
        
        // Buscar imagem antes de deletar
        $result = $conn->query("SELECT imagem FROM produtos WHERE id = $id");
        if ($result->num_rows > 0) {
            $produto = $result->fetch_assoc();
            
            // Deletar produto
            $stmt = $conn->prepare("DELETE FROM produtos WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                // Deletar imagem se existir
                if (!empty($produto['imagem']) && file_exists($produto['imagem'])) {
                    @unlink($produto['imagem']);
                }
                
                echo json_encode(["success" => true, "message" => "Produto deletado com sucesso"]);
            } else {
                throw new Exception("Erro ao deletar: " . $stmt->error);
            }
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Produto não encontrado"]);
        }
    }
    
    // ===== MÉTODO NÃO PERMITIDO =====
    else {
        http_response_code(405);
        echo json_encode(["error" => "Método não permitido"]);
    }
    
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}
?>