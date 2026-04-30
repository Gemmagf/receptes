# LOG · App Receptes Simone Ortega
> Última actualització: 2026-04-30

---

## ✅ Fet i funcionant

### App base
- **React + Vite + Tailwind CSS** — SPA sense routing
- **1067 receptes** extretes del PDF _1080 Recetas de Cocina_ de Simone Ortega, traduïdes i adaptades al català
- **`receptes.js`** — dades estructurades: nom, categoria, dificultat, temps, persones, ingredients, tipus d'ingredients
- **`extras.js`** — cobertura completa de les 1067 receptes amb: passos numerats detallats, consells pràctics, presentació i servei

### Components
| Component | Estat | Notes |
|---|---|---|
| `FilterBar` | ✅ | Cerca per text + 4 filtres (categoria, ingredients, dificultat, persones) |
| `RecipeList` | ✅ | Llista scrollable amb cards |
| `RecipeCard` | ✅ | Targeta amb dificultat, temps, comensals i tipus d'ingredients |
| `RecipeDetail` | ✅ | Passos numerats, consells, presentació, versió lleugera |
| `ScalingPanel` | ✅ | Escalat automàtic d'ingredients per nombre de comensals |
| `LogPanel` | ✅ | Notes personals i valoració per recepta (desat a localStorage) |
| `ImageRecipeModal` | ✅ | Puja foto → IA identifica plat → genera recepta completa |
| `HelpModal` | ✅ | Modal "Com funciona" accessible des del botó ? del header |

### Adaptació mòbil
- `height: 100dvh` (corregeix el bug de `100vh` a iOS Safari)
- Layout flex amb `min-h-0` — les columnes no desbordem mai
- Cerca sempre a la seva pròpia fila (full-width)
- Filtres en `flex-wrap` — els dropdowns no queden retallats
- Botons +/− de ScalingPanel: 44px (estàndard touch Apple/Google)
- `safe-area-inset` al header i footer per notch i barra d'inici iPhone
- `touch-action: manipulation` — elimina delay de 300ms
- Botó esborrar nota de LogPanel visible en mòbil (sense hover)
- `viewport-fit=cover` a `index.html`

### Infraestructura
- **Netlify Function** (`netlify/functions/identify-recipe.mjs`) — proxy segur cap a l'API d'Anthropic (Claude Opus 4.5)
- **`netlify.toml`** configurat: build command, publish dir, redirect SPA
- **Repositori GitHub**: https://github.com/Gemmagf/receptes

---

## 🔧 Decidit / Arquitectura

| Decisió | Raó |
|---|---|
| Totes les receptes en fitxers JS estàtics | Sense servidor ni BD; deploy pur a Netlify. 1067 receptes caben bé (~1.2MB gzipejat) |
| Receptes noves desades a localStorage | Sense BD. Suficient per ús personal en un sol dispositiu |
| Funció IA com a Netlify Function (no directe al client) | La API key d'Anthropic mai s'exposa al navegador |
| GitHub Pages descartat | No suporta serverless functions; la funció de foto no funcionaria |
| **Deploy: Netlify** | Serverless functions + deploy automàtic des de GitHub |

---

## 🚧 Pendent

### Crític (necessari per fer funcionar la foto en producció)
- [ ] **Fer el deploy a Netlify** — connectar repo `Gemmagf/receptes` a netlify.com
- [ ] **Afegir `ANTHROPIC_API_KEY`** a les variables d'entorn del site a Netlify
  - Netlify → Site → Environment variables → `ANTHROPIC_API_KEY`

### Millores desitjades
- [ ] **Afegir recepta manualment** (sense foto, formulari bàsic)
- [ ] **Editar una recepta pròpia** generada per IA
- [ ] **Eliminar recepta pròpia** des de RecipeDetail
- [ ] **Exportar / compartir recepta** (PDF o link)
- [ ] **Sincronització entre dispositius** — ara les receptes noves i notes només existeixen al dispositiu on es van crear (localStorage). Requeriria Supabase o Firebase

### Millores tècniques menors
- [ ] Code splitting del bundle principal (ara >1MB, warning de Vite)
- [ ] Icona PWA i `manifest.json` per poder instal·lar com a app al mòbil
- [ ] Missatge d'error si `ANTHROPIC_API_KEY` no és a Netlify (ara dona error 500 genèric)

---

## 📦 Historial de commits

```
e675e56  Afegir modal "Com funciona" amb guia de funcionalitats
5794e1a  Afegir identificació de plats per foto amb IA
0af75c3  Corregir dropdowns i cerca al mòbil
d0b6c4d  Completar extras.js i adaptar la web per a mòbil
8f4d88c  Afegir passos detallats per receptes 17-100
1d68b30  Ampliar base de receptes a 1080 i passos detallats
97a4170  Afegir elaboració detallada: passos, consells, presentació
217d064  Reescriure app en React/Vite per deploy a Netlify
b054c41  Afegir escalat, filtre per ingredient i log de proves
6e10f96  Afegir app de receptes Simone Ortega en català
```
