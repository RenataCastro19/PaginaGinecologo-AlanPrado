// Comentarios que envían las pacientes desde la página pública (colección "comentarios").
// Siempre llegan como pendientes y el público no puede leerlos (ver firestore.rules).
//   Aprobar  = agregar el testimonio al borrador y borrar el comentario, en un solo lote (las dos cosas o ninguna).
//   Rechazar = borrar el comentario.
// Nada de esto publica: el testimonio aparece en la página cuando se publica desde Revisar y publicar.
import { auth, db, doc, collection, getDocs, query, orderBy, deleteDoc, writeBatch, serverTimestamp } from "../../js/firebase-config.js";
import { nuevoId } from "./listas.js";

// Comentarios pendientes, del más antiguo al más reciente
export async function leerComentarios() {
  const resultado = await getDocs(query(collection(db, "comentarios"), orderBy("creadoEn", "asc")));
  return resultado.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Fecha de envío en formato corto: "17/11/2026"
export function fechaEnvio(comentario) {
  const fecha = comentario.creadoEn?.toDate?.();
  return fecha ? fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
}

export const nombreCompleto = (comentario) => `${comentario.nombre || ""} ${comentario.apellido || ""}`.trim();

// Convierte un comentario en testimonio con el esquema de sitio/borrador.
// Queda activo y con el consentimiento registrado (la paciente marcó la autorización en el formulario).
export function aTestimonio(comentario, orden) {
  const autora = nombreCompleto(comentario);
  const fecha = fechaEnvio(comentario);
  return {
    id: nuevoId(autora),
    autora,
    edad: null,
    valoracion: Number(comentario.valoracion) || 5,
    comentario: comentario.comentario,
    visible: true,
    orden,
    consentimiento: true,
    referenciaConsentimiento: `Autorizó la publicación en el formulario del sitio${fecha ? ` el ${fecha}` : ""}.`
  };
}

// testimonios = lista completa de testimonios del borrador, ya con el nuevo incluido
export async function aprobarComentario(comentarioId, testimonios) {
  const lote = writeBatch(db);
  lote.update(doc(db, "sitio", "borrador"), {
    testimonios,
    "metadatos.actualizadoEn": serverTimestamp(),
    "metadatos.actualizadoPor": auth.currentUser.uid
  });
  lote.delete(doc(db, "comentarios", comentarioId));
  await lote.commit();
}

export function rechazarComentario(comentarioId) {
  return deleteDoc(doc(db, "comentarios", comentarioId));
}
