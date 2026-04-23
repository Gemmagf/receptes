import { useState } from 'react'

const LOG_KEY = 'receptes-log'

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '{}') } catch { return {} }
}
function saveLog(log) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
}

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition-transform hover:scale-110 active:scale-95 w-9 h-9 flex items-center justify-center ${n <= value ? 'text-amber-400' : 'text-stone-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function LogPanel({ recipeNum }) {
  const [log, setLog] = useState(loadLog)
  const [nota, setNota] = useState('')
  const [valoracio, setValoracio] = useState(4)
  const [showForm, setShowForm] = useState(false)

  const key = String(recipeNum)
  const entrades = log[key] ?? []

  function handleAdd(e) {
    e.preventDefault()
    if (!nota.trim()) return
    const entry = {
      data: new Date().toLocaleString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      nota: nota.trim(),
      valoracio,
    }
    const updated = { ...log, [key]: [...entrades, entry] }
    setLog(updated)
    saveLog(updated)
    setNota('')
    setValoracio(4)
    setShowForm(false)
  }

  function handleDelete(i) {
    const newEntrades = entrades.filter((_, idx) => idx !== i)
    const updated = newEntrades.length ? { ...log, [key]: newEntrades } : (({ [key]: _, ...rest }) => rest)(log)
    setLog(updated)
    saveLog(updated)
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-green-50 border-b border-green-100">
        <h3 className="text-sm font-semibold text-stone-700">📝 Registre de proves</h3>
        <button
          onClick={() => setShowForm(f => !f)}
          className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          + Afegir nota
        </button>
      </div>

      {/* Formulari nou */}
      {showForm && (
        <form onSubmit={handleAdd} className="px-4 py-3 bg-green-50 border-b border-green-100 space-y-3">
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Quines modificacions has fet? Com ha quedat?"
            className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200"
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <Stars value={valoracio} onChange={setValoracio} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1">
                Cancel·lar
              </button>
              <button type="submit" className="text-xs font-medium px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                Desar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Llista d'entrades */}
      {entrades.length === 0 && !showForm ? (
        <p className="px-4 py-4 text-sm text-stone-400 text-center">
          Encara no hi ha notes per aquesta recepta
        </p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {[...entrades].reverse().map((e, i) => (
            <li key={i} className="px-4 py-3 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">{e.data}</span>
                  <span className="text-amber-400 text-xs">{'★'.repeat(e.valoracio)}{'☆'.repeat(5 - e.valoracio)}</span>
                </div>
                <button
                  onClick={() => handleDelete(entrades.length - 1 - i)}
                  className="text-stone-300 hover:text-red-400 active:text-red-500 transition-colors p-1 -mr-1 rounded lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Esborrar nota"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-stone-700 mt-1 leading-relaxed">{e.nota}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
