export default function HelpModal({ onClose }) {
  const seccions = [
    {
      icon: '🔍',
      titol: 'Cerca i filtra',
      desc: 'Escriu el nom d\'un plat o un ingredient a la barra de cerca. Usa els filtres per categoria, tipus d\'ingredient, dificultat o nombre de comensals. Pots combinar-los lliurement.',
    },
    {
      icon: '📷',
      titol: 'Identifica un plat per foto',
      desc: 'Fes clic al botó de càmera (header). Puja una foto o fes-ne una des del mòbil. La intel·ligència artificial identifica el plat i genera automàticament la recepta completa en català: ingredients, passos, consells i presentació.',
    },
    {
      icon: '👥',
      titol: 'Adapta les quantitats',
      desc: 'Dins de cada recepta hi ha el panell "Adaptar al nombre de comensals". Toca els botons + i − per canviar les persones: els ingredients es recalculen automàticament.',
    },
    {
      icon: '📝',
      titol: 'Registre de proves',
      desc: 'A cada recepta pots afegir notes personals: modificacions que has fet, com ha quedat, valoració amb estrelles. Queda desat al teu dispositiu.',
    },
    {
      icon: '💾',
      titol: 'Receptes pròpies',
      desc: 'Les receptes generades per IA es guarden a la teva llista amb l\'etiqueta "Recepta pròpia". Les pots consultar, escalar i eliminar igual que qualsevol altra recepta.',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Fons */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Targeta */}
      <div
        className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Capçalera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-stone-800">Com funciona</h2>
            <p className="text-xs text-stone-400 mt-0.5">1080 Receptes de Cuina · Guia ràpida</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 active:bg-stone-200 text-stone-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contingut */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {seccions.map((s, i) => (
            <div key={i} className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-3xl shrink-0 leading-none mt-0.5">{s.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800 mb-1">{s.titol}</p>
                <p className="text-sm text-stone-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}

          {/* Peu */}
          <div className="text-center pt-2 pb-1">
            <p className="text-xs text-stone-400">
              Les notes i receptes pròpies es desen al teu dispositiu (localStorage).
            </p>
          </div>
        </div>

        {/* Botó tancar */}
        <div className="px-5 py-3 border-t border-stone-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm transition-colors"
          >
            Entesos!
          </button>
        </div>
      </div>
    </div>
  )
}
