# ⚡ EnergyBid — PMI Energy Tool

Strumento per aiutare le PMI italiane a ottimizzare l'acquisto di energia sul mercato libero.

## Funzionalità

- **Calcolo** consumi per fascia oraria F1/F2/F3 con confronto contratto attuale vs PUN
- **Confronto offerte** multiple con ranking automatico e calcolo risparmio annuo
- **Storico mensile** con grafico e tabella delta costi
- **Persistenza locale** via localStorage — zero backend richiesto

## Stack

- React 19 + Vite
- Recharts (grafici)
- CSS Modules
- localStorage per la persistenza

## Sviluppo locale

```bash
npm install
npm run dev
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

---

Progetto portfolio di Piergiuseppe Fava — Ingegneria Gestionale, Politecnico di Milano
