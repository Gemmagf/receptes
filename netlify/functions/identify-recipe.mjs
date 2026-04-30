export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key no configurada al servidor. Afegeix ANTHROPIC_API_KEY a les variables d\'entorn de Netlify.' }),
    }
  }

  try {
    const { base64, mediaType } = JSON.parse(event.body)

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `Ets un expert cuiner català. Analitza la imatge d'aquest plat i genera una recepta completa en català.

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
    "Segon pas detallat."
  ],
  "consells": [
    "Consell pràctic per millorar el resultat.",
    "Alternativa o variació possible."
  ],
  "presentacio": "Com emplatar i servir el plat per a una presentació atractiva."
}

Normes:
- Per "dificultat" utilitza NOMÉS: Fàcil, Mitjana o Difícil
- Per "tipus_ingredients" utilitza NOMÉS valors d'aquesta llista: Carn, Caça, Peix, Mariscs, Verdures, Llegums, Pasta, Arròs, Ous, Làctics, Fruits Secs, Fruita
- Els "passos" han de ser detallats, amb temps i temperatures si cal (mínim 3 passos)
- Els "ingredients" han de tenir quantitats concretes
- Tot en català`,
              },
            ],
          },
        ],
      }),
    })

    if (!anthropicRes.ok) {
      const errData = await anthropicRes.json().catch(() => ({}))
      throw new Error(errData.error?.message || `Error API: ${anthropicRes.status}`)
    }

    const data = await anthropicRes.json()
    const rawText = data.content[0].text.trim()

    // Neteja possibles blocs markdown ```json ... ```
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    const recipe = JSON.parse(cleaned)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ recipe }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: err.message }),
    }
  }
}
