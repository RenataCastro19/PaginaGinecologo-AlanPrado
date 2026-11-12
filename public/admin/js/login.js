// Lógica de la pantalla de inicio de sesión del panel.
import {
  auth,
  signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail
} from "../../js/firebase-config.js";
import { obtenerAdministrador, PAGINA_INICIO } from "./auth.js";

const formulario = document.getElementById("formAcceso");
const campoCorreo = document.getElementById("correo");
const campoContrasena = document.getElementById("contrasena");
const botonIngresar = document.getElementById("btnIngresar");
const botonMostrar = document.getElementById("btnMostrar");
const avisoError = document.getElementById("avisoError");
const avisoInfo = document.getElementById("avisoInfo");

const formRecuperar = document.getElementById("formRecuperar");
const campoCorreoRecuperar = document.getElementById("correoRecuperar");
const botonEnviarEnlace = document.getElementById("btnEnviarEnlace");
const avisoRecuperar = document.getElementById("avisoRecuperar");

// Los correos de Firebase (como el de recuperación) se envían en español
auth.languageCode = "es";

const MENSAJES_ERROR = {
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Escriba un correo electrónico válido.",
  "auth/missing-password": "Escriba su contraseña.",
  "auth/user-disabled": "Esta cuenta está desactivada. Comuníquese con el administrador del sitio.",
  "auth/too-many-requests": "Se bloquearon temporalmente los intentos por seguridad. Espere unos minutos e intente de nuevo.",
  "auth/network-request-failed": "No hay conexión a internet. Verifique su red e intente de nuevo.",
  "sin-acceso": "Esta cuenta no tiene acceso al panel de administración.",
  "error": "No fue posible verificar la sesión. Inicie sesión de nuevo."
};

// Mensajes que llegan desde otras páginas del panel (login.html?motivo=...)
const MENSAJES_MOTIVO = {
  "sesion-cerrada": "Su sesión se cerró. Inicie sesión de nuevo para continuar.",
  "salida": "Cerró sesión correctamente."
};

function mostrarError(codigo) {
  avisoError.textContent = MENSAJES_ERROR[codigo] || "No fue posible iniciar sesión. Intente de nuevo.";
  avisoError.hidden = false;
}

function ocultarAvisos() {
  avisoError.hidden = true;
  avisoInfo.hidden = true;
}

function estadoCargando(cargando) {
  botonIngresar.disabled = cargando;
  botonIngresar.textContent = cargando ? "Ingresando…" : "Iniciar sesión";
}

function mostrarMotivoRecibido() {
  const motivo = new URLSearchParams(window.location.search).get("motivo");
  if (!motivo) return;
  if (MENSAJES_ERROR[motivo]) mostrarError(motivo);
  else if (MENSAJES_MOTIVO[motivo]) { avisoInfo.textContent = MENSAJES_MOTIVO[motivo]; avisoInfo.hidden = false; }
  history.replaceState(null, "", window.location.pathname);
}

// Al abrir la página: si ya hay sesión de administrador, va directo al panel;
// si no, muestra el formulario.
const detenerObservador = onAuthStateChanged(auth, async (usuario) => {
  detenerObservador();
  try {
    if (usuario && await obtenerAdministrador(usuario.uid)) {
      window.location.replace(PAGINA_INICIO);
      return;
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
  }
  mostrarMotivoRecibido();
  document.body.classList.remove("verificando");
  campoCorreo.focus();
});

botonMostrar.addEventListener("click", () => {
  const visible = campoContrasena.type === "text";
  campoContrasena.type = visible ? "password" : "text";
  botonMostrar.textContent = visible ? "Mostrar" : "Ocultar";
  botonMostrar.setAttribute("aria-pressed", String(!visible));
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultarAvisos();

  const correo = campoCorreo.value.trim();
  const contrasena = campoContrasena.value;

  if (!correo) { mostrarError("auth/invalid-email"); campoCorreo.focus(); return; }
  if (!contrasena) { mostrarError("auth/missing-password"); campoContrasena.focus(); return; }

  estadoCargando(true);
  try {
    const credencial = await signInWithEmailAndPassword(auth, correo, contrasena);

    if (!(await obtenerAdministrador(credencial.user.uid))) {
      await signOut(auth);
      mostrarError("sin-acceso");
      estadoCargando(false);
      return;
    }

    window.location.replace(PAGINA_INICIO);
  } catch (error) {
    mostrarError(error.code);
    estadoCargando(false);
  }
});

// ---------- Recuperación de contraseña ----------

function mostrarFormulario(cual) {
  const recuperar = cual === "recuperar";
  formulario.hidden = recuperar;
  formRecuperar.hidden = !recuperar;
  ocultarAvisos();
  avisoRecuperar.hidden = true;
  if (recuperar) {
    campoCorreoRecuperar.value = campoCorreo.value.trim();
    campoCorreoRecuperar.focus();
  } else {
    campoCorreo.focus();
  }
}

function avisoDeRecuperacion(tipo, texto) {
  avisoRecuperar.className = `aviso aviso--${tipo}`;
  avisoRecuperar.textContent = texto;
  avisoRecuperar.hidden = false;
}

document.getElementById("btnOlvido").addEventListener("click", () => mostrarFormulario("recuperar"));
document.getElementById("btnVolver").addEventListener("click", () => mostrarFormulario("acceso"));

formRecuperar.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const correo = campoCorreoRecuperar.value.trim();

  if (!correo) {
    avisoDeRecuperacion("error", MENSAJES_ERROR["auth/invalid-email"]);
    campoCorreoRecuperar.focus();
    return;
  }

  botonEnviarEnlace.disabled = true;
  botonEnviarEnlace.textContent = "Enviando…";
  try {
    await sendPasswordResetEmail(auth, correo);
    // Por seguridad, el mensaje es el mismo exista o no la cuenta
    avisoDeRecuperacion("exito", "Si el correo está registrado, recibirá un enlace para crear una nueva contraseña. Revise también la carpeta de correo no deseado.");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      avisoDeRecuperacion("exito", "Si el correo está registrado, recibirá un enlace para crear una nueva contraseña. Revise también la carpeta de correo no deseado.");
    } else {
      avisoDeRecuperacion("error", MENSAJES_ERROR[error.code] || "No fue posible enviar el enlace. Intente de nuevo.");
    }
  } finally {
    botonEnviarEnlace.disabled = false;
    botonEnviarEnlace.textContent = "Enviar enlace";
  }
});
