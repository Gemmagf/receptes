import RecipeCard from './RecipeCard'

export default function RecipeList({ recipes, selectedNum, onSelect }) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-400 gap-2">
        <span className="text-3xl">🔍</span>
        <p className="text-sm">Cap recepta coincideix amb els filtres</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-thin pr-1 flex-1 min-h-0 pb-2">
      {recipes.map(r => (
        <RecipeCard
          key={r.num}
          recipe={r}
          selected={r.num === selectedNum}
          onClick={() => onSelect(r.num)}
        />
      ))}
    </div>
  )
}
