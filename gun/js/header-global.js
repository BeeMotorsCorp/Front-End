// ==================== HEADER GLOBAL V5 - FINAL ====================
// Este script REMOVE propagação de cliques

class HeaderGlobal {
    constructor() {
        console.log('🚀 Inicializando HeaderGlobal V5...');
        this.verificarLogin();
        this.setupMenuDropdown();
        this.setupEventListeners();
        this.atualizarCarrinhoCount();
        console.log('✅ HeaderGlobal pronto!');
    }

    verificarLogin() {
        const usuarioId = localStorage.getItem('usuario_id');
        const usuarioNome = localStorage.getItem('usuario_nome');
        
        const btnLoginContainer = document.getElementById('btnLoginContainer');
        const userProfileContainer = document.getElementById('userProfileContainer');
        const userName = document.getElementById('userName');
        
        if (usuarioId && usuarioNome) {
            console.log('✅ Usuário logado:', usuarioNome);
            if (btnLoginContainer) btnLoginContainer.style.display = 'none';
            if (userProfileContainer) userProfileContainer.style.display = 'flex';
            if (userName) userName.textContent = usuarioNome;
        } else {
            console.log('❌ Usuário não logado');
            if (btnLoginContainer) btnLoginContainer.style.display = 'flex';
            if (userProfileContainer) userProfileContainer.style.display = 'none';
        }
    }

    setupMenuDropdown() {
        const userProfileBtn = document.getElementById('userProfileBtn');
        const userMenuDropdown = document.getElementById('userMenuDropdown');
        
        if (!userProfileBtn || !userMenuDropdown) {
            console.error('❌ Elementos não encontrados');
            return;
        }

        // Garantir que começa fechado
        userMenuDropdown.classList.remove('show');

        // ==================== CLICK NO BOTÃO ====================
        userProfileBtn.addEventListener('click', (e) => {
            console.log('📌 BOTÃO CLICADO');
            e.preventDefault();
            e.stopPropagation(); // ← IMPORTANTE: impede propagação
            
            // Toggle
            userMenuDropdown.classList.toggle('show');
            console.log('📌 Menu agora:', userMenuDropdown.classList.contains('show') ? '✅ ABERTO' : '❌ FECHADO');
        });

        // ==================== FECHAR AO CLICAR FORA ====================
        // Usar capturing phase (true) para interceptar antes
        document.addEventListener('click', (e) => {
            // Se o menu está aberto
            if (userMenuDropdown.classList.contains('show')) {
                // Se você NÃO clicou no botão E NÃO clicou no menu
                if (!userProfileBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
                    console.log('👉 Clique fora - FECHANDO');
                    userMenuDropdown.classList.remove('show');
                }
            }
        }, true);

        // ==================== CLICK NOS ITENS DO MENU ====================
        const menuPerfil = document.getElementById('menuPerfil');
        const menuMinhasCompras = document.getElementById('menuMinhasCompras');
        const menuConfiguracoes = document.getElementById('menuConfiguracoes');
        const menuLogout = document.getElementById('menuLogout');
        
        if (menuPerfil) {
            menuPerfil.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔗 Ir para: Meu Perfil');
                userMenuDropdown.classList.remove('show');
                window.location.href = 'usuario.html';
            });
        }
        
        if (menuMinhasCompras) {
            menuMinhasCompras.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔗 Ir para: Minhas Compras');
                userMenuDropdown.classList.remove('show');
                window.location.href = 'usuario.html#compras';
            });
        }
        
        if (menuConfiguracoes) {
            menuConfiguracoes.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔗 Ir para: Documentos');
                userMenuDropdown.classList.remove('show');
                window.location.href = 'usuario.html#documentos';
            });
        }
        
        if (menuLogout) {
            menuLogout.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔗 Logout');
                this.fazerLogout();
            });
        }
        
        console.log('✅ Menu configurado');
    }

    setupEventListeners() {
        // Tecla Escape para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const dropdown = document.getElementById('userMenuDropdown');
                if (dropdown && dropdown.classList.contains('show')) {
                    console.log('⌨️ ESC - FECHANDO');
                    dropdown.classList.remove('show');
                }
            }
        });

        // Sincronizar entre abas
        window.addEventListener('storage', (e) => {
            if (e.key === 'usuario_id' || e.key === 'usuario_nome') {
                console.log('🔄 Sincronizando...');
                this.verificarLogin();
            }
        });
    }

    atualizarCarrinhoCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const carrinho = JSON.parse(localStorage.getItem('carrinho_items') || '[]');
            cartCount.textContent = carrinho.length;
        }
    }

    fazerLogout() {
        if (!confirm('Sair do sistema?')) return;
        
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('usuario_nome');
        localStorage.removeItem('usuario_email');
        
        console.log('👋 Logout realizado');
        window.location.href = 'home.html';
    }

    static atualizarPerfil(nome, email) {
        localStorage.setItem('usuario_nome', nome);
        if (email) localStorage.setItem('usuario_email', email);
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = nome;
        console.log('📝 Perfil atualizado');
    }

    static fazerLogin(usuarioId, usuarioNome, usuarioEmail = null) {
        localStorage.setItem('usuario_id', usuarioId);
        localStorage.setItem('usuario_nome', usuarioNome);
        if (usuarioEmail) localStorage.setItem('usuario_email', usuarioEmail);
        console.log('✅ Login:',usuarioNome);
        new HeaderGlobal();
    }
}

// ==================== INICIALIZAÇÃO ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HeaderGlobal();
    });
} else {
    new HeaderGlobal();
}