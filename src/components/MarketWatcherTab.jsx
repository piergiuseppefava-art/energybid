/**
 * MarketWatcherTab
 *
 * Pagina admin di EnergyBid per triggerare manualmente l'agente
 * Market Watcher e visualizzare in tempo reale:
 *  - il ragionamento dell'agente (log live a sinistra)
 *  - le offerte raccolte (card a destra)
 *  - lo storico esecuzioni (tabella in basso)
 *
 * Salvataggio offerte: localStorage (key: energybid_market_offers)
 * Storico run: localStorage (key: energybid_market_runs)
 *
 * Per integrare con CompareTab: basta leggere energybid_market_offers
 * dallo stesso localStorage.
 */

import { useState, useEffect, useRef } from 'react'
import { runMarketWatcherAgent } from '../services/marketWatcherAgent'
import styles from './MarketWatcherTab.module.css'

const STORAGE_KEY_OFFERS = 'energybid_market_offers'
const STORAGE_KEY_RUNS = 'energybid_market_runs'

export default function MarketWatcherTab() {
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const [offers, setOffers] = useState([])
  const [runHistory, setRunHistory] = useState([])
  const logEndRef = useRef(null)

  // Carica offerte e history da localStorage all'avvio
  useEffect(() => {
    const savedOffers = localStorage.getItem(STORAGE_KEY_OFFERS)
    if (savedOffers) {
      try {
        setOffers(JSON.parse(savedOffers))
      } catch (e) {
        console.error('Errore parsing offerte salvate', e)
      }
    }
    const savedRuns = localStorage.getItem(STORAGE_KEY_RUNS)
    if (savedRuns) {
      try {
        setRunHistory(JSON.parse(savedRuns))
      } catch (e) {
        console.error('Errore parsing storico run', e)
      }
    }
  }, [])

  // Auto-scroll del log man mano che arrivano nuovi eventi
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const handleRun = async () => {
    setRunning(true)
    setLog([])

    try {
      const result = await runMarketWatcherAgent({
        onLog: (entry) => setLog((prev) => [...prev, entry]),
        onOfferSaved: (offer) => {
          setOffers((prev) => {
            const updated = [...prev, offer]
            localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(updated))
            return updated
          })
        },
      })

      const summary = {
        timestamp: new Date().toISOString(),
        iterations: result.iterations,
        offers_count: result.offers.length,
        stopped_reason: result.stopped_reason,
      }
      setRunHistory((prev) => {
        const newHistory = [summary, ...prev].slice(0, 20)
        localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(newHistory))
        return newHistory
      })
    } catch (e) {
      setLog((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: 'error',
          message: `Errore fatale: ${e.message}`,
        },
      ])
    } finally {
      setRunning(false)
    }
  }

  const clearOffers = () => {
    if (window.confirm('Cancellare tutte le offerte salvate?')) {
      setOffers([])
      localStorage.removeItem(STORAGE_KEY_OFFERS)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>⚡ Energy Market Watcher</h2>
        <p className={styles.subtitle}>
          Agente AI che monitora il Portale Offerte ARERA e aggiorna il
          database offerte di EnergyBid
        </p>
      </div>

      <div className={styles.controlPanel}>
        <button
          onClick={handleRun}
          disabled={running}
          className={styles.runBtn}
        >
          {running ? '🔄 Agente in esecuzione...' : '▶ Esegui agente'}
        </button>
        <span className={styles.controlHint}>
          L'agente userà la API key configurata in <code>.env</code>
        </span>
      </div>

      <div className={styles.twoColumns}>
        {/* COLONNA SINISTRA: Live Agent Log */}
        <div>
          <h3 className={styles.sectionTitle}>
            🧠 Ragionamento dell'agente (live)
          </h3>
          <div className={styles.logBox}>
            {log.length === 0 && (
              <div className={styles.logEmpty}>
                Premi "Esegui agente" per vedere il ragionamento live...
              </div>
            )}
            {log.map((entry) => (
              <LogLine key={entry.timestamp} entry={entry} />
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* COLONNA DESTRA: Offerte salvate */}
        <div>
          <div className={styles.offersHeader}>
            <h3 className={styles.sectionTitle}>
              📋 Offerte raccolte ({offers.length})
            </h3>
            {offers.length > 0 && (
              <button onClick={clearOffers} className={styles.clearBtn}>
                Pulisci
              </button>
            )}
          </div>
          <div className={styles.offersBox}>
            {offers.length === 0 && (
              <div className={styles.logEmpty}>
                Nessuna offerta raccolta finora.
              </div>
            )}
            {offers
              .slice()
              .reverse()
              .map((offer) => (
                <OfferCard key={offer.source_url} offer={offer} />
              ))}
          </div>
        </div>
      </div>

      {/* RUN HISTORY */}
      {runHistory.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>📊 Storico esecuzioni</h3>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Iterazioni</th>
                <th>Offerte raccolte</th>
                <th>Esito</th>
              </tr>
            </thead>
            <tbody>
              {runHistory.map((r) => (
                <tr key={r.timestamp}>
                  <td>{new Date(r.timestamp).toLocaleString('it-IT')}</td>
                  <td>{r.iterations}</td>
                  <td>{r.offers_count}</td>
                  <td>{r.stopped_reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function LogLine({ entry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString('it-IT')
  const icons = {
    thought: '💭',
    tool_call: '🔧',
    tool_result: '📥',
    offer_saved: '✅',
    error: '❌',
    done: '🏁',
  }
  return (
    <div className={`${styles.logLine} ${styles[`logLine_${entry.type}`]}`}>
      <span className={styles.logTime}>{time}</span>
      <span className={styles.logIcon}>{icons[entry.type] || '•'}</span>
      <span className={styles.logMessage}>{entry.message}</span>
    </div>
  )
}

function OfferCard({ offer }) {
  return (
    <div className={styles.offerCard}>
      <div className={styles.offerHeader}>
        <span className={styles.offerSupplier}>{offer.supplier}</span>
        {offer.green_badge && (
          <span className={styles.greenBadge}>🌿 Verde</span>
        )}
      </div>
      <div className={styles.offerName}>{offer.offer_name}</div>
      <div className={styles.offerMeta}>
        <span className={styles.tag}>{offer.energy_type}</span>
        <span className={styles.tag}>{offer.price_type}</span>
        <span className={styles.tag}>{offer.target_segment}</span>
      </div>
      <div className={styles.offerPrice}>{offer.price_component}</div>
      {offer.fixed_fee_monthly !== undefined && (
        <div className={styles.offerDetail}>
          Quota fissa: €{offer.fixed_fee_monthly}/mese
        </div>
      )}
      {offer.duration_months !== undefined && (
        <div className={styles.offerDetail}>
          Durata: {offer.duration_months} mesi
        </div>
      )}
      {offer.raw_notes && (
        <div className={styles.offerNotes}>{offer.raw_notes}</div>
      )}
    </div>
  )
}
