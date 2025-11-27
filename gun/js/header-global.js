// ==================== HEADER GLOBAL V3 - VERSÃO DEBUG ====================

class HeaderGlobal {
    constructor() {
        console.log('🚀 [1] Inicializando HeaderGlobal V3...');
        console.log('📍 URL atual:', window.location.href);
        
        this.verificarLogin();
        this.setupMenuDropdown();
        this.setupEventListeners();
        this.atualizarCarrinhoCount();
        
        console.log('✅ [4] HeaderGlobal inicializado com sucesso!');
    }

    verificarLogin() {
        console.log('🔍 [2] Verificando login...');
        
        const usuarioId = localStorage.getItem('usuario_id');
        const usuarioNome = localStorage.getItem('usuario_nome');
        
        console.log('   ℹ️ usuario_id:', usuarioId);
        console.log('   ℹ️ usuario_nome:', usuarioNome);
        
        const btnLoginContainer = document.getElementById('btnLoginContainer');
        const userProfileContainer = document.getElementById('userProfileContainer');
        const userName = document.getElementById('userName');
        
        console.log('   ✓ btnLoginContainer encontrado?', !!btnLoginContainer);
        console.log('   ✓ userProfileContainer encontrado?', !!userProfileContainer);
        console.log('   ✓ userName encontrado?', !!userName);
        
        if (usuarioId && usuarioNome) {
            console.log('   ✅ Usuário LOGADO - mostrando perfil');
            
            if (btnLoginContainer) {
                btnLoginContainer.style.display = 'none';
            }
            
            if (userProfileContainer) {
                userProfileContainer.style.display = 'flex';
                if (userName) {
                    userName.textContent = usuarioNome;
                    console.log('   📝 Nome do usuário atualizado:', usuarioNome);
                }
            }
            
        } else {
            console.log('   ❌ Usuário NÃO logado - mostrando login');
            
            if (btnLoginContainer) {
                btnLoginContainer.style.display = 'flex';
            }
            
            if (userProfileContainer) {
                userProfileContainer.style.display = 'none';
            }
        }
    }

    setupMenuDropdown() {
        console.log('🔧 [3] Configurando menu dropdown...');
        
        const userProfileBtn = document.getElementById('userProfileBtn');
        const userMenuDropdown = document.getElementById('userMenuDropdown');
        
        console.log('   ✓ userProfileBtn encontrado?', !!userProfileBtn);
        console.log('   ✓ userMenuDropdown encontrado?', !!userMenuDropdown);
        
        if (!userProfileBtn || !userMenuDropdown) {
            console.error('   ❌ ERRO: Elementos do menu não encontrados!');
            console.log('   💡 Certifique-se de que os IDs estão CORRETOS no HTML');
            return;
        }

        // GARANTE que dropdown está fechado
        userMenuDropdown.classList.remove('show');
        console.log('   ✓ Dropdown inicialmente fechado');

        // ==================== TOGGLE DROPDOWN ====================
        userProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isShowing = userMenuDropdown.classList.contains('show');
            console.log('📌 Clique no botão de perfil - Era:', isShowing ? 'aberto' : 'fechado');
            
            userMenuDropdown.classList.toggle('show');
            
            const isShowingNow = userMenuDropdown.classList.contains('show');
            console.log('📌 Agora está:', isShowingNow ? 'aberto' : 'fechado');
        });

        // ==================== FECHAR AO CLICAR FORA ====================
        document.addEventListener('click', (e) => {
            if (userProfileBtn && userMenuDropdown) {
                const isClickInsideButton = userProfileBtn.contains(e.target);
                const isClickInsideMenu = userMenuDropdown.contains(e.target);
                
                if (!isClickInsideButton && !isClickInsideMenu) {
                    if (userMenuDropdown.classList.contains('show')) {
                        console.log('👉 Clique fora - fechando menu');
                        userMenuDropdown.classList.remove('show');
                    }
                }
            }
        });

        // ==================== NAVEGAÃ‡ÃƒO DO MENU ====================
        const menuPerfil = document.getElementById('menuPerfil');
        const menuMinhasCompras = document.getElementById('menuMinhasCompras');
        const menuConfiguracoes = document.getElementById('menuConfiguracoes');
        const menuLogout = document.getElementById('menuLogout');
        
        console.log('   ✓ menuPerfil encontrado?', !!menuPerfil);
        console.log('   ✓ menuLogout encontrado?', !!menuLogout);
        
        if (menuPerfil) {
            menuPerfil.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Clicou em "Meu Perfil" - navegando...');
                userMenuDropdown.classList.remove('show');
                window.location.href = 'usuario.html';
            });
        }
        
        if (menuMinhasCompras) {
            menuMinhasCompras.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Clicou em "Minhas Compras" - navegando...');
                userMenuDropdown.classList.remove('show');
                window.location.href = 'usuario.html#compras';
            });
        }
        
        if (menuConfiguracoes) {
            menuConfiguracoes.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Clicou em "Documentos" - navegando...');
                userMenuDropdown.classList.remove('show');
                window.location.href = 'usuario.html#documentos';
            });
        }
        
        // ==================== LOGOUT ====================
        if (menuLogout) {
            menuLogout.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Clicou em "Sair" - fazendo logout');
                this.fazerLogout();
            });
        }

        // ==================== FECHAR AO CLICAR EM ITEM ====================
        document.querySelectorAll('.user-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                console.log('   📝 Clicou em item do menu');
                setTimeout(() => {
                    userMenuDropdown.classList.remove('show');
                }, 100);
            });
        });
        
        console.log('   ✅ Menu dropdown configurado');
    }

    setupEventListeners() {
        console.log('👂 Configurando event listeners...');
        
        // Sincronizar com outras abas
        window.addEventListener('storage', (e) => {
            if (e.key === 'usuario_id' || e.key === 'usuario_nome') {
                console.log('🔄 Storage mudou - atualizando...');
                this.verificarLogin();
            }
        });

        // Tecla Escape para fechar menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const dropdown = document.getElementById('userMenuDropdown');
                if (dropdown && dropdown.classList.contains('show')) {
                    console.log('⌨️ ESC pressionado - fechando menu');
                    dropdown.classList.remove('show');
                }
            }
        });

        console.log('   ✅ Event listeners configurados');
    }

    atualizarCarrinhoCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const carrinho = JSON.parse(localStorage.getItem('carrinho_items') || '[]');
            cartCount.textContent = carrinho.length;
            console.log('🛒 Carrinho atualizado:', carrinho.length, 'itens');
        }
    }

    fazerLogout() {
        if (!confirm('Tem certeza que deseja sair?')) {
            console.log('   ❌ Logout cancelado');
            return;
        }

        console.log('🔐 Realizando logout...');
        
        // Limpar localStorage
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('usuario_nome');
        localStorage.removeItem('usuario_email');
        
        console.log('   ✅ Dados removidos');
        
        // Redirecionar
        setTimeout(() => {
            console.log('   🔄 Redirecionando para home.html');
            window.location.href = 'home.html';
        }, 300);
    }

    static atualizarPerfil(nome, email) {
        console.log('📝 Atualizando perfil...', nome);
        localStorage.setItem('usuario_nome', nome);
        if (email) {
            localStorage.setItem('usuario_email', email);
        }
        
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = nome;
        }
        
        console.log('✅ Perfil atualizado');
    }

    static fazerLogin(usuarioId, usuarioNome, usuarioEmail = null) {
        console.log('✅ Login realizado:', usuarioNome);
        localStorage.setItem('usuario_id', usuarioId);
        localStorage.setItem('usuario_nome', usuarioNome);
        if (usuarioEmail) {
            localStorage.setItem('usuario_email', usuarioEmail);
        }
        
        console.log('   🔄 Reinicializando HeaderGlobal');
        new HeaderGlobal();
    }

    static adicionarAoCarrinho(produto) {
        console.log('🛒 Adicionando ao carrinho:', produto.nome);
        let carrinho = JSON.parse(localStorage.getItem('carrinho_items') || '[]');
        
        const existente = carrinho.find(p => p.id === produto.id);
        
        if (existente) {
            existente.quantidade = (existente.quantidade || 1) + 1;
        } else {
            produto.quantidade = 1;
            carrinho.push(produto);
        }
        
        localStorage.setItem('carrinho_items', JSON.stringify(carrinho));
        console.log('   ✅ Carrinho atualizado');
        
        this.mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`);
        new HeaderGlobal();
        return carrinho;
    }

    static mostrarNotificacao(mensagem) {
        const notif = document.createElement('div');
        notif.className = 'cart-message show';
        notif.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.remove();
        }, 3000);
    }
}

// ==================== INICIALIZAÃ‡ÃƒO ====================
console.log('═══════════════════════════════════════════');
console.log('  🌐 HEADER GLOBAL V3 - DEBUG MODE');
console.log('═══════════════════════════════════════════');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM pronto - Inicializando HeaderGlobal');
    new HeaderGlobal();
});

// Fallback para se o script rodar após DOMContentLoaded
if (document.readyState === 'loading') {
    console.log('⏳ Documento ainda carregando...');
    document.addEventListener('DOMContentLoaded', () => {
        new HeaderGlobal();
    });
} else {
    console.log('⏩ Documento já carregado - inicializando direto');
    new HeaderGlobal();
}

console.log('═══════════════════════════════════════════');