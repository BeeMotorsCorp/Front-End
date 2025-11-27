// ==================== CONFIGURAÇÃO ====================
const baseURL = window.location.pathname.includes('/painel.html') 
    ? window.location.pathname.split('/painel.html')[0] 
    : '';
const API_URL = baseURL + '/php/painel.php';

console.log('📍 BASE URL detectada:', baseURL);
console.log('📍 API URL final:', API_URL);

// ==================== ELEMENTOS DO DOM ====================
const form = document.getElementById('productForm');
const inputs = {
    nome: document.getElementById('nome'),
    descricao: document.getElementById('descricao'),
    preco: document.getElementById('preco'),
    estoque: document.getElementById('estoque'),
    calibre: document.getElementById('calibre'),
    capacidade: document.getElementById('capacidade'),
    peso: document.getElementById('peso'),
    marca: document.getElementById('marca'),
    categoria: document.getElementById('categoria'),
    badge: document.getElementById('badge'),
    disponivel: document.getElementById('disponivel'),
    imagemInput: document.getElementById('imagemInput')
};

let produtoEmEdicao = null;

// ==================== PREVIEW EM TEMPO REAL ====================
function setupPreviewListeners() {
    inputs.nome.addEventListener('input', (e) => {
        document.getElementById('previewNome').textContent = e.target.value || 'Nome do Produto';
    });

    inputs.descricao.addEventListener('input', (e) => {
        const texto = e.target.value || 'Descrição do produto aparecerá aqui...';
        document.getElementById('previewDescricao').textContent = 
            texto.length > 200 ? texto.substring(0, 200) + '...' : texto;
    });

    inputs.preco.addEventListener('input', (e) => {
        const valor = parseFloat(e.target.value) || 0;
        document.getElementById('previewPreco').textContent = 
            valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    });

    inputs.estoque.addEventListener('input', (e) => {
        document.getElementById('previewEstoque').textContent = `Estoque: ${e.target.value || 0}`;
    });

    inputs.badge.addEventListener('change', (e) => {
        const badge = document.getElementById('previewBadge');
        if (e.target.value) {
            badge.textContent = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });

    inputs.calibre.addEventListener('change', updatePreviewDetails);
    inputs.capacidade.addEventListener('input', updatePreviewDetails);
    inputs.peso.addEventListener('input', updatePreviewDetails);
}

function updatePreviewDetails() {
    const calibre = inputs.calibre.value || '--';
    const capacidade = inputs.capacidade.value || '--';
    const peso = inputs.peso.value ? `${inputs.peso.value}g` : '--';
    
    document.getElementById('previewDetails').innerHTML = `
        <span><i class="fas fa-bullseye"></i> ${calibre}</span>
        <span><i class="fas fa-layer-group"></i> ${capacidade}</span>
        <span><i class="fas fa-weight"></i> ${peso}</span>
    `;
}

// ==================== UPLOAD DE IMAGEM ====================
function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = inputs.imagemInput;
    const previewImg = document.getElementById('previewImage');
    const uploadPreview = document.getElementById('imagePreviewUpload');
    const icon = document.querySelector('.preview-image > i');

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.background = 'rgba(220, 38, 38, 0.05)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--background)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--background)';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files;
            handleImagePreview(file);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImagePreview(file);
        }
    });

    function handleImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            uploadPreview.src = event.target.result;
            uploadPreview.style.display = 'block';
            if (icon) icon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// ==================== ENVIAR FORMULÁRIO ====================
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    showLoading(true);
    
    if (produtoEmEdicao) {
        // ✅ EDITAR PRODUTO - Usar FormData com POST e _method=PUT
        const formData = new FormData();
        
        formData.append('_method', 'PUT');
        formData.append('id', produtoEmEdicao.id);
        formData.append('nome', inputs.nome.value);
        formData.append('descricao', inputs.descricao.value);
        formData.append('preco', inputs.preco.value);
        formData.append('estoque', inputs.estoque.value);
        formData.append('calibre', inputs.calibre.value);
        formData.append('capacidade', inputs.capacidade.value);
        formData.append('peso', inputs.peso.value);
        formData.append('marca', inputs.marca.value);
        formData.append('categoria', inputs.categoria.value);
        formData.append('badge', inputs.badge.value);
        formData.append('disponivel', inputs.disponivel.checked ? '1' : '0'); // ✅ Converter para 1 ou 0
        
        if (inputs.imagemInput.files[0]) {
            formData.append('imagem', inputs.imagemInput.files[0]);
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const produto = await response.json();
                showAlert('✅ Produto atualizado com sucesso!', 'success');
                resetForm();
                loadProdutos();
                updateStats();
                produtoEmEdicao = null;
            } else {
                const error = await response.json();
                showAlert('❌ ' + (error.error || error.message || 'Erro ao salvar produto'), 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showAlert('❌ Erro de conexão com o servidor: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }

    } else {
        // ✅ CRIAR NOVO PRODUTO
        const formData = new FormData();
        
        formData.append('nome', inputs.nome.value);
        formData.append('descricao', inputs.descricao.value);
        formData.append('preco', inputs.preco.value);
        formData.append('estoque', inputs.estoque.value);
        formData.append('calibre', inputs.calibre.value);
        formData.append('capacidade', inputs.capacidade.value);
        formData.append('peso', inputs.peso.value);
        formData.append('marca', inputs.marca.value);
        formData.append('categoria', inputs.categoria.value);
        formData.append('badge', inputs.badge.value);
        formData.append('disponivel', inputs.disponivel.checked ? '1' : '0'); // ✅ Converter para 1 ou 0
        
        if (inputs.imagemInput.files[0]) {
            formData.append('imagem', inputs.imagemInput.files[0]);
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const produto = await response.json();
                showAlert('✅ Produto cadastrado com sucesso!', 'success');
                resetForm();
                loadProdutos();
                updateStats();
            } else {
                const error = await response.json();
                showAlert('❌ ' + (error.error || error.message || 'Erro ao salvar produto'), 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showAlert('❌ Erro de conexão com o servidor: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
});

// ==================== CARREGAR PRODUTOS ====================
async function loadProdutos() {
    const lista = document.getElementById('produtosLista');
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }
        
        const produtos = await response.json();
        
        if (produtos.length === 0) {
            lista.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p style="font-size: 1.1rem;">Nenhum produto cadastrado ainda.</p>
                </div>
            `;
            return;
        }
        
        lista.innerHTML = produtos.map(p => createProductItem(p)).join('');
        setupSearch();
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        lista.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <p>Erro ao carregar produtos</p>
            </div>
        `;
    }
}

function createProductItem(produto) {
    const {
        id,
        nome,
        preco,
        estoque,
        calibre,
        capacidade,
        marca,
        categoria,
        imagem,
        disponivel
    } = produto;
    
    const precoFormatado = parseFloat(preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    // ✅ CORRIGIR: caminho completo da imagem
    const imagemURL = imagem 
        ? (imagem.startsWith('http') ? imagem : baseURL + '/' + imagem)
        : 'https://via.placeholder.com/80/1F1F1F/DC2626?text=Sem+Imagem';
    
    const statusBadge = disponivel 
        ? '<span style="color: #10B981;"><i class="fas fa-check-circle"></i> Disponível</span>'
        : '<span style="color: #EF4444;"><i class="fas fa-times-circle"></i> Indisponível</span>';
    
    return `
        <div class="produto-item" data-id="${id}">
            <div class="produto-info">
                <img src="${imagemURL}" 
                     alt="${nome}" 
                     class="produto-thumb"
                     onerror="this.src='https://via.placeholder.com/80/1F1F1F/DC2626?text=Erro'">
                <div class="produto-details">
                    <h4>${nome}</h4>
                    <div class="produto-meta">
                        ${calibre ? `<span><i class="fas fa-bullseye"></i> ${calibre}</span>` : ''}
                        ${capacidade ? `<span><i class="fas fa-layer-group"></i> ${capacidade}</span>` : ''}
                        ${marca ? `<span><i class="fas fa-copyright"></i> ${marca}</span>` : ''}
                        ${categoria ? `<span><i class="fas fa-tag"></i> ${categoria}</span>` : ''}
                        <span><i class="fas fa-dollar-sign"></i> ${precoFormatado}</span>
                        <span><i class="fas fa-boxes"></i> Estoque: ${estoque}</span>
                        ${statusBadge}
                    </div>
                </div>
            </div>
            <div class="produto-actions">
                <button class="btn-edit" onclick="editProduto(${id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteProduto(${id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `;
}

// ==================== DELETAR PRODUTO ====================
async function deleteProduto(id) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este produto?\n\nEsta ação não pode ser desfeita!')) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            body: 'id=' + id,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (response.ok) {
            showAlert('✅ Produto excluído com sucesso!', 'success');
            loadProdutos();
            updateStats();
        } else {
            const error = await response.json();
            showAlert('❌ ' + (error.error || error.message || 'Erro ao excluir produto'), 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('❌ Erro de conexão com o servidor', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== EDITAR PRODUTO ====================
async function editProduto(id) {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        const produto = produtos.find(p => p.id == id);
        
        if (!produto) {
            showAlert('❌ Produto não encontrado', 'error');
            return;
        }
        
        produtoEmEdicao = produto;
        
        // Preencher formulário
        inputs.nome.value = produto.nome || '';
        inputs.descricao.value = produto.descricao || '';
        inputs.preco.value = produto.preco || '';
        inputs.estoque.value = produto.estoque || '';
        inputs.calibre.value = produto.calibre || '';
        inputs.capacidade.value = produto.capacidade || '';
        inputs.peso.value = produto.peso || '';
        inputs.marca.value = produto.marca || '';
        inputs.categoria.value = produto.categoria || '';
        inputs.badge.value = produto.badge || '';
        inputs.disponivel.checked = produto.disponivel == 1 || produto.disponivel === '1';
        
        // Mostrar imagem se existir
        if (produto.imagem) {
            const imagemURL = baseURL + '/' + produto.imagem;
            const previewImg = document.getElementById('previewImage');
            previewImg.src = imagemURL;
            previewImg.style.display = 'block';
            document.querySelector('.preview-image > i').style.display = 'none';
        }
        
        // Atualizar preview
        updatePreviewDetails();
        
        // Scroll para o formulário
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Mudar texto do botão
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.innerHTML = '<i class="fas fa-save"></i> Atualizar Produto';
        
        showAlert('📝 Editando produto. Faça suas alterações e clique em "Atualizar"', 'success');
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert('❌ Erro ao carregar dados do produto', 'error');
    }
}

// ==================== ATUALIZAR ESTATÍSTICAS ====================
async function updateStats() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        
        const total = produtos.length;
        const disponiveis = produtos.filter(p => p.disponivel == 1 || p.disponivel === '1').length;
        const estoquesBaixos = produtos.filter(p => p.estoque < 5 && (p.disponivel == 1 || p.disponivel === '1')).length;
        const valorTotal = produtos.reduce((sum, p) => sum + (parseFloat(p.preco) * parseInt(p.estoque)), 0);
        
        document.getElementById('totalProdutos').textContent = total;
        document.getElementById('produtosDisponiveis').textContent = disponiveis;
        document.getElementById('estoquesBaixos').textContent = estoquesBaixos;
        document.getElementById('valorTotal').textContent = valorTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

// ==================== BUSCAR PRODUTOS ====================
function setupSearch() {
    const searchInput = document.getElementById('searchProdutos');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.produto-item');
            
            items.forEach(item => {
                const texto = item.textContent.toLowerCase();
                if (texto.includes(termo)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

// ==================== RESETAR FORMULÁRIO ====================
function resetForm() {
    form.reset();
    produtoEmEdicao = null;
    
    // Mudar texto do botão de volta
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.innerHTML = '<i class="fas fa-save"></i> Cadastrar Produto';
    
    // Resetar preview
    document.getElementById('previewNome').textContent = 'Nome do Produto';
    document.getElementById('previewDescricao').textContent = 'Descrição do produto aparecerá aqui...';
    document.getElementById('previewPreco').textContent = 'R$ 0,00';
    document.getElementById('previewEstoque').textContent = 'Estoque: --';
    document.getElementById('previewBadge').style.display = 'none';
    
    // Resetar imagens
    const previewImg = document.getElementById('previewImage');
    const uploadPreview = document.getElementById('imagePreviewUpload');
    const icon = document.querySelector('.preview-image > i');
    
    previewImg.style.display = 'none';
    uploadPreview.style.display = 'none';
    if (icon) icon.style.display = 'block';
    
    updatePreviewDetails();
}

// ==================== ALERTS ====================
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    
    alert.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    alert.className = `alert alert-${type} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
    
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==================== LOADING ====================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// ==================== ORDENAÇÃO ====================
let ordenacaoAtual = { campo: 'id', ordem: 'desc' };

async function carregarProdutosOrdenados(campo = null, ordem = null) {
    if (campo) {
        if (ordenacaoAtual.campo === campo) {
            ordenacaoAtual.ordem = ordenacaoAtual.ordem === 'asc' ? 'desc' : 'asc';
        } else {
            ordenacaoAtual.campo = campo;
            ordenacaoAtual.ordem = 'asc';
        }
    }
    
    try {
        const urlComParametros = `${API_URL}?ordenarPor=${ordenacaoAtual.campo}&ordem=${ordenacaoAtual.ordem}`;
        const response = await fetch(urlComParametros);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos');
        }
        
        const produtos = await response.json();
        const lista = document.getElementById('produtosLista');
        lista.innerHTML = produtos.map(p => createProductItem(p)).join('');
        setupSearch();
        atualizarInterfaceOrdenacao();
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showAlert('❌ Erro ao carregar produtos', 'error');
    }
}

function ordenarProdutos(campo) {
    carregarProdutosOrdenados(campo);
}

function atualizarInterfaceOrdenacao() {
    document.querySelectorAll('.sort-indicator').forEach(ind => ind.remove());
    
    const header = document.querySelector(`[data-sort="${ordenacaoAtual.campo}"]`);
    if (header) {
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.innerHTML = ordenacaoAtual.ordem === 'asc' ? ' ↑' : ' ↓';
        indicator.style.marginLeft = '5px';
        indicator.style.color = 'var(--primary-color)';
        indicator.style.fontWeight = 'bold';
        header.appendChild(indicator);
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Painel Admin carregado!');
    
    setupPreviewListeners();
    setupImageUpload();
    loadProdutos();
    updateStats();
    
    setInterval(() => {
        loadProdutos();
        updateStats();
    }, 30000);
    
    console.log('✅ Todos os componentes inicializados!');
});