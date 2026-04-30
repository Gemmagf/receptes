import { useState, useMemo } from 'react'
import { RECEPTES_COMPLETES as RECEPTES, CATEGORIES, DIFICULTATS, TIPUS_INGREDIENTS, MAX_PERSONES } from './data/receptes'
import FilterBar from './components/FilterBar'
import RecipeList from './components/RecipeList'
import RecipeDetail from './components/RecipeDetail'
import ImageRecipeModal from './components/ImageRecipeModal'

const CUSTOM_KEY = 'receptes-custom'

function loadCustom() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]') } catch { return [] }
}
function saveCustom(list) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list))
}

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
  const [filters, setFilters]       = useState(EMPTY_FILTERS)
  const [selectedNum, setSelectedNum] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [showImageModal, setShowImageModal] = useState(false)
  const [customRecipes, setCustomRecipes]   = useState(loadCustom)

  // Combina les receptes del llibre + les receptes guardades per l'usuari
  const allRecipes = useMemo(
    () => [...RECEPTES, ...customRecipes],
    [customRecipes],
  )

  const filtered = useMemo(() => filterRecipes(allRecipes, filters), [allRecipes, filters])
  const selected = allRecipes.find(r => r.num === selectedNum) ?? null

  function handleSelect(num) {
    setSelectedNum(num)
    setMobileView('detail')
  }

  function handleBack() {
    setMobileView('list')
  }

  // Guarda la recepta generada per IA a localStorage i la selecciona
  function handleSaveCustom(recipe) {
    const num = Date.now() // ID únic basat en timestamp
    const full = { ...recipe, num, custom: true }
    const updated = [...customRecipes, full]
    setCustomRecipes(updated)
    saveCustom(updated)
    setSelectedNum(num)
    setMobileView('detail')
  }

  return (
    <div className="bg-amber-50 flex flex-col overflow-hidden" style={{ height: '100dvh' }}>

      {/* Header */}
      <header className="bg-amber-800 text-white px-4 shadow-md shrink-0"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: '0.75rem' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-tight">1080 Receptes de Cuina</h1>
            <p className="text-amber-200 text-xs">Simone Ortega · En català</p>
          </div>
          {/* Botó identificar plat per foto */}
          <button
            onClick={() => setShowImageModal(true)}
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 active:bg-amber-900 border border-amber-600 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors shrink-0"
            title="Identificar plat per foto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <span className="hidden sm:inline">Foto</span>
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="bg-white border-b border-amber-100 shadow-sm z-40 shrink-0">
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
      <main className="flex-1 min-h-0 max-w-7xl mx-auto w-full px-3 py-3 overflow-hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="flex gap-4 h-full min-h-0">

          {/* Llista */}
          <div className={`${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 xl:w-96 shrink-0 min-h-0`}>
            <p className="text-xs text-stone-500 mb-2 px-1 shrink-0">
              <span className="font-semibold text-stone-700">{filtered.length}</span> recepta{filtered.length !== 1 ? 'es' : ''} trobada{filtered.length !== 1 ? 'es' : ''}
              {customRecipes.length > 0 && (
                <span className="ml-1.5 text-amber-600 font-medium">· {customRecipes.length} pròpia{customRecipes.length !== 1 ? 'es' : ''}</span>
              )}
            </p>
            <RecipeList
              recipes={filtered}
              selectedNum={selectedNum}
              onSelect={handleSelect}
            />
          </div>

          {/* Detall */}
          <div className={`${mobileView === 'list' ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-w-0 min-h-0`}>
            {selected ? (
              <RecipeDetail
                recipe={selected}
                onBack={handleBack}
                onDelete={selected.custom ? () => {
                  const updated = customRecipes.filter(r => r.num !== selected.num)
                  setCustomRecipes(updated)
                  saveCustom(updated)
                  setSelectedNum(null)
                  setMobileView('list')
                } : null}
              />
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-64 text-stone-400 gap-3">
                <span className="text-4xl">👈</span>
                <p className="text-sm">Fes clic sobre una recepta per veure'n els detalls</p>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="flex items-center gap-2 mt-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-sm font-medium transition-colors"
                >
                  📷 Identificar plat per foto
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modal identificació per foto */}
      {showImageModal && (
        <ImageRecipeModal
          onClose={() => setShowImageModal(false)}
          onSave={handleSaveCustom}
        />
      )}
    </div>
  )
}
