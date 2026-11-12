// Lectura y guardado del contenido del sitio.
// Todas las pantallas del panel editan el documento sitio/borrador. Nunca escriben en sitio/publicado:
// eso solo ocurre en la pantalla "Revisar y publicar".
import { auth, db, doc, getDoc, updateDoc, serverTimestamp, writeBatch, collection } from "../../js/firebase-config.js";

const refBorrador = doc(db, "sitio", "borrador");
const refPublicado = doc(db, "sitio", "publicado");

export async function leerBorrador() {
  const documento = await getDoc(refBorrador);
  if (!documento.exists()) throw new Error("No existe el documento sitio/borrador.");
  return documento.data();
}

export async function leerPublicado() {
  const documento = await getDoc(refPublicado);
  return documento.exists() ? documento.data() : null;
}

// Guarda una sección completa del borrador (por ejemplo "perfil" o "servicios")
// y registra quién y cuándo hizo el cambio.
// Si seccion es una lista (["servicios", "paquetes"]), valor es un objeto con esas llaves
// y se guardan todas en la misma escritura.
export async function guardarSeccion(seccion, valor) {
  const cambios = Array.isArray(seccion)
    ? Object.fromEntries(seccion.map((nombre) => [nombre, valor[nombre]]))
    : { [seccion]: valor };
  await updateDoc(refBorrador, {
    ...cambios,
    "metadatos.actualizadoEn": serverTimestamp(),
    "metadatos.actualizadoPor": auth.currentUser.uid
  });
}

// Publica: copia el borrador a sitio/publicado y deja una copia en historial, en una sola operación
// (writeBatch: se aplican las dos escrituras o ninguna). Es la ÚNICA función que escribe en
// sitio/publicado e historial; solo la usa la pantalla Revisar y publicar.
export async function publicarBorrador(secciones = []) {
  const contenido = await leerBorrador();
  const uid = auth.currentUser.uid;
  const lote = writeBatch(db);
  lote.set(refPublicado, {
    ...contenido,
    metadatos: { ...(contenido.metadatos || {}), publicadoEn: serverTimestamp(), publicadoPor: uid }
  });
  lote.set(doc(collection(db, "historial")), {
    publicadoEn: serverTimestamp(),
    publicadoPor: uid,
    secciones,
    contenido
  });
  await lote.commit();
}

// Convierte un valor a texto con las llaves ordenadas, para comparar objetos
// sin que importe el orden en que Firestore devuelve los campos.
function textoCanonico(valor) {
  if (Array.isArray(valor)) return `[${valor.map(textoCanonico).join(",")}]`;
  if (valor && typeof valor === "object") {
    return `{${Object.keys(valor).sort().map((llave) => `${JSON.stringify(llave)}:${textoCanonico(valor[llave])}`).join(",")}}`;
  }
  return JSON.stringify(valor);
}

export function sonIguales(a, b) {
  return textoCanonico(a) === textoCanonico(b);
}

// Secciones del contenido, con el nombre y la pantalla donde se editan.
// Se usan para comparar el borrador contra lo publicado (Configuración, Revisar y publicar, Dashboard).
export const SECCIONES = [
  { clave: "perfil", nombre: "Mi perfil", pagina: "perfil.html" },
  { clave: "informacionProfesional", nombre: "Información profesional", pagina: "informacion-profesional.html" },
  { clave: "servicios", nombre: "Servicios", pagina: "servicios.html" },
  { clave: "paquetes", nombre: "Paquetes", pagina: "servicios.html" },
  { clave: "notaPaquetes", nombre: "Nota de paquetes", pagina: "servicios.html" },
  { clave: "experiencia", nombre: "Experiencia y formación", pagina: "experiencia.html" },
  { clave: "contacto", nombre: "Información de contacto", pagina: "contacto.html" },
  { clave: "horarios", nombre: "Horarios de atención", pagina: "horarios.html" },
  { clave: "galeria", nombre: "Galería / Imágenes", pagina: "galeria.html" },
  { clave: "testimonios", nombre: "Testimonios", pagina: "testimonios.html" },
  { clave: "configuracion", nombre: "Configuración", pagina: "configuracion.html" }
];

// Devuelve las secciones cuyo contenido en el borrador es distinto de lo publicado
// (si no hay nada publicado, todas cuentan como cambio)
export function seccionesConCambios(borrador, publicado) {
  return SECCIONES.filter(({ clave }) => !publicado || !sonIguales(borrador?.[clave] ?? null, publicado[clave] ?? null));
}

// Formatea una fecha de Firestore (Timestamp) o Date: "12 nov 2026 · 09:30"
export function formatearFecha(valor) {
  const fecha = valor?.toDate ? valor.toDate() : valor instanceof Date ? valor : null;
  if (!fecha || Number.isNaN(fecha.getTime())) return "";
  const dia = fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  const hora = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dia} · ${hora}`;
}

// Validación nativa con mensajes claros (la usan controlarFormulario y los editores de listas):
// - un campo obligatorio no puede tener solo espacios (en <textarea> no existe pattern y required acepta espacios)
// - si el formato no coincide (pattern, type="email"/"url", min/max), se muestra el title del campo como mensaje
// - validarExtra() permite reglas propias con campo.setCustomValidity("mensaje")
export function validarFormulario(formulario, validarExtra) {
  formulario.querySelectorAll("input:not([type=checkbox]), textarea").forEach((campo) => {
    campo.setCustomValidity("");
    const v = campo.validity;
    if (campo.required && !campo.value.trim()) {
      campo.setCustomValidity("Este campo no puede quedar vacío.");
    } else if (campo.title && (v.patternMismatch || v.typeMismatch || v.rangeUnderflow || v.rangeOverflow || v.stepMismatch || v.badInput)) {
      campo.setCustomValidity(campo.title);
    }
  });
  validarExtra?.();
  return formulario.reportValidity();
}

// Al escribir en un campo marcado con error, el error se limpia (se vuelve a revisar al guardar)
export function limpiarErroresAlEscribir(formulario) {
  formulario.addEventListener("input", (evento) => evento.target.setCustomValidity?.(""));
}

// Controla el ciclo de edición de un formulario: detecta cambios, cancela, guarda
// y avisa si se intenta salir con cambios sin guardar.
//
//   formulario   elemento <form> de la pantalla (su botón type="submit" es "Guardar cambios")
//   seccion      nombre del campo del borrador que edita la pantalla, o lista de nombres
//                (en ese caso valorInicial y leer() usan un objeto con esas llaves)
//   valorInicial valor actual de esa sección
//   rellenar(v)  función de la pantalla que coloca el valor en el formulario
//   leer()       función de la pantalla que devuelve el valor a partir del formulario
//   alGuardar(v) opcional; se llama con el valor guardado (por ejemplo, para actualizar la barra lateral)
//   validar()    opcional; reglas propias de la pantalla. Se ejecuta antes de reportValidity()
//                y marca errores con campo.setCustomValidity("mensaje")
//
// Elementos opcionales de la página:
//   [data-accion="cancelar"]          botón Cancelar
//   [data-estado-edicion]             texto del estado (pueden ser varios)
//   [data-estado-edicion="corto"]     versión corta, para la insignia junto al título
//   [data-aviso-edicion]              aviso con título y explicación; debe contener
//                                     [data-aviso-titulo] y [data-aviso-texto]
//
// Antes de guardar se aplica la validación nativa del formulario (required, pattern, maxlength…);
// si algo no es válido, el navegador señala el campo y no se guarda.
export function controlarFormulario({ formulario, seccion, valorInicial, rellenar, leer, alGuardar, validar: validarPantalla }) {
  const botonGuardar = formulario.querySelector('[type="submit"]');
  const botonCancelar = document.querySelector('[data-accion="cancelar"]');
  const indicadores = document.querySelectorAll("[data-estado-edicion]");
  const aviso = document.querySelector("[data-aviso-edicion]");

  const TEXTOS = {
    limpio: "Guardado · Sin cambios pendientes",
    sucio: "Cambios sin guardar",
    guardando: "Guardando…",
    guardado: "Guardado en el borrador · Pendiente de publicar",
    error: "No se pudo guardar. Revisa tu conexión e intenta de nuevo."
  };

  const TEXTOS_CORTOS = {
    limpio: "Guardado",
    sucio: "Sin guardar",
    guardando: "Guardando…",
    guardado: "Guardado",
    error: "Error al guardar"
  };

  const AVISOS = {
    limpio: ["Sin cambios pendientes", "Este formulario coincide con lo guardado. Guardar no publica automáticamente."],
    sucio: ["Tienes cambios sin guardar", "Guarda para conservarlos en el borrador o cancela para descartarlos."],
    guardando: ["Guardando cambios", "Espera un momento mientras se guardan en el borrador."],
    guardado: ["Cambios guardados", "Se guardaron en el borrador. Aparecerán en la página pública cuando los publiques desde Revisar y publicar."],
    error: ["No se pudo guardar", "Revisa tu conexión e intenta de nuevo. Tus cambios siguen en el formulario."]
  };

  let original = structuredClone(valorInicial);
  let estado = "limpio";

  function fijarEstado(nuevo) {
    estado = nuevo;
    indicadores.forEach((elemento) => {
      const textos = elemento.dataset.estadoEdicion === "corto" ? TEXTOS_CORTOS : TEXTOS;
      elemento.textContent = textos[nuevo];
      elemento.dataset.estado = nuevo;
    });
    if (aviso) {
      aviso.dataset.estado = nuevo;
      aviso.querySelector("[data-aviso-titulo]").textContent = AVISOS[nuevo][0];
      aviso.querySelector("[data-aviso-texto]").textContent = AVISOS[nuevo][1];
    }
    const editable = nuevo === "sucio" || nuevo === "error";
    if (botonGuardar) botonGuardar.disabled = !editable;
    if (botonCancelar) botonCancelar.disabled = !editable;
  }

  // En secciones tipo objeto, los campos que la pantalla no edita se conservan tal como están
  const esObjeto = (v) => v && typeof v === "object" && !Array.isArray(v);
  const leerCompleto = () => {
    const valor = leer();
    return esObjeto(original) && esObjeto(valor) ? { ...original, ...valor } : valor;
  };

  const hayCambios = () => !sonIguales(leerCompleto(), original);

  // Las pantallas con listas llaman a revisar() después de agregar, quitar o mover elementos
  function revisar() {
    if (estado === "guardando") return;
    if (hayCambios()) fijarEstado("sucio");
    else if (estado !== "guardado") fijarEstado("limpio");
  }

  const validar = () => validarFormulario(formulario, validarPantalla);

  // Los <textarea> crecen con su contenido para que el texto largo se lea completo
  function ajustarAlturas() {
    formulario.querySelectorAll("textarea").forEach((area) => {
      area.style.height = "auto";
      area.style.height = `${area.scrollHeight}px`;
    });
  }
  const rellenarYAjustar = (valor) => { rellenar(valor); ajustarAlturas(); };

  formulario.addEventListener("input", (evento) => {
    evento.target.setCustomValidity?.("");
    if (evento.target.tagName === "TEXTAREA") ajustarAlturas();
  });
  window.addEventListener("resize", ajustarAlturas);
  document.fonts?.ready.then(ajustarAlturas);
  formulario.addEventListener("input", revisar);
  formulario.addEventListener("change", revisar);

  botonCancelar?.addEventListener("click", () => {
    rellenarYAjustar(structuredClone(original));
    fijarEstado("limpio");
  });

  // Guarda en el borrador. Si ya hay un guardado en curso, se repite al terminar
  // (así no se pierden cambios hechos mientras se guardaba). Devuelve true si quedó guardado.
  let otroPendiente = false;
  async function guardar() {
    if (estado === "guardando") { otroPendiente = true; return false; }
    if (!hayCambios()) return true;
    if (!validar()) return false;
    fijarEstado("guardando");
    try {
      const valor = leerCompleto();
      await guardarSeccion(seccion, valor);
      original = structuredClone(valor);
      fijarEstado("guardado");
      alGuardar?.(structuredClone(valor));
    } catch (error) {
      console.error("Error al guardar:", error);
      otroPendiente = false;
      fijarEstado("error");
      return false;
    }
    if (otroPendiente) { otroPendiente = false; return guardar(); }
    return true;
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    guardar();
  });

  window.addEventListener("beforeunload", (evento) => {
    if (estado === "sucio" || estado === "error") {
      evento.preventDefault();
      evento.returnValue = "";
    }
  });

  rellenarYAjustar(structuredClone(original));
  fijarEstado("limpio");

  // Para pantallas que guardan al instante (listas con editor): control.guardar()
  return { revisar, hayCambios, guardar };
}
