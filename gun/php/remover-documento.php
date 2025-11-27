<?php
// ==================== REMOVER-DOCUMENTO.PHP ====================
// Arquivo: php/remover-documento.php
// Função: Remover documentos enviados pelos usuários

header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

try {
    // Verificar se é uma requisição DELETE
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception('Método HTTP não permitido');
    }

    // Ler dados do corpo da requisição
    $entrada = json_decode(file_get_contents('php://input'), true);

    if (!isset($entrada['usuario_id']) || !isset($entrada['documento'])) {
        throw new Exception('Dados incompletos');
    }

    $usuario_id = filter_var($entrada['usuario_id'], FILTER_VALIDATE_INT);
    $documento = $entrada['documento'];

    if (!$usuario_id) {
        throw new Exception('ID do usuário inválido');
    }

    // Validar se documento existe
    $documentos_validos = [
        'comprovante_capacidade_tecnica',
        'comprovante_habitualidade',
        'declaracao_seguranca_acervo',
        'certidao_antecedente_federal',
        'declaracao_nao_responde_inquerito',
        'documento_identificacao',
        'laudo_aptidao_psicologica',
        'comprovante_residencia',
        'comprovante_ocupacao_licita',
        'certidao_antecedente_estadual',
        'certidao_antecedente_militar',
        'certidao_antecedente_eleitoral'
    ];

    if (!in_array($documento, $documentos_validos)) {
        throw new Exception('Documento inválido');
    }

    // Buscar informações do arquivo a deletar
    $diretorio = 'uploads/documentos/' . $usuario_id . '/';
    $pattern = $documento . '_*';
    $arquivos = glob($diretorio . $pattern);

    // Deletar arquivos
    foreach ($arquivos as $arquivo) {
        if (is_file($arquivo)) {
            unlink($arquivo);
        }
    }

    // Atualizar banco de dados para "Pendente"
    $sql = "UPDATE documentos_usuario SET {$documento} = 'Pendente' WHERE id_usuario = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$usuario_id]);

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Documento removido com sucesso'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ]);
}