// Formulario "Agenda tu cita": arma el mensaje y abre WhatsApp con el texto precargado.
// No depende de Firebase: si no se puede leer el contenido publicado, usa el número del HTML.
// js/landing.js envía el evento "sitio:contenido" con el número y el horario publicados.
// Los datos del formulario NO se guardan en ningún lado (incluyen el motivo de consulta, dato de salud).
//
// "Hora preferida" ofrece consultas de una hora dentro del horario publicado para el día elegido.
// Son horarios posibles, no disponibilidad real: el consultorio confirma la cita por WhatsApp.

const $ = (selector) => document.querySelector(selector);
const soloDigitos = (v) => String(v || "").replace(/\D/g, "");

const DURACION_CONSULTA = 60; // minutos
const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const formulario = $(".booking-form");
let numeroWhatsApp = soloDigitos(formulario?.getAttribute("action")) || "522299010537";
let diasAtencion = null;
let actualizarHoras = () => {};

document.addEventListener("sitio:contenido", (evento) => {
  const { contacto = {}, horarios = {} } = evento.detail || {};
  if (soloDigitos(contacto.whatsapp)) numeroWhatsApp = soloDigitos(contacto.prefijo) + soloDigitos(contacto.whatsapp);
  if (Array.isArray(horarios.dias)) diasAtencion = horarios.dias;
  actualizarHoras(); // por si ya se había elegido un día antes de que llegara el horario
});

// "09:30" → 570 minutos, y de regreso
const aMinutos = (hora) => { const [h, m] = String(hora).split(":").map(Number); return h * 60 + (m || 0); };
const aHora = (minutos) => `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
const legible = (hora) => hora.replace(/^0/, ""); // "09:00" → "9:00"

// Horarios de consulta para una fecha (AAAA-MM-DD):
//   { estado: "sin-datos" }        no se pudo leer el horario publicado
//   { estado: "sin-consulta", dia } ese día no hay atención
//   { estado: "a-confirmar" }       hay atención, pero sin horas definidas
//   { estado: "ok", horas: [{ inicio, fin }] }
function horariosDelDia(fechaTexto) {
  if (!diasAtencion) return { estado: "sin-datos" };
  const fecha = new Date(`${fechaTexto}T12:00:00`);
  const dia = NOMBRES_DIA[fecha.getDay()];
  const datos = diasAtencion.find((d) => d.dia === dia);
  if (!datos) return { estado: "sin-datos" };
  if (!datos.disponible) return { estado: "sin-consulta", dia };
  if (!datos.inicio || !datos.fin || aMinutos(datos.fin) <= aMinutos(datos.inicio)) return { estado: "a-confirmar" };

  const inicio = aMinutos(datos.inicio), fin = aMinutos(datos.fin);
  const horas = [];
  for (let m = inicio; m + DURACION_CONSULTA <= fin; m += DURACION_CONSULTA) {
    horas.push({ inicio: aHora(m), fin: aHora(m + DURACION_CONSULTA) });
  }
  if (!horas.length) horas.push({ inicio: datos.inicio, fin: datos.fin }); // horario menor a una hora

  // Si es hoy, solo las horas que aún no empiezan
  const ahora = new Date();
  const esHoy = fecha.toDateString() === ahora.toDateString();
  const vigentes = esHoy ? horas.filter((h) => aMinutos(h.inicio) > ahora.getHours() * 60 + ahora.getMinutes()) : horas;
  return { estado: "ok", horas: vigentes, esHoy };
}

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

  function opcion(valor, texto) {
    const o = document.createElement("option");
    o.value = valor;
    o.textContent = texto;
    return o;
  }

  // Llena "Hora preferida" según el día elegido
  actualizarHoras = (avisar = false) => {
    const anterior = hora.value;
    fecha.setCustomValidity("");
    hora.disabled = true;

    if (!fecha.value) {
      hora.replaceChildren(opcion("", "Primero elige el día"));
      return;
    }
    const resultado = horariosDelDia(fecha.value);

    if (resultado.estado === "sin-consulta") {
      const plural = /s$/.test(resultado.dia) ? resultado.dia : `${resultado.dia}s`; // "los lunes", "los domingos"
      fecha.setCustomValidity(`No hay consulta los ${plural.toLowerCase()}. Elige otro día.`);
      hora.replaceChildren(opcion("", "Sin consulta este día"));
      if (avisar) fecha.reportValidity();
      return;
    }
    if (resultado.estado === "ok" && !resultado.horas.length) {
      fecha.setCustomValidity("Ya no hay horarios disponibles hoy. Elige otro día.");
      hora.replaceChildren(opcion("", "Sin horarios para hoy"));
      if (avisar) fecha.reportValidity();
      return;
    }
    if (resultado.estado !== "ok") {
      // Sin horas publicadas (o sin conexión): el consultorio propone la hora
      hora.replaceChildren(opcion("A confirmar", "Horario a confirmar con el consultorio"));
      hora.disabled = false;
      return;
    }

    hora.replaceChildren(
      opcion("", "Selecciona un horario"),
      ...resultado.horas.map((h) => opcion(h.inicio, `${legible(h.inicio)} a ${legible(h.fin)}`))
    );
    hora.disabled = false;
    if ([...hora.options].some((o) => o.value === anterior && anterior)) hora.value = anterior;
  };
  fecha.addEventListener("change", () => actualizarHoras(true));
  actualizarHoras();

  // Botones "Agendar este paquete": preseleccionan el paquete como motivo
  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-motivo]");
    if (!boton) return;
    const o = [...motivo.options].find((x) => x.value === boton.dataset.motivo);
    if (o) { motivo.value = o.value; revisarOtro(); }
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    actualizarHoras(); // por si la página quedó abierta y cambió la hora del día
    if (!formulario.reportValidity()) return;

    const fechaTexto = new Date(`${fecha.value}T12:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const lineas = [
      "Hola, me gustaría agendar una cita.",
      "",
      `Nombre: ${$("#nombre").value.trim()}`,
      `Día preferido: ${fechaTexto}`,
      `Hora preferida: ${hora.selectedOptions[0]?.textContent || hora.value}`,
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
