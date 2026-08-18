// Contenido del Método CREA — tomado de "Propuesta Malla de Inventia.docx"
// Fuente de verdad para la página pública /metodo-crea y la guía interna
// de profesores en /profesor/curriculo.

export interface CurriculumModule {
  number: number
  title: string
  competencias: string
  conceptos: string
  herramientas: string
  proyecto: string
}

export interface CurriculumLevel {
  id: string
  name: string
  ageRange: string
  orientingQuestion: string
  focus: string
  tools: string
  durationHours: number
  purpose: string
  modules: CurriculumModule[]
}

export const LEARNING_AXES = [
  'Pensamiento computacional',
  'Robótica y mecanismos',
  'Programación',
  'Electrónica y sensores',
  'Diseño e ingeniería',
  'Creatividad e innovación',
  'Proyecto y emprendimiento tecnológico',
]

export const METHODOLOGY_DESCRIPTION =
  'Metodología basada en retos, integrando robótica, STEM, aprendizaje basado en proyectos, aprendizaje basado en retos, pensamiento computacional y constructivismo.'

// La estructura de cada clase de 2 horas, igual en todos los niveles.
export const CLASS_STRUCTURE = [
  { phase: 'Imagina', minutes: 15, description: 'Pregunta detonadora o situación problema.' },
  { phase: 'Explora', minutes: 20, description: 'Experimentación libre o guiada.' },
  { phase: 'Aprende', minutes: 20, description: 'El docente introduce el concepto.' },
  { phase: 'Crea', minutes: 40, description: 'Construcción, programación o desarrollo.' },
  { phase: 'Reto', minutes: 15, description: 'Aplicación del aprendizaje a un desafío.' },
  {
    phase: 'Reflexiona',
    minutes: 10,
    description: '¿Qué funcionó? ¿Qué falló? ¿Qué cambiarías?',
  },
]

export const CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    id: 'exploradores',
    name: 'INVENTIA Exploradores',
    ageRange: '4-6 años',
    orientingQuestion: '¿Cómo puedo hacer que las cosas sucedan?',
    focus: 'Pensamiento computacional y exploración',
    tools: 'mTiny, Tale-Bot Pro, LEGO y material manipulativo',
    durationHours: 64,
    purpose:
      'Favorecer el desarrollo del pensamiento computacional mediante el juego, la exploración, el movimiento, la construcción y la interacción con robots, fortaleciendo la capacidad de seguir instrucciones, reconocer patrones, organizar secuencias, resolver problemas sencillos y comunicar ideas.',
    modules: [
      {
        number: 1,
        title: '¡Hola, Robot!',
        competencias: 'Secuenciación, lógica, exploración',
        conceptos: 'Robot, instrucción, acción, dirección, movimiento, secuencia',
        herramientas: 'mTiny + LEGO',
        proyecto: 'Mi primer recorrido robótico',
      },
      {
        number: 2,
        title: 'Detectives de patrones',
        competencias: 'Patrones, clasificación, pensamiento lógico',
        conceptos: 'Patrón, repetición, clasificación, orden',
        herramientas: 'mTiny + material manipulativo',
        proyecto: 'El camino secreto',
      },
      {
        number: 3,
        title: 'Dale instrucciones al robot',
        competencias: 'Algoritmos sencillos, secuenciación, resolución de problemas',
        conceptos: 'Instrucción, algoritmo, orden, ruta',
        herramientas: 'mTiny',
        proyecto: 'Robot explorador',
      },
      {
        number: 4,
        title: 'El viaje de Tale-Bot',
        competencias: 'Secuenciación, orientación espacial, creatividad',
        conceptos: 'Dirección, distancia, recorrido, causa-efecto',
        herramientas: 'Tale-Bot Pro',
        proyecto: 'Una aventura robótica',
      },
      {
        number: 5,
        title: 'Construyo mi mundo',
        competencias: 'Construcción, creatividad, experimentación',
        conceptos: 'Estructuras, equilibrio, forma, construcción',
        herramientas: 'LEGO',
        proyecto: 'La ciudad de INVENTIA',
      },
      {
        number: 6,
        title: 'Robot cuentacuentos',
        competencias: 'Narración, secuenciación, comunicación',
        conceptos: 'Historia, personajes, secuencia, acción',
        herramientas: 'Tale-Bot + mTiny',
        proyecto: 'Una historia que se mueve',
      },
      {
        number: 7,
        title: 'Misión: resolver',
        competencias: 'Descomposición, perseverancia, resolución de problemas',
        conceptos: 'Problema, estrategia, prueba, error, solución',
        herramientas: 'mTiny + LEGO',
        proyecto: 'Misión rescate',
      },
      {
        number: 8,
        title: 'INVENTIA Challenge',
        competencias: 'Integración de aprendizajes',
        conceptos: 'Diseño, secuencia, construcción, prueba, mejora',
        herramientas: 'mTiny + Tale-Bot + LEGO',
        proyecto: 'Diseña una misión para tu robot',
      },
    ],
  },
  {
    id: 'makers',
    name: 'INVENTIA Makers',
    ageRange: '7-10 años',
    orientingQuestion: '¿Cómo puedo construir una máquina que resuelva un problema?',
    focus: 'Robótica, mecanismos y programación',
    tools: 'Codey Rocky, MatataStudio VinciBot, LEGO y, desde los 9 años, Roblox/Minecraft',
    durationHours: 64,
    purpose:
      'Desarrollar competencias de pensamiento computacional y robótica mediante la construcción, programación y resolución de retos, comprendiendo el funcionamiento de mecanismos, motores y sensores y utilizando la programación para automatizar comportamientos.',
    modules: [
      {
        number: 1,
        title: 'Makers: construimos y pensamos',
        competencias: 'Diseño, construcción, secuenciación',
        conceptos: 'Estructuras, mecanismos, movimiento, algoritmo',
        herramientas: 'LEGO',
        proyecto: 'Mi primera máquina',
      },
      {
        number: 2,
        title: 'Conozco a Codey Rocky',
        competencias: 'Programación secuencial, control',
        conceptos: 'Motor, movimiento, secuencia, comandos',
        herramientas: 'Codey Rocky',
        proyecto: 'Robot mensajero',
      },
      {
        number: 3,
        title: 'Los robots pueden percibir',
        competencias: 'Exploración de sensores, lógica',
        conceptos: 'Sensor, entrada, salida, distancia, luz, sonido',
        herramientas: 'Codey/VinciBot',
        proyecto: 'Robot explorador',
      },
      {
        number: 4,
        title: 'Si ocurre esto… entonces…',
        competencias: 'Condicionales, toma de decisiones',
        conceptos: 'Evento, condición, decisión, lógica',
        herramientas: 'Codey/VinciBot',
        proyecto: 'Robot inteligente',
      },
      {
        number: 5,
        title: 'Repite y automatiza',
        competencias: 'Bucles, automatización, depuración',
        conceptos: 'Repetición, bucle, automatización, error',
        herramientas: 'Codey/VinciBot',
        proyecto: 'Fábrica automática',
      },
      {
        number: 6,
        title: 'Creo mi mundo digital',
        competencias: 'Diseño digital, creatividad, lógica',
        conceptos: 'Mundo virtual, reglas, diseño, interacción',
        herramientas: 'Roblox/Minecraft (9-10 años)',
        proyecto: 'Mi mundo INVENTIA',
      },
      {
        number: 7,
        title: 'Diseña, construye y prueba',
        competencias: 'Ingeniería, experimentación, resolución',
        conceptos: 'Problema, prototipo, prueba, mejora',
        herramientas: 'LEGO + robot',
        proyecto: 'Mi solución robótica',
      },
      {
        number: 8,
        title: 'INVENTIA Maker Challenge',
        competencias: 'Integración, comunicación, perseverancia',
        conceptos: 'Diseño, programación, prototipo, solución',
        herramientas: 'LEGO + robot + digital',
        proyecto: 'Robot que resuelve un problema',
      },
    ],
  },
  {
    id: 'innovadores',
    name: 'INVENTIA Innovadores',
    ageRange: '11-13 años',
    orientingQuestion: '¿Cómo puedo diseñar y programar una solución?',
    focus: 'Programación, electrónica y diseño',
    tools: 'mBot2, LEGO, Roblox/Minecraft y herramientas introductorias de IA',
    durationHours: 64,
    purpose:
      'Desarrollar la capacidad de diseñar y programar soluciones tecnológicas mediante el uso de algoritmos, variables, condicionales, bucles, sensores y sistemas robóticos, integrando creatividad, diseño y una introducción crítica a la Inteligencia Artificial.',
    modules: [
      {
        number: 1,
        title: 'Pienso como programador',
        competencias: 'Algoritmos, descomposición, abstracción',
        conceptos: 'Algoritmo, pseudocódigo, diagrama de flujo',
        herramientas: 'Programación visual',
        proyecto: 'Mi primer algoritmo',
      },
      {
        number: 2,
        title: 'Programación visual avanzada',
        competencias: 'Variables, eventos, condicionales',
        conceptos: 'Variable, evento, condición, operador',
        herramientas: 'Programación visual',
        proyecto: 'Juego interactivo',
      },
      {
        number: 3,
        title: 'Bucles y lógica',
        competencias: 'Repetición, depuración, pensamiento lógico',
        conceptos: 'Bucle, operador lógico, depuración',
        herramientas: 'Programación visual',
        proyecto: 'Desafío lógico',
      },
      {
        number: 4,
        title: 'mBot2: robot + código',
        competencias: 'Control robótico, programación',
        conceptos: 'Motores, sensores, control, automatización',
        herramientas: 'mBot2',
        proyecto: 'Robot autónomo',
      },
      {
        number: 5,
        title: 'Electrónica y sensores',
        competencias: 'Integración de sistemas',
        conceptos: 'Entrada, salida, sensor, actuador, automatización',
        herramientas: 'mBot2 + componentes',
        proyecto: 'Sistema automatizado',
      },
      {
        number: 6,
        title: 'Diseño de videojuegos',
        competencias: 'Creatividad, programación, diseño',
        conceptos: 'Mecánicas, reglas, niveles, interacción',
        herramientas: 'Roblox/Minecraft',
        proyecto: 'Mi videojuego',
      },
      {
        number: 7,
        title: 'Descubro la Inteligencia Artificial',
        competencias: 'Pensamiento crítico, análisis de datos',
        conceptos: 'Datos, patrones, entrenamiento, reconocimiento, IA generativa',
        herramientas: 'Herramientas de IA',
        proyecto: 'Mi primer experimento de IA',
      },
      {
        number: 8,
        title: 'Innovators Challenge',
        competencias: 'Integración, innovación, comunicación',
        conceptos: 'Problema, solución, prototipo, IA, presentación',
        herramientas: 'mBot2 + digital + IA',
        proyecto: 'Solución tecnológica para mi entorno',
      },
    ],
  },
  {
    id: 'lab',
    name: 'INVENTIA Lab',
    ageRange: '14-16 años',
    orientingQuestion: '¿Cómo puedo crear una solución tecnológica real?',
    focus: 'Programación avanzada, IA, innovación y proyectos',
    tools: 'mBot2, programación, Roblox/Minecraft, IA y herramientas digitales',
    durationHours: 64,
    purpose:
      'Desarrollar competencias avanzadas de programación, pensamiento computacional, inteligencia artificial, diseño, innovación y emprendimiento tecnológico mediante la creación de proyectos que respondan a problemas reales.',
    modules: [
      {
        number: 1,
        title: 'Pensamiento computacional avanzado',
        competencias: 'Abstracción, descomposición, optimización',
        conceptos: 'Algoritmos, abstracción, eficiencia, optimización',
        herramientas: 'Programación',
        proyecto: 'Algoritmo eficiente',
      },
      {
        number: 2,
        title: 'Del bloque al código',
        competencias: 'Programación basada en texto',
        conceptos: 'Variables, funciones, condicionales, bucles, estructuras de datos',
        herramientas: 'Programación',
        proyecto: 'Mi primera aplicación',
      },
      {
        number: 3,
        title: 'Robótica programable',
        competencias: 'Automatización, integración',
        conceptos: 'Sensores, motores, control, autonomía',
        herramientas: 'mBot2',
        proyecto: 'Sistema robótico autónomo',
      },
      {
        number: 4,
        title: 'Game Lab',
        competencias: 'Desarrollo de videojuegos',
        conceptos: 'Game mechanics, niveles, interacción, experiencia de usuario',
        herramientas: 'Roblox',
        proyecto: 'Videojuego funcional',
      },
      {
        number: 5,
        title: 'Minecraft: diseñando el futuro',
        competencias: 'Diseño de soluciones, pensamiento sistémico',
        conceptos: 'Ciudad inteligente, sostenibilidad, recursos, automatización',
        herramientas: 'Minecraft',
        proyecto: 'Ciudad del futuro',
      },
      {
        number: 6,
        title: 'AI Lab',
        competencias: 'Pensamiento crítico, datos, IA',
        conceptos: 'Machine learning, datos, modelos, predicción, IA generativa, ética',
        herramientas: 'Herramientas de IA',
        proyecto: 'Solución apoyada en IA',
      },
      {
        number: 7,
        title: 'Tech Startup',
        competencias: 'Innovación, emprendimiento, prototipado',
        conceptos: 'Problema, usuario, necesidad, propuesta de valor, MVP, pitch',
        herramientas: 'Herramientas digitales',
        proyecto: 'Mi startup tecnológica',
      },
      {
        number: 8,
        title: 'INVENTIA Lab Challenge',
        competencias: 'Innovación, integración, autonomía',
        conceptos: 'Investigación, prototipo, programación, IA, validación',
        herramientas: 'Libre elección',
        proyecto: 'Proyecto tecnológico final',
      },
    ],
  },
]
