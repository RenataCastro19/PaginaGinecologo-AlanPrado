// Contenido inicial del sitio, tomado de la landing actual (public/index.html)
// y organizado según las pantallas del panel en Figma.
// Se usa una sola vez desde carga-inicial.html para crear sitio/borrador y sitio/publicado.

export const contenidoInicial = {

  // Pantalla: Mi perfil
  perfil: {
    nombreCompleto: "Dr. Alan Guillermo Prado Villalobos",
    especialidad: "Ginecología & Obstetricia",
    cedulaProfesional: "" // Pendiente: no proporcionada por el cliente
  },

  // Pantalla: Información profesional
  informacionProfesional: {
    eyebrow: "Especialista en Salud Femenina",
    tituloHero: "Tu salud importa, tu bienestar nos inspira.",
    textoPresentacion: "Atención ginecológica integral con calidez humana y tecnología de vanguardia, acompañando a las mujeres en cada etapa de su vida.",
    ctaPrincipal: "Agendar mi cita",
    ctaSecundario: "Conocer más",
    biografia: "Médico especialista en Ginecología y Obstetricia, graduado con honores de la Universidad Nacional Autónoma de México y con subespecialidad en Medicina Materno-Fetal realizada en el Hospital General de México.",
    filosofia: "Mi filosofía es brindar atención con profundo respeto, escucha activa y la más alta calidad médica. Creo firmemente que cada mujer merece sentirse comprendida, acompañada y empoderada en sus decisiones de salud.",
    subespecialidad: "Medicina Materno-Fetal",
    certificacion: "Board Certified — Ginecología y Obstetricia, UNAM"
  },

  // Pantalla: Servicios / Especialidades
  servicios: [
    { id: "consulta-general", nombre: "Consulta General", descripcion: "Revisión ginecológica completa, Papanicolaou y evaluación del bienestar reproductivo.", visible: true, orden: 1 },
    { id: "control-prenatal", nombre: "Control Prenatal", descripcion: "Seguimiento integral del embarazo con ultrasonidos y asesoría nutricional.", visible: true, orden: 2 },
    { id: "colposcopia", nombre: "Colposcopía", descripcion: "Detección temprana de lesiones cervicales con tecnología de alta resolución.", visible: true, orden: 3 },
    { id: "planificacion-familiar", nombre: "Planificación Familiar", descripcion: "Asesoría personalizada sobre métodos anticonceptivos y salud hormonal.", visible: true, orden: 4 },
    { id: "menopausia", nombre: "Menopausia", descripcion: "Manejo integral de la menopausia con terapias hormonales y alternativas naturales.", visible: true, orden: 5 },
    { id: "salud-sexual", nombre: "Salud Sexual", descripcion: "Atención confidencial y sensible para el bienestar sexual integral de la mujer.", visible: true, orden: 6 }
  ],

  // Sin pantalla en el Figma (pendiente de decisión del equipo)
  paquetes: [
    {
      id: "preventivo",
      etiqueta: "Paquete Preventivo",
      nombre: "Chequeo Ginecológico Completo",
      descripcion: "Ideal para tu revisión anual. Detección temprana y tranquilidad total.",
      incluye: ["Consulta ginecológica", "Papanicolaou (Pap)", "Colposcopía diagnóstica", "Ultrasonido pélvico", "Resultados en 48 h"],
      precioRegular: 2400,
      precioPaquete: 1650,
      destacado: false,
      visible: true,
      orden: 1
    },
    {
      id: "prenatal",
      etiqueta: "Paquete Prenatal",
      nombre: "Control de Embarazo Integral",
      descripcion: "Acompañamiento completo desde el primer trimestre hasta el parto.",
      incluye: ["3 consultas prenatales", "Ultrasonido obstétrico", "Doppler fetal", "Perfil biofísico fetal", "Asesoría nutricional", "Línea directa de emergencias"],
      precioRegular: 5800,
      precioPaquete: 3900,
      destacado: true,
      visible: true,
      orden: 2
    },
    {
      id: "hormonal",
      etiqueta: "Paquete Hormonal",
      nombre: "Salud Hormonal & Menopausia",
      descripcion: "Evaluación y manejo integral del equilibrio hormonal en cualquier etapa de vida.",
      incluye: ["Consulta especializada", "Perfil hormonal completo", "Ultrasonido transvaginal", "Densitometría ósea", "Plan de tratamiento"],
      precioRegular: 3200,
      precioPaquete: 2200,
      destacado: false,
      visible: true,
      orden: 3
    }
  ],
  notaPaquetes: "Precios en pesos mexicanos. Consulta disponibilidad. Los paquetes no incluyen estudios de laboratorio externos.",

  // Pantalla: Experiencia y formación
  experiencia: [
    { id: "medico-cirujano", titulo: "Médico Cirujano, UNAM", institucion: "Universidad Nacional Autónoma de México", periodo: "", orden: 1 },
    { id: "especialidad", titulo: "Especialidad en Ginecología", institucion: "", periodo: "", orden: 2 },
    { id: "subespecialidad", titulo: "Subespecialidad Materno-Fetal", institucion: "Hospital General de México", periodo: "", orden: 3 },
    { id: "amgo", titulo: "Miembro AMGO", institucion: "AMGO", periodo: "", orden: 4 }
  ],

  // Pantalla: Información de contacto
  contacto: {
    prefijo: "+52",
    telefono: "229 901 0537",
    whatsapp: "229 901 0537", // El enlace wa.me se arma uniendo los dígitos del prefijo y de este número
    mostrarTelefono: true,
    etiquetaPublica: "Llamadas y WhatsApp",
    ciudad: "Veracruz, Ver.",
    modalidad: "Consulta presencial",
    direccion: "",
    direccionVisible: false,
    correo: "",
    correoVisible: false,
    urlMapa: "",
    instagram: "",
    instagramActivo: false, // Inactivo = se muestra "Próximamente"
    facebook: "",
    facebookActivo: false
  },

  // Pantalla: Horarios de atención
  horarios: {
    etiquetaPublica: "Lun–Sáb",
    textoHorario: "Horario a confirmar",
    dias: [
      { dia: "Lunes", disponible: true, inicio: "", fin: "" },
      { dia: "Martes", disponible: true, inicio: "", fin: "" },
      { dia: "Miércoles", disponible: true, inicio: "", fin: "" },
      { dia: "Jueves", disponible: true, inicio: "", fin: "" },
      { dia: "Viernes", disponible: true, inicio: "", fin: "" },
      { dia: "Sábado", disponible: true, inicio: "", fin: "" },
      { dia: "Domingo", disponible: false, inicio: "", fin: "" }
    ]
  },

  // Pantalla: Galería / Imágenes
  // uso "inicio" = fotografía del hero (también es la fotografía de perfil); uso "sobre-mi" = sección Sobre mí
  galeria: [
    { id: "foto-inicio", uso: "inicio", url: "/assets/img/doctor-AlanPrado.jpg", publicId: "", textoAlternativo: "Dr. Alan Guillermo Prado Villalobos, ginecólogo", orden: 1 },
    { id: "foto-sobre-mi", uso: "sobre-mi", url: "/assets/img/doctor-consulta.jpg", publicId: "", textoAlternativo: "Dr. Alan Guillermo Prado Villalobos", orden: 2 }
  ],

  // Pantalla: Testimonios
  testimonios: [
    { id: "t1", autora: "María González", edad: 34, valoracion: 5, comentario: "El Dr. Prado me hizo sentir completamente cómoda y segura. Su profesionalismo y calidez humana son incomparables. Lo recomiendo ampliamente.", visible: true, orden: 1 },
    { id: "t2", autora: "Sofía Herrera", edad: 28, valoracion: 5, comentario: "Excelente atención durante todo mi embarazo. Siempre dispuesto a resolver mis dudas con paciencia y conocimiento. Mi bebé y yo estamos muy bien gracias a él.", visible: true, orden: 2 },
    { id: "t3", autora: "Valentina Cruz", edad: 45, valoracion: 5, comentario: "Encontrar al Dr. Alan Guillermo fue un alivio enorme. Su manejo de mi menopausia fue completamente personalizado y me devolvió la calidad de vida que necesitaba.", visible: true, orden: 3 }
  ],

  // Pantalla: Configuración
  configuracion: {
    sitioVisible: true,
    tituloPagina: "Dr. Alan Guillermo Prado Villalobos | Ginecología y Obstetricia",
    descripcionBuscadores: "", // Pendiente: no proporcionada
    etiquetaRevision: ""       // Nota interna del panel; no se muestra en el sitio
  }
};
