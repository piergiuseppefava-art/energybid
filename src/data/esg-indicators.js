/**
 * Indicatori ESG MEF-Banche
 * Set di 40 indicatori basato sulle linee guida del Ministero
 * dell'Economia e delle Finanze per la valutazione ESG delle PMI italiane.
 *
 * Ogni indicatore ha:
 * - id: codice univoco
 * - category: E (Environmental), S (Social), G (Governance)
 * - question: domanda all'utente
 * - type: tipo di risposta (boolean, number, select, percentage)
 * - options: opzioni se select
 * - weight: peso nello score (1-5)
 * - autoFrom: campo per auto-popolamento (opzionale)
 * - unit: unità di misura (opzionale)
 */

export const ESG_INDICATORS = [
  // ============================================
  // ENVIRONMENTAL (15 indicatori)
  // ============================================
  {
    id: 'E01',
    category: 'E',
    question: 'Emissioni Scope 2 annuali (tCO₂)',
    type: 'number',
    weight: 5,
    autoFrom: 'bollette',
    unit: 'tCO₂',
  },
  {
    id: 'E02',
    category: 'E',
    question: 'Consumo energetico annuo totale (MWh)',
    type: 'number',
    weight: 4,
    autoFrom: 'bollette',
    unit: 'MWh',
  },
  {
    id: 'E03',
    category: 'E',
    question: 'Percentuale energia da fonti rinnovabili',
    type: 'percentage',
    weight: 5,
  },
  {
    id: 'E04',
    category: 'E',
    question: 'Avete certificazione ISO 14001 (sistema gestione ambientale)?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'E05',
    category: 'E',
    question: 'Avete certificazione ISO 50001 (sistema gestione energia)?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'E06',
    category: 'E',
    question: 'Avete impianti fotovoltaici o partecipate a una CER?',
    type: 'boolean',
    weight: 4,
    autoFrom: 'cer',
  },
  {
    id: 'E07',
    category: 'E',
    question: 'Riduzione consumi energetici negli ultimi 3 anni',
    type: 'percentage',
    weight: 3,
  },
  {
    id: 'E08',
    category: 'E',
    question: 'Avete una politica di gestione rifiuti documentata?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'E09',
    category: 'E',
    question: 'Percentuale rifiuti riciclati',
    type: 'percentage',
    weight: 3,
  },
  {
    id: 'E10',
    category: 'E',
    question: 'Consumo idrico annuo (m³)',
    type: 'number',
    weight: 2,
    unit: 'm³',
  },
  {
    id: 'E11',
    category: 'E',
    question: 'Avete obiettivi di riduzione emissioni Scope 1+2 entro il 2030?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'E12',
    category: 'E',
    question: 'Avete una flotta aziendale elettrica/ibrida?',
    type: 'select',
    options: ['nessuna', 'parziale', 'maggioranza', 'totale'],
    weight: 3,
  },
  {
    id: 'E13',
    category: 'E',
    question: 'Avete eseguito una diagnosi energetica nell\'ultimo triennio?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'E14',
    category: 'E',
    question: 'Avete acquisito Garanzie di Origine (GO) per energia verde?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'E15',
    category: 'E',
    question: 'Investimenti annui in transizione ecologica (€)',
    type: 'number',
    weight: 4,
    unit: '€',
  },

  // ============================================
  // SOCIAL (13 indicatori)
  // ============================================
  {
    id: 'S01',
    category: 'S',
    question: 'Numero totale dipendenti',
    type: 'number',
    weight: 3,
    autoFrom: 'organizzazione',
  },
  {
    id: 'S02',
    category: 'S',
    question: 'Percentuale donne in posizioni manageriali',
    type: 'percentage',
    weight: 4,
  },
  {
    id: 'S03',
    category: 'S',
    question: 'Tasso di turnover dipendenti annuo',
    type: 'percentage',
    weight: 3,
  },
  {
    id: 'S04',
    category: 'S',
    question: 'Ore di formazione media per dipendente / anno',
    type: 'number',
    weight: 3,
    unit: 'ore',
  },
  {
    id: 'S05',
    category: 'S',
    question: 'Avete un piano di welfare aziendale?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'S06',
    category: 'S',
    question: 'Avete certificazione UNI/PdR 125 (parità di genere)?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'S07',
    category: 'S',
    question: 'Avete certificazione SA8000 (responsabilità sociale)?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'S08',
    category: 'S',
    question: 'Numero infortuni sul lavoro nell\'ultimo anno',
    type: 'number',
    weight: 4,
  },
  {
    id: 'S09',
    category: 'S',
    question: 'Differenziale retributivo medio uomo-donna (gender pay gap)',
    type: 'percentage',
    weight: 4,
  },
  {
    id: 'S10',
    category: 'S',
    question: 'Avete politiche di smart working/lavoro flessibile?',
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'S11',
    category: 'S',
    question: 'Iniziative di responsabilità sociale verso il territorio',
    type: 'select',
    options: ['nessuna', '1-2 attività', '3-5 attività', 'oltre 5'],
    weight: 3,
  },
  {
    id: 'S12',
    category: 'S',
    question: 'Avete un sistema di valutazione fornitori su criteri ESG?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'S13',
    category: 'S',
    question: 'Investimenti annui in formazione dipendenti (€)',
    type: 'number',
    weight: 2,
    unit: '€',
  },

  // ============================================
  // GOVERNANCE (12 indicatori)
  // ============================================
  {
    id: 'G01',
    category: 'G',
    question: 'Avete un Codice Etico documentato e diffuso?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'G02',
    category: 'G',
    question: 'Avete adottato un Modello 231 (D.Lgs. 231/2001)?',
    type: 'boolean',
    weight: 5,
  },
  {
    id: 'G03',
    category: 'G',
    question: 'Avete un Organismo di Vigilanza attivo?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'G04',
    category: 'G',
    question: 'Percentuale donne nel CdA',
    type: 'percentage',
    weight: 4,
  },
  {
    id: 'G05',
    category: 'G',
    question: 'Avete certificazione ISO 27001 (sicurezza informazioni)?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'G06',
    category: 'G',
    question: 'Avete una policy whistleblowing conforme al D.Lgs. 24/2023?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'G07',
    category: 'G',
    question: 'Avete una policy anti-corruzione documentata?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'G08',
    category: 'G',
    question: 'Numero membri indipendenti nel CdA',
    type: 'number',
    weight: 3,
  },
  {
    id: 'G09',
    category: 'G',
    question: 'Pubblicate un bilancio di sostenibilità o report ESG annuale?',
    type: 'boolean',
    weight: 4,
  },
  {
    id: 'G10',
    category: 'G',
    question: 'Avete una funzione di Risk Management formalizzata?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'G11',
    category: 'G',
    question: 'Avete un comitato/responsabile sostenibilità?',
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'G12',
    category: 'G',
    question: 'Avete subito sanzioni o procedimenti negli ultimi 3 anni?',
    type: 'boolean',
    weight: 5,
    invertScore: true,
  },
]

/**
 * Calcolo dello score ESG
 * Ritorna { E, S, G, total, classe }
 */
export function calcolaScoreESG(risposte) {
  const categorie = { E: { score: 0, max: 0 }, S: { score: 0, max: 0 }, G: { score: 0, max: 0 } }

  ESG_INDICATORS.forEach(ind => {
    const risp = risposte[ind.id]
    const maxPoints = ind.weight * 10
    categorie[ind.category].max += maxPoints

    if (risp === undefined || risp === null || risp === '') return

    let points = 0
    if (ind.type === 'boolean') {
      points = risp === true ? maxPoints : 0
      if (ind.invertScore) points = maxPoints - points
    } else if (ind.type === 'percentage') {
      points = (parseFloat(risp) / 100) * maxPoints
    } else if (ind.type === 'number') {
      // Per numeri usiamo logica semplice: se >0 metà punti, scaling custom in futuro
      points = parseFloat(risp) > 0 ? maxPoints * 0.6 : 0
    } else if (ind.type === 'select') {
      const idx = ind.options.indexOf(risp)
      points = idx >= 0 ? (idx / (ind.options.length - 1)) * maxPoints : 0
    }
    categorie[ind.category].score += Math.min(points, maxPoints)
  })

  const E = Math.round((categorie.E.score / categorie.E.max) * 100)
  const S = Math.round((categorie.S.score / categorie.S.max) * 100)
  const G = Math.round((categorie.G.score / categorie.G.max) * 100)
  const total = Math.round((E + S + G) / 3)

  let classe = 'E'
  if (total >= 85) classe = 'A'
  else if (total >= 70) classe = 'B'
  else if (total >= 55) classe = 'C'
  else if (total >= 40) classe = 'D'

  return { E, S, G, total, classe }
}

/**
 * Conta quante risposte sono state date
 */
export function contaRisposte(risposte) {
  return ESG_INDICATORS.filter(ind => {
    const r = risposte[ind.id]
    return r !== undefined && r !== null && r !== ''
  }).length
}

export const TOTAL_INDICATORS = ESG_INDICATORS.length

export function getColorByClass(classe) {
  return { A: '#2ecc71', B: '#7ed957', C: '#e8a020', D: '#e67e22', E: '#e74c3c' }[classe] || '#888'
}
