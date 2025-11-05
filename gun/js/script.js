// Mobile Navigation
const hamburger = document.querySelector('.nav__hamburger');
const navMenu = document.querySelector('.nav__menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on links
document.querySelectorAll('.nav__menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(220, 38, 38, 0.1)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
            header.style.boxShadow = 'none';
        }
    }
});

// ==================== CARROSSEL ====================
class Carousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.carousel-prev');
        this.nextBtn = document.querySelector('.carousel-next');
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        this.showSlide(0);
        this.startAutoPlay();
        
        const carouselContainer = document.querySelector('.hero-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
            carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
    
    showSlide(index) {
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        this.slides[index].classList.add('active');
        this.indicators[index].classList.add('active');
        
        this.currentSlide = index;
    }
    
    nextSlide() {
        let next = this.currentSlide + 1;
        if (next >= this.slides.length) next = 0;
        this.showSlide(next);
    }
    
    prevSlide() {
        let prev = this.currentSlide - 1;
        if (prev < 0) prev = this.slides.length - 1;
        this.showSlide(prev);
    }
    
    goToSlide(index) {
        this.showSlide(index);
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// ==================== NOTÍCIAS SOBRE ARMAS E CAC ====================

async function loadNews() {
    const newsGrid = document.querySelector('.news__grid');
    
    if (!newsGrid) {
        console.error('❌ Elemento .news__grid não encontrado no HTML');
        return;
    }
    
    // Mostrar loading
    newsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p style="color: var(--text-secondary); font-size: 1.2rem;">
                <i class="fas fa-spinner fa-spin"></i> Carregando notícias do InfoArmas...
            </p>
        </div>
    `;
    
    console.log('📰 Buscando notícias do InfoArmas...');
    
    try {
        let allArticles = [];
        
        // FONTES ESPECIALIZADAS EM ARMAS E CAC
        const sources = [
            // InfoArmas - PRINCIPAL
            { url: 'https://infoarmas.com.br/feed/', name: 'InfoArmas' },
            // Outras fontes especializadas (backup)
            { url: 'https://www.portal27.com.br/feed/', name: 'Portal 27' },
        ];
        
        for (const source of sources) {
            console.log(`🔍 Buscando em: ${source.name}...`);
            const articles = await fetchRSSNews(source.url, source.name);
            if (articles && articles.length > 0) {
                console.log(`✅ ${articles.length} notícias encontradas em ${source.name}`);
                allArticles = allArticles.concat(articles);
            } else {
                console.log(`⚠️ Nenhuma notícia encontrada em ${source.name}`);
            }
        }
        
        console.log(`📊 Total de notícias coletadas: ${allArticles.length}`);
        
        // Mostrar notícias ou fallback
        if (allArticles && allArticles.length > 0) {
            // Ordenar por data (mais recentes primeiro)
            allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            displayNews(allArticles.slice(0, 3));
        } else {
            console.log('⚠️ Nenhuma notícia encontrada, usando notícias padrão do InfoArmas');
            showDefaultNews();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar notícias:', error);
        showDefaultNews();
    }
}

// Buscar notícias via RSS2JSON (serviço gratuito, sem API key!)
async function fetchRSSNews(rssUrl, sourceName) {
    try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=public&count=10`;
        
        console.log(`🔄 Buscando de ${sourceName}...`);
        console.log(`🔗 URL da API: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error(`❌ Erro HTTP ${response.status} ao buscar ${sourceName}`);
            return null;
        }
        
        const data = await response.json();
        
        console.log(`📊 Resposta completa de ${sourceName}:`, data);
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            console.log(`✅ ${data.items.length} itens encontrados em ${sourceName}`);
            
            return data.items.map((item, index) => {
                console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📰 NOTÍCIA ${index + 1}:`);
                console.log(`📌 Título: ${item.title}`);
                console.log(`🔗 Link: ${item.link}`);
                console.log(`🆔 GUID: ${item.guid}`);
                console.log(`🖼️ Thumbnail: ${item.thumbnail}`);
                console.log(`📎 Enclosure:`, item.enclosure);
                
                // Limpar HTML da descrição
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description || item.content || '';
                const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
                
                // BUSCA AGRESSIVA DE IMAGENS
                let imageUrl = null;
                
                // Método 1: Thumbnail direto
                if (item.thumbnail && item.thumbnail.trim() !== '') {
                    imageUrl = item.thumbnail;
                    console.log(`✅ Imagem (thumbnail): ${imageUrl}`);
                }
                
                // Método 2: Enclosure
                if (!imageUrl && item.enclosure && item.enclosure.link) {
                    imageUrl = item.enclosure.link;
                    console.log(`✅ Imagem (enclosure): ${imageUrl}`);
                }
                
                // Método 3: Procurar no conteúdo HTML (múltiplas tentativas)
                if (!imageUrl && item.description) {
                    // Tag img
                    const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/gi;
                    const imgMatches = item.description.match(imgRegex);
                    if (imgMatches && imgMatches.length > 0) {
                        const srcMatch = imgMatches[0].match(/src=["']([^"'>]+)["']/i);
                        if (srcMatch && srcMatch[1]) {
                            imageUrl = srcMatch[1];
                            console.log(`✅ Imagem (img tag): ${imageUrl}`);
                        }
                    }
                }
                
                // Método 4: Meta tag og:image
                if (!imageUrl && item.description) {
                    const ogMatch = item.description.match(/property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
                    if (ogMatch && ogMatch[1]) {
                        imageUrl = ogMatch[1];
                        console.log(`✅ Imagem (og:image): ${imageUrl}`);
                    }
                }
                
                // Método 5: Buscar qualquer URL de imagem no conteúdo
                if (!imageUrl && item.description) {
                    const urlMatch = item.description.match(/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp))/i);
                    if (urlMatch && urlMatch[1]) {
                        imageUrl = urlMatch[1];
                        console.log(`✅ Imagem (URL encontrada): ${imageUrl}`);
                    }
                }
                
                if (!imageUrl) {
                    console.log(`⚠️ NENHUMA imagem encontrada! Usando placeholder`);
                }
                
                // CORREÇÃO DO LINK - Priorizar GUID sobre LINK
                let articleUrl = item.guid || item.link;
                
                // Se o guid for igual ao link, usar o link
                if (item.guid === item.link) {
                    articleUrl = item.link;
                }
                
                // Garantir que o URL está completo
                if (articleUrl && !articleUrl.startsWith('http')) {
                    articleUrl = 'https://infoarmas.com.br' + (articleUrl.startsWith('/') ? '' : '/') + articleUrl;
                }
                
                console.log(`🎯 URL FINAL: ${articleUrl}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
                
                return {
                    title: item.title,
                    description: cleanDescription.substring(0, 200).trim() + '...',
                    url: articleUrl,
                    urlToImage: imageUrl,
                    publishedAt: item.pubDate,
                    source: { name: sourceName },
                    rawItem: item // Guardar item original para debug
                };
            });
        } else {
            console.error(`❌ ${sourceName} não retornou itens válidos`);
            console.log('Status da resposta:', data.status);
            console.log('Mensagem:', data.message);
            return null;
        }
        
    } catch (error) {
        console.error(`❌ Erro ao buscar ${sourceName}:`, error);
        return null;
    }
}

function displayNews(articles) {
    const newsGrid = document.querySelector('.news__grid');
    
    console.log('🎨 Renderizando notícias na tela...');
    
    newsGrid.innerHTML = articles.map((article, index) => {
        // Formatar data
        const date = new Date(article.publishedAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        // Sistema de fallback de imagens melhorado
        const fallbackImage = 'https://via.placeholder.com/400x250/1F1F1F/DC2626?text=InfoArmas';
        const imageUrl = article.urlToImage || fallbackImage;
        
        console.log(`  📰 ${index + 1}. ${article.title}`);
        console.log(`     🖼️ Imagem: ${imageUrl}`);
        console.log(`     🔗 Link: ${article.url}`);
        
        return `
            <div class="news__card">
                <div class="news__image">
                    <img src="${imageUrl}" 
                         alt="${article.title}"
                         onerror="this.onerror=null; this.src='${fallbackImage}';"
                         loading="lazy">
                </div>
                <div class="news__content">
                    <h3>${article.title}</h3>
                    <p>${article.description}</p>
                    <div class="news__meta">
                        <span class="author">Por ${article.source.name}</span>
                        <span class="date">${formattedDate}</span>
                    </div>
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more">
                        Ler mais <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Notícias renderizadas com sucesso!');
}

function showDefaultNews() {
    const newsGrid = document.querySelector('.news__grid');
    
    console.log('📄 Mostrando notícias padrão do InfoArmas...');
    
    newsGrid.innerHTML = `
        <div class="news__card">
            <div class="news__image">
                <img src="https://via.placeholder.com/400x250/1F1F1F/DC2626?text=InfoArmas" 
                     alt="CAC Brasil">
            </div>
            <div class="news__content">
                <h3>Crescimento do CAC no Brasil Bate Recorde em 2025</h3>
                <p>O número de Caçadores, Atiradores e Colecionadores (CAC) no Brasil continua crescendo, refletindo o aumento do interesse por tiro esportivo e colecionismo de armas...</p>
                <div class="news__meta">
                    <span class="author">Por InfoArmas</span>
                    <span class="date">1 Novembro, 2025</span>
                </div>
                <a href="https://infoarmas.com.br" target="_blank" rel="noopener noreferrer" class="read-more">
                    Ler mais <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>

        <div class="news__card">
            <div class="news__image">
                <img src="https://via.placeholder.com/400x250/1F1F1F/DC2626?text=Tiro+Esportivo" 
                     alt="Tiro Esportivo">
            </div>
            <div class="news__content">
                <h3>Novas Modalidades de Tiro Esportivo Ganham Destaque</h3>
                <p>IPSC, IDPA e Steel Challenge são algumas das modalidades que vêm conquistando cada vez mais adeptos nos clubes de tiro brasileiros, promovendo competições oficiais...</p>
                <div class="news__meta">
                    <span class="author">Por InfoArmas</span>
                    <span class="date">30 Outubro, 2025</span>
                </div>
                <a href="https://infoarmas.com.br" target="_blank" rel="noopener noreferrer" class="read-more">
                    Ler mais <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>

        <div class="news__card">
            <div class="news__image">
                <img src="https://via.placeholder.com/400x250/1F1F1F/DC2626?text=Legislação" 
                     alt="Legislação CAC">
            </div>
            <div class="news__content">
                <h3>Exército Atualiza Normas para Registro de Armas CAC</h3>
                <p>Novas diretrizes do Comando Logístico do Exército trazem mudanças importantes para o registro e renovação de CR (Certificado de Registro) para atiradores...</p>
                <div class="news__meta">
                    <span class="author">Por InfoArmas</span>
                    <span class="date">28 Outubro, 2025</span>
                </div>
                <a href="https://infoarmas.com.br" target="_blank" rel="noopener noreferrer" class="read-more">
                    Ler mais <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página carregada! Inicializando componentes...');
    console.log('📍 URL atual:', window.location.href);
    
    // Verificar se está em servidor local
    if (window.location.protocol === 'file:') {
        console.warn('⚠️ ATENÇÃO: Você está abrindo o arquivo direto (file://). Use um servidor local!');
    } else {
        console.log('✅ Servidor local detectado');
    }
    
    // Inicializar carrossel
    const carousel = new Carousel();
    console.log('✅ Carrossel inicializado');
    
    // Carregar notícias
    loadNews();
    
    // Atualizar notícias a cada 10 minutos
    setInterval(() => {
        console.log('🔄 Atualizando notícias...');
        loadNews();
    }, 600000);
    
    console.log('✅ Todos os componentes inicializados!');
});