// Landing dinámica: lee sitio/publicado (lectura pública) y rellena cada sección.
// El HTML de index.html se conserva como respaldo: si la lectura falla, la página muestra ese contenido.
// Cada sección se procesa por separado; un dato con problemas en una sección no afecta a las demás.
// Todo texto que viene de Firestore se inserta con textContent (nunca como HTML).
import { db, doc, getDoc } from "./firebase-config.js";

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];
const visible = (x) => x && x.visible !== false;
const ordenar = (lista = []) => [...lista].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
const texto = (v) => (typeof v === "string" ? v.trim() : "");
const soloDigitos = (v) => String(v || "").replace(/\D/g, "");
const esHttps = (url) => /^https:\/\/[^\s]+$/i.test(texto(url));

// Crea un elemento con clase y texto (sin HTML)
function crear(etiqueta, clase, contenido) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (contenido !== undefined) el.textContent = contenido;
  return el;
}

// Íconos de servicios (los mismos del Figma que usa el panel; trazos en una cuadrícula de 20 × 20)
const ICONOS = {
  estetoscopio: "M9.1666 1.666V2.49937M9.1666 2.49937V3.33274M9.1666 2.49937H10C10.4421 2.49937 10.866 2.67497 11.1786 2.98754C11.4912 3.30012 11.6668 3.72406 11.6668 4.16611V7.49958C11.6668 8.82572 11.14 10.0975 10.2022 11.0353C9.26446 11.973 7.99259 12.4998 6.6664 12.4998M4.1662 1.666V2.49937M4.1662 2.49937V3.33274M4.1662 2.49937H3.3328C2.89074 2.49937 2.46678 2.67497 2.15419 2.98754C1.84161 3.30012 1.666 3.72406 1.666 4.16611V7.49958C1.666 8.82572 2.19283 10.0975 3.13058 11.0353C4.06834 11.973 5.34021 12.4998 6.6664 12.4998M6.6664 12.4998C6.6664 13.8259 7.19323 15.0978 8.13098 16.0355C9.06874 16.9732 10.3406 17.5 11.6668 17.5C12.993 17.5 14.2649 16.9732 15.2026 16.0355C16.1404 15.0978 16.6672 13.8259 16.6672 12.4998V9.99968M16.6672 9.99968C17.5877 9.99968 18.334 9.25346 18.334 8.33295C18.334 7.41243 17.5877 6.66621 16.6672 6.66621C15.7467 6.66621 15.0004 7.41243 15.0004 8.33295C15.0004 9.25346 15.7467 9.99968 16.6672 9.99968Z",
  bebe: "M8.33283 13.3336C8.74952 13.5836 9.33289 13.7502 9.99959 13.7502C10.6663 13.7502 11.2497 13.5836 11.6664 13.3336M12.4997 10.0002H12.5081M16.1504 5.67757C16.7346 6.52709 17.1375 7.48794 17.3338 8.50013C17.6156 8.63661 17.8532 8.8497 18.0195 9.115C18.1858 9.3803 18.274 9.68706 18.274 10.0002C18.274 10.3133 18.1858 10.62 18.0195 10.8853C17.8532 11.1506 17.6156 11.3637 17.3338 11.5002C16.974 13.1781 16.0497 14.682 14.715 15.7607C13.3804 16.8395 11.7161 17.428 10 17.428C8.28387 17.428 6.61963 16.8395 5.28499 15.7607C3.95034 14.682 3.02602 13.1781 2.66624 11.5002C2.38444 11.3637 2.14678 11.1506 1.98049 10.8853C1.8142 10.62 1.726 10.3133 1.726 10.0002C1.726 9.68706 1.8142 9.3803 1.98049 9.115C2.14678 8.8497 2.38444 8.63661 2.66624 8.50013C3.01148 6.80885 3.92956 5.28841 5.26558 4.19534C6.6016 3.10227 8.27378 2.50348 10 2.5C11.6668 2.5 12.9168 3.41669 12.9168 4.58338C12.9168 5.75007 12.1668 6.66676 11.2501 6.66676C10.5834 6.66676 10 6.33342 10 5.83341M7.49945 10.0002H7.50778",
  escaner: "M2.5 5.83333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H5.83333M14.1667 2.5H15.8333C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V5.83333M17.5 14.1667V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H14.1667M5.83333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V14.1667",
  "corazon-manos": "M10.3409 4.85385L7.98817 7.15543C7.6757 7.46796 7.50016 7.89179 7.50016 8.33371C7.50016 8.77563 7.6757 9.19946 7.98817 9.51199C8.30074 9.82443 8.72462 9.99995 9.1666 9.99995C9.60857 9.99995 10.0325 9.82443 10.345 9.51199L11.7701 8.08705C11.9567 7.90048 12.1781 7.75247 12.4219 7.65149C12.6656 7.55051 12.9268 7.49854 13.1907 7.49854C13.4545 7.49854 13.7158 7.55051 13.9595 7.65149C14.2032 7.75247 14.4247 7.90048 14.6112 8.08705L16.1788 9.65532C16.4913 9.96786 16.6668 10.3917 16.6668 10.8336C16.6668 11.2755 16.4913 11.6994 16.1788 12.0119C17.5006 10.6903 18.334 9.58366 18.334 7.91706C18.334 6.98977 18.0526 6.08429 17.5272 5.32022C17.0017 4.55615 16.2567 3.96944 15.3908 3.63757C14.5248 3.3057 13.5785 3.24429 12.6769 3.46145C11.7753 3.67861 10.9607 4.16412 10.3409 4.85385ZM16.1788 12.0119C16.0145 12.1763 15.8193 12.3067 15.6045 12.3956C15.3897 12.4846 15.1595 12.5304 14.9271 12.5304C14.6946 12.5304 14.4644 12.4846 14.2496 12.3956C14.0623 12.318 13.8899 12.2089 13.7398 12.0732M10.3409 4.85385C10.2484 4.94019 10.1267 4.98828 10.0002 4.98843C9.87366 4.98859 9.7518 4.9408 9.65914 4.85469C9.03932 4.165 8.22487 3.67951 7.32333 3.46233C6.42179 3.24515 5.47557 3.30649 4.60963 3.63825C3.74369 3.97002 2.99875 4.5566 2.4732 5.32054C1.94764 6.08448 1.66619 6.98984 1.666 7.91706C1.666 9.83365 2.9161 11.2503 4.1662 12.5002L8.77907 16.9684C8.93161 17.1324 9.11565 17.2639 9.32019 17.3552C9.52473 17.4465 9.74558 17.4957 9.96954 17.4997C10.1935 17.5038 10.416 17.4626 10.6237 17.3788C10.8314 17.2949 11.0201 17.1701 11.1784 17.0117C11.3425 16.8474 11.4726 16.6524 11.5612 16.4378C11.6499 16.2232 11.6953 15.9932 11.695 15.761C11.6947 15.5289 11.6486 15.299 11.5594 15.0847C11.482 14.8987 11.3735 14.7276 11.2388 14.5786M13.7398 12.0732C13.7178 12.0534 13.6963 12.0329 13.6753 12.0119C13.6973 12.0318 13.7189 12.0523 13.7398 12.0732ZM13.7398 12.0732C13.8881 12.2216 14.0091 12.3952 14.0968 12.5862C14.1969 12.8043 14.2516 13.0404 14.2576 13.2802C14.2637 13.5201 14.2209 13.7586 14.1318 13.9814C14.0428 14.2042 13.9094 14.4066 13.7397 14.5762C13.5701 14.7459 13.3677 14.8792 13.1449 14.9683C12.922 15.0573 12.6835 15.1001 12.4436 15.0941C12.2037 15.088 11.9676 15.0333 11.7495 14.9332C11.5595 14.846 11.3866 14.7258 11.2388 14.5786M11.2388 14.5786C11.217 14.5569 11.1958 14.5346 11.1751 14.5118C11.1969 14.5335 11.2181 14.5558 11.2388 14.5786Z",
  flor: "M10 4.1662C10 3.67171 10.1466 3.18832 10.4214 2.77716C10.6961 2.36601 11.0866 2.04555 11.5435 1.85632C12.0003 1.66708 12.5031 1.61757 12.9881 1.71404C13.4731 1.81051 13.9186 2.04863 14.2683 2.39829C14.6179 2.74795 14.8561 3.19345 14.9525 3.67844C15.049 4.16343 14.9995 4.66613 14.8102 5.12299C14.621 5.57984 14.3005 5.97032 13.8894 6.24504C13.4782 6.51977 12.9948 6.6664 12.5003 6.6664M10 4.1662C10 3.67171 9.85336 3.18832 9.57863 2.77716C9.30389 2.36601 8.9134 2.04555 8.45653 1.85632C7.99967 1.66708 7.49694 1.61757 7.01193 1.71404C6.52693 1.81051 6.08142 2.04863 5.73175 2.39829C5.38207 2.74795 5.14395 3.19345 5.04747 3.67844C4.951 4.16343 5.00051 4.66613 5.18975 5.12299C5.37899 5.57984 5.69946 5.97032 6.11063 6.24504C6.5218 6.51977 7.00521 6.6664 7.49971 6.6664M10 4.1662V4.9996M12.5003 6.6664C12.9948 6.6664 13.4782 6.81304 13.8894 7.08776C14.3005 7.36249 14.621 7.75296 14.8102 8.20982C14.9995 8.66667 15.049 9.16937 14.9525 9.65437C14.8561 10.1394 14.6179 10.5848 14.2683 10.9345C13.9186 11.2842 13.4731 11.5223 12.9881 11.6188C12.5031 11.7152 12.0003 11.6657 11.5435 11.4765C11.0866 11.2873 10.6961 10.9668 10.4214 10.5556C10.1466 10.1445 10 9.66109 10 9.1666M12.5003 6.6664H11.6669M7.49971 6.6664C7.00521 6.6664 6.5218 6.81304 6.11063 7.08776C5.69946 7.36249 5.37899 7.75296 5.18975 8.20982C5.00051 8.66667 4.951 9.16937 5.04747 9.65437C5.14395 10.1394 5.38207 10.5848 5.73175 10.9345C6.08142 11.2842 6.52693 11.5223 7.01193 11.6188C7.49694 11.7152 7.99967 11.6657 8.45653 11.4765C8.9134 11.2873 9.30389 10.9668 9.57863 10.5556C9.85328 10.1446 9.99991 9.66138 10 9.16705M7.49971 6.6664H8.33314M10 4.9996C9.07942 4.9996 8.33314 5.74585 8.33314 6.6664M10 4.9996C10.9206 4.9996 11.6669 5.74585 11.6669 6.6664M10 18.334L10 9.16705C10 9.1669 10 9.16675 10 9.1666M10 9.1666V8.3332M11.6669 6.6664C11.6669 7.58695 10.9206 8.3332 10 8.3332M8.33314 6.6664C8.33314 7.58695 9.07942 8.3332 10 8.3332M10 18.334C13.5004 18.334 15.834 16.9447 15.834 14.167C12.3336 14.167 10 15.5563 10 18.334ZM10 18.334C6.4996 18.334 4.166 16.9447 4.166 14.167C7.6664 14.167 10 15.5563 10 18.334Z",
  corazon: "M1.666 7.91684C1.66602 6.9895 1.94735 6.08397 2.47284 5.31987C2.99833 4.55576 3.74326 3.96902 4.60923 3.63713C5.47521 3.30524 6.4215 3.24383 7.32311 3.461C8.22473 3.67817 9.03925 4.1637 9.65911 4.85348C9.70277 4.90015 9.75556 4.93737 9.81419 4.96281C9.87282 4.98825 9.93606 5.00138 9.99997 5.00138C10.0639 5.00138 10.1271 4.98825 10.1858 4.96281C10.2444 4.93737 10.2972 4.90015 10.3408 4.85348C10.9587 4.15922 11.7735 3.6696 12.6765 3.4498C13.5796 3.22999 14.5282 3.29042 15.3961 3.62303C16.264 3.95565 17.01 4.54468 17.5348 5.31173C18.0596 6.07878 18.3384 6.98746 18.3339 7.91684C18.3339 9.82519 17.0839 11.2502 15.8338 12.5002L11.2567 16.9278C11.1014 17.1061 10.91 17.2494 10.6951 17.348C10.4801 17.4467 10.2467 17.4985 10.0102 17.5C9.77374 17.5015 9.53964 17.4526 9.32349 17.3567C9.10734 17.2608 8.91408 17.12 8.75654 16.9436L4.16619 12.5002C2.9161 11.2502 1.666 9.83352 1.666 7.91684Z"
};
const ICONO_ORIGINAL = {
  "consulta-general": "estetoscopio", "control-prenatal": "bebe", colposcopia: "escaner",
  "planificacion-familiar": "corazon-manos", menopausia: "flor", "salud-sexual": "corazon"
};
function iconoServicio(servicio) {
  const clave = ICONOS[servicio.icono] ? servicio.icono : ICONO_ORIGINAL[servicio.id] || "estetoscopio";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("aria-hidden", "true");
  svg.style.strokeWidth = "1.25";
  const trazo = document.createElementNS("http://www.w3.org/2000/svg", "path");
  trazo.setAttribute("d", ICONOS[clave]);
  svg.append(trazo);
  return svg;
}

// Oculta una sección y los enlaces del menú que apuntan a ella
function ocultarSeccion(id) {
  const seccion = document.getElementById(id);
  if (seccion) seccion.hidden = true;
  $$(`a[href="#${id}"]`).forEach((enlace) => { enlace.hidden = true; });
}

// Cambia una imagen solo si hay una URL válida; si la nueva no carga, vuelve a la original
function ponerImagen(img, imagen) {
  if (!img || !imagen?.url) return;
  const original = img.getAttribute("src");
  img.addEventListener("error", () => { if (img.getAttribute("src") !== original) img.src = original; }, { once: true });
  img.src = imagen.url;
  if (texto(imagen.textoAlternativo)) img.alt = imagen.textoAlternativo;
}

// =====================================================================
// Secciones
// =====================================================================

function aplicarMetadatos(c = {}) {
  if (texto(c.tituloPagina)) document.title = c.tituloPagina;
  const descripcion = texto(c.descripcionBuscadores);
  if (descripcion) {
    let meta = $('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.append(meta); }
    meta.content = descripcion;
  }
}

function aplicarIdentidad(perfil = {}) {
  const nombre = texto(perfil.nombreCompleto);
  const especialidad = texto(perfil.especialidad);
  if (nombre) {
    $(".navbar__name").textContent = nombre;
    $(".footer__name").textContent = nombre;
    $(".navbar__logo").alt = `Logo ${nombre}`;
  }
  if (especialidad) $(".navbar__specialty").textContent = especialidad;
  if (nombre) {
    $(".footer__copy").textContent =
      `© ${new Date().getFullYear()} ${nombre}${especialidad ? ` — ${especialidad}` : ""}. Todos los derechos reservados.`;
  }
  // Título de Sobre mí: si es el nombre original se conserva el formato del HTML (dos líneas)
  const titulo = $(".about__title");
  if (nombre && titulo && titulo.innerText.replace(/\s+/g, " ").trim() !== nombre) titulo.textContent = nombre;
}

function aplicarHero(info = {}, galeria = []) {
  if (texto(info.eyebrow)) $(".hero__eyebrow").textContent = info.eyebrow;
  // El título original tiene cursiva y saltos de línea en el HTML: se conserva si el texto no cambió
  const titulo = $(".hero__title");
  const nuevo = texto(info.tituloHero);
  if (nuevo && titulo.innerText.replace(/\s+/g, " ").trim() !== nuevo) titulo.textContent = nuevo;
  if (texto(info.textoPresentacion)) $(".hero__text").textContent = info.textoPresentacion;
  const [cta1, cta2] = $$(".hero__actions a");
  if (cta1 && texto(info.ctaPrincipal)) cta1.textContent = info.ctaPrincipal;
  if (cta2 && texto(info.ctaSecundario)) cta2.textContent = info.ctaSecundario;
  ponerImagen($(".hero__photo img"), galeria.find((i) => i.uso === "inicio"));
}

function aplicarServicios(servicios) {
  const lista = ordenar(servicios).filter(visible);
  if (!lista.length) { ocultarSeccion("servicios"); return; }
  const rejilla = $(".services__grid");
  rejilla.replaceChildren(...lista.map((s) => {
    const tarjeta = crear("div", "service-card");
    const icono = crear("div", "service-card__icon");
    icono.append(iconoServicio(s));
    tarjeta.append(icono, crear("h3", "service-card__title", s.nombre), crear("p", "service-card__desc", s.descripcion), crear("div", "service-card__line"));
    return tarjeta;
  }));
}

const pesos = (n) => `$${Number(n).toLocaleString("es-MX")}`;

function aplicarPaquetes(paquetes, nota) {
  const lista = ordenar(paquetes).filter(visible);
  if (!lista.length) { ocultarSeccion("paquetes"); return; }
  $(".packages__grid").dataset.cantidad = lista.length;
  $(".packages__grid").replaceChildren(...lista.map((p) => {
    const tarjeta = crear("div", `package${p.destacado ? " package--featured" : ""}`);
    if (p.destacado) tarjeta.append(crear("span", "package__badge", "Más popular"));
    if (texto(p.etiqueta)) tarjeta.append(crear("p", "package__tag", p.etiqueta));
    tarjeta.append(crear("h3", "package__name", p.nombre), crear("p", "package__desc", p.descripcion));
    const ul = crear("ul", "package__list");
    (p.incluye || []).forEach((elemento) => ul.append(crear("li", "", elemento)));
    tarjeta.append(ul);
    const pie = crear("div", "package__footer");
    const precios = crear("div", "package__prices");
    if (Number(p.precioRegular) > 0) precios.append(crear("span", "package__old", pesos(p.precioRegular)));
    if (Number(p.precioPaquete) > 0) precios.append(crear("span", "package__price", pesos(p.precioPaquete)));
    const boton = crear("a", "package__btn", "Agendar este paquete");
    boton.href = "#agendar";
    boton.dataset.motivo = `Paquete: ${p.nombre}`;
    pie.append(precios, boton);
    tarjeta.append(pie);
    return tarjeta;
  }));
  const parrafo = $(".packages__note");
  if (texto(nota)) parrafo.textContent = `* ${nota.replace(/^\*\s*/, "")}`;
  else parrafo.hidden = true;
}

function aplicarSobreMi(info = {}, experiencia, galeria = []) {
  ponerImagen($(".about__photo img"), galeria.find((i) => i.uso === "sobre-mi"));
  const certificacion = texto(info.certificacion);
  if (certificacion) $(".about__badge-text").textContent = certificacion;
  else $(".about__badge").hidden = true;
  const [bio, filosofia] = $$(".about__text");
  if (bio) { if (texto(info.biografia)) bio.textContent = info.biografia; }
  if (filosofia) { if (texto(info.filosofia)) filosofia.textContent = info.filosofia; else filosofia.hidden = true; }

  if (!Array.isArray(experiencia)) return;
  const credenciales = ordenar(experiencia).filter((e) => texto(e.titulo));
  const contenedor = $(".about__credentials");
  if (!credenciales.length) { contenedor.hidden = true; return; }
  contenedor.replaceChildren(...credenciales.map((e) => {
    const fila = crear("div", "about__credential");
    fila.append(crear("div", "about__dot"), crear("p", "", texto(e.periodo) ? `${e.titulo} · ${e.periodo}` : e.titulo));
    return fila;
  }));
}

function aplicarTestimonios(testimonios) {
  const lista = ordenar(testimonios).filter(visible).filter((t) => texto(t.comentario));
  if (!lista.length) { ocultarSeccion("testimonios"); return; }
  $(".testimonials__grid").dataset.cantidad = lista.length;
  $(".testimonials__grid").replaceChildren(...lista.map((t) => {
    const tarjeta = crear("div", "testimonial");
    const valoracion = Math.max(1, Math.min(5, Number(t.valoracion) || 5));
    const estrellas = crear("div", "testimonial__stars");
    estrellas.setAttribute("aria-label", `${valoracion} de 5 estrellas`);
    for (let i = 0; i < valoracion; i++) estrellas.append(crear("span", "", "★"));
    const autora = crear("div", "testimonial__author");
    const datos = crear("div");
    datos.append(crear("p", "testimonial__name", t.autora));
    if (Number(t.edad) > 0) datos.append(crear("p", "testimonial__age", `${t.edad} años`));
    autora.append(crear("div", "testimonial__avatar", texto(t.autora).charAt(0).toUpperCase()), datos);
    tarjeta.append(estrellas, crear("p", "testimonial__text", `"${t.comentario}"`), autora);
    return tarjeta;
  }));
}

// Datos de contacto en "Agenda tu cita" (ubicación, teléfono, horario)
function aplicarInfoAgenda(contacto = {}, horarios = {}) {
  const [ubicacion, telefono, horario] = $$(".booking__info .info-item");
  const poner = (item, titulo, sub) => {
    if (!item) return;
    if (texto(titulo)) $(".info-item__title", item).textContent = titulo;
    if (texto(sub)) $(".info-item__sub", item).textContent = sub;
  };
  poner(ubicacion, contacto.ciudad, contacto.modalidad);
  if (contacto.mostrarTelefono === false) { if (telefono) telefono.hidden = true; }
  else poner(telefono, contacto.telefono, contacto.etiquetaPublica);
  poner(horario, horarios.etiquetaPublica, horarios.textoHorario);
}

// Tarjetas de "Contacto y redes sociales"
const SVG = {
  telefono: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />',
  correo: '<rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />',
  ubicacion: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />'
};
function tarjetaContacto({ etiqueta, valor, href, externo, svg, svgRelleno, activa }) {
  const tarjeta = crear(href ? "a" : "div", `contact-card ${activa ? "contact-card--active" : "contact-card--soon"}`);
  if (href) {
    tarjeta.href = href;
    if (externo) { tarjeta.target = "_blank"; tarjeta.rel = "noopener noreferrer"; }
  }
  // Los íconos son fijos (definidos aquí), no vienen de Firestore
  tarjeta.insertAdjacentHTML("afterbegin", svgRelleno
    ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${svgRelleno}</svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>`);
  const datos = crear("div");
  datos.append(crear("p", "contact-card__label", etiqueta), crear("p", "contact-card__value", valor));
  tarjeta.append(datos);
  return tarjeta;
}

function aplicarContacto(c = {}) {
  const tarjetas = [];
  const prefijo = soloDigitos(c.prefijo);
  if (c.mostrarTelefono !== false) {
    if (soloDigitos(c.telefono)) tarjetas.push(tarjetaContacto({ etiqueta: "Teléfono", valor: c.telefono, href: `tel:+${prefijo}${soloDigitos(c.telefono)}`, svg: SVG.telefono, activa: true }));
    if (soloDigitos(c.whatsapp)) tarjetas.push(tarjetaContacto({ etiqueta: "WhatsApp", valor: c.whatsapp, href: `https://wa.me/${prefijo}${soloDigitos(c.whatsapp)}`, externo: true, svgRelleno: '<use href="#icon-whatsapp" />', activa: true }));
  }
  if (c.correoVisible && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(c.correo))) {
    tarjetas.push(tarjetaContacto({ etiqueta: "Correo", valor: c.correo, href: `mailto:${texto(c.correo)}`, svg: SVG.correo, activa: true }));
  }
  if (c.direccionVisible && texto(c.direccion)) {
    tarjetas.push(tarjetaContacto({ etiqueta: "Dirección", valor: c.direccion, href: esHttps(c.urlMapa) ? texto(c.urlMapa) : null, externo: true, svg: SVG.ubicacion, activa: true }));
  } else if (esHttps(c.urlMapa)) {
    tarjetas.push(tarjetaContacto({ etiqueta: "Ubicación", valor: "Ver en el mapa", href: texto(c.urlMapa), externo: true, svg: SVG.ubicacion, activa: true }));
  }
  const igActivo = c.instagramActivo && /^https:\/\/(www\.)?instagram\.com\/\S+$/i.test(texto(c.instagram));
  const fbActivo = c.facebookActivo && /^https:\/\/(www\.|m\.)?facebook\.com\/\S+$/i.test(texto(c.facebook));
  tarjetas.push(tarjetaContacto({ etiqueta: "Instagram", valor: igActivo ? "Síguenos" : "Próximamente", href: igActivo ? texto(c.instagram) : null, externo: true, svg: SVG.instagram, activa: igActivo }));
  tarjetas.push(tarjetaContacto({ etiqueta: "Facebook", valor: fbActivo ? "Síguenos" : "Próximamente", href: fbActivo ? texto(c.facebook) : null, externo: true, svgRelleno: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />', activa: fbActivo }));

  $(".contact__grid").replaceChildren(...tarjetas);
  $(".contact__subtitle").textContent = igActivo && fbActivo ? "Síguenos en redes sociales" : igActivo || fbActivo ? "Escríbenos o síguenos en redes" : "Próximamente disponibles en redes";
}

// Opciones de "Motivo de consulta": servicios y paquetes visibles, más "Otro"
function aplicarMotivos(servicios, paquetes) {
  const select = $("#motivo");
  const servs = ordenar(servicios).filter(visible);
  if (!servs.length) return;
  const opcion = (valor) => { const o = document.createElement("option"); o.value = valor; o.textContent = valor; return o; };
  const vacia = select.options[0];
  const nuevas = [vacia, ...servs.map((s) => opcion(s.nombre))];
  const paqs = ordenar(paquetes).filter(visible);
  if (paqs.length) {
    const grupo = document.createElement("optgroup");
    grupo.label = "Paquetes";
    paqs.forEach((p) => grupo.append(opcion(`Paquete: ${p.nombre}`)));
    nuevas.push(grupo);
  }
  nuevas.push(opcion("Otro"));
  select.replaceChildren(...nuevas);
  vacia.selected = true;
}

// Página en mantenimiento (configuracion.sitioVisible = false)
function mostrarMantenimiento(datos) {
  const nombre = texto(datos.perfil?.nombreCompleto) || $(".navbar__name").textContent;
  const c = datos.contacto || {};
  document.body.classList.add("sitio-mantenimiento");
  const aviso = crear("section", "mantenimiento");
  aviso.append(
    crear("p", "section-eyebrow", "Sitio en mantenimiento"),
    crear("h1", "mantenimiento__titulo", nombre),
    crear("p", "mantenimiento__texto", "Estamos actualizando la información de este sitio. Vuelve a visitarnos pronto.")
  );
  const numero = soloDigitos(c.prefijo) + soloDigitos(c.whatsapp);
  if (soloDigitos(c.whatsapp)) {
    const enlace = crear("a", "btn btn--primary", "Escribir por WhatsApp");
    enlace.href = `https://wa.me/${numero}`;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    aviso.append(enlace);
  }
  $("main").replaceChildren(aviso);
}

// =====================================================================
// Carga
// =====================================================================

function intentar(nombre, funcion) {
  try { funcion(); } catch (error) { console.error(`No se pudo actualizar la sección ${nombre}:`, error); }
}

async function cargar() {
  let datos;
  try {
    const documento = await getDoc(doc(db, "sitio", "publicado"));
    if (!documento.exists()) return;
    datos = documento.data();
  } catch (error) {
    console.error("No se pudo leer el contenido publicado; se muestra el contenido base.", error);
    return;
  }

  intentar("metadatos", () => aplicarMetadatos(datos.configuracion));
  if (datos.configuracion?.sitioVisible === false) { intentar("mantenimiento", () => mostrarMantenimiento(datos)); return; }

  const galeria = (datos.galeria || []).filter((i) => i.uso && i.url);
  intentar("identidad", () => aplicarIdentidad(datos.perfil));
  intentar("inicio", () => aplicarHero(datos.informacionProfesional, galeria));
  if (Array.isArray(datos.servicios)) intentar("servicios", () => aplicarServicios(datos.servicios));
  if (Array.isArray(datos.paquetes)) intentar("paquetes", () => aplicarPaquetes(datos.paquetes, datos.notaPaquetes));
  intentar("sobre mí", () => aplicarSobreMi(datos.informacionProfesional, datos.experiencia, galeria));
  if (Array.isArray(datos.testimonios)) intentar("testimonios", () => aplicarTestimonios(datos.testimonios));
  intentar("agenda", () => aplicarInfoAgenda(datos.contacto, datos.horarios));
  intentar("contacto", () => aplicarContacto(datos.contacto));
  if (Array.isArray(datos.servicios)) intentar("motivos", () => aplicarMotivos(datos.servicios, datos.paquetes));

  // El formulario de agendado (js/agendar.js) toma de aquí el número de WhatsApp y el horario
  document.dispatchEvent(new CustomEvent("sitio:contenido", { detail: { contacto: datos.contacto, horarios: datos.horarios } }));
}

cargar();
