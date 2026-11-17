# Sitio web y panel del Dr. Alan Prado

Sitio del Dr. Alan Guillermo Prado Villalobos, ginecólogo y obstetra en Veracruz, Ver. Las pacientes conocen sus servicios y paquetes y solicitan una cita por WhatsApp. El doctor administra todo el contenido desde un panel propio, sin tocar código.

**Sitio en producción:** <https://dr-alan-prado.web.app>  ·  **Panel:** <https://dr-alan-prado.web.app/admin/>

Proyecto de la materia **Ingeniería de Software Avanzada**, Universidad Veracruzana. Docente: Dra. Primavera Argüelles Lucho.

## Funcionalidades

### Sitio público

| Sección | Qué hace |
|---|---|
| Inicio, Servicios, Paquetes, Sobre mí, Testimonios, Contacto | Muestran el contenido **publicado** desde el panel. Si Firestore no responde, se ve el contenido base escrito en el HTML. |
| Agenda tu cita | Abre WhatsApp con un mensaje ya armado: nombre, día, horario y motivo. La hora se elige de una lista de consultas de 60 minutos dentro del horario publicado del día. No permite días sin consulta ni fechas pasadas, y pide consentimiento para el uso de datos. **El sitio no guarda los datos del formulario.** |
| Aviso de privacidad y términos de uso | `privacidad.html` (LFPDPPP, 2025) y `terminos.html`, enlazados desde el pie |
| Modo mantenimiento | Si el doctor oculta el sitio desde el panel, se muestra un aviso con un botón de WhatsApp |

### Panel del doctor (`/admin/`)

| Pantalla | Qué edita |
|---|---|
| Dashboard | Estado de publicación, conteos, pendientes por completar y vista previa |
| Mi perfil | Nombre, especialidad y cédula profesional |
| Información profesional | Textos del inicio, biografía, filosofía, subespecialidad y certificación |
| Servicios / Especialidades | Servicios (ícono, orden, visibilidad) y paquetes con precios |
| Experiencia y formación | Credenciales que aparecen en Sobre mí |
| Información de contacto | Teléfono, WhatsApp, ubicación, correo, mapa y redes, cada uno con su interruptor de visibilidad |
| Horarios de atención | Disponibilidad por día y texto público del horario |
| Galería / Imágenes | Subida a Cloudinary y asignación de la foto de inicio y de Sobre mí |
| Testimonios | Testimonios, valoración, visibilidad y registro de consentimiento |
| Configuración | Visibilidad del sitio, título y descripción para buscadores, nota interna |
| Revisar y publicar | Compara el borrador con lo publicado, campo por campo, y publica |

**Flujo de trabajo:** el doctor edita → **guarda** (se escribe en `sitio/borrador`; la página pública no cambia) → **revisa y publica** (se copia a `sitio/publicado` y se guarda una copia en `historial`).

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript sin frameworks ni herramientas de compilación |
| SDK | Firebase JS SDK 12.19.0 por CDN, como módulos ES |
| Autenticación | Firebase Authentication (correo y contraseña; sin registro público) |
| Base de datos | Cloud Firestore (región `northamerica-south1`) |
| Imágenes | Cloudinary (subida sin firma mediante preset) |
| Despliegue | Firebase Hosting (proyecto `dr-alan-prado`) |
| Diseño | Figma; tipografías Playfair Display e Inter |

## Estructura del repositorio

```
├── public/                          Carpeta que se publica en Firebase Hosting
│   ├── index.html                   Sitio público (su HTML es el respaldo si Firestore no responde)
│   ├── privacidad.html              Aviso de privacidad
│   ├── terminos.html                Términos de uso
│   ├── 404.html
│   ├── css/                         base, inicio, servicios, paquetes, sobre-mi, agendar, legal
│   ├── js/
│   │   ├── firebase-config.js       ÚNICO archivo que importa el SDK de Firebase; datos de Cloudinary
│   │   ├── landing.js               Lee sitio/publicado y rellena cada sección
│   │   ├── agendar.js               Formulario de cita → WhatsApp (no depende de Firebase)
│   │   ├── legal.js                 Datos de contacto en las páginas legales
│   │   └── main.js                  Menú móvil
│   ├── assets/img/                  Logo y fotografías originales
│   └── admin/                       Panel del doctor
│       ├── login.html, index.html (Dashboard) y una página por sección
│       ├── publicar.html            Revisar y publicar
│       ├── img/                     Íconos del diseño
│       ├── css/admin.css
│       └── js/
│           ├── auth.js              Sesión y protección de páginas
│           ├── login.js             Inicio de sesión y recuperación de contraseña
│           ├── layout.js            Barra lateral, encabezado y menú móvil comunes
│           ├── borrador.js          Lectura, guardado, validación, comparación y publicación
│           ├── listas.js            Editores, orden y confirmación de eliminación
│           └── datos-iniciales.js   Contenido original y esquema de referencia
├── docs/                            Documentación técnica y plantilla de página del panel
├── firebase.json                    Hosting (encabezados de seguridad y caché) y Firestore
├── firestore.rules                  Reglas de seguridad
└── README.md
```

## Datos en Firestore

| Ruta | Contenido | Acceso |
|---|---|---|
| `sitio/publicado` | Contenido que lee el sitio público | Lectura pública; escritura solo administradores; no se puede borrar |
| `sitio/borrador` | Contenido en edición | Solo administradores; no se puede borrar |
| `historial/{id}` | Copia de cada publicación (fecha, autor, secciones y contenido) | Administradores leen y crean; nadie modifica ni borra |
| `administradores/{uid}` | `nombre`, `correo`, `rol` de cada cuenta con acceso al panel | Cada usuario lee solo el suyo; se administra únicamente desde la consola |

**Dar acceso al panel:** crear el usuario en *Authentication* y, en *Firestore*, un documento en `administradores` cuyo **ID sea exactamente el UID** de ese usuario, con los campos `nombre`, `correo` y `rol`. El rol es informativo; el acceso depende solo de que exista el documento.

## Requisitos

- [Node.js](https://nodejs.org) (versión LTS) y Firebase CLI: `npm install -g firebase-tools`
- Ser miembro del proyecto `dr-alan-prado` en la consola de Firebase

## Ejecución local

> Los scripts son módulos (`type="module"`): **no funcionan abriendo el HTML con doble clic** (`file://`). Siempre se debe usar un servidor local.

```bash
firebase login
firebase serve --only hosting
```

| Página | Dirección |
|---|---|
| Sitio público | <http://localhost:5000/> |
| Panel del doctor | <http://localhost:5000/admin/> |

El entorno local usa los **datos reales** de Firestore. Lo que se publique desde el panel en local aparece en el sitio en producción.

## Despliegue

```bash
firebase use                               # debe indicar dr-alan-prado
firebase deploy --only hosting             # sitio y panel
firebase deploy --only firestore:rules     # solo cuando cambien las reglas
```

| Necesidad | Cómo |
|---|---|
| Probar antes de publicar | `firebase hosting:channel:deploy prueba --expires 2d` genera una URL temporal sin tocar producción |
| Revertir un despliegue | Consola de Firebase → Hosting → historial de versiones → *Rollback* |
| Probar las reglas sin tocar producción | `firebase emulators:exec --only firestore --project demo-dr-alan "<script de pruebas>"` (un proyecto `demo-` nunca se conecta a la nube) |

## Seguridad

- Los valores de `firebaseConfig` son identificadores públicos; la protección de los datos depende de `firestore.rules`.
- **Nunca** subir al repositorio contraseñas ni el *API Secret* de Cloudinary.
- Todo texto que viene de Firestore se inserta como texto (`textContent`) o escapado; las URL de redes y mapa se validan (`https://` y dominio) antes de usarse como enlace.
- Hosting envía encabezados de seguridad: protección contra incrustación en otros sitios, `nosniff`, política de *referrer* y de permisos, y `noindex` en el panel.
- Pruebas realizadas: 29 casos de reglas en el emulador (todos correctos), acceso sin sesión a las 11 pantallas del panel y auditoría de accesibilidad WCAG 2 A/AA del panel sin hallazgos.

## Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable, desplegada en producción |
| `panel-doctor` | Rama donde se desarrolló el panel (ya unida a `main`) |

## Estado

| Fase | Estado |
|---|---|
| 1. Servicios en la nube (Firebase, Cloudinary) | Completa |
| 2. Reestructura del repositorio | Completa |
| 3. Modelo de datos, reglas y contenido inicial | Completa |
| 4. Inicio de sesión, protección de páginas y recuperación de contraseña | Completa |
| 5. Pantallas del panel | Completa |
| 6. Sitio público dinámico y envío a WhatsApp | Completa |
| 7. Pruebas, aviso de privacidad y términos | Completa |
| 8. Despliegue en producción | Completa |
| 9. Entrega al cliente | Pendiente |

### Pendiente (Fase 9)

- Manual de uso para el doctor y actualización de la documentación técnica.
- Revisión del aviso de privacidad por el doctor y captura de su domicilio completo.
- Que el doctor defina su propia contraseña ("¿Olvidó su contraseña?" en el inicio de sesión).
- Transferir la propiedad del proyecto de Firebase y de la cuenta de Cloudinary al doctor, y después retirar las cuentas del equipo.
- Ajustar el contraste de algunos colores del sitio público (sugerencia de accesibilidad).

## Documentación

- [Documentación técnica](docs/Documentacion-Tecnica.docx)
- [Documentación de la Fase 1: Firebase y Cloudinary](docs/Documentacion-Fase1-Firebase-Cloudinary.docx)
- [Plantilla para crear una página del panel](docs/plantilla-pagina-panel.html)

## Equipo

| Integrante | Rol |
|---|---|
| Juan Pablo Salas González | Scrum Master |
| Renata Carolina Castro Olmos | Desarrolladora Frontend |
| Othon Lozano Vidal | Desarrollador Backend |
| Olimpia de los Angeles Moctezuma Juan | Desarrolladora Backend, Product Owner |

## Repositorio

<https://github.com/RenataCastro19/PaginaGinecologo-AlanPrado>
