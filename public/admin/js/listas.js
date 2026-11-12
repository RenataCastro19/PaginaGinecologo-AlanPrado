// Utilidades para las pantallas con listas (servicios, paquetes, experiencia, testimonios, galería):
// identificadores, orden, editor en un <dialog> y confirmación de eliminación.
import { validarFormulario, limpiarErroresAlEscribir } from "./borrador.js";
import { escaparHTML } from "./layout.js";

// Identificador estable para un elemento nuevo: texto legible + sufijo aleatorio
export function nuevoId(base = "elemento") {
  const legible = String(base)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 30) || "elemento";
  return `${legible}-${crypto.randomUUID().slice(0, 6)}`;
}

// Copia ordenada por el campo "orden"
export function ordenar(lista = []) {
  return structuredClone(lista).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}

// Vuelve a numerar "orden" según la posición (1, 2, 3…)
export function renumerar(lista) {
  lista.forEach((elemento, i) => { elemento.orden = i + 1; });
  return lista;
}

// Mueve un elemento a otra posición (índices desde 0) y renumera
export function mover(lista, desde, hasta) {
  const destino = Math.max(0, Math.min(lista.length - 1, hasta));
  const [elemento] = lista.splice(desde, 1);
  lista.splice(destino, 0, elemento);
  return renumerar(lista);
}

export function iniciales(nombre = "") {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  return ((palabras[0]?.[0] || "") + (palabras.length > 1 ? palabras.at(-1)[0] : "")).toUpperCase();
}

// Une una lista en español: "a, b y c"
export function unirEnEspanol(elementos) {
  if (elementos.length <= 1) return elementos.join("");
  return `${elementos.slice(0, -1).join(", ")} y ${elementos.at(-1)}`;
}

// Abre un <dialog> que contiene un <form> y resuelve con el valor leído, o null si se cancela.
//   dialogo   elemento <dialog> (su <form> tiene un botón type="submit" y botones [data-cerrar-dialogo])
//   valor     objeto a editar (o null para uno nuevo)
//   rellenar  coloca el valor en el formulario
//   leer      devuelve el valor a partir del formulario
//   validar   opcional; reglas propias con setCustomValidity
export function abrirEditor({ dialogo, valor, rellenar, leer, validar }) {
  const formulario = dialogo.querySelector("form");
  if (!formulario.dataset.preparado) {
    formulario.dataset.preparado = "1";
    formulario.noValidate = true;
    limpiarErroresAlEscribir(formulario);
    dialogo.querySelectorAll("[data-cerrar-dialogo]").forEach((boton) =>
      boton.addEventListener("click", () => dialogo.close("cancelar")));
    // Los textarea del editor crecen con el contenido
    formulario.addEventListener("input", (evento) => {
      if (evento.target.tagName === "TEXTAREA") ajustarAltura(evento.target);
    });
  }

  formulario.reset();
  formulario.querySelectorAll("input, textarea").forEach((campo) => campo.setCustomValidity(""));
  rellenar(valor);

  return new Promise((resolver) => {
    function alEnviar(evento) {
      evento.preventDefault();
      if (!validarFormulario(formulario, validar)) return;
      const resultado = leer();
      terminar();
      dialogo.close("guardar");
      resolver(resultado);
    }
    function alCerrar() {
      terminar();
      resolver(null);
    }
    function terminar() {
      formulario.removeEventListener("submit", alEnviar);
      dialogo.removeEventListener("close", alCerrar);
    }
    formulario.addEventListener("submit", alEnviar);
    dialogo.addEventListener("close", alCerrar);
    dialogo.showModal();
    formulario.querySelectorAll("textarea").forEach(ajustarAltura);
    formulario.querySelector("input:not([type=hidden]), textarea, select")?.focus();
  });
}

function ajustarAltura(area) {
  area.style.height = "auto";
  area.style.height = `${area.scrollHeight}px`;
}

// Modal de confirmación de eliminación (Figma 3:36324). Resuelve true si se confirma.
let dialogoEliminar;
export function confirmarEliminacion({ titulo, nombre, mensaje, nota, textoBoton = "Eliminar" }) {
  if (!dialogoEliminar) {
    dialogoEliminar = document.createElement("dialog");
    dialogoEliminar.className = "dialogo";
    dialogoEliminar.setAttribute("aria-labelledby", "tituloEliminar");
    document.body.appendChild(dialogoEliminar);
  }
  dialogoEliminar.innerHTML = `
    <form method="dialog" class="dialogo__formulario">
      <div class="dialogo__cabecera">
        <img src="img/iconos/eliminar.svg" width="22" height="22" alt="">
        <h2 id="tituloEliminar" class="dialogo__titulo">${escaparHTML(titulo)}</h2>
        <button class="dialogo__cerrar" type="submit" value="cancelar" aria-label="Cerrar">${ICONO_CERRAR}</button>
      </div>
      ${nombre ? `<span class="insignia insignia--marca">${escaparHTML(nombre)}</span>` : ""}
      <p>${escaparHTML(mensaje)}</p>
      <div class="aviso aviso--pendiente">
        <p class="aviso__titulo">Revisa antes de continuar</p>
        <p>${escaparHTML(nota || "La página pública no cambia hasta que publiques los cambios desde Revisar y publicar.")}</p>
      </div>
      <div class="dialogo__acciones">
        <button class="boton boton--secundario" type="submit" value="cancelar">Cancelar</button>
        <button class="boton boton--peligro" type="submit" value="eliminar">${escaparHTML(textoBoton)}</button>
      </div>
    </form>`;
  return new Promise((resolver) => {
    dialogoEliminar.addEventListener("close", () => resolver(dialogoEliminar.returnValue === "eliminar"), { once: true });
    dialogoEliminar.returnValue = "";
    dialogoEliminar.showModal();
    dialogoEliminar.querySelector('[value="cancelar"].boton').focus();
  });
}

export const ICONO_CERRAR =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

// Estrellas de valoración (texto accesible aparte)
export function estrellas(valor = 0, total = 5) {
  return Array.from({ length: total }, (_, i) => (i < valor ? "★" : "☆")).join("");
}
