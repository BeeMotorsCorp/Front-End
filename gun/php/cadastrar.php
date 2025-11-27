<?php
// Iniciar buffer de saída
ob_start();

// Headers CORS - ANTES DE QUALQUER SAÍDA
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Tratar OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit;
}

// Desabilitar exibição de erros no output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Log de debug
$logFile = __DIR__ . '/debug_cadastro.log';
function logDebug($msg) {
    global $logFile;
    $timestamp = date('[Y-m-d H:i:s]');
    file_put_contents($logFile, "$timestamp $msg\n", FILE_APPEND);
}

logDebug("=== CADASTRAR.PHP INICIADO ===");
logDebug("Diretório: " . __DIR__);
logDebug("PHP Version: " . phpversion());

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(["status" => "erro", "mensagem" => "Método não permitido"]);
    exit;
}

try {
    // Ler dados do POST
    $json = file_get_contents("php://input");
    logDebug("JSON recebido: " . substr($json, 0, 100));
    
    if (empty($json)) {
        throw new Exception("Nenhum dado recebido");
    }
    
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }
    
    // Validar campos obrigatórios
    $campos = ['nome', 'sobrenome', 'cpf', 'usuario', 'senha'];
    foreach ($campos as $campo) {
        if (empty($data[$campo])) {
            throw new Exception("Campo '$campo' é obrigatório");
        }
    }
    
    $nome = trim($data["nome"]);
    $sobrenome = trim($data["sobrenome"]);
    $cpf = trim($data["cpf"]);
    $usuario = trim($data["usuario"]);
    $senha = $data["senha"];
    
    logDebug("Usuário a cadastrar: $usuario");
    
    // ===== INCLUIR CONEXÃO =====
    $caminhoConexao = __DIR__ . '/conexao.php';
    logDebug("Procurando conexao.php em: $caminhoConexao");
    
    if (!file_exists($caminhoConexao)) {
        throw new Exception("Arquivo conexao.php não encontrado em: $caminhoConexao");
    }
    
    logDebug("Arquivo encontrado, incluindo...");
    
    // Limpar buffer e incluir
    ob_clean();
    include $caminhoConexao;
    ob_clean();
    
    logDebug("Conexao.php incluído");
    
    if (!isset($conn)) {
        throw new Exception("Variável conn não definida após incluir conexao.php");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
    
    logDebug("Conectado ao banco com sucesso");
    
    // Verificar se usuário já existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ? OR cpf = ?");
    if (!$stmt) {
        throw new Exception("Erro prepare: " . $conn->error);
    }
    
    $stmt->bind_param("ss", $usuario, $cpf);
    if (!$stmt->execute()) {
        throw new Exception("Erro execute: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $stmt->close();
        throw new Exception("Usuário ou CPF já cadastrado");
    }
    $stmt->close();
    
    logDebug("Dados validados, criptografando senha...");
    
    // Criptografar senha
    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
    
    logDebug("Inserindo no banco...");
    
    // Inserir no banco
    $stmt = $conn->prepare(
        "INSERT INTO usuarios (nome, sobrenome, cpf, usuario, senha) VALUES (?, ?, ?, ?, ?)"
    );
    
    if (!$stmt) {
        throw new Exception("Erro prepare insert: " . $conn->error);
    }
    
    $stmt->bind_param("sssss", $nome, $sobrenome, $cpf, $usuario, $senha_hash);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao inserir: " . $stmt->error);
    }
    
    $id = $conn->insert_id;
    $stmt->close();
    $conn->close();
    
    logDebug("SUCESSO! Cadastrado com ID: $id");
    
    // Limpar buffer completamente
    ob_end_clean();
    
    // Enviar resposta
    http_response_code(200);
    $resposta = [
        "status" => "ok",
        "mensagem" => "Cadastro realizado com sucesso!",
        "usuario_id" => $id
    ];
    echo json_encode($resposta);
    exit;
    
} catch (Exception $e) {
    $erro = $e->getMessage();
    logDebug("ERRO CAPTURADO: $erro");
    
    // Fechar conexão se existir (SEM GERAR ERRO)
    if (isset($conn)) {
        try {
            if (is_object($conn) && method_exists($conn, 'close')) {
                @$conn->close(); // @ suprime erros
            }
        } catch (Exception $closeError) {
            logDebug("Erro ao fechar conexão: " . $closeError->getMessage());
        }
    }
    
    // Limpar buffer completamente
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    // Garantir que vai enviar JSON válido
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    $resposta_erro = json_encode([
        "status" => "erro",
        "mensagem" => $erro
    ]);
    logDebug("Enviando erro: $resposta_erro");
    echo $resposta_erro;
    exit;
}
