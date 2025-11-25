// config.js - Detecta o caminho base correto automaticamente
// Adicione isso no <head> de TODAS as páginas HTML ANTES de outros scripts

function getBasePath() {
    const currentPath = window.location.pathname;
    
    // Log para debug
    console.log('📍 URL Completo:', window.location.href);
    console.log('📍 Pathname:', currentPath);
    
    // Se estiver em algo como /Repositorios/Front-End/Gun/
    const gunMatch = currentPath.match(/.*\/Gun\//i);
    if (gunMatch) {
        const basePath = gunMatch[0];
        console.log('✅ Detectado caminho Gun:', basePath);
        return basePath;
    }s
    
    // Se estiver em algo como /Front-End/Gun/
    const frontEndMatch = currentPath.match(/.*\/Front-End\/Gun\//i);
    if (frontEndMatch) {
        const basePath = frontEndMatch[0];
        console.log('✅ Detectado caminho Front-End/Gun:', basePath);
        return basePath;
    }
    
    // Fallback: retorna o diretório do arquivo atual
    const fallback = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    console.warn('⚠️ Usando fallback:', fallback);
    return fallback;
}

// Exportar para uso global
window.CONFIG = {
    BASE_PATH: getBasePath(),
    
    // Funções auxiliares
    getPath: (file) => {
        return window.CONFIG.BASE_PATH + file;
    },
    
    getAbsPath: (file) => {
        // Para caminhos absolutos do servidor
        return '/' + window.CONFIG.BASE_PATH.split('/').filter(p => p).join('/') + file;
    }
};

console.log('🔗 CONFIG inicializado:', window.CONFIG);
console.log('📂 BASE_PATH:', window.CONFIG.BASE_PATH);