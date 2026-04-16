import ScalingPanel from './ScalingPanel'
import LogPanel from './LogPanel'

const DIF_COLOR = {
  'Fàcil':   'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Mitjana': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Difícil': 'bg-red-100 text-red-700 border-red-200',
}

const TIPUS_COLOR = {
  'Carn':       'bg-rose-100 text-rose-700',
  'Caça':       'bg-orange-100 text-orange-700',
  'Peix':       'bg-cyan-100 text-cyan-700',
  'Mariscs':    'bg-sky-100 text-sky-700',
  'Verdures':   'bg-green-100 text-green-700',
  'Llegums':    'bg-lime-100 text-lime-700',
  'Pasta':      'bg-yellow-100 text-yellow-700',
  'Arròs':      'bg-amber-100 text-amber-700',
  'Ous':        'bg-orange-100 text-orange-700',
  'Làctics':    'bg-blue-100 text-blue-700',
  'Fruits Secs':'bg-stone-100 text-stone-600',
  'Fruita':     'bg-pink-100 text-pink-700',
}

export default function RecipeDetail({ recipe: r, onBack }) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin pr-1" style={{ maxHeight: 'calc(100vh - 160px)' }}>

      {/* Capçalera */}
      <div className="bg-white rounded-xl border border-stone-200 px-4 py-4">
        {/* Botó enrere (mòbil) */}
        <button
          onClick={onBack}
          className="lg:hidden flex items-center gap-1.5 text-xs text-amber-600 mb-3 hover:text-amber-800"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Tornar a la llista
        </button>

        <p className="text-xs font-bold text-amber-500 mb-1">Recepta #{r.num}</p>
        <h2 className="text-lg font-bold text-stone-800 leading-snug mb-3">{r.nom}</h2>

        {/* Metadades */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
            {r.categoria}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${DIF_COLOR[r.dificultat]}`}>
            {r.dificultat}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            ⏱ {r.temps}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
            👥 {r.persones} persones
          </span>
        </div>

        {/* Tipus d'ingredients */}
        <div className="flex flex-wrap gap-1">
          {r.tipus_ingredients.map(t => (
            <span key={t} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TIPUS_COLOR[t] ?? 'bg-stone-100 text-stone-600'}`}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Escalat d'ingredients */}
      <ScalingPanel recipe={r} />

      {/* Preparació */}
      <div className="bg-white rounded-xl border border-stone-200 px-4 py-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">👨‍🍳 Preparació</h3>
        <p className="text-sm text-stone-600 leading-relaxed">{r.instruccions}</p>
      </div>

      {/* Log de proves */}
      <LogPanel recipeNum={r.num} />

    </div>
  )
}
