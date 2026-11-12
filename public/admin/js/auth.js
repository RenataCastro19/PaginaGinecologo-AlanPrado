// Control de sesión del panel de administración.
// Toda página del panel (excepto login.html) debe llamar a protegerPagina() al cargar.
import { auth, db, onAuthStateChanged, signOut, doc, getDoc } from "../../js/firebase-config.js";

export const PAGINA_LOGIN = "login.html";
export const PAGINA_INICIO = "index.html";

// Devuelve los datos del administrador (nombre, correo, rol) o null si el UID no está registrado
export async function obtenerAdministrador(uid) {
  const documento = await getDoc(doc(db, "administradores", uid));
  return documento.exists() ? documento.data() : null;
}

// Indica si el cierre de sesión lo pidió el usuario desde esta pestaña
let cierreVoluntario = false;

function irAlLogin(motivo) {
  const destino = motivo ? `${PAGINA_LOGIN}?motivo=${motivo}` : PAGINA_LOGIN;
  window.location.replace(destino);
}

// Verifica que haya una sesión activa de un administrador.
// - Si no hay sesión, envía al login.
// - Si la cuenta no está en administradores, cierra la sesión y envía al login.
// - Si todo es correcto, devuelve { usuario, administrador } y muestra la página
//   (con { mostrar: false } la página sigue oculta, para que quien llama la muestre al terminar de dibujarla).
// El observador queda activo: si la sesión se cierra en otra pestaña, esta página también vuelve al login.
export function protegerPagina({ mostrar = true } = {}) {
  return new Promise((resolver) => {
    let verificada = false;

    onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        if (cierreVoluntario) irAlLogin("salida");
        else irAlLogin(verificada ? "sesion-cerrada" : null);
        return;
      }
      if (verificada) return;

      try {
        const administrador = await obtenerAdministrador(usuario.uid);
        if (!administrador) {
          await signOut(auth);
          irAlLogin("sin-acceso");
          return;
        }
        verificada = true;
        if (mostrar) document.body.classList.remove("verificando");
        resolver({ usuario, administrador });
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        irAlLogin("error");
      }
    });
  });
}

// Cierra la sesión del usuario. El observador de protegerPagina() detecta el cambio
// y envía al login con el aviso de salida. Devuelve false si no se pudo cerrar.
export async function cerrarSesion() {
  cierreVoluntario = true;
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    cierreVoluntario = false;
    console.error("Error al cerrar la sesión:", error);
    alert("No fue posible cerrar la sesión. Revisa tu conexión e intenta de nuevo.");
    return false;
  }
}
