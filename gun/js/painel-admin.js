// ==================== CONFIGURAÇÃO ====================
console.log('🚀 Painel Admin Carregado');

// Verificar autenticação
if (localStorage.getItem('admin_authenticated') !== 'true') {
    window.location.href = 'admin-login.html';
}

// Carregar nome do admin
const adminUser = localStorage.getItem('admin_user');
if (adminUser) {
    document.getElementById('adminUserName').textContent = adminUser;
}

// ==================== NAVEGAÇÃO ENTRE SEÇÕES ====================
function changeSection(sectionName) {
    // Ocultar todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Remover classe active de todos os links
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });

    // Mostrar seção selecionada
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
    }

    // Adicionar classe active no link
    const link = document.querySelector(`[data-section="${sectionName}"]`);
    if (link) {
        link.classList.add('active');
    }

    // Carregar dados da seção
    switch(sectionName) {
        case 'dashboard':
            carregarDashboard();
            break;
        case 'clientes':
            carregarClientes();
            break;
        case 'documentos':
            carregarDocumentos();
            break;
        case 'produtos':
            break;
    }
}

// Setup event listeners para navegação
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            if (section) {
                changeSection(section);
            }
        });
    });

    // Carregar dashboard inicial
    carregarDashboard();
});

// ==================== LOGOUT ====================
function logout() {
    if (confirm('Deseja realmente sair do painel administrativo?')) {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_login_time');
        window.location.href = 'admin-login.html';
    }
}

// ==================== DASHBOARD ====================
async function carregarDashboard() {
    try {
        // Carregar estatísticas de clientes
        const responseClientes = await fetch('php/buscar-clientes.php');
        const dataClientes = await responseClientes.json();
        
        if (dataClientes.sucesso) {
            document.getElementById('totalClientes').textContent = dataClientes.total;
        }

        // Carregar estatísticas de documentos
        const responseDocumentos = await fetch('php/admin-documentos.php?acao=listar');
        const dataDocumentos = await responseDocumentos.json();
        
        if (dataDocumentos.sucesso) {
            let pendentes = 0;
            dataDocumentos.usuarios.forEach(usuario => {
                pendentes += usuario.documentos_pendentes || 0;
            });
            document.getElementById('documentosPendentes').textContent = pendentes;
        }

        // Carregar estatísticas de produtos
        const responseProdutos = await fetch('php/painel.php');
        const dataProdutos = await responseProdutos.json();
        
        if (Array.isArray(dataProdutos)) {
            document.getElementById('totalProdutos').textContent = dataProdutos.length;
        }

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// ==================== CLIENTES ====================
async function carregarClientes() {
    try {
        console.log('🔍 Buscando clientes...');
        
        const response = await fetch('php/buscar-clientes.php');
        
        // ⭐⭐ ADICIONE ESTAS LINHAS PARA DEBUG ⭐⭐
        const textResponse = await response.text();
        console.log('📄 Resposta bruta:', textResponse);
        
        const dados = JSON.parse(textResponse);
        // ⭐⭐ FIM DAS LINHAS DE DEBUG ⭐⭐
        
        if (dados.sucesso) {
            exibirClientes(dados.clientes);
            document.getElementById('totalClientes').textContent = dados.total;
        } else {
            throw new Error(dados.erro || 'Erro desconhecido');
        }
        
    } catch (error) {
        console.error
    }
}

function setupSearchClientes() {
    const searchInput = document.getElementById('searchClientes');
    const tbody = document.getElementById('clientesTableBody');
    const rows = tbody.querySelectorAll('tr');

    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();

        rows.forEach(row => {
            const texto = row.textContent.toLowerCase();
            if (texto.includes(termo)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// ==================== VER DETALHES DO CLIENTE ====================
async function verDetalhesCliente(clienteId) {
    const modal = document.getElementById('modalCliente');
    const modalBody = document.getElementById('modalClienteBody');

    try {
        // Buscar dados completos do cliente
        const responseCliente = await fetch(`php/buscar-clientes.php?usuario_id=${clienteId}`);
        const dataCliente = await responseCliente.json();

        if (!dataCliente.sucesso) {
            throw new Error('Cliente não encontrado');
        }

        const cliente = dataCliente.usuario;

        // Buscar documentos do cliente
        const responseDocumentos = await fetch(`php/documentos.php?usuario_id=${clienteId}`);
        const dataDocumentos = await responseDocumentos.json();

        const documentos = dataDocumentos.sucesso ? dataDocumentos.documentos : {};

        // Montar HTML do modal
        modalBody.innerHTML = `
            <div class="user-card">
                <div class="user-card-header">
                    <div class="user-avatar-large">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h3 style="color: #FFFFFF; margin-bottom: 0.25rem;">${cliente.nome} ${cliente.sobrenome}</h3>
                        <p style="color: #737373; font-size: 0.85rem;">ID: ${cliente.id}</p>
                    </div>
                </div>

                <div class="user-info-grid">
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">${cliente.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">CPF</span>
                        <span class="info-value">${cliente.cpf}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Telefone</span>
                        <span class="info-value">${cliente.telefone || 'Não informado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data de Cadastro</span>
                        <span class="info-value">${formatarData(cliente.data_criacao)}</span>
                    </div>
                </div>
            </div>

            <h3 style="color: #DC2626; margin: 2rem 0 1rem; text-transform: uppercase; font-size: 1.2rem;">
                <i class="fas fa-file-alt"></i> Documentos CAC
            </h3>

            <div class="documents-grid">
                ${gerarCardsDocumentos(documentos, clienteId)}
            </div>
        `;

        modal.classList.add('show');

    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes do cliente');
    }
}

function gerarCardsDocumentos(documentos, clienteId) {
    const tipos = {
        comprovante_capacidade_tecnica: 'Comprovante de Capacidade Técnica',
        comprovante_habitualidade: 'Comprovante de Habitualidade',
        declaracao_seguranca_acervo: 'Declaração de Segurança do Acervo',
        certidao_antecedente_federal: 'Certidão de Antecedentes Federais',
        declaracao_nao_responde_inquerito: 'Declaração de Não Responde Inquérito',
        documento_identificacao: 'Documento de Identificação',
        laudo_aptidao_psicologica: 'Laudo de Aptidão Psicológica',
        comprovante_residencia: 'Comprovante de Residência',
        comprovante_ocupacao_licita: 'Comprovante de Ocupação Lícita',
        certidao_antecedente_estadual: 'Certidão de Antecedentes Estaduais',
        certidao_antecedente_militar: 'Certidão de Antecedentes Militares',
        certidao_antecedente_eleitoral: 'Certidão de Antecedentes Eleitorais'
    };

    return Object.entries(tipos).map(([chave, nome]) => {
        const status = documentos[chave] || 'Pendente';
        const badgeClass = status === 'Aprovado' ? 'badge-approved' : 
                          status === 'Reprovado' ? 'badge-rejected' : 'badge-pending';

        return `
            <div class="document-card">
                <div class="document-header">
                    <span class="document-name">${nome}</span>
                    <span class="badge ${badgeClass}">${status}</span>
                </div>
                <div class="document-actions">
                    ${status !== 'Aprovado' ? `
                        <button class="btn btn-approve" onclick="aprovarDocumento(${clienteId}, '${chave}')">
                            <i class="fas fa-check"></i> Aprovar
                        </button>
                    ` : ''}
                    ${status !== 'Reprovado' ? `
                        <button class="btn btn-reject" onclick="rejeitarDocumento(${clienteId}, '${chave}')">
                            <i class="fas fa-times"></i> Rejeitar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== APROVAR/REJEITAR DOCUMENTO ====================
async function aprovarDocumento(clienteId, documento) {
    if (!confirm('Aprovar este documento?')) return;

    try {
        const formData = new FormData();
        formData.append('acao', 'aprovar');
        formData.append('usuario_id', clienteId);
        formData.append('documento', documento);

        const response = await fetch('php/admin-documentos.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.sucesso) {
            alert('✅ Documento aprovado com sucesso!');
            verDetalhesCliente(clienteId);
            carregarDashboard();
        } else {
            alert('❌ Erro ao aprovar documento: ' + (data.erro || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao conectar com servidor');
    }
}

async function rejeitarDocumento(clienteId, documento) {
    const motivo = prompt('Digite o motivo da rejeição:');
    if (!motivo) return;

    try {
        const formData = new FormData();
        formData.append('acao', 'rejeitar');
        formData.append('usuario_id', clienteId);
        formData.append('documento', documento);
        formData.append('motivo', motivo);

        const response = await fetch('php/admin-documentos.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.sucesso) {
            alert('✅ Documento rejeitado. Cliente será notificado.');
            verDetalhesCliente(clienteId);
            carregarDashboard();
        } else {
            alert('❌ Erro ao rejeitar documento: ' + (data.erro || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao conectar com servidor');
    }
}

// ==================== DOCUMENTOS ====================
async function carregarDocumentos() {
    const tbody = document.getElementById('documentosTableBody');

    try {
        const response = await fetch('php/admin-documentos.php?acao=listar');
        const data = await response.json();

        if (data.sucesso && data.usuarios.length > 0) {
            tbody.innerHTML = data.usuarios.map(usuario => {
                const pendentes = usuario.documentos_pendentes || 0;
                
                return `
                    <tr>
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>
                            <span class="badge ${pendentes > 0 ? 'badge-pending' : 'badge-approved'}">
                                ${pendentes} ${pendentes === 1 ? 'documento' : 'documentos'}
                            </span>
                        </td>
                        <td>${formatarData(usuario.data_ultima_analise)}</td>
                        <td>
                            <button class="btn btn-view" onclick="verDetalhesCliente(${usuario.id_usuario})">
                                <i class="fas fa-eye"></i> Revisar
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <p>Nenhum documento pendente no momento</p>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar documentos:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #EF4444; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar documentos</p>
                </td>
            </tr>
        `;
    }
}

// ==================== MODAL ====================
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});

// ==================== UTILITÁRIOS ====================
function formatarData(dataString) {
    if (!dataString) return 'N/A';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Verificar sessão expirada (24 horas)
const loginTime = parseInt(localStorage.getItem('admin_login_time') || '0');
const currentTime = Date.now();
const sessionDuration = 24 * 60 * 60 * 1000;

if (loginTime && (currentTime - loginTime) > sessionDuration) {
    alert('Sua sessão expirou. Por favor, faça login novamente.');
    logout();
}

// Proteção contra DevTools
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }
});

console.log('✅ Painel Admin inicializado com sucesso!');
async function carregarClientes() {
    try {
        console.log('🔍 Buscando clientes...');
        
        const response = await fetch('php/buscar-clientes.php');
        console.log('📥 Resposta bruta:', response);
        
        // Verificar o texto da resposta primeiro
        const textResponse = await response.text();
        console.log('📄 Texto da resposta:', textResponse);
        
        // Tentar parsear como JSON
        const dados = JSON.parse(textResponse);
        console.log('✅ JSON parseado:', dados);
        
        if (dados.sucesso) {
            exibirClientes(dados.clientes);
            document.getElementById('totalClientes').textContent = dados.total;
        } else {
            throw new Error(dados.erro || 'Erro desconhecido');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar clientes:', error);
        alert('Erro ao carregar clientes: ' + error.message);
    }
}