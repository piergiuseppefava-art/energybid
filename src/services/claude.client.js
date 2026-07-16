/**
 * Claude Client (Frontend)
 * Wrapper frontend per le chiamate Claude API.
 */

import { callAnthropic } from '../utils/anthropic'

const MODEL = 'claude-sonnet-4-6'

class ClaudeClient {
  async _call(messages, maxTokens = 1024) {
    const data = await callAnthropic({ model: MODEL, messages, maxTokens })
    const block = data?.content?.[0]
    if (!block || block.type !== 'text' || typeof block.text !== 'string') {
      throw new Error('Risposta AI non valida — riprova tra qualche secondo')
    }
    return block.text.trim()
  }

  async extractBolletta(base64Data, mediaType = 'application/pdf') {
    const isImage = mediaType.startsWith('image/')
    const contentBlock = isImage
      ? { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } }
      : { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } }

    const text = await this._call([{
      role: 'user',
      content: [
        contentBlock,
        {
          type: 'text',
          text: `Sei un esperto di bollette elettriche italiane. Estrai i dati con la massima precisione.
Fasce: F1 (lun-ven 8-19), F2 (lun-ven 7-8 e 19-23, sab 7-23), F3 (notti e domeniche).
Rispondi SOLO con questo JSON senza markdown:
{
  "f1": <numero kWh>,
  "f2": <numero kWh>,
  "f3": <numero kWh>,
  "pc": <numero €/kWh con 4 decimali>,
  "fornitore": "<stringa>",
  "periodo": "<stringa, es: Marzo 2026>"
}`,
        },
      ],
    }])
    try {
      return JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
      throw new Error("Impossibile leggere i dati dalla bolletta — riprova con un'immagine più nitida")
    }
  }

  async generateStatuto(cer, organizzazione) {
    return await this._call([{
      role: 'user',
      content: `Sei un esperto di diritto associativo italiano e di Comunità Energetiche Rinnovabili (CER) ai sensi del D.Lgs. 199/2021 e del DM CACER del 7 dicembre 2023.

Genera lo Statuto Associativo per una CER costituita come ${cer.formaGiuridica} con i seguenti dati:

DENOMINAZIONE: ${cer.nome}
SEDE: ${cer.indirizzoSede}, ${cer.cap} ${cer.provincia}
CABINA PRIMARIA: ${cer.cabinaPrimaria}
POTENZA: ${cer.potenzaTotaleKw} kW
TIPOLOGIA: ${cer.tipologiaImpianto}
MEMBRI: ${cer.numeroMembri}
PROPONENTE: ${organizzazione.nome} (P.IVA ${organizzazione.partitaIva || 'da inserire'})

Includi: denominazione/sede/durata, scopo (art. 31 D.Lgs. 199/2021), requisiti soci, diritti/doveri, organi (Assemblea, Consiglio Direttivo, Presidente), patrimonio, ripartizione incentivi GSE, recesso/esclusione, scioglimento, disposizioni finali.

Markdown con articoli numerati (Art. 1, Art. 2...). Tono giuridico italiano formale. Min 1500 parole. Nessun placeholder.`,
    }], 4096)
  }

  async generateRegolamento(cer, organizzazione) {
    return await this._call([{
      role: 'user',
      content: `Genera Regolamento Interno operativo per CER ${cer.nome} (${cer.potenzaTotaleKw} kW, ${cer.numeroMembri} membri).
Proponente: ${organizzazione.nome} (P.IVA ${organizzazione.partitaIva || 'da inserire'})

Includi: adesione nuovi membri, registrazione GSE, misurazione energia condivisa, calcolo/ripartizione incentivi mensili, comunicazione interna, contributi straordinari, reclami, trasparenza, dismissione impianto, GDPR.

Riferimenti: D.Lgs. 199/2021, DM CACER 7/12/2023, Regole Operative GSE.
Markdown con sezioni numerate. Min 1200 parole.`,
    }], 4096)
  }

  async generateLetteraDistributore(cer, organizzazione) {
    return await this._call([{
      role: 'user',
      content: `Genera lettera formale al distributore di energia elettrica.

CER: ${cer.nome}
Proponente: ${organizzazione.nome}
Sede: ${cer.indirizzoSede}, ${cer.cap} ${cer.provincia}
Cabina presunta: ${cer.cabinaPrimaria}
Potenza: ${cer.potenzaTotaleKw} kW

Cita D.Lgs. 199/2021 e DM CACER 7/12/2023. Richiedi: conferma cabina primaria, elenco POD afferenti, disponibilità di rete. Includi data, luogo, firma legale rappresentante. Tono formale italiano.

Markdown. 300-500 parole.`,
    }], 2048)
  }

  async generateChecklistGSE(cer, organizzazione) {
    return await this._call([{
      role: 'user',
      content: `Genera checklist completa per registrazione CER presso GSE e contributo PNRR Invitalia.

CER: ${cer.nome}, ${cer.potenzaTotaleKw} kW, ${cer.tipologiaImpianto}, ${cer.numeroMembri} membri.
Proponente: ${organizzazione.nome} (P.IVA ${organizzazione.partitaIva || 'da inserire'})

Sezioni:
1. Documenti preliminari (atto costitutivo, statuto, RUNTS)
2. Registrazione portale GSE (SPID, anagrafica, POD)
3. Registrazione impianto (documentazione tecnica, TICA)
4. Tariffa Incentivante
5. Contributo PNRR (comuni < 5000 ab)
6. Post-attivazione (comunicazioni mensili, rendicontazione)

Per ogni voce: documento, ente, tempistica, note operative.
Markdown con checkbox [ ]. Min 1000 parole.`,
    }], 4096)
  }

  /**
   * MODULO ESG — Genera report completo
   */
  async generateReportESG(organizzazione, risposte, score, indicators) {
    const ateco = organizzazione.settoreAteco || 'altro'
    const dipendenti = organizzazione.numeroDipendenti || 'non dichiarato'

    // Costruisci contesto risposte in formato leggibile
    const rispostePerCategoria = { E: [], S: [], G: [] }
    indicators.forEach(ind => {
      const r = risposte[ind.id]
      if (r === undefined || r === null || r === '') return
      let display = r
      if (ind.type === 'boolean') display = r ? 'Sì' : 'No'
      else if (ind.type === 'percentage') display = `${r}%`
      else if (ind.unit) display = `${r} ${ind.unit}`
      rispostePerCategoria[ind.category].push(`- ${ind.question}: ${display}`)
    })

    return await this._call([{
      role: 'user',
      content: `Sei un esperto consulente ESG specializzato in PMI italiane e standard MEF-ABI per il rating bancario.

Genera un Report ESG professionale da consegnare a una banca per la valutazione del merito creditizio.

ORGANIZZAZIONE
- Nome: ${organizzazione.nome}
- P.IVA: ${organizzazione.partitaIva || 'non dichiarata'}
- Settore ATECO: ${ateco}
- Dipendenti: ${dipendenti}

SCORE ESG CALCOLATI
- Environmental: ${score.E}/100
- Social: ${score.S}/100
- Governance: ${score.G}/100
- Score totale: ${score.total}/100
- Classe: ${score.classe}

RISPOSTE FORNITE

Environmental:
${rispostePerCategoria.E.join('\n') || '- Nessun dato fornito'}

Social:
${rispostePerCategoria.S.join('\n') || '- Nessun dato fornito'}

Governance:
${rispostePerCategoria.G.join('\n') || '- Nessun dato fornito'}

STRUTTURA DEL REPORT (segui esattamente):

1. EXECUTIVE SUMMARY
   - Sintesi della performance ESG
   - Posizionamento rispetto al settore
   - Punti di forza e aree di miglioramento principali

2. PROFILO ORGANIZZAZIONE
   - Anagrafica e settore di attività
   - Caratteristiche dimensionali

3. ANALISI DIMENSIONE ENVIRONMENTAL (E)
   - Score: ${score.E}/100
   - Analisi dettagliata indicatori chiave
   - Confronto con benchmark settore ATECO ${ateco}
   - Criticità emerse e raccomandazioni

4. ANALISI DIMENSIONE SOCIAL (S)
   - Score: ${score.S}/100
   - Analisi capitale umano, sicurezza, parità
   - Raccomandazioni operative

5. ANALISI DIMENSIONE GOVERNANCE (G)
   - Score: ${score.G}/100
   - Analisi compliance e assetto organizzativo
   - Conformità a normative chiave (231, GDPR, Whistleblowing)

6. CONCLUSIONI E RATING
   - Score totale: ${score.total}/100 — Classe ${score.classe}
   - Implicazioni per accesso al credito
   - Tassi agevolati potenzialmente accessibili (green loan, sustainability-linked)

7. ROADMAP DI MIGLIORAMENTO
   - 3-5 azioni prioritarie ad alto impatto
   - Tempistiche di implementazione
   - Investimenti stimati

8. METODOLOGIA
   - Riferimento Linee Guida MEF-ABI
   - Note metodologiche su scoring

Tono: professionale, tecnico-finanziario, oggettivo. Lingua italiana formale.
Lunghezza: 2500-3500 parole.
Formato: Markdown con titoli, sottotitoli, tabelle dove utile, elenchi puntati.

Rispondi direttamente con il report, senza preambolo.`,
    }], 8000)
  }
}

const claudeClient = new ClaudeClient()
export default claudeClient
