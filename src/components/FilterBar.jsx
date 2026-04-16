import { useState, useRef, useEffect } from 'react'

// ── Dropdown genèric amb checkboxes ────────────────────────────────────────
function DropdownFilter({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function toggle(opt) {
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt])
  }

  const active = selected.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
          active
            ? 'bg-amber-100 border-amber-400 text-amber-800'
            : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700'
        }`}
      >
        {label}
        {active && (
          <span className="bg-amber-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
            {selected.length}
          </span>
        )}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 min-w-48 py-1 max-h-64 overflow-y-auto">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 px-3 py-2 hover:bg-amber-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-amber-500 w-3.5 h-3.5"
              />
              <span className="text-sm text-stone-700">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Filtre de persones ──────────────────────────────────────────────────────
function PersonesFilter({ min, max, maxVal, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const active = min > 1 || max < maxVal

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
          active
            ? 'bg-amber-100 border-amber-400 text-amber-800'
            : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700'
        }`}
      >
        {active ? `${min}–${max} p.` : 'Persones'}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 w-56 p-4">
          <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">Nombre de persones</p>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1 flex-1">
              <label className="text-xs text-stone-400">Mínim</label>
              <input
                type="number" min={1} max={max}
                value={min}
                onChange={e => onChange(Math.min(Number(e.target.value), max), max)}
                className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-amber-400"
              />
            </div>
            <span className="text-stone-300 mt-4">—</span>
            <div className="flex flex-col items-center gap-1 flex-1">
              <label className="text-xs text-stone-400">Màxim</label>
              <input
                type="number" min={min} max={maxVal}
                value={max}
                onChange={e => onChange(min, Math.max(Number(e.target.value), min))}
                className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Chip actiu ──────────────────────────────────────────────────────────────
function ActiveChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-2.5 py-0.5 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-amber-600 ml-0.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

// ── FilterBar principal ─────────────────────────────────────────────────────
export default function FilterBar({ filters, onChange, empty, options }) {
  const { cerca, categories, tipus, dificultats, personesMin, personesMax } = filters
  const { maxPersones } = options

  function set(key, val) { onChange({ ...filters, [key]: val }) }
  function removeFrom(key, val) { set(key, filters[key].filter(x => x !== val)) }

  const activeChips = [
    ...categories.map(c => ({ label: c, remove: () => removeFrom('categories', c) })),
    ...tipus.map(t => ({ label: t, remove: () => removeFrom('tipus', t) })),
    ...dificultats.map(d => ({ label: d, remove: () => removeFrom('dificultats', d) })),
  ]
  const hasFilters = cerca || activeChips.length > 0 || personesMin > 1 || personesMax < maxPersones

  return (
    <div className="px-3 py-2.5 space-y-2">
      {/* Fila 1: cerca + dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cerca per nom o ingredient…"
            value={cerca}
            onChange={e => set('cerca', e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-stone-200 rounded-full focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 bg-white"
          />
          {cerca && (
            <button onClick={() => set('cerca', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <DropdownFilter label="Categoria" options={options.categories} selected={categories} onChange={v => set('categories', v)} />
        <DropdownFilter label="Ingredients" options={options.tipus} selected={tipus} onChange={v => set('tipus', v)} />
        <DropdownFilter label="Dificultat" options={options.dificultats} selected={dificultats} onChange={v => set('dificultats', v)} />
        <PersonesFilter min={personesMin} max={personesMax} maxVal={maxPersones} onChange={(mn, mx) => onChange({ ...filters, personesMin: mn, personesMax: mx })} />

        {/* Esborrar tot */}
        {hasFilters && (
          <button
            onClick={() => onChange(empty)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Esborrar tot
          </button>
        )}
      </div>

      {/* Fila 2: chips actius */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((c, i) => (
            <ActiveChip key={i} label={c.label} onRemove={c.remove} />
          ))}
        </div>
      )}
    </div>
  )
}
