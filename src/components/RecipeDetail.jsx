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

export default function RecipeDetail({ recipe: r, onBack, onDelete }) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin pr-1 flex-1 min-h-0 pb-2">

      {/* Capçalera */}
      <div className="bg-white rounded-xl border border-stone-200 px-4 py-4">
        {/* Fila superior mòbil: enrere + eliminar */}
        <div className="lg:hidden flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 -mx-1 px-1 py-2 rounded-lg hover:bg-amber-50 active:bg-amber-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tornar a la llista
          </button>
          {onDelete && (
            <button onClick={onDelete}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 px-2 py-1.5 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-amber-500 mb-1">
              {r.custom ? '📷 Recepta pròpia' : `Recepta #${r.num}`}
            </p>
            <h2 className="text-lg font-bold text-stone-800 leading-snug mb-3">{r.nom}</h2>
          </div>
          {onDelete && (
            <button onClick={onDelete}
              className="hidden lg:flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          )}
        </div>

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
        <h3 className="text-sm font-semibold text-stone-700 mb-4">👨‍🍳 Preparació</h3>

        {r.passos ? (
          <ol className="space-y-4">
            {r.passos.map((pas, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-stone-600 leading-relaxed">{pas}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-stone-600 leading-relaxed">{r.instruccions}</p>
        )}

        {r.consells?.length > 0 && (
          <div className="mt-5 bg-amber-50 rounded-xl p-3.5 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700 mb-2">💡 Consells</p>
            <ul className="space-y-1.5">
              {r.consells.map((c, i) => (
                <li key={i} className="text-xs text-amber-900 leading-relaxed flex gap-2">
                  <span className="shrink-0 text-amber-400">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {r.presentacio && (
          <div className="mt-3 bg-green-50 rounded-xl p-3.5 border border-green-200">
            <p className="text-xs font-semibold text-green-700 mb-1">🍽️ Presentació i servei</p>
            <p className="text-xs text-green-900 leading-relaxed">{r.presentacio}</p>
          </div>
        )}

        {r.versio_lleugera && (
          <div className="mt-3 bg-sky-50 rounded-xl p-3.5 border border-sky-200">
            <p className="text-xs font-semibold text-sky-700 mb-1">🥗 Versió lleugera</p>
            <p className="text-xs text-sky-900 leading-relaxed">{r.versio_lleugera}</p>
          </div>
        )}
      </div>

      {/* Log de proves */}
      <LogPanel recipeNum={r.num} />

    </div>
  )
}
