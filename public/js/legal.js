// Páginas legales (privacidad.html, terminos.html): completa nombre y datos de contacto con lo publicado,
// para que el aviso no quede desactualizado si el doctor cambia sus datos desde el panel.
// Si no se puede leer Firestore, se conserva el texto escrito en el HTML.
import { db, doc, getDoc } from "./firebase-config.js";

const texto = (v) => (typeof v === "string" ? v.trim() : "");
const soloDigitos = (v) => String(v || "").replace(/\D/g, "");
const poner = (dato, valor) => document.querySelectorAll(`[data-dato="${dato}"]`).forEach((el) => { el.textContent = valor; });

try {
  const documento = await getDoc(doc(db, "sitio", "publicado"));
  if (documento.exists()) {
    const { perfil = {}, contacto = {} } = documento.data();

    if (texto(perfil.nombreCompleto)) poner("nombre", perfil.nombreCompleto);
    if (texto(perfil.especialidad)) poner("especialidad", perfil.especialidad);
    if (texto(contacto.ciudad)) {
      poner("ciudad", contacto.ciudad);
      const direccion = contacto.direccionVisible && texto(contacto.direccion) ? `${contacto.direccion}, ` : "";
      poner("domicilio", `${direccion}${contacto.ciudad}, México`);
    }

    // Medios para ejercer derechos ARCO: correo (si es público) y WhatsApp
    const correo = texto(contacto.correo);
    const filaCorreo = document.querySelector('[data-dato-fila="correo"]');
    // El correo solo se muestra si el doctor lo marcó como visible (en el HTML de respaldo está oculto)
    if (filaCorreo && contacto.correoVisible && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      document.querySelectorAll('[data-dato="correo"]').forEach((a) => { a.textContent = correo; a.href = `mailto:${correo}`; });
      filaCorreo.hidden = false;
    }
    if (soloDigitos(contacto.whatsapp)) {
      const numero = soloDigitos(contacto.prefijo) + soloDigitos(contacto.whatsapp);
      document.querySelectorAll('[data-dato="whatsapp"]').forEach((a) => { a.textContent = contacto.whatsapp; a.href = `https://wa.me/${numero}`; });
    }
  }
} catch (error) {
  console.error("No se pudieron leer los datos publicados; se muestra el texto base.", error);
}
