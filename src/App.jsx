import { useState, useMemo } from 'react'
import { RECEPTES_COMPLETES as RECEPTES, CATEGORIES, DIFICULTATS, TIPUS_INGREDIENTS, MAX_PERSONES } from './data/receptes'
import FilterBar from './components/FilterBar'
import RecipeList from './components/RecipeList'
import RecipeDetail from './components/RecipeDetail'

const EMPTY_FILTERS = {
  cerca: '',
  categories: [],
  tipus: [],
  dificultats: [],
  personesMin: 1,
  personesMax: MAX_PERSONES,
}

function filterRecipes(receptes, { cerca, categories, tipus, dificultats, personesMin, personesMax }) {
  return receptes.filter(r => {
    if (cerca) {
      const t = cerca.toLowerCase()
      if (!r.nom.toLowerCase().includes(t) && !r.ingredients.some(i => i.toLowerCase().includes(t)))
        return false
    }
    if (categories.length && !categories.includes(r.categoria)) return false
    if (dificultats.length && !dificultats.includes(r.dificultat)) return false
    if (tipus.length && !r.tipus_ingredients.some(ti => tipus.includes(ti))) return false
    if (r.persones < personesMin || r.persones > personesMax) return false
    return true
  })
}

export default function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedNum, setSelectedNum] = useState(null)
  // On mobile: 'list' | 'detail'
  const [mobileView, setMobileView] = useState('list')

  const filtered = useMemo(() => filterRecipes(RECEPTES, filters), [filters])
  const selected = RECEPTES.find(r => r.num === selectedNum) ?? null

  function handleSelect(num) {
    setSelectedNum(num)
    setMobileView('detail')
  }

  function handleBack() {
    setMobileView('list')
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-amber-800 text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">1080 Receptes de Cuina</h1>
            <p className="text-amber-200 text-xs">Simone Ortega · En català</p>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            empty={EMPTY_FILTERS}
            options={{ categories: CATEGORIES, tipus: TIPUS_INGREDIENTS, dificultats: DIFICULTATS, maxPersones: MAX_PERSONES }}
          />
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 py-4">
        <div className="flex gap-4 h-full">

          {/* Recipe list — hidden on mobile when detail is open */}
          <div className={`${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 xl:w-96 shrink-0`}>
            <p className="text-xs text-stone-500 mb-2 px-1">
              <span className="font-semibold text-stone-700">{filtered.length}</span> recepta{filtered.length !== 1 ? 'es' : ''} trobada{filtered.length !== 1 ? 'es' : ''}
            </p>
            <RecipeList
              recipes={filtered}
              selectedNum={selectedNum}
              onSelect={handleSelect}
            />
          </div>

          {/* Recipe detail */}
          <div className={`${mobileView === 'list' ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-w-0`}>
            {selected ? (
              <RecipeDetail
                recipe={selected}
                onBack={handleBack}
              />
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-64 text-stone-400 gap-2">
                <span className="text-4xl">👈</span>
                <p className="text-sm">Fes clic sobre una recepta per veure'n els detalls</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
