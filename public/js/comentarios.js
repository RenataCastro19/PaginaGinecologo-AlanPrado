// Formulario "¿Fuiste paciente del doctor?": guarda el comentario en Firestore como pendiente.
// Nada se publica desde aquí: el doctor lo aprueba en el panel (Testimonios) y después lo publica.
// Las reglas de firestore.rules solo permiten crear comentarios con este formato exacto; el público no puede leerlos.
// El SDK de Firebase se carga al enviar, para que el formulario funcione aunque Firebase no responda.

const ESPERA_ENTRE_ENVIOS = 10 * 60 * 1000;   // 10 minutos entre envíos desde el mismo navegador
const CLAVE_ULTIMO_ENVIO = "opinion:ultimoEnvio";

const $ = (id) => document.getElementById(id);
const formulario = $("formOpinion");
const abrir = $("abrirOpinion");
const estado = $("estadoOpinion");
const enviar = $("enviarOpinion");
const comentario = $("opinionComentario");
const contador = $("opinionContador");
const campos = { nombre: $("opinionNombre"), apellido: $("opinionApellido") };

// Une letra y acento en un solo carácter (NFC), une espacios repetidos y quita los de los extremos
const limpiar = (texto) => texto.normalize("NFC").replace(/\s+/g, " ").trim();

function mostrarEstado(mensaje, tipo) {
  estado.textContent = mensaje;
  estado.className = `opinion__estado opinion__estado--${tipo}`;
  estado.hidden = false;
}

function leerUltimoEnvio() {
  try { return Number(localStorage.getItem(CLAVE_ULTIMO_ENVIO)) || 0; } catch { return 0; }
}
function guardarUltimoEnvio() {
  try { localStorage.setItem(CLAVE_ULTIMO_ENVIO, String(Date.now())); } catch { /* sin almacenamiento local: se omite el límite */ }
}

function alternarFormulario() {
  const abierto = formulario.hidden;
  formulario.hidden = !abierto;
  abrir.setAttribute("aria-expanded", String(abierto));
  abrir.textContent = abierto ? "Ocultar formulario" : "Escribir mi opinión";
  if (abierto) { estado.hidden = true; campos.nombre.focus(); }
}

function actualizarContador() {
  contador.textContent = `${comentario.value.length} de 500 caracteres`;
}

// Reglas que el navegador no revisa solo: textos con únicamente espacios y mínimo de caracteres reales
function validar() {
  for (const campo of Object.values(campos)) {
    campo.setCustomValidity(campo.value.trim() && limpiar(campo.value).length < 2 ? "Escribe al menos 2 letras." : "");
  }
  const largo = limpiar(comentario.value).length;
  comentario.setCustomValidity(comentario.value.trim() && largo < 10 ? "Escribe al menos 10 caracteres." : "");
  return formulario.reportValidity();
}

async function enviarComentario(evento) {
  evento.preventDefault();
  if (!validar()) return;

  // Campo trampa lleno: es un programa automático. Se simula el éxito sin enviar nada.
  if ($("opinionSitio").value) { terminar(); return; }

  if (Date.now() - leerUltimoEnvio() < ESPERA_ENTRE_ENVIOS) {
    mostrarEstado("Ya enviaste un comentario hace unos minutos. Gracias; si quieres enviar otro, intenta más tarde.", "error");
    return;
  }

  const datos = {
    nombre: limpiar(campos.nombre.value),
    apellido: limpiar(campos.apellido.value),
    valoracion: Number(formulario.elements.valoracion.value),
    comentario: limpiar(comentario.value),
    autorizaPublicacion: true,
    estado: "pendiente"
  };

  enviar.disabled = true;
  enviar.textContent = "Enviando…";
  estado.hidden = true;
  // Sin conexión, Firestore espera a recuperarla; se avisa si tarda, sin cancelar el envío
  const aviso = setTimeout(() => mostrarEstado("El envío está tardando más de lo normal. Revisa tu conexión y no cierres la página.", "info"), 12000);

  try {
    const { db, collection, addDoc, serverTimestamp } = await import("./firebase-config.js");
    await addDoc(collection(db, "comentarios"), { ...datos, creadoEn: serverTimestamp() });
    clearTimeout(aviso);
    guardarUltimoEnvio();
    terminar(datos.nombre);
  } catch (error) {
    clearTimeout(aviso);
    console.error("No se pudo enviar el comentario:", error);
    mostrarEstado(error?.code === "permission-denied"
      ? "No pudimos enviar tu comentario. Revisa que los datos estén completos e intenta de nuevo."
      : "No pudimos enviar tu comentario. Revisa tu conexión a internet e intenta de nuevo.", "error");
  } finally {
    enviar.disabled = false;
    enviar.textContent = "Enviar comentario";
  }
}

// Limpia y cierra el formulario, y agradece
function terminar(nombre) {
  formulario.reset();
  actualizarContador();
  formulario.hidden = true;
  abrir.setAttribute("aria-expanded", "false");
  abrir.textContent = "Escribir mi opinión";
  mostrarEstado(`Gracias${nombre ? `, ${nombre}` : ""}. Recibimos tu comentario; se publicará cuando el doctor lo revise.`, "exito");
  estado.focus();
}

if (formulario && abrir) {
  abrir.addEventListener("click", alternarFormulario);
  comentario.addEventListener("input", () => { actualizarContador(); comentario.setCustomValidity(""); });
  Object.values(campos).forEach((campo) => campo.addEventListener("input", () => campo.setCustomValidity("")));
  formulario.addEventListener("submit", enviarComentario);
  actualizarContador();
}
