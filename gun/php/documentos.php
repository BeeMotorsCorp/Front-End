<?php
// ==================== DOCUMENTOS.PHP ====================
// Arquivo: php/documentos.php
// Função: Carregar documentos do usuário

header('Content-Type: application/json; charset=utf-8');

// Incluir conexão com banco de dados
require_once 'config.php';

try {
    // Verificar se usuario_id foi enviado
    if (!isset($_GET['usuario_id']) || empty($_GET['usuario_id'])) {
        throw new Exception('ID do usuário não fornecido');
    }

    $usuario_id = filter_var($_GET['usuario_id'], FILTER_VALIDATE_INT);
    
    if (!$usuario_id) {
        throw new Exception('ID do usuário inválido');
    }

    // Preparar query para buscar documentos do usuário
    $sql = "SELECT * FROM documentos_usuario WHERE id_usuario = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$usuario_id]);
    
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$resultado) {
        // Se não houver registro, criar um vazio
        $sqlInsert = "INSERT INTO documentos_usuario (id_usuario) VALUES (?)";
        $stmtInsert = $pdo->prepare($sqlInsert);
        $stmtInsert->execute([$usuario_id]);
        
        $resultado = [
            'id_documento_usuario' => $pdo->lastInsertId(),
            'id_usuario' => $usuario_id,
            'comprovante_capacidade_tecnica' => 'Pendente',
            'comprovante_habitualidade' => 'Pendente',
            'declaracao_seguranca_acervo' => 'Pendente',
            'certidao_antecedente_federal' => 'Pendente',
            'declaracao_nao_responde_inquerito' => 'Pendente',
            'documento_identificacao' => 'Pendente',
            'laudo_aptidao_psicologica' => 'Pendente',
            'comprovante_residencia' => 'Pendente',
            'comprovante_ocupacao_licita' => 'Pendente',
            'certidao_antecedente_estadual' => 'Pendente',
            'certidao_antecedente_militar' => 'Pendente',
            'certidao_antecedente_eleitoral' => 'Pendente'
        ];
    }

    // Formatar resposta
    $documentos = [];
    $campos_documentos = [
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

    foreach ($campos_documentos as $campo) {
        $documentos[$campo] = [
            'status' => $resultado[$campo] ?? 'Pendente',
            'arquivo' => null,
            'data_envio' => $resultado['data_envio'] ?? null
        ];
    }

    echo json_encode([
        'sucesso' => true,
        'documentos' => $documentos
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ]);
}