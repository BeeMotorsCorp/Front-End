<?php
// ==================== ADMIN-DOCUMENTOS.PHP ====================
// Arquivo: php/admin-documentos.php
// Função: Painel admin para validar/rejeitar documentos de usuários

header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

// ==================== MIDDLEWARE: VERIFICAR SE É ADMIN ====================
function verificarAdmin() {
    // IMPORTANTE: Implementar sistema de roles/permissões
    // Por enquanto, você precisa definir quem é admin
    // Exemplo simples (INSEGURO - apenas para demo):
    
    // session_start();
    // if (!isset($_SESSION['usuario_id']) || $_SESSION['usuario_role'] !== 'admin') {
    //     throw new Exception('Acesso negado - Apenas administradores');
    // }
    
    // Implementação real depende do seu sistema de autenticação
}

try {
    $acao = $_GET['acao'] ?? $_POST['acao'] ?? '';

    switch ($acao) {
        case 'listar':
            listarDocumentosPendentes();
            break;
        
        case 'aprovar':
            aprovarDocumento();
            break;
        
        case 'rejeitar':
            rejeitarDocumento();
            break;
        
        case 'usuario':
            obterDocumentosUsuario();
            break;
        
        default:
            throw new Exception('Ação não reconhecida');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage()
    ]);
}

// ==================== LISTAR DOCUMENTOS PENDENTES ====================
function listarDocumentosPendentes() {
    global $pdo;
    
    try {
        $sql = "
            SELECT 
                du.id_documento_usuario,
                du.id_usuario,
                u.nome,
                u.email,
                u.usuario,
                du.data_envio,
                du.data_ultima_analise,
                COUNT(CASE WHEN du.comprovante_capacidade_tecnica = 'Pendente' THEN 1 END) +
                COUNT(CASE WHEN du.comprovante_habitualidade = 'Pendente' THEN 1 END) +
                COUNT(CASE WHEN du.declaracao_seguranca_acervo = 'Pendente' THEN 1 END) as documentos_pendentes
            FROM documentos_usuario du
            JOIN usuarios u ON du.id_usuario = u.id
            GROUP BY du.id_usuario
            ORDER BY du.data_envio DESC
        ";
        
        $stmt = $pdo->query($sql);
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'sucesso' => true,
            'total' => count($usuarios),
            'usuarios' => $usuarios
        ]);

    } catch (Exception $e) {
        throw new Exception('Erro ao listar documentos: ' . $e->getMessage());
    }
}

// ==================== OBTER DOCUMENTOS DE UM USUÁRIO ====================
function obterDocumentosUsuario() {
    global $pdo;
    
    if (!isset($_GET['usuario_id'])) {
        throw new Exception('ID do usuário não fornecido');
    }

    $usuario_id = filter_var($_GET['usuario_id'], FILTER_VALIDATE_INT);
    
    if (!$usuario_id) {
        throw new Exception('ID do usuário inválido');
    }

    try {
        // Obter dados do usuário
        $sqlUsuario = "SELECT id, nome, email, usuario FROM usuarios WHERE id = ?";
        $stmtUsuario = $pdo->prepare($sqlUsuario);
        $stmtUsuario->execute([$usuario_id]);
        $usuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            throw new Exception('Usuário não encontrado');
        }

        // Obter documentos
        $sqlDocs = "SELECT * FROM documentos_usuario WHERE id_usuario = ?";
        $stmtDocs = $pdo->prepare($sqlDocs);
        $stmtDocs->execute([$usuario_id]);
        $documentos = $stmtDocs->fetch(PDO::FETCH_ASSOC);

        // Listar arquivos na pasta
        $diretorio = 'uploads/documentos/' . $usuario_id . '/';
        $arquivos = [];
        
        if (is_dir($diretorio)) {
            $files = scandir($diretorio);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    $partes = explode('_', $file);
                    $documento_tipo = $partes[0] ?? 'desconhecido';
                    
                    $arquivos[$documento_tipo] = [
                        'nome' => $file,
                        'caminho' => $diretorio . $file,
                        'tamanho' => filesize($diretorio . $file),
                        'data_upload' => filemtime($diretorio . $file)
                    ];
                }
            }
        }

        echo json_encode([
            'sucesso' => true,
            'usuario' => $usuario,
            'documentos' => $documentos,
            'arquivos' => $arquivos
        ]);

    } catch (Exception $e) {
        throw new Exception('Erro ao obter documentos: ' . $e->getMessage());
    }
}

// ==================== APROVAR DOCUMENTO ====================
function aprovarDocumento() {
    global $pdo;
    
    $usuario_id = filter_var($_POST['usuario_id'] ?? null, FILTER_VALIDATE_INT);
    $documento = $_POST['documento'] ?? null;

    if (!$usuario_id || !$documento) {
        throw new Exception('Dados incompletos');
    }

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

    try {
        $sql = "UPDATE documentos_usuario SET {$documento} = 'Aprovado' WHERE id_usuario = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario_id]);

        // TODO: Enviar email ao usuário notificando aprovação

        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Documento aprovado com sucesso!'
        ]);

    } catch (Exception $e) {
        throw new Exception('Erro ao aprovar documento: ' . $e->getMessage());
    }
}

// ==================== REJEITAR DOCUMENTO ====================
function rejeitarDocumento() {
    global $pdo;
    
    $usuario_id = filter_var($_POST['usuario_id'] ?? null, FILTER_VALIDATE_INT);
    $documento = $_POST['documento'] ?? null;
    $motivo = $_POST['motivo'] ?? 'Não especificado';

    if (!$usuario_id || !$documento) {
        throw new Exception('Dados incompletos');
    }

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

    try {
        $sql = "UPDATE documentos_usuario SET {$documento} = 'Reprovado' WHERE id_usuario = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario_id]);

        // TODO: Enviar email ao usuário com motivo da rejeição

        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Documento rejeitado. Usuário será notificado.',
            'motivo' => $motivo
        ]);

    } catch (Exception $e) {
        throw new Exception('Erro ao rejeitar documento: ' . $e->getMessage());
    }
}