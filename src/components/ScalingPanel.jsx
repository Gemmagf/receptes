import { useState } from 'react'

function scaleIngredient(ing, factor) {
  if (Math.abs(factor - 1) < 0.01) return { text: ing, changed: false, unscalable: false }
  const m = ing.match(/^(\d+(?:[.,]\d+)?)\s*(.*)/)
  if (!m) return { text: ing, changed: false, unscalable: true }
  const num = parseFloat(m[1].replace(',', '.'))
  const rest = m[2]
  const scaled = num * factor
  let s
  if (scaled >= 10) {
    s = String(Math.round(scaled))
  } else {
    const r = Math.round(scaled * 2) / 2
    s = r === Math.floor(r) ? String(Math.floor(r)) : String(r)
  }
  return { text: `${s} ${rest}`.trim(), changed: true, unscalable: false }
}

export default function ScalingPanel({ recipe }) {
  const [comensals, setComensals] = useState(recipe.persones)
  const factor = comensals / recipe.persones
  const changed = Math.abs(factor - 1) > 0.01

  const scaled = recipe.ingredients.map(ing => scaleIngredient(ing, factor))
  const hasUnscalable = changed && scaled.some(s => s.unscalable)

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
        <h3 className="text-sm font-semibold text-stone-700">👥 Adaptar al nombre de comensals</h3>
        {changed && (
          <button
            onClick={() => setComensals(recipe.persones)}
            className="text-xs text-amber-600 hover:text-amber-800 underline"
          >
            Restablir ({recipe.persones}p)
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-stone-100">
        <button
          onClick={() => setComensals(c => Math.max(1, c - 1))}
          className="w-7 h-7 rounded-full border border-stone-300 text-stone-600 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 font-bold text-base transition-colors"
        >−</button>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-amber-700">{comensals}</span>
          <span className="text-[10px] text-stone-400">persones</span>
        </div>
        <button
          onClick={() => setComensals(c => Math.min(50, c + 1))}
          className="w-7 h-7 rounded-full border border-stone-300 text-stone-600 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 font-bold text-base transition-colors"
        >+</button>
        {changed && (
          <span className="ml-2 text-xs text-stone-400">
            factor ×{factor.toFixed(2)} · original {recipe.persones}p
          </span>
        )}
      </div>

      {/* Ingredients list */}
      <ul className="divide-y divide-stone-100 px-4">
        {scaled.map((s, i) => (
          <li key={i} className="py-1.5 flex items-start gap-2">
            {s.unscalable ? (
              <span className="w-4 text-stone-300 text-xs mt-0.5 shrink-0">~</span>
            ) : s.changed ? (
              <span className="w-4 text-emerald-500 text-xs mt-0.5 shrink-0">✓</span>
            ) : (
              <span className="w-4 text-stone-300 text-xs mt-0.5 shrink-0">•</span>
            )}
            <span className={`text-sm ${s.changed ? 'text-emerald-700 font-medium' : s.unscalable ? 'text-stone-400 italic' : 'text-stone-600'}`}>
              {s.text}
            </span>
          </li>
        ))}
      </ul>

      {hasUnscalable && (
        <p className="px-4 py-2 text-[11px] text-stone-400 border-t border-stone-100">
          ~ Ingredients sense quantitat no s'han escalat
        </p>
      )}
    </div>
  )
}
