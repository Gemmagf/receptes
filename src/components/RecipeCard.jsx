const DIF_COLOR = {
  'Fàcil':   'bg-emerald-100 text-emerald-700',
  'Mitjana': 'bg-yellow-100 text-yellow-700',
  'Difícil': 'bg-red-100 text-red-700',
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

export default function RecipeCard({ recipe: r, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl px-3 py-2.5 border transition-all ${
        selected
          ? 'bg-amber-100 border-amber-400 shadow-sm'
          : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-amber-600 mb-0.5">#{r.num}</p>
          <p className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2">{r.nom}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIF_COLOR[r.dificultat]}`}>
          {r.dificultat}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mt-1.5">
        <span className="text-[10px] text-stone-400">⏱ {r.temps}</span>
        <span className="text-[10px] text-stone-400">·</span>
        <span className="text-[10px] text-stone-400">👥 {r.persones}p</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-1.5">
        {r.tipus_ingredients.map(t => (
          <span key={t} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TIPUS_COLOR[t] ?? 'bg-stone-100 text-stone-600'}`}>
            {t}
          </span>
        ))}
      </div>
    </button>
  )
}
