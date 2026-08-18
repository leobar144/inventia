import { CURRICULUM_LEVELS, CLASS_STRUCTURE } from '@/lib/curriculum'

export default function ProfesorCurriculoPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-heading font-bold">Currículo — Método CREA</h1>
        <p className="text-gray-600">
          Guía completa de los 4 niveles y sus 8 módulos cada uno, para preparar cada clase.
        </p>
      </div>

      <section className="card p-6">
        <h2 className="text-xl font-bold mb-4">Estructura de cada clase (2 horas)</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CLASS_STRUCTURE.map((step) => (
            <div key={step.phase} className="bg-gray-50 rounded-xl p-4">
              <p className="font-bold text-primary-700">
                {step.phase} <span className="text-gray-400 font-normal">· {step.minutes} min</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {CURRICULUM_LEVELS.map((level) => (
        <section key={level.id} className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <h2 className="text-2xl font-bold">{level.name}</h2>
              <span className="text-sm text-gray-500">
                {level.ageRange} · {level.durationHours}h
              </span>
            </div>
            <p className="text-sm text-secondary-700 italic mt-1">{level.orientingQuestion}</p>
            <p className="text-sm text-gray-600 mt-2">{level.purpose}</p>
            <p className="text-xs text-gray-500 mt-2">
              <strong>Herramientas del nivel:</strong> {level.tools}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 pr-4">Módulo</th>
                  <th className="py-2 pr-4">Competencias</th>
                  <th className="py-2 pr-4">Conceptos</th>
                  <th className="py-2 pr-4">Herramientas</th>
                  <th className="py-2">Proyecto / reto</th>
                </tr>
              </thead>
              <tbody>
                {level.modules.map((m) => (
                  <tr key={m.number} className="border-b border-gray-100 align-top">
                    <td className="py-3 pr-4 font-medium whitespace-nowrap">
                      {m.number}. {m.title}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{m.competencias}</td>
                    <td className="py-3 pr-4 text-gray-600">{m.conceptos}</td>
                    <td className="py-3 pr-4 text-gray-600">{m.herramientas}</td>
                    <td className="py-3 text-gray-600">{m.proyecto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
