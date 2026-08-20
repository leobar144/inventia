// Herramientas externas que se usan en las clases — el "Aula INVENTIA" es
// solo un lanzador con nuestra marca hacia estas herramientas reales.
// Nunca reempaquetamos ni reemplazamos su marca — cada una sigue siendo
// textualmente Scratch/Code.org/etc, con su propio logo y su propio dominio.
import type { CurriculumLevel } from '@/lib/curriculum'

export interface LearningTool {
  id: string
  name: string
  icon: string
  description: string
  url: string
  minAge: number
  firstStepsTip: string
  // Niveles del Método CREA donde esta herramienta aplica — ver lib/curriculum.ts.
  // Es una aproximación razonable basada en las herramientas descritas por
  // nivel, ajústala si no calza con cómo la usas de verdad en clase.
  relevantLevels: CurriculumLevel['id'][]
}

export const LEARNING_TOOLS: LearningTool[] = [
  {
    id: 'scratch',
    name: 'Scratch',
    icon: '🎨',
    description: 'Crea tus propias historias, juegos y animaciones programando con bloques.',
    url: 'https://scratch.mit.edu',
    minAge: 7,
    firstStepsTip: 'Entra a "Únete a Scratch" y crea una cuenta gratis con el correo de tus papás.',
    relevantLevels: ['makers', 'innovadores', 'lab'],
  },
  {
    id: 'codeorg',
    name: 'Code.org',
    icon: '💻',
    description: 'Lecciones de programación paso a paso, desde lo más básico.',
    url: 'https://code.org',
    minAge: 6,
    firstStepsTip: 'Si tu profesor te dio un código de clase, entra a "Unirme a una clase" y escríbelo ahí.',
    relevantLevels: ['makers', 'innovadores', 'lab'],
  },
  {
    id: 'mblock',
    name: 'mBlock',
    icon: '🤖',
    description: 'Programa tu robot Codey Rocky o mBot2 con bloques o código real.',
    url: 'https://ide.mblock.cc',
    minAge: 8,
    firstStepsTip: 'Abre mBlock en el navegador, conecta tu robot por USB o Bluetooth, y elige tu modelo.',
    relevantLevels: ['makers', 'innovadores', 'lab'],
  },
  {
    id: 'roblox',
    name: 'Roblox Studio',
    icon: '🎮',
    description: 'Diseña y construye tus propios mundos y experiencias interactivas.',
    url: 'https://www.roblox.com/create',
    minAge: 9,
    firstStepsTip: 'Crea tu cuenta de Roblox con el correo de tus papás, y desde ahí abre "Studio".',
    relevantLevels: ['makers', 'innovadores', 'lab'],
  },
]
