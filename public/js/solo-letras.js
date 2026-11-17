// Campos de nombre que solo aceptan letras: a-z, A-Z, ñ, vocales con acento y con diéresis, y espacios.
// Se aplica a todo <input data-solo-letras>. Los caracteres no permitidos (números, signos, etiquetas)
// se quitan al escribir o pegar, y se muestra un aviso breve debajo del campo.
// La misma regla está en el atributo pattern de cada campo y, para los comentarios, en firestore.rules.

export const LETRAS = "A-Za-zÁÉÍÓÚáéíóúÄËÏÖÜäëïöüÑñ";
const NO_PERMITIDO = new RegExp(`[^${LETRAS} ]`, "g");
const AVISO = "Solo se permiten letras (con acentos, ñ o diéresis) y espacios.";

function avisar(campo) {
  let aviso = campo.parentElement.querySelector(".aviso-letras");
  if (!aviso) {
    aviso = document.createElement("p");
    aviso.className = "aviso-letras";
    aviso.setAttribute("aria-live", "polite");
    aviso.id = `${campo.id}-aviso-letras`;
    campo.after(aviso);
    campo.setAttribute("aria-describedby", [campo.getAttribute("aria-describedby"), aviso.id].filter(Boolean).join(" "));
  }
  aviso.textContent = AVISO;
  aviso.hidden = false;
  clearTimeout(aviso._temporizador);
  aviso._temporizador = setTimeout(() => { aviso.hidden = true; aviso.textContent = ""; }, 3500);
}

function filtrar(campo) {
  const original = campo.value;
  // NFC une letra + acento combinado en un solo carácter (por ejemplo, al pegar texto de otro programa)
  const normalizado = original.normalize("NFC");
  const limpio = normalizado.replace(NO_PERMITIDO, "");
  if (limpio === original) return;
  // Conserva la posición del cursor: se descuentan los caracteres quitados antes de él
  const cursor = campo.selectionStart ?? limpio.length;
  const antes = original.slice(0, cursor).normalize("NFC").replace(NO_PERMITIDO, "").length;
  campo.value = limpio;
  try { campo.setSelectionRange(antes, antes); } catch { /* campo sin selección */ }
  if (limpio !== normalizado) avisar(campo);
}

export function soloLetras(campo) {
  if (!campo || campo.dataset.soloLetrasListo) return;
  campo.dataset.soloLetrasListo = "true";
  // Con teclas muertas o teclados de composición se espera a que termine de formarse la letra
  campo.addEventListener("input", (evento) => { if (!evento.isComposing) filtrar(campo); });
  campo.addEventListener("compositionend", () => filtrar(campo));
}

document.querySelectorAll("input[data-solo-letras]").forEach(soloLetras);
