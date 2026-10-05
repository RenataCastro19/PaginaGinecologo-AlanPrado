# Landing Page para Ginecólogo Dr. Alan Prado

Landing page del Dr. Alan Guillermo Prado Villalobos (Ginecología y Obstetricia, Veracruz, Ver.). Permite a potenciales pacientes conocer sus servicios y paquetes, y solicitar una cita enviando un mensaje por WhatsApp.

Proyecto de la materia **Ingeniería de Software Avanzada** — Universidad Veracruzana. Docente: Dra. Primavera Argüelles Lucho.

## Stack

- HTML5, CSS3 y JavaScript sin frameworks ni herramientas de build.
- Tipografías de Google Fonts (Playfair Display e Inter).
- Diseño mobile-first con *media queries* `min-width` (640, 768 y 1024 px).

## Estructura del repositorio

```
├── index.html          Página única con todas las secciones
├── css/
│   ├── base.css        Variables, reset y estilos globales
│   ├── inicio.css      Navbar y sección Inicio (hero)
│   ├── servicios.css   Sección Servicios
│   ├── paquetes.css    Sección Paquetes
│   ├── sobre-mi.css    Secciones Sobre mí y Testimonios
│   └── agendar.css     Formulario de cita, Contacto y Footer
├── js/
│   └── main.js         Menú móvil
├── assets/img/         Logo y fotografías del doctor
└── docs/               Documentación técnica
```

## Ejecución local

No requiere instalación. Opciones:

1. Abrir `index.html` directamente en el navegador.
2. O servirlo con la extensión **Live Server** de VS Code (clic derecho sobre `index.html` → *Open with Live Server*).

## Estado actual

| Sección | Estado |
|---|---|
| Inicio (hero) y navbar | Hecho |
| Servicios | Hecho |
| Paquetes | Hecho |
| Sobre mí | Hecho |
| Testimonios | Hecho (contenido de ejemplo) |
| Agendar cita (formulario) | Maquetado; **el envío a WhatsApp aún no funciona correctamente** |
| Contacto y redes | Hecho (Instagram y Facebook como "Próximamente") |

### Pendiente principal

El formulario de agendado envía los datos con `method="get"` hacia `wa.me`, pero este servicio solo interpreta el parámetro `text`, por lo que el mensaje llega sin los datos capturados. Falta construir el mensaje con JavaScript. Detalle en la [documentación técnica](docs/Documentacion-Tecnica.docx).

## Documentación

- [Documentación técnica](docs/Documentacion-Tecnica.docx)

## Equipo

| Integrante | Rol |
|---|---|
| Juan Pablo Salas González | Scrum Master |
| Renata Carolina Castro Olmos | Desarrolladora Frontend |
| Othon Lozano Vidal | Desarrollador Backend |
| Olimpia de los Angeles Moctezuma Juan | Desarrolladora Backend, Product Owner |

## Repositorio

<https://github.com/RenataCastro19/PaginaGinecologo-AlanPrado>
