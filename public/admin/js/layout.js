// Estructura común del panel: barra lateral, encabezado, menú móvil y pie.
// Cada página del panel llama a iniciarPanel("clave-de-la-pagina") al cargar.
import { protegerPagina, cerrarSesion } from "./auth.js";
import { leerBorrador } from "./borrador.js";

const ICONOS = {
  inicio: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  "informacion-profesional": '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>',
  servicios: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
  experiencia: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  contacto: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17c1-2 2.5-3 4-3s3 1 4 3"/>',
  horarios: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  galeria: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  testimonios: '<path d="M4 5h16v11H9l-5 4z"/>',
  configuracion: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  salir: '<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>'
};

const MENU = [
  { clave: "inicio", texto: "Dashboard / Inicio", href: "index.html" },
  { clave: "perfil", texto: "Mi perfil", href: "perfil.html" },
  { clave: "informacion-profesional", texto: "Información profesional", href: "informacion-profesional.html" },
  { clave: "servicios", texto: "Servicios / Especialidades", href: "servicios.html" },
  { clave: "experiencia", texto: "Experiencia y formación", href: "experiencia.html" },
  { clave: "contacto", texto: "Información de contacto", href: "contacto.html" },
  { clave: "horarios", texto: "Horarios de atención", href: "horarios.html" },
  { clave: "galeria", texto: "Galería / Imágenes", href: "galeria.html" },
  { clave: "testimonios", texto: "Testimonios", href: "testimonios.html" },
  { clave: "configuracion", texto: "Configuración", href: "configuracion.html" }
];

export function escaparHTML(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function icono(nombre) {
  return `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre]}</svg>`;
}

function iniciales(nombre = "") {
  const palabras = nombre.replace(/^(Dr|Dra)\.?\s+/i, "").trim().split(/\s+/);
  const primera = palabras[0]?.[0] || "";
  const ultima = palabras.length > 1 ? palabras[palabras.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}

function dibujarBarraLateral(paginaActual, perfil) {
  const enlaces = MENU.map(({ clave, texto, href }) => {
    const activo = clave === paginaActual;
    return `<li><a class="lateral__enlace${activo ? " lateral__enlace--activo" : ""}" href="${href}"${activo ? ' aria-current="page"' : ""}>${icono(clave)}<span>${texto}</span></a></li>`;
  }).join("");

  return `
    <div class="lateral__barra-movil">
      <span class="lateral__rotulo">Administración</span>
      <button class="lateral__cerrar-menu" type="button" data-cerrar-menu>Cerrar menú</button>
    </div>
    <div class="lateral__cabecera">
      <p class="lateral__nombre">${escaparHTML(perfil.nombreCompleto)}</p>
      <p class="lateral__especialidad">${escaparHTML(perfil.especialidad)}</p>
      <span class="insignia insignia--marca lateral__solo-escritorio">Administración del sitio</span>
      <span class="insignia insignia--exito lateral__solo-movil">Sesión activa</span>
    </div>
    <p class="lateral__titulo">Contenido público</p>
    <nav aria-label="Secciones del panel">
      <ul class="lateral__lista">${enlaces}</ul>
    </nav>
    <div class="lateral__pie">
      <p class="lateral__nota">Guarda tus cambios y publícalos cuando estén listos.</p>
      <button class="lateral__salir" type="button" data-cerrar-sesion>${icono("salir")}<span>Cerrar sesión</span></button>
    </div>`;
}

function dibujarEncabezado(administrador) {
  return `
    <button class="encabezado__menu" type="button" data-abrir-menu aria-controls="barraLateral" aria-expanded="false">Menú</button>
    <div class="encabezado__usuario">
      <p class="encabezado__nombre">${escaparHTML(administrador.nombre)}</p>
      <p class="encabezado__estado">Sesión activa</p>
    </div>
    <span class="avatar" title="${escaparHTML(administrador.correo || "")}">${escaparHTML(iniciales(administrador.nombre))}</span>`;
}

function conectarMenuMovil() {
  const lateral = document.getElementById("barraLateral");
  const botonAbrir = document.querySelector("[data-abrir-menu]");
  const fondo = document.createElement("div");
  fondo.className = "panel__fondo";
  fondo.hidden = true;
  document.body.appendChild(fondo);

  function abrir() {
    document.body.classList.add("menu-abierto");
    fondo.hidden = false;
    botonAbrir.setAttribute("aria-expanded", "true");
    lateral.querySelector(".lateral__enlace")?.focus();
  }
  function cerrar() {
    if (!document.body.classList.contains("menu-abierto")) return;
    document.body.classList.remove("menu-abierto");
    fondo.hidden = true;
    botonAbrir.setAttribute("aria-expanded", "false");
    botonAbrir.focus();
  }

  botonAbrir.addEventListener("click", abrir);
  lateral.querySelector("[data-cerrar-menu]").addEventListener("click", cerrar);
  fondo.addEventListener("click", cerrar);
  document.addEventListener("keydown", (evento) => { if (evento.key === "Escape") cerrar(); });
}

function conectarCierreDeSesion() {
  const boton = document.querySelector("[data-cerrar-sesion]");
  boton.addEventListener("click", async () => {
    boton.disabled = true;
    boton.querySelector("span").textContent = "Cerrando sesión…";
    if (!(await cerrarSesion())) {
      boton.disabled = false;
      boton.querySelector("span").textContent = "Cerrar sesión";
    }
  });
}

// Verifica la sesión, carga el borrador, dibuja la estructura y muestra la página.
// Devuelve { usuario, administrador, borrador } para que la página use los datos.
export async function iniciarPanel(paginaActual) {
  const { usuario, administrador } = await protegerPagina({ mostrar: false });

  let borrador;
  try {
    borrador = await leerBorrador();
  } catch (error) {
    console.error(error);
    document.body.classList.remove("verificando");
    document.body.innerHTML = '<p class="aviso aviso--error" style="margin:40px">No fue posible cargar el contenido del sitio. Revisa tu conexión y recarga la página.</p>';
    throw error;
  }

  document.getElementById("barraLateral").innerHTML = dibujarBarraLateral(paginaActual, borrador.perfil);
  document.getElementById("encabezado").innerHTML = dibujarEncabezado(administrador);
  document.getElementById("pie").textContent = `${borrador.perfil.nombreCompleto} · Gestión de contenido del sitio`;

  conectarMenuMovil();
  conectarCierreDeSesion();

  document.body.classList.remove("verificando");
  return { usuario, administrador, borrador };
}
