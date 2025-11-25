<?php
// Iniciar buffer de saída
ob_start();

// Headers CORS - ANTES DE QUALQUER SAÍDA
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuração de erros
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Log de debug
$logFile = __DIR__ . '/debug_painel.log';
function logDebug($msg) {
    global $logFile;
    $timestamp = date('[Y-m-d H:i:s]');
    file_put_contents($logFile, "$timestamp $msg\n", FILE_APPEND);
}

logDebug("=== PAINEL.PHP INICIADO ===");
logDebug("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);

// Trata OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// ===== ALGORITMO QUICK SORT EM PHP =====
function quickSort($array, $campo, $ordem = 'asc') {
    if (count($array) <= 1) {
        return $array;
    }
    
    $pivo = $array[0];
    $esquerda = [];
    $direita = [];
    
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

try {
    // ===== CONEXÃO COM BANCO =====
    logDebug("Conectando ao banco...");
    
    $conn = new mysqli("localhost", "AdminSportGun", "yQKMl.T51W4vExZ9", "sport_gun");
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    logDebug("Conectado ao banco com sucesso");
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    // ===== GET - LISTAR PRODUTOS COM ORDENAÇÃO =====
    if ($method === 'GET') {
        logDebug("GET REQUEST - Listando produtos");
        
        $result = $conn->query("SELECT * FROM produtos ORDER BY id DESC");
        
        if (!$result) {
            throw new Exception("Erro na query: " . $conn->error);
        }
        
        $produtos = [];
        while ($row = $result->fetch_assoc()) {
            $produtos[] = $row;
        }
        
        logDebug("Total de produtos: " . count($produtos));
        
        // ===== APLICAR QUICK SORT SE SOLICITADO =====
        if (isset($_GET['ordenarPor']) && isset($_GET['ordem'])) {
            $campo = $_GET['ordenarPor'];
            $ordem = $_GET['ordem'];
            
            $camposValidos = ['nome', 'preco', 'estoque', 'marca', 'categoria', 'calibre'];
            
            if (in_array($campo, $camposValidos)) {
                logDebug("Ordenando por: $campo - $ordem");
                $produtos = quickSort($produtos, $campo, $ordem);
            }
        }
        
        ob_end_clean();
        http_response_code(200);
        echo json_encode($produtos);
        
    }
    
    // ===== POST - CRIAR PRODUTO =====
    else if ($method === 'POST') {
        logDebug("POST REQUEST - Criando produto");
        
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
        
        logDebug("Dados recebidos: Nome=$nome, Preco=$preco, Estoque=$estoque");
        
        // Validação
        if (empty($nome)) {
            throw new Exception("Nome é obrigatório");
        }
        
        // Upload de imagem
        if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
            logDebug("Upload de imagem detectado");
            
            // Usar caminho absoluto correto
            $uploadDir = __DIR__ . '/../uploads/';
            
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
                logDebug("Pasta uploads criada em: $uploadDir");
            }
            
            $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!in_array($_FILES['imagem']['type'], $tiposPermitidos)) {
                throw new Exception("Tipo de arquivo não permitido: " . $_FILES['imagem']['type']);
            }
            
            if ($_FILES['imagem']['size'] > 5242880) {
                throw new Exception("Arquivo muito grande (max 5MB)");
            }
            
            $extensao = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
            $nomeArquivo = uniqid('produto_') . '.' . $extensao;
            $caminhoCompleto = $uploadDir . $nomeArquivo;
            
            if (move_uploaded_file($_FILES['imagem']['tmp_name'], $caminhoCompleto)) {
                // Salvar apenas o caminho relativo no banco
                $imagem = 'uploads/' . $nomeArquivo;
                logDebug("Imagem salva: $imagem");
            } else {
                logDebug("Erro ao fazer upload da imagem");
            }
        }
        
        logDebug("Preparando statement para INSERT");
        
        // Inserir no banco
        $stmt = $conn->prepare(
            "INSERT INTO produtos (nome, descricao, preco, estoque, calibre, capacidade, peso, marca, categoria, badge, imagem, disponivel) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        if (!$stmt) {
            throw new Exception("Erro ao preparar statement: " . $conn->error);
        }
        
        $stmt->bind_param(
            "ssdisssssssi",
            $nome, $descricao, $preco, $estoque, $calibre, $capacidade, 
            $peso, $marca, $categoria, $badge, $imagem, $disponivel
        );
        
        logDebug("Executando INSERT...");
        
        if ($stmt->execute()) {
            $novoId = $conn->insert_id;
            logDebug("Produto inserido com ID: $novoId");
            
            $result = $conn->query("SELECT * FROM produtos WHERE id = $novoId");
            if ($result && $result->num_rows > 0) {
                $produto = $result->fetch_assoc();
                logDebug("Produto recuperado do banco");
                
                $stmt->close();
                $conn->close();
                
                ob_end_clean();
                http_response_code(201);
                echo json_encode($produto);
            } else {
                throw new Exception("Erro ao recuperar produto inserido");
            }
        } else {
            throw new Exception("Erro ao executar INSERT: " . $stmt->error);
        }
        
    }
    
    // ===== PUT - EDITAR PRODUTO =====
    else if ($method === 'PUT') {
        logDebug("PUT REQUEST - Editando produto");
        
        parse_str(file_get_contents("php://input"), $put_vars);
        $id = isset($put_vars['id']) ? intval($put_vars['id']) : null;
        
        if (!$id) {
            throw new Exception("ID não fornecido");
        }
        
        $nome = isset($put_vars['nome']) ? trim($put_vars['nome']) : '';
        $descricao = isset($put_vars['descricao']) ? trim($put_vars['descricao']) : '';
        $preco = isset($put_vars['preco']) ? floatval($put_vars['preco']) : 0;
        $estoque = isset($put_vars['estoque']) ? intval($put_vars['estoque']) : 0;
        $calibre = isset($put_vars['calibre']) ? trim($put_vars['calibre']) : '';
        $capacidade = isset($put_vars['capacidade']) ? trim($put_vars['capacidade']) : '';
        $peso = isset($put_vars['peso']) ? trim($put_vars['peso']) : '';
        $marca = isset($put_vars['marca']) ? trim($put_vars['marca']) : '';
        $categoria = isset($put_vars['categoria']) ? trim($put_vars['categoria']) : '';
        $badge = isset($put_vars['badge']) ? trim($put_vars['badge']) : '';
        $disponivel = (isset($put_vars['disponivel']) && $put_vars['disponivel'] === 'true') ? 1 : 0;
        
        logDebug("Atualizando produto ID: $id");
        
        $stmt = $conn->prepare(
            "UPDATE produtos SET nome=?, descricao=?, preco=?, estoque=?, calibre=?, capacidade=?, peso=?, marca=?, categoria=?, badge=?, disponivel=? WHERE id=?"
        );
        
        if (!$stmt) {
            throw new Exception("Erro ao preparar statement: " . $conn->error);
        }
        
        $stmt->bind_param(
            "ssdissssssii",
            $nome, $descricao, $preco, $estoque, $calibre, $capacidade,
            $peso, $marca, $categoria, $badge, $disponivel, $id
        );
        
        if ($stmt->execute()) {
            logDebug("Produto atualizado com sucesso");
            
            $result = $conn->query("SELECT * FROM produtos WHERE id = $id");
            if ($result && $result->num_rows > 0) {
                $produto = $result->fetch_assoc();
                
                $stmt->close();
                $conn->close();
                
                ob_end_clean();
                http_response_code(200);
                echo json_encode($produto);
            }
        } else {
            throw new Exception("Erro ao executar UPDATE: " . $stmt->error);
        }
    }
    
    // ===== DELETE - DELETAR PRODUTO =====
    else if ($method === 'DELETE') {
        logDebug("DELETE REQUEST");
        
        parse_str(file_get_contents("php://input"), $delete_vars);
        $id = isset($delete_vars['id']) ? intval($delete_vars['id']) : null;
        
        logDebug("ID a deletar: $id");
        
        if (!$id) {
            throw new Exception("ID não fornecido");
        }
        
        // Buscar imagem antes de deletar
        $result = $conn->query("SELECT imagem FROM produtos WHERE id = $id");
        if ($result && $result->num_rows > 0) {
            $produto = $result->fetch_assoc();
            
            // Deletar produto
            $stmt = $conn->prepare("DELETE FROM produtos WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                logDebug("Produto deletado com sucesso");
                
                // Deletar imagem se existir
                if (!empty($produto['imagem'])) {
                    $caminhoImagem = __DIR__ . '/../' . $produto['imagem'];
                    if (file_exists($caminhoImagem)) {
                        @unlink($caminhoImagem);
                        logDebug("Imagem deletada: " . $produto['imagem']);
                    }
                }
                
                $stmt->close();
                $conn->close();
                
                ob_end_clean();
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Produto deletado com sucesso"]);
            } else {
                throw new Exception("Erro ao deletar: " . $stmt->error);
            }
        } else {
            throw new Exception("Produto não encontrado");
        }
        
    }
    
    // ===== MÉTODO NÃO PERMITIDO =====
    else {
        throw new Exception("Método não permitido: $method");
    }
    
} catch (Exception $e) {
    logDebug("ERRO CAPTURADO: " . $e->getMessage());
    
    // Fechar conexão se existir
    if (isset($conn)) {
        try {
            if (is_object($conn) && method_exists($conn, 'close')) {
                @$conn->close();
            }
        } catch (Exception $closeError) {
            logDebug("Erro ao fechar conexão: " . $closeError->getMessage());
        }
    }
    
    // Limpar buffer
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    // Enviar erro
    http_response_code(400);
    $resposta_erro = json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
    logDebug("Enviando erro: $resposta_erro");
    echo $resposta_erro;
}

exit;
?>