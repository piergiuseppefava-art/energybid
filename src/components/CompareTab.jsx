import { useMemo, useState } from 'react'
import { calcOfferCost, fmt } from '../utils/calc'
import { OFFERTE, ULTIMO_AGGIORNAMENTO, PUN_RIFERIMENTO } from '../data/offerte'
import GreenBadge from './GreenBadge'
import PremiumVerde from './PremiumVerde'
import styles from './CompareTab.module.css'

export default function CompareTab({ inputs, t, tPremium, lang = 'it' }) {
  const [filtroGreen, setFiltroGreen] = useState(false)

  const offerte = filtroGreen ? OFFERTE.filter(o => o.green) : OFFERTE

  const results = useMemo(() =>
    offerte.map((o) => ({
      ...o,
      monthly: calcOfferCost(inputs, o),
      annual: calcOfferCost(inputs, o) * 12,
    })).sort((a, b) => a.monthly - b.monthly),
    [inputs, offerte]
  )

  const best = results[0]?.monthly ?? 0
  const worst = results[results.length - 1]?.monthly ?? 0
  const maxCost = Math.max(...results.map((r) => r.monthly), 0.01)

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>{t.filtri}</div>
          <button
            className={`${styles.filterBtn} ${filtroGreen ? styles.filterActive : ''}`}
            onClick={() => setFiltroGreen(p => !p)}
          >
            {filtroGreen ? '✓' : '○'} {t.soloVerde}
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>{t.punRef}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>F1</span>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--amber)' }}>{PUN_RIFERIMENTO.f1} €/kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>F3</span>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--amber)' }}>{PUN_RIFERIMENTO.f3} €/kWh</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
              {t.fonte} <a href="https://www.mercatoelettrico.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', textDecoration: 'none' }}>GME</a> · {ULTIMO_AGGIORNAMENTO}
            </div>
          </div>
        </div>

        {results.length > 1 && (
          <div className={styles.summaryCard}>
            <div className={styles.cardTitle}>{t.risparmio}</div>
            <div className={styles.bigNum} style={{ color: 'var(--green)' }}>
              +{fmt((worst - best) * 12)} €/anno
            </div>
            <div className={styles.bigSub}>
              {t.scegliendo(<strong>{results[0]?.name}</strong>)}
            </div>
          </div>
        )}

        <PremiumVerde inputs={inputs} t={tPremium} />
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>{t.title(results.length)}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginBottom: '1rem' }}>
            {t.lastUpdate} {ULTIMO_AGGIORNAMENTO} · {t.fonte} {t.sourceNote}
          </div>
          {results.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>{t.nessuna}</p>
          ) : (
            <div className={styles.tableWrap}>
              {results.map((r, i) => {
                const isBest = i === 0
                const pct = Math.round((r.monthly / maxCost) * 100)
                return (
                  <div key={r.id} className={`${styles.resultRow} ${isBest ? styles.bestRow : ''}`}>
                    <div className={styles.rank} style={{ color: isBest ? 'var(--amber)' : 'var(--text3)' }}>
                      {isBest ? '★' : `${i + 1}`}
                    </div>
                    <div className={styles.rMain}>
                      <div className={styles.rNameRow}>
                        <span className={styles.rName}>{r.name}</span>
                        {isBest && <span className={styles.bestBadge}>{t.migliore}</span>}
                      </div>
                      <div className={styles.rMeta}>
                        <span className={styles.rTipo}>{r.tipo} · {r.durata}</span>
                      </div>
                      <GreenBadge green={r.green} fonte={r.fonte} go_certificata={r.go_certificata} provenienza={r.provenienza} lang={lang} />
                    </div>
                    <div className={styles.rNums}>
                      <span className={styles.rMonth}>{fmt(r.monthly)} €/mese</span>
                      <span className={styles.rYear}>{fmt(r.annual)} €/anno</span>
                      {r.link && (
                        <a href={r.link} target="_blank" rel="noopener noreferrer" className={styles.rLink}>
                          {t.attiva}
                        </a>
                      )}
                    </div>
                    <div className={styles.rBar}>
                      <div className={styles.rTrack}>
                        <div
                          className={styles.rFill}
                          style={{
                            width: `${pct}%`,
                            background: isBest ? 'var(--green)' : r.green ? 'rgba(46,204,113,0.3)' : 'var(--border2)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
