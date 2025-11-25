// Formulário de Contato
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // Simulação de envio
    console.log('Formulário enviado:', formData);
    
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    this.reset();
});