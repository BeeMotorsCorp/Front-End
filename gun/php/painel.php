<?php
// QUICK SORT NO BACKEND
error_reporting(0);
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

// ===== ALGORITMO QUICK SORT EM PHP =====
function quickSort($array, $campo, $ordem = 'asc') {
    // Caso base: array com 0 ou 1 elemento já está ordenado
    if (count($array) <= 1) {
        return $array;
    }
    
    // Escolhe o pivô (primeiro elemento)
    $pivo = $array[0];
    $esquerda = [];
    $direita = [];
    
    // Divide o array em elementos menores e maiores que o pivô
    for ($i = 1; $i < count($array); $i++) {
        $comparacao = compararValores($array[$i][$campo], $pivo[$campo], $campo);
        
        if ($ordem === 'asc') {
            if ($comparacao <= 0) {
                $esquerda[] = $array[$i];
            } else {
                $direita[] = $array[$i];
            }
        } else {
            if ($comparacao >= 0) {
                $esquerda[] = $array[$i];
            } else {
                $direita[] = $array[$i];
            }
        }
    }
    
    // Recursivamente ordena e combina
    return array_merge(
        quickSort($esquerda, $campo, $ordem),
        array($pivo),
        quickSort($direita, $campo, $ordem)
    );
}

function compararValores($a, $b, $campo) {
    if ($campo === 'preco' || $campo === 'estoque') {
        return floatval($a) - floatval($b);
    } elseif ($campo === 'nome' || $campo === 'marca' || $campo === 'categoria') {
        return strcasecmp($a, $b);
    } else {
        return strcmp($a, $b);
    }
}

// ===== CONEXÃO COM BANCO =====
try {
    $conn = new mysqli("", "AdminSportGun", "yQKMl.T51W4vExZ9", "sport_gun");
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    // ===== GET - LISTAR PRODUTOS COM ORDENAÇÃO =====
    if ($method === 'GET') {
        // Buscar todos os produtos
        $result = $conn->query("SELECT * FROM produtos ORDER BY id DESC");
        
        if (!$result) {
            throw new Exception("Erro na query: " . $conn->error);
        }
        
        $produtos = [];
        while ($row = $result->fetch_assoc()) {
            $produtos[] = $row;
        }
        
        // ===== APLICAR QUICK SORT SE SOLICITADO =====
        if (isset($_GET['ordenarPor']) && isset($_GET['ordem'])) {
            $campo = $_GET['ordenarPor'];
            $ordem = $_GET['ordem'];
            
            // Campos válidos para ordenação
            $camposValidos = ['nome', 'preco', 'estoque', 'marca', 'categoria', 'calibre'];
            
            if (in_array($campo, $camposValidos)) {
                $produtos = quickSort($produtos, $campo, $ordem);
            }
        }
        
        echo json_encode($produtos);
    }
    
    // ===== POST - CRIAR PRODUTO =====
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
        
        // Upload de imagem (mantenha seu código existente)
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
            
            if ($_FILES['imagem']['size'] > 5242880) {
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
    
    // ===== DELETE - DELETAR PRODUTO =====
    else if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        
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
