// Carrusel de testimonios: con 3 o más tarjetas, la cuadrícula se convierte en una franja desplazable
// (1 tarjeta visible en teléfono, 2 desde 768 px; ver css/sobre-mi.css). Con 1 o 2 se queda como cuadrícula.
// Usa el desplazamiento nativo con scroll-snap: funciona con el dedo, la rueda, el teclado y los botones.
// No avanza solo (el movimiento automático exigiría un botón de pausa y dificulta la lectura).
// landing.js vuelve a llamar a prepararCarrusel() cada vez que dibuja los testimonios publicados.

const MINIMO = 3;
const movimientoReducido = matchMedia("(prefers-reduced-motion: reduce)");
const FLECHA = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

export function prepararCarrusel(pista) {
  if (!pista) return;
  pista._carrusel?.destruir();
  const tarjetas = [...pista.children];
  if (tarjetas.length < MINIMO) return;

  pista.classList.add("testimonials__grid--carrusel");
  pista.setAttribute("role", "region");
  pista.setAttribute("aria-roledescription", "carrusel");
  pista.setAttribute("aria-label", "Testimonios de pacientes");
  pista.tabIndex = 0;   // una zona desplazable debe poder recibir el foco (flechas del teclado)
  tarjetas.forEach((tarjeta, i) => {
    tarjeta.setAttribute("role", "group");
    tarjeta.setAttribute("aria-roledescription", "testimonio");
    tarjeta.setAttribute("aria-label", `${i + 1} de ${tarjetas.length}`);
  });

  const controles = document.createElement("div");
  controles.className = "carrusel__controles";
  controles.innerHTML = `
    <button class="carrusel__boton" type="button" data-direccion="-1" aria-label="Testimonios anteriores">${FLECHA("M15 18l-6-6 6-6")}</button>
    <div class="carrusel__puntos"></div>
    <button class="carrusel__boton" type="button" data-direccion="1" aria-label="Testimonios siguientes">${FLECHA("M9 18l6-6-6-6")}</button>`;
  pista.after(controles);
  const [anterior, siguiente] = controles.querySelectorAll(".carrusel__boton");
  const puntos = controles.querySelector(".carrusel__puntos");

  // Distancia entre el inicio de una tarjeta y el de la siguiente (ancho + separación)
  const paso = () => tarjetas[1].offsetLeft - tarjetas[0].offsetLeft || pista.clientWidth;
  const separacion = () => parseFloat(getComputedStyle(pista).columnGap) || 0;
  const porVista = () => Math.max(1, Math.round((pista.clientWidth + separacion()) / paso()));
  const posiciones = () => Math.max(1, tarjetas.length - porVista() + 1);
  const actual = () => Math.min(posiciones() - 1, Math.round(pista.scrollLeft / paso()));
  const ir = (i) => pista.scrollTo({
    left: Math.max(0, Math.min(i, posiciones() - 1)) * paso(),
    behavior: movimientoReducido.matches ? "auto" : "smooth"
  });

  function dibujarPuntos() {
    const total = posiciones();
    if (puntos.children.length === total) return;
    puntos.innerHTML = Array.from({ length: total }, (_, i) =>
      `<button class="carrusel__punto" type="button" data-posicion="${i}" aria-label="Mostrar desde el testimonio ${i + 1}"></button>`).join("");
    puntos.hidden = total < 2;
  }

  function actualizar() {
    dibujarPuntos();
    const i = actual();
    [...puntos.children].forEach((punto, n) => {
      if (n === i) punto.setAttribute("aria-current", "true");
      else punto.removeAttribute("aria-current");
    });
    anterior.disabled = pista.scrollLeft <= 1;
    siguiente.disabled = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 1;
  }

  let pendiente = 0;
  const alDesplazar = () => { cancelAnimationFrame(pendiente); pendiente = requestAnimationFrame(actualizar); };
  const alHacerClic = (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;
    if (boton.dataset.direccion) ir(actual() + Number(boton.dataset.direccion));
    else if (boton.dataset.posicion) ir(Number(boton.dataset.posicion));
  };

  pista.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar);
  controles.addEventListener("click", alHacerClic);
  actualizar();

  pista._carrusel = {
    destruir() {
      pista.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
      controles.remove();
      pista.classList.remove("testimonials__grid--carrusel");
      ["role", "aria-roledescription", "aria-label", "tabindex"].forEach((a) => pista.removeAttribute(a));
      pista.scrollLeft = 0;
      delete pista._carrusel;
    }
  };
}

// Contenido inicial del HTML (respaldo si Firestore no responde)
prepararCarrusel(document.querySelector(".testimonials__grid"));
