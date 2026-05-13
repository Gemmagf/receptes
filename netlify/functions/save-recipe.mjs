/**
 * Netlify Function: save-recipe
 * Desa una recepta nova a public/receptes_custom.json via GitHub API.
 * Requereix env vars: GITHUB_TOKEN, GITHUB_REPO (p.ex. "Gemmagf/receptes")
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const token = process.env.GITHUB_TOKEN
  const repo  = process.env.GITHUB_REPO  // "Gemmagf/receptes"

  if (!token || !repo) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Falten GITHUB_TOKEN o GITHUB_REPO a les variables d\'entorn de Netlify.' }),
    }
  }

  try {
    const { recipe } = JSON.parse(event.body)
    if (!recipe?.nom) throw new Error('Recepta invàlida')

    const FILE_PATH = 'public/receptes_custom.json'
    const API_URL   = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`
    const headers   = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }

    // 1. Llegeix el fitxer actual (per obtenir el SHA i el contingut)
    const getRes = await fetch(API_URL, { headers })
    let receptes = []
    let sha = null

    if (getRes.ok) {
      const fileData = await getRes.json()
      sha = fileData.sha
      const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8')
      receptes = JSON.parse(decoded)
    } else if (getRes.status !== 404) {
      throw new Error(`GitHub GET error: ${getRes.status}`)
    }

    // 2. Afegeix la nova recepta amb ID únic i timestamp
    const novaRecepta = {
      ...recipe,
      id:         `custom_${Date.now()}`,
      creat_el:   new Date().toISOString().split('T')[0],
    }
    receptes.push(novaRecepta)

    // 3. Commit al repo
    const content = Buffer.from(JSON.stringify(receptes, null, 2)).toString('base64')
    const putBody = {
      message: `Add recipe: ${recipe.nom}`,
      content,
      ...(sha ? { sha } : {}),
    }

    const putRes = await fetch(API_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    })

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}))
      throw new Error(`GitHub PUT error: ${putRes.status} — ${err.message || ''}`)
    }

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id: novaRecepta.id }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    }
  }
}
