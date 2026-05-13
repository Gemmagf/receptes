/**
 * Netlify Function: identify-recipe-gemini
 * Analitza una imatge amb Gemini 2.0 Flash i retorna una recepta en català.
 * Requereix env var: GEMINI_API_KEY
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PROMPT = `Ets un expert cuiner català. Analitza la imatge d'aquest plat i genera una recepta completa en català.

Retorna ÚNICAMENT un objecte JSON vàlid, sense markdown ni cap text fora del JSON:

{
  "nom": "Nom del plat en català",
  "categoria": "una d'aquestes opcions exactes: Aperitius | Sopes i Cremes | Verdures, Pasta, Arròs i Ous | Peix i Mariscs | Carns | Caça | Postres",
  "persones": 4,
  "dificultat": "Fàcil",
  "temps": "30 min",
  "tipus_ingredients": ["Verdures"],
  "ingredients": ["500 g de ...", "2 grans d'all", "sal", "pebre"],
  "passos": [
    "Primer pas detallat amb tècnica i temps.",
    "Segon pas detallat.",
    "Tercer pas."
  ],
  "consells": [
    "Consell pràctic per millorar el resultat.",
    "Alternativa o variació possible."
  ],
  "presentacio": "Com emplatar i servir el plat per a una presentació atractiva."
}

Normes:
- dificultat: NOMÉS Fàcil, Mitjana o Difícil
- tipus_ingredients: NOMÉS valors d'aquesta llista: Carn, Caça, Peix, Mariscs, Verdures, Llegums, Pasta, Arròs, Ous, Làctics, Fruits Secs, Fruita
- passos: mínim 3, detallats amb temps i temperatures si cal
- ingredients: amb quantitats concretes
- Tot en català`

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'GEMINI_API_KEY no configurada a Netlify.' }),
    }
  }

  try {
    const { base64, mediaType } = JSON.parse(event.body)

    // Prova models en ordre fins que un funcioni (quota free tier)
    const MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b']
    let geminiRes = null
    let lastErr   = null

    for (const model of MODELS) {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mediaType, data: base64 } },
                { text: PROMPT },
              ],
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
          }),
        }
      )
      if (geminiRes.ok) break
      const errData = await geminiRes.json().catch(() => ({}))
      lastErr = errData.error?.message || `HTTP ${geminiRes.status}`
      console.warn(`Model ${model} failed: ${lastErr}`)
      geminiRes = null
    }

    if (!geminiRes) throw new Error(lastErr || 'Tots els models han fallat')

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}))
      throw new Error(err.error?.message || `Gemini API error: ${geminiRes.status}`)
    }

    const data = await geminiRes.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    // Neteja blocs markdown si n'hi ha
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    // Extreu l'objecte JSON
    const start = cleaned.indexOf('{')
    const end   = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('Resposta no conté JSON vàlid')

    const recipe = JSON.parse(cleaned.slice(start, end + 1))
    // Detecta quin model ha respost per mostrar-ho al frontend
    const modelUsed = geminiRes.url?.match(/models\/([^:]+)/)?.[1] ?? 'gemini'

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe, model: modelUsed }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    }
  }
}
