// Mobile Navigation
const hamburger = document.querySelector('.nav__hamburger');
const navMenu = document.querySelector('.nav__menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on links
document.querySelectorAll('.nav__menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
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

// VERSÃO CORRIGIDA - mantém o tema preto
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)'; // Preto sólido
        header.style.boxShadow = '0 2px 20px rgba(220, 38, 38, 0.1)'; // Sombra vermelha sutil
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)'; // Preto levemente transparente
        header.style.boxShadow = 'none';
    }
});

// Search functionality
const searchButton = document.querySelector('.btn--search');
searchButton.addEventListener('click', () => {
    alert('Funcionalidade de busca em desenvolvimento!');
});

// Vehicle card hover effects
document.querySelectorAll('.vehicle__card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Carousel Functionality - VERSÃO CORRIGIDA
class Carousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.carousel-prev');
        this.nextBtn = document.querySelector('.carousel-next');
        this.currentSlide = 0;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Mostrar primeiro slide
        this.showSlide(this.currentSlide);
        
        // Auto play
        this.startAutoPlay();
        
        // Pause on hover
        const carousel = document.querySelector('.hero-carousel');
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    showSlide(index) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Remove todas as classes ativas
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'next');
        });
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Adiciona classe baseada na direção
        const prevSlide = this.currentSlide;
        this.currentSlide = index;
        
        if (index > prevSlide) {
            this.slides[index].classList.add('next');
        } else if (index < prevSlide) {
            this.slides[index].classList.add('prev');
        }
        
        // Timeout para ativar a transição
        setTimeout(() => {
            this.slides[index].classList.add('active');
            this.indicators[index].classList.add('active');
            
            // Reset da animação
            setTimeout(() => {
                this.isAnimating = false;
            }, 800);
        }, 50);
    }
    
    nextSlide() {
        let next = this.currentSlide + 1;
        if (next >= this.slides.length) {
            next = 0;
        }
        this.showSlide(next);
    }
    
    prevSlide() {
        let prev = this.currentSlide - 1;
        if (prev < 0) {
            prev = this.slides.length - 1;
        }
        this.showSlide(prev);
    }
    
    goToSlide(index) {
        if (index !== this.currentSlide) {
            this.showSlide(index);
        }
    }
    
    startAutoPlay() {
        this.autoPlay = setInterval(() => {
            this.nextSlide();
        }, 5000); // Muda a cada 5 segundos
    }
    
    stopAutoPlay() {
        if (this.autoPlay) {
            clearInterval(this.autoPlay);
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
    
    // Seu código existente de navegação mobile
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
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling
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
});