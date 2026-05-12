import { useState, useRef, useCallback } from 'react'

const DIF_COLOR = {
  'Fàcil':   'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Mitjana': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Difícil': 'bg-red-100 text-red-700 border-red-200',
}

// ── Compressió de la imatge abans d'enviar ──────────────────────────────────
function compressImage(file, maxPx = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => {
          const reader = new FileReader()
          reader.onload = e => {
            const [header, base64] = e.target.result.split(',')
            resolve({ base64, mediaType: header.match(/:(.*?);/)[1] })
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function ImageRecipeModal({ onClose, onSave }) {
  // 'upload' | 'loading' | 'result' | 'error'
  const [step, setStep]       = useState('upload')
  const [preview, setPreview] = useState(null)   // data URL per mostrar
  const [imgPayload, setImgPayload] = useState(null) // { base64, mediaType }
  const [recipe, setRecipe]   = useState(null)
  const [error, setError]     = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)

  // ── Gestió del fitxer ─────────────────────────────────────────────────────
  async function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Només s\'accepten imatges (JPG, PNG, WEBP).')
      setStep('error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imatge és massa gran. Màxim 10 MB.')
      setStep('error')
      return
    }
    // Previsualització original
    setPreview(URL.createObjectURL(file))
    // Comprimir per enviar
    try {
      const payload = await compressImage(file)
      setImgPayload(payload)
      setStep('upload')
    } catch {
      setError('No s\'ha pogut llegir la imatge.')
      setStep('error')
    }
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDragOver = useCallback(e => { e.preventDefault(); setDragging(true) }, [])
  const handleDragLeave = useCallback(() => setDragging(false), [])
  const handleDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const [modelUsed, setModelUsed] = useState(null)

  // ── Prompt per a Ollama (gemma3:4b) ───────────────────────────────────────
  const OLLAMA_PROMPT = `You are a culinary expert. Look at the food image and generate a recipe in Catalan (català).
Return ONLY a valid JSON object. No markdown, no explanation, just the JSON:

{
  "nom": "Nom del plat en català",
  "categoria": "Carns",
  "persones": 4,
  "dificultat": "Fàcil",
  "temps": "30 min",
  "tipus_ingredients": ["Carn"],
  "ingredients": ["500 g de...", "sal", "pebre"],
  "passos": ["Pas 1.", "Pas 2.", "Pas 3."],
  "consells": ["Consell 1.", "Consell 2."],
  "presentacio": "Com emplatar i servir."
}

Regles:
- dificultat ha de ser exactament: Fàcil, Mitjana, o Difícil
- Tot el contingut ha d'estar en català
- Retorna NOMÉS el JSON, res més`

  // ── Cridar Ollama local (gemma3:4b) ───────────────────────────────────────
  async function callOllama(base64, mediaType) {
    const res = await fetch('/api/ollama/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: OLLAMA_PROMPT,
        images: [base64],
        stream: false,
        options: { temperature: 0.1, num_predict: 2048 },
      }),
      signal: AbortSignal.timeout(300_000), // 5 min màx
    })
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
    const data = await res.json()
    let raw = data.response?.trim() ?? ''
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('Resposta no és JSON')
    return JSON.parse(raw.slice(start, end + 1))
  }

  // ── Cridar Netlify Function (fallback producció) ───────────────────────────
  async function callNetlify(base64, mediaType) {
    const res = await fetch('/.netlify/functions/identify-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, mediaType }),
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Error desconegut')
    return data.recipe
  }

  // ── Anàlisi: prova Ollama, fallback a Netlify ─────────────────────────────
  async function handleAnalyze() {
    if (!imgPayload) return
    setStep('loading')
    setError(null)
    setModelUsed(null)
    const { base64, mediaType } = imgPayload
    try {
      const recipe = await callOllama(base64, mediaType)
      setModelUsed('gemma3:4b (local)')
      setRecipe(recipe)
      setStep('result')
    } catch (ollamaErr) {
      console.warn('Ollama no disponible, provant Netlify...', ollamaErr.message)
      try {
        const recipe = await callNetlify(base64, mediaType)
        setModelUsed('Claude (cloud)')
        setRecipe(recipe)
        setStep('result')
      } catch (netlifyErr) {
        setError('No s\'ha pogut analitzar la imatge. Comprova que Ollama està corrent (`ollama serve`) o que estàs desplegat a Netlify.')
        setStep('error')
      }
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function reset() {
    setStep('upload')
    setPreview(null)
    setImgPayload(null)
    setRecipe(null)
    setError(null)
    setModelUsed(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Fons fosc */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Targeta modal */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
           style={{ maxHeight: '92dvh' }}>

        {/* Capçalera */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h2 className="text-base font-semibold text-stone-800">Identificar plat per foto</h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 active:bg-stone-200 text-stone-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contingut scrollable */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">

          {/* ── Zona upload / previsualització ── */}
          {step !== 'loading' && (
            <div>
              {!preview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                    dragging
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-300 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-5xl block mb-3">🖼️</span>
                  <p className="text-sm font-semibold text-stone-700 mb-1">
                    Fes una foto o puja una imatge
                  </p>
                  <p className="text-xs text-stone-400">JPG · PNG · WEBP · màx. 10 MB</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-stone-100 shadow-sm">
                  <img src={preview} alt="Plat seleccionat"
                    className="w-full max-h-64 object-cover" />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                    aria-label="Treure imatge"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Loading ── */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-stone-700">Analitzant el plat…</p>
                <p className="text-xs text-stone-400 mt-1">gemma3:4b identifica el plat i genera la recepta</p>
                <p className="text-xs text-stone-300 mt-0.5">Pot trigar fins a 2 minuts</p>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
              <span className="text-2xl block mb-2">⚠️</span>
              <p className="text-sm text-red-700 mb-3">{error}</p>
            </div>
          )}

          {/* ── Resultat ── */}
          {step === 'result' && recipe && (
            <div className="space-y-3">
              {/* Capçalera recepta */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">✨ Plat identificat</p>
                  {modelUsed && (
                    <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      🤖 {modelUsed}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">{recipe.nom}</h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${DIF_COLOR[recipe.dificultat] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                    {recipe.dificultat}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    ⏱ {recipe.temps}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                    👥 {recipe.persones} persones
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                    {recipe.categoria}
                  </span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <h4 className="text-sm font-semibold text-stone-700 mb-2">🛒 Ingredients</h4>
                <ul className="space-y-1.5">
                  {recipe.ingredients?.map((ing, i) => (
                    <li key={i} className="text-sm text-stone-600 flex gap-2">
                      <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Passos */}
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <h4 className="text-sm font-semibold text-stone-700 mb-3">👨‍🍳 Preparació</h4>
                <ol className="space-y-3">
                  {recipe.passos?.map((pas, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-stone-600 leading-relaxed">{pas}</p>
                    </li>
                  ))}
                </ol>

                {recipe.consells?.length > 0 && (
                  <div className="mt-4 bg-amber-50 rounded-xl p-3.5 border border-amber-200">
                    <p className="text-xs font-semibold text-amber-700 mb-2">💡 Consells</p>
                    <ul className="space-y-1.5">
                      {recipe.consells.map((c, i) => (
                        <li key={i} className="text-xs text-amber-900 leading-relaxed flex gap-2">
                          <span className="text-amber-400 shrink-0">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.presentacio && (
                  <div className="mt-3 bg-green-50 rounded-xl p-3.5 border border-green-200">
                    <p className="text-xs font-semibold text-green-700 mb-1">🍽️ Presentació</p>
                    <p className="text-xs text-green-900 leading-relaxed">{recipe.presentacio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Botons d'acció ── */}
        <div className="px-4 py-3 border-t border-stone-100 shrink-0">
          {step === 'upload' && !preview && (
            <button onClick={onClose}
              className="w-full py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 active:bg-stone-100 font-medium text-sm transition-colors">
              Tancar
            </button>
          )}

          {step === 'upload' && preview && (
            <button onClick={handleAnalyze}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm transition-colors">
              ✨ Analitzar amb IA
            </button>
          )}

          {step === 'error' && (
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-sm">
                Tancar
              </button>
              <button onClick={reset}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm">
                Tornar a intentar
              </button>
            </div>
          )}

          {step === 'result' && (
            <div className="flex gap-2">
              <button onClick={reset}
                className="px-4 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 active:bg-stone-100 font-medium text-sm transition-colors whitespace-nowrap">
                Nova foto
              </button>
              <button onClick={() => { onSave(recipe); onClose() }}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm transition-colors">
                💾 Guardar recepta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
