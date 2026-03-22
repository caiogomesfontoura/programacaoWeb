// Toggle do menu hamburger
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

function closeMenu() {
    mainNav.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
});

// Fechar menu ao clicar em um link
mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        closeMenu();
    });
});

// Fechar menu ao clicar fora do botao e da navegacao
document.addEventListener('click', (event) => {
    const clickedInsideMenu = mainNav.contains(event.target);
    const clickedMenuButton = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuButton) {
        closeMenu();
    }
});

// Toggle entre tema escuro e claro
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Verificar preferência salva ou preferência do sistema
const savedTheme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Aplicar tema inicial
setTheme(savedTheme);

// Toggle ao clicar
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Sincronizar com mudanças do sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});
