// verificar-login.js
function verificarEstadoLogin() {
    const usuarioId = localStorage.getItem('usuario_id');
    const btnLoginContainer = document.getElementById('btnLoginContainer');
    const userProfileContainer = document.getElementById('userProfileContainer');
    const userName = document.getElementById('userName');

    console.log('🔍 Verificando login...', { usuarioId, btnLoginContainer, userProfileContainer });

    if (usuarioId) {
        // Usuário está logado
        console.log('✅ Usuário logado, ID:', usuarioId);
        if (btnLoginContainer) {
            btnLoginContainer.style.display = 'none';
            btnLoginContainer.style.visibility = 'hidden';
        }
        if (userProfileContainer) {
            userProfileContainer.style.display = 'flex';
            userProfileContainer.style.visibility = 'visible';
            userProfileContainer.style.opacity = '1';
        }
        if (userName) {
            const nome = localStorage.getItem('usuario_nome') || 'Usuário';
            userName.textContent = nome;
        }
    } else {
        // Usuário não está logado
        console.log('❌ Usuário não logado');
        if (btnLoginContainer) {
            btnLoginContainer.style.display = 'flex';
            btnLoginContainer.style.visibility = 'visible';
            btnLoginContainer.style.opacity = '1';
        }
        if (userProfileContainer) {
            userProfileContainer.style.display = 'none';
            userProfileContainer.style.visibility = 'hidden';
        }
    }
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página carregada, verificando login...');
    verificarEstadoLogin();
});

// Executar quando o storage mudar (outra aba)
window.addEventListener('storage', function() {
    console.log('🔄 Storage alterado, verificando login...');
    verificarEstadoLogin();
});

// Forçar verificação após 100ms (para casos de race condition)
setTimeout(verificarEstadoLogin, 100);