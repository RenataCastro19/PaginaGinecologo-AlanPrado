// Menú móvil
const toggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('is-open');
  mobileMenu.classList.toggle('is-open');
});

// Cerrar el menú al elegir un enlace
mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    toggle.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
  });
});