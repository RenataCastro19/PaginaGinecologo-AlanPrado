// Formulario "Agenda tu cita": arma el mensaje y abre WhatsApp con el texto precargado.
// No depende de Firebase: si no se puede leer el contenido publicado, usa el número del HTML.
// js/landing.js envía el evento "sitio:contenido" con el número y el horario publicados.
// Los datos del formulario NO se guardan en ningún lado (incluyen el motivo de consulta, dato de salud).

const $ = (selector) => document.querySelector(selector);
const soloDigitos = (v) => String(v || "").replace(/\D/g, "");

const formulario = $(".booking-form");
let numeroWhatsApp = soloDigitos(formulario?.getAttribute("action")) || "522299010537";
let diasAtencion = null;

document.addEventListener("sitio:contenido", (evento) => {
  const { contacto = {}, horarios = {} } = evento.detail || {};
  if (soloDigitos(contacto.whatsapp)) numeroWhatsApp = soloDigitos(contacto.prefijo) + soloDigitos(contacto.whatsapp);
  if (Array.isArray(horarios.dias)) diasAtencion = horarios.dias;
});

// =====================================================================

const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function prepararFormulario() {
  if (!formulario) return;
  const fecha = $("#fecha"), hora = $("#hora"), motivo = $("#motivo"), otro = $("#otro");

  // No se pueden elegir días pasados
  const hoy = new Date();
  fecha.min = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  // "Describe tu motivo" solo es obligatorio si se elige "Otro"
  const revisarOtro = () => { otro.required = motivo.value === "Otro"; };
  motivo.addEventListener("change", revisarOtro);
  revisarOtro();

  // El día y la hora deben caer en el horario publicado (si está definido)
  function validarHorario() {
    fecha.setCustomValidity(""); hora.setCustomValidity("");
    if (!diasAtencion || !fecha.value) return;
    const dia = NOMBRES_DIA[new Date(`${fecha.value}T12:00:00`).getDay()];
    const datos = diasAtencion.find((d) => d.dia === dia);
    if (!datos) return;
    if (!datos.disponible) {
      const plural = /s$/.test(dia) ? dia : `${dia}s`; // "los lunes", "los sábados", "los domingos"
      fecha.setCustomValidity(`No hay consulta los ${plural.toLowerCase()}. Elige otro día.`);
      return;
    }
    if (datos.inicio && datos.fin && hora.value && (hora.value < datos.inicio || hora.value > datos.fin)) {
      hora.setCustomValidity(`El ${dia.toLowerCase()} la atención es de ${datos.inicio} a ${datos.fin}.`);
    }
  }
  fecha.addEventListener("input", validarHorario);
  hora.addEventListener("input", validarHorario);

  // Botones "Agendar este paquete": preseleccionan el paquete como motivo
  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-motivo]");
    if (!boton) return;
    const opcion = [...motivo.options].find((o) => o.value === boton.dataset.motivo);
    if (opcion) { motivo.value = opcion.value; revisarOtro(); }
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    validarHorario();
    if (!formulario.reportValidity()) return;

    const fechaTexto = new Date(`${fecha.value}T12:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const lineas = [
      "Hola, me gustaría agendar una cita.",
      "",
      `Nombre: ${$("#nombre").value.trim()}`,
      `Día preferido: ${fechaTexto}`,
      `Hora preferida: ${hora.value}`,
      `Motivo: ${motivo.value}`
    ];
    if (motivo.value === "Otro" && otro.value.trim()) lineas.push(`Detalle: ${otro.value.trim()}`);
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(lineas.join("\n"))}`;

    // Si el navegador bloquea la ventana nueva, se abre en la misma pestaña
    // (con la opción "noopener", window.open siempre devuelve null; por eso se corta opener a mano)
    const ventana = window.open(url, "_blank");
    if (ventana) ventana.opener = null;
    else window.location.href = url;
  });
}


prepararFormulario();
