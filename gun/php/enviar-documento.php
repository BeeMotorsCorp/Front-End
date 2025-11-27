<?php
// ==================== ENVIAR-DOCUMENTO.PHP ====================
// Arquivo: php/enviar-documento.php
// Função: Receber e salvar documentos dos usuários

header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

try {
    // Verificar se é uma requisição POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método HTTP não permitido');
    }

    // Validar dados enviados
    if (!isset($_POST['usuario_id']) || !isset($_POST['documento']) || !isset($_FILES['arquivo'])) {
        throw new Exception('Dados incompletos');
    }

    $usuario_id = filter_var($_POST['usuario_id'], FILTER_VALIDATE_INT);
    $documento = $_POST['documento'];
    $arquivo = $_FILES['arquivo'];

    if (!$usuario_id) {
        throw new Exception('ID do usuário inválido');
    }

    // Validar tipo de arquivo permitido
    $tipos_permitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!in_array($arquivo['type'], $tipos_permitidos)) {
        throw new Exception('Tipo de arquivo não permitido. Use PDF, JPG ou PNG');
    }

    // Validar tamanho do arquivo (máximo 5MB)
    $tamanho_maximo = 5 * 1024 * 1024;
    if ($arquivo['size'] > $tamanho_maximo) {
        throw new Exception('Arquivo muito grande. Máximo 5MB');
    }

    // Criar diretório se não existir
    $diretorio = 'uploads/documentos/' . $usuario_id . '/';
    if (!is_dir($diretorio)) {
        if (!mkdir($diretorio, 0755, true)) {
            throw new Exception('Erro ao criar diretório de uploads');
        }
    }

    // Gerar nome único para o arquivo
    $extensao = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
    $nome_arquivo = $documento . '_' . time() . '.' . $extensao;
    $caminho_arquivo = $diretorio . $nome_arquivo;

    // Salvar arquivo
    if (!move_uploaded_file($arquivo['tmp_name'], $caminho_arquivo)) {
        throw new Exception('Erro ao salvar o arquivo');
    }

    // Atualizar banco de dados
    $sql = "UPDATE documentos_usuario SET {$documento} = 'Pendente' WHERE id_usuario = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$usuario_id]);

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Documento enviado com sucesso!',
        'arquivo' => $nome_arquivo,
        'caminho' => $caminho_arquivo
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ]);
}