// Herramientas externas que se usan en las clases — el "Aula INVENTIA" es
// solo un lanzador con nuestra marca hacia estas herramientas reales.
// Nunca reempaquetamos ni reemplazamos su marca — cada una sigue siendo
// textualmente Scratch/Code.org/etc, con su propio logo y su propio dominio.
export interface LearningTool {
  id: string
  name: string
  icon: string
  description: string
  url: string
  minAge: number
}

export const LEARNING_TOOLS: LearningTool[] = [
  {
    id: 'scratch',
    name: 'Scratch',
    icon: '🎨',
    description: 'Crea tus propias historias, juegos y animaciones programando con bloques.',
    url: 'https://scratch.mit.edu',
    minAge: 7,
  },
  {
    id: 'codeorg',
    name: 'Code.org',
    icon: '💻',
    description: 'Lecciones de programación paso a paso, desde lo más básico.',
    url: 'https://code.org',
    minAge: 6,
  },
  {
    id: 'mblock',
    name: 'mBlock',
    icon: '🤖',
    description: 'Programa tu robot Codey Rocky o mBot2 con bloques o código real.',
    url: 'https://ide.mblock.cc',
    minAge: 8,
  },
  {
    id: 'roblox',
    name: 'Roblox Studio',
    icon: '🎮',
    description: 'Diseña y construye tus propios mundos y experiencias interactivas.',
    url: 'https://www.roblox.com/create',
    minAge: 9,
  },
]
