# ⚡ EnergyBid — PMI Energy Tool

![CI](https://github.com/piergiuseppefava-art/energybid/actions/workflows/ci.yml/badge.svg)

Strumento web per aiutare le PMI italiane a scegliere l'offerta energetica giusta, valutare l'accesso a una Comunità Energetica Rinnovabile e misurare il proprio profilo ESG — in un'unica interfaccia.

**Demo live:** [energybid.vercel.app](https://energybid.vercel.app)

## Funzionalità

- **EnergyBid / Offerte** — analisi dei consumi per fascia oraria F1/F2/F3, confronto tra contratto attuale e riferimento PUN, ranking automatico delle offerte di mercato con calcolo del risparmio annuo stimato
- **CER Navigator** — guida alla valutazione di una Comunità Energetica Rinnovabile: requisiti, stato di avanzamento e badge green
- **ESG Scoring** — questionario ESG guidato con generazione di un report (assistita da AI) esportabile in PDF

## Stack tecnico

- **React 19 + Vite** — UI e build tool
- **Anthropic Claude API** — generazione del report ESG, tramite funzione serverless su Vercel (`/api`)
- **Recharts** — grafici e visualizzazione dello storico consumi
- **jsPDF** — export del report ESG in PDF
- **react-markdown** — rendering dei contenuti generati dall'AI
- **Upstash Redis** — rate limiting delle chiamate API
- **localStorage** — persistenza locale dei dati, zero backend/database richiesto

## Fonte dati

Le offerte energetiche business incluse nell'app provengono dal **Portale Offerte** di ARERA / Acquirente Unico (Open Data). Il valore PUN di riferimento è aggiornato manualmente e non in tempo reale — vedi note sotto.

## Come avviare in locale

```bash
npm install
npm run dev
```

> Le funzionalità basate su AI (generazione report ESG) richiedono le funzioni serverless in `/api` e funzionano solo dopo il deploy su Vercel (o con `vercel dev` in locale) — il solo dev server di Vite non le esegue.

## Test

Test automatici sulle funzioni di calcolo core (`src/utils/calc.js`), con [Vitest](https://vitest.dev):

```bash
npm run test
```

## Deploy su Vercel

### Opzione 1 — Vercel CLI (raccomandato)
```bash
npm install -g vercel
vercel
```

### Opzione 2 — GitHub + Vercel UI
1. Carica questo progetto su un repository GitHub
2. Vai su [vercel.com](https://vercel.com) → "Add New Project"
3. Importa il repository
4. Lascia le impostazioni di default (Vite viene rilevato automaticamente)
5. Clicca "Deploy"

### Opzione 3 — Drag & Drop
1. Esegui `npm run build`
2. Vai su [vercel.com/new](https://vercel.com/new)
3. Trascina la cartella `dist/` nella pagina

## Note sul dominio energia

- **PUN** (Prezzo Unico Nazionale): prezzo di riferimento del mercato all'ingrosso GME
- **Fasce F1/F2/F3**: suddivisione oraria ARERA per la tariffazione dell'energia
- I prezzi PUN reali sono disponibili su [mercatoelettrico.org](https://www.mercatoelettrico.org)
- Per uso commerciale dei dati GME è richiesto un accordo ufficiale con il Gestore

## Roadmap

- [ ] Integrazione dati PUN in tempo reale via API GME
- [ ] Export PDF del report mensile
- [ ] Supporto multi-azienda
- [ ] Calcolo oneri di sistema e imposte

## Disclaimer

Progetto dimostrativo/portfolio, non ancora pronto per uso commerciale. I prezzi dei fornitori, i valori PUN e i dati ESG mostrati sono indicativi e non aggiornati in tempo reale. EnergyBid non è un consulente energetico autorizzato: per decisioni contrattuali consulta un professionista o verifica i dati direttamente sul [Portale Offerte](https://www.ilportaleofferte.it).

---

Progetto portfolio di Piergiuseppe Fava — Ingegneria Gestionale, Politecnico di Milano
