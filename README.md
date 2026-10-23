# Landing Page para Ginecólogo Dr. Alan Prado

Landing page del Dr. Alan Guillermo Prado Villalobos (Ginecología y Obstetricia, Veracruz, Ver.). Permite a potenciales pacientes conocer sus servicios y paquetes, y solicitar una cita enviando un mensaje por WhatsApp. Incluye un panel de administración para que el doctor modifique la información publicada en el sitio.

Proyecto de la materia **Ingeniería de Software Avanzada** — Universidad Veracruzana. Docente: Dra. Primavera Argüelles Lucho.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3 y JavaScript sin frameworks ni herramientas de build |
| Tipografías | Google Fonts (Playfair Display e Inter) |
| Diseño | Mobile-first con *media queries* `min-width` (640, 768 y 1024 px) |
| Autenticación | Firebase Authentication (correo y contraseña) |
| Base de datos | Cloud Firestore |
| Imágenes | Cloudinary (subida sin firma mediante preset) |
| Despliegue | Firebase Hosting |
| SDK | Firebase JS SDK 12.19.0 cargado por CDN como módulos ES |

## Estructura del repositorio

```
├── public/                     Carpeta que se publica en Firebase Hosting
│   ├── index.html              Landing pública (página única con todas las secciones)
│   ├── 404.html                Página de error
│   ├── css/
│   │   ├── base.css            Variables, reset y estilos globales
│   │   ├── inicio.css          Navbar y sección Inicio (hero)
│   │   ├── servicios.css       Sección Servicios
│   │   ├── paquetes.css        Sección Paquetes
│   │   ├── sobre-mi.css        Secciones Sobre mí y Testimonios
│   │   └── agendar.css         Formulario de cita, Contacto y Footer
│   ├── js/
│   │   ├── main.js             Menú móvil
│   │   └── firebase-config.js  Conexión con Firebase y datos de Cloudinary (compartido)
│   ├── assets/img/             Logo y fotografías del doctor
│   └── admin/                  Panel de administración del doctor
│       ├── login.html          Inicio de sesión
│       ├── index.html          Dashboard / Inicio
│       ├── css/admin.css       Estilos del panel
│       └── js/
│           ├── auth.js         Control de sesión y protección de páginas
│           └── borrador.js     Lectura y guardado del borrador
├── docs/                       Documentación técnica
├── firebase.json               Configuración de Hosting y Firestore
├── .firebaserc                 Proyecto de Firebase asociado (dr-alan-prado)
├── firestore.rules             Reglas de seguridad de Firestore
├── firestore.indexes.json      Índices de Firestore
└── README.md
```

## Requisitos

- [Node.js](https://nodejs.org) (versión LTS).
- Firebase CLI: `npm install -g firebase-tools`.
- Ser miembro del proyecto `dr-alan-prado` en la consola de Firebase.

## Ejecución local

> Los archivos JavaScript se cargan como módulos (`type="module"`), por lo que **no funcionan si se abre `index.html` con doble clic** (`file://`). El sitio siempre debe servirse desde un servidor local.

**Opción 1. Firebase CLI (recomendada)**

```bash
firebase login
firebase serve --only hosting
```

| Página | Dirección |
|---|---|
| Landing pública | <http://localhost:5000/> |
| Panel del doctor | <http://localhost:5000/admin/> |

**Opción 2. Live Server de VS Code**

Clic derecho sobre `public/index.html` → *Open with Live Server*.

| Página | Dirección |
|---|---|
| Landing pública | <http://127.0.0.1:5500/public/index.html> |
| Panel del doctor | <http://127.0.0.1:5500/public/admin/index.html> |

## Despliegue

```bash
firebase deploy
```

El sitio queda publicado en <https://dr-alan-prado.web.app>. Para publicar únicamente las reglas de seguridad: `firebase deploy --only firestore:rules`.

## Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable |
| `panel-doctor` | Desarrollo del panel de administración |

## Estado actual

| Módulo | Estado |
|---|---|
| Inicio (hero) y navbar | Hecho |
| Servicios | Hecho |
| Paquetes | Hecho |
| Sobre mí | Hecho |
| Testimonios | Hecho (contenido de ejemplo) |
| Agendar cita (formulario) | Maquetado; **el envío a WhatsApp aún no funciona correctamente** |
| Contacto y redes | Hecho (Instagram y Facebook como "Próximamente") |
| Configuración de Firebase y Cloudinary | Hecho |
| Reestructura del repositorio para Firebase Hosting | Hecho |
| Panel del doctor | En desarrollo |

### Pendiente principal

El formulario de agendado envía los datos con `method="get"` hacia `wa.me`, pero este servicio solo interpreta el parámetro `text`, por lo que el mensaje llega sin los datos capturados. Falta construir el mensaje con JavaScript. Detalle en la [documentación técnica](docs/Documentacion-Tecnica.docx).

## Seguridad

- Los valores de `firebaseConfig` son identificadores públicos y pueden estar en el repositorio; la protección de los datos depende de `firestore.rules`.
- **Nunca** deben subirse al repositorio contraseñas de usuarios ni el *API Secret* de Cloudinary.

## Documentación

- [Documentación técnica](docs/Documentacion-Tecnica.docx)
- Documentación de la Fase 1: configuración de Firebase y Cloudinary

## Equipo

| Integrante | Rol |
|---|---|
| Juan Pablo Salas González | Scrum Master |
| Renata Carolina Castro Olmos | Desarrolladora Frontend |
| Othon Lozano Vidal | Desarrollador Backend |
| Olimpia de los Angeles Moctezuma Juan | Desarrolladora Backend, Product Owner |

## Repositorio

<https://github.com/RenataCastro19/PaginaGinecologo-AlanPrado>