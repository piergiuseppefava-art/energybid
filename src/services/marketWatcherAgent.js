/**
 * Market Watcher Agent
 *
 * Agent loop che usa l'API Claude con tool use per cercare offerte
 * energetiche sul Portale Offerte ARERA (ilportaleofferte.it),
 * estrarle in formato strutturato, e aggiornare il DB locale.
 *
 * Pattern: chiama il proxy serverless /api/claude che gestisce l'API key.
 */

import { callAnthropic } from '../utils/anthropic'

const MODEL = 'claude-haiku-4-5-20251001'

// ============================================================
// TOOL DEFINITIONS
// Queste sono le "API" che diamo al modello.
// Il modello decide quando chiamarle in base al system prompt.
// ============================================================

const TOOLS = [
  {
    name: 'search_arera_portal',
    description:
      'Cerca offerte sul Portale Offerte ARERA (ilportaleofferte.it). ' +
      'Usa questo tool per trovare offerte attive per il segmento richiesto. ' +
      'Ritorna una lista di URL di pagine offerta da visitare.',
    input_schema: {
      type: 'object',
      properties: {
        energy_type: {
          type: 'string',
          enum: ['luce', 'gas', 'dual'],
          description: 'Tipo di fornitura da cercare',
        },
        segment: {
          type: 'string',
          enum: ['domestico', 'microimpresa'],
          description:
            "Segmento cliente. Per EnergyBid ci interessa 'microimpresa' (PMI fino a 15kW luce / 200.000 Smc gas).",
        },
      },
      required: ['energy_type', 'segment'],
    },
  },
  {
    name: 'fetch_offer_page',
    description:
      'Recupera il contenuto di una pagina di dettaglio offerta dal Portale ARERA o dal sito del fornitore. ' +
      'Usa questo tool per leggere i dettagli di una specifica offerta dopo averla trovata con search_arera_portal.',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL completo della pagina offerta',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'save_offer',
    description:
      "Salva un'offerta estratta nel database EnergyBid. Chiama questo tool una volta per ogni offerta " +
      'valida che hai estratto. Estrai tutti i campi dallo schema con la massima accuratezza possibile. ' +
      'Se un campo opzionale non è disponibile, omettilo. ' +
      "IMPORTANTE: target_segment deve essere 'microimpresa' per offerte PMI.",
    input_schema: {
      type: 'object',
      properties: {
        supplier: {
          type: 'string',
          description: 'Nome del fornitore (es. Enel Energia, Eni Plenitude)',
        },
        offer_name: {
          type: 'string',
          description: "Nome commerciale dell'offerta",
        },
        energy_type: { type: 'string', enum: ['luce', 'gas', 'dual'] },
        price_type: { type: 'string', enum: ['fisso', 'variabile', 'placet'] },
        price_component: {
          type: 'string',
          description:
            "Descrizione del prezzo (es. '0.123 €/kWh' o 'PUN + 0.02 €/kWh')",
        },
        fixed_fee_monthly: {
          type: 'number',
          description: 'Quota fissa mensile in €',
        },
        duration_months: {
          type: 'number',
          description: 'Durata garanzia prezzo in mesi',
        },
        green_badge: {
          type: 'boolean',
          description: 'true se 100% rinnovabile certificata',
        },
        target_segment: {
          type: 'string',
          enum: ['domestico', 'microimpresa', 'altro_uso'],
        },
        source_url: { type: 'string' },
        raw_notes: {
          type: 'string',
          description: 'Note aggiuntive utili (es. promozioni, penali)',
        },
      },
      required: [
        'supplier',
        'offer_name',
        'energy_type',
        'price_type',
        'price_component',
        'green_badge',
        'target_segment',
        'source_url',
      ],
    },
  },
]

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `Sei un agente di raccolta dati di mercato per EnergyBid, una piattaforma italiana che aiuta PMI a ottimizzare i contratti energetici.

Il tuo compito: trovare offerte luce e gas attive sul Portale Offerte ARERA (ilportaleofferte.it), estrarle in formato strutturato, e salvarle nel database EnergyBid.

TARGET PRIORITARIO: offerte per microimprese (PMI fino a 15 kW per luce, 200.000 Smc/anno per gas).

PROCESSO:
1. Inizia chiamando search_arera_portal per luce + microimpresa, poi gas + microimpresa
2. Per ogni URL ritornato, valuta se vale la pena approfondire (max 3-5 offerte per categoria)
3. Chiama fetch_offer_page per le offerte più interessanti
4. Estrai i dati e chiama save_offer per ogni offerta valida
5. Quando hai salvato 3-4 offerte di buona qualità, termina

REGOLE:
- Salva SOLO offerte chiaramente identificabili (fornitore + nome + prezzo)
- Se una pagina è ambigua o incompleta, NON salvare (qualità > quantità)
- Per offerte PLACET, usa price_type "placet"
- Annota in raw_notes informazioni utili come: sconti, penali, modalità pagamento richiesta
- Pensa a voce alta in italiano prima di chiamare un tool

LIMITI:
- Massimo 15 iterazioni totali
- Se un tool fallisce, prova un approccio alternativo, non insistere
- Se non trovi offerte di qualità, meglio salvarne 3 buone che 10 cattive`


// ============================================================
// TOOL EXECUTORS
// Le funzioni che eseguono davvero i tool quando l'agente li chiama.
// ============================================================

/**
 * search_arera_portal: usa una sotto-chiamata Claude con web_search
 * per trovare URL di offerte sul Portale ARERA.
 *
 * In produzione si sostituirebbe con uno scraper backend vero.
 */
async function execSearchAreraPortal({ energy_type, segment }) {
  // Strategia: cerchiamo offerte direttamente sui siti dei principali
  // fornitori italiani, perché il Portale ARERA è un'app dinamica le
  // cui pagine offerta non sono indicizzate via web search.
  // Per fonte istituzionale c'è sempre la Scheda di Confrontabilità
  // (PDF) che ARERA obbliga ogni fornitore a pubblicare.

  const isLuce = energy_type === 'luce' || energy_type === 'dual'
  const isMicroimpresa = segment === 'microimpresa'

  // Query mirate per ottenere risultati buoni
  const queries = []
  if (isLuce && isMicroimpresa) {
    queries.push(
      'offerta luce business microimpresa partita iva 2026',
      'tariffa elettrica PMI piccola impresa prezzo fisso',
      'scheda confrontabilità ARERA offerta luce non domestico'
    )
  } else if (isLuce) {
    queries.push('offerta luce domestico mercato libero 2026 prezzo fisso')
  } else {
    queries.push('offerta gas business PMI 2026 mercato libero')
  }

  const allUrls = []

  for (const q of queries.slice(0, 2)) {
    try {
      const data = await callAnthropic({
        model: MODEL,
        maxTokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `Cerca su Google: "${q}". Trova 3-4 pagine di OFFERTE energetiche specifiche di fornitori italiani (es. Enel Energia, Eni Plenitude, Edison, A2A, Sorgenia, Illumia, Acea, Iren). Cerca pagine prodotto/offerta con prezzi. Per ognuna scrivi UNA RIGA con solo l'URL completo, niente altro. Niente intro, niente prosa, niente bullet, niente markdown. Solo URL, una per riga.`,
          },
        ],
      })

      const text = data.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')

      // Parser permissivo: estrai qualsiasi URL http(s) dal testo
      const urlRegex = /https?:\/\/[^\s\)\]\>\"\'<]+/g
      const found = text.match(urlRegex) || []
      for (const url of found) {
        // Filtra URL che chiaramente non sono pagine offerta
        if (url.includes('google.com') || url.includes('youtube.com')) continue
        if (url.includes('arera.it')) continue // pagine info, non offerte
        if (!allUrls.find((u) => u.url === url)) {
          allUrls.push({ url, preview: `Risultato per "${q}"` })
        }
      }
    } catch (e) {
      // Continua con la query successiva se una fallisce
      console.warn(`Search fallita per "${q}":`, e.message)
    }
  }

  return { urls: allUrls.slice(0, 6) }
}

/**
 * fetch_offer_page: usa Claude con web_search per leggere una pagina
 * di dettaglio offerta ed estrarre il contenuto rilevante.
 */
async function execFetchOfferPage({ url }) {
  const data = await callAnthropic({
    model: MODEL,
    maxTokens: 1500,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [
      {
        role: 'user',
        content: `Visita questa pagina ed estrai TUTTI i dettagli sull'offerta energetica: ${url}

Cerca: fornitore, nome offerta, tipo prezzo (fisso/variabile/PLACET), componenti di prezzo, quota fissa, durata, badge verde/rinnovabile, segmento (domestico/microimpresa), eventuali sconti o penali.

Ritorna tutte le informazioni rilevanti in formato testo.`,
      },
    ],
  })

  const content = data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')

  return { content: content.slice(0, 1500) }
}

// save_offer NON ha un executor remoto: lo gestiamo localmente
// nel loop principale (salviamo in localStorage tramite callback).

// ============================================================
// AGENT LOOP — IL CUORE
// ============================================================

/**
 * Esegue il loop dell'agente Market Watcher.
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.onLog - chiamato per ogni evento (thought, tool_call, ...)
 * @param {Function} callbacks.onOfferSaved - chiamato quando un'offerta viene salvata
 * @param {number} maxIterations - limite di sicurezza
 * @returns {Promise<{offers, log, iterations, stopped_reason}>}
 */
export async function runMarketWatcherAgent(
  { onLog, onOfferSaved },
  maxIterations = 8
) {
  const offers = []
  const log = []

  const addLog = (entry) => {
    const full = { ...entry, timestamp: new Date().toISOString() }
    log.push(full)
    onLog?.(full)
  }

  addLog({
    type: 'thought',
    message: 'Agente avviato. Sto pianificando la strategia di ricerca.',
  })

  // Storia della conversazione: cresce ad ogni iterazione
  const messages = [
    {
      role: 'user',
      content:
        'Inizia la sessione di raccolta. Trova e salva 5-10 offerte di qualità per microimprese (mix luce e gas). Lavora in modo metodico.',
    },
  ]

  let iteration = 0
  let stoppedReason = 'max_iterations_reached'

  while (iteration < maxIterations) {
    iteration++

    // ─── 1. Chiama il modello con la storia attuale ───
    let response
    try {
      response = await callAnthropic({
        model: MODEL,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
        maxTokens: 2000,
      })
    } catch (e) {
      addLog({ type: 'error', message: `Errore API: ${e.message}` })
      stoppedReason = 'api_error'
      break
    }

    // ─── 2. Logga i pensieri del modello (blocchi text) ───
    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim()) {
        addLog({ type: 'thought', message: block.text.trim() })
      }
    }

    // ─── 3. Aggiungi la risposta dell'assistant alla storia ───
    messages.push({ role: 'assistant', content: response.content })

    // ─── 4. Se il modello ha finito (no tool call), esci ───
    if (response.stop_reason === 'end_turn') {
      stoppedReason = 'agent_finished'
      addLog({
        type: 'done',
        message: `Agente terminato. ${offers.length} offerte salvate.`,
      })
      break
    }

    // ─── 5. Esegui i tool call richiesti dal modello ───
    const toolResults = []

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue

      addLog({
        type: 'tool_call',
        message: `Chiamata tool: ${block.name}`,
        data: block.input,
      })

      try {
        let result

        if (block.name === 'search_arera_portal') {
          result = await execSearchAreraPortal(block.input)
          addLog({
            type: 'tool_result',
            message: `Trovati ${result.urls.length} URL`,
            data: result.urls,
          })
        } else if (block.name === 'fetch_offer_page') {
          result = await execFetchOfferPage(block.input)
          addLog({
            type: 'tool_result',
            message: `Pagina recuperata (${result.content.length} caratteri)`,
          })
        } else if (block.name === 'save_offer') {
          const offer = {
            ...block.input,
            scraped_at: new Date().toISOString(),
          }
          offers.push(offer)
          onOfferSaved?.(offer)
          addLog({
            type: 'offer_saved',
            message: `Offerta salvata: ${offer.supplier} - ${offer.offer_name}`,
            data: offer,
          })
          result = { success: true, total_saved: offers.length }
        } else {
          throw new Error(`Tool sconosciuto: ${block.name}`)
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        })
      } catch (e) {
        addLog({
          type: 'error',
          message: `Errore in ${block.name}: ${e.message}`,
        })
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify({ error: e.message }),
          is_error: true,
        })
      }
    }

    // ─── 6. Manda i risultati al modello e continua il loop ───
    messages.push({ role: 'user', content: toolResults })
  }

  return {
    offers,
    log,
    iterations: iteration,
    stopped_reason: stoppedReason,
  }
}