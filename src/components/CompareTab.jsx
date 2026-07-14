import { useMemo, useState } from 'react'
import { calcCostoOfferta, fmt } from '../utils/calc'
import { OFFERTE, ULTIMO_AGGIORNAMENTO, PUN_RIFERIMENTO, FONTE_DATI, FONTE_URL } from '../data/offerte'
import GreenBadge from './GreenBadge'
import PremiumVerde from './PremiumVerde'
import styles from './CompareTab.module.css'

function StrategyBox({ label, offerta, t }) {
  return (
    <div className={styles.strategyBox}>
      <div className={styles.strategyLabel}>{label}</div>
      <div className={styles.strategyName}>{offerta.fornitore} — {offerta.nome}</div>
      <div className={styles.strategyPrice}>{fmt(offerta.annual)} {t.perYear}</div>
    </div>
  )
}

export default function CompareTab({ inputs, t, tPremium, lang = 'it' }) {
  const [filtroGreen, setFiltroGreen] = useState(false)
  const { consumoAnnuo } = inputs

  const offerte = filtroGreen ? OFFERTE.filter(o => o.green) : OFFERTE

  const results = useMemo(() =>
    offerte.map((o) => ({
      ...o,
      annual: calcCostoOfferta(consumoAnnuo, o, PUN_RIFERIMENTO),
    })).sort((a, b) => a.annual - b.annual),
    [consumoAnnuo, offerte]
  )

  const best = results[0]?.annual ?? 0
  const worst = results[results.length - 1]?.annual ?? 0
  const maxCost = Math.max(...results.map((r) => r.annual), 0.01)

  const strategia = useMemo(() => {
    const fisse = OFFERTE.filter(o => o.tipo === 'fissa')
      .map(o => ({ ...o, annual: calcCostoOfferta(consumoAnnuo, o, PUN_RIFERIMENTO) }))
      .sort((a, b) => a.annual - b.annual)
    const indicizzate = OFFERTE.filter(o => o.tipo === 'indicizzata')
      .map(o => ({ ...o, annual: calcCostoOfferta(consumoAnnuo, o, PUN_RIFERIMENTO) }))
      .sort((a, b) => a.annual - b.annual)
    if (!fisse.length || !indicizzate.length) return null

    const migliorFissa = fisse[0]
    const migliorIndicizzata = indicizzate[0]
    const diff = Math.abs(migliorIndicizzata.annual - migliorFissa.annual)
    const convieneIndicizzata = migliorIndicizzata.annual < migliorFissa.annual

    return { migliorFissa, migliorIndicizzata, diff, convieneIndicizzata }
  }, [consumoAnnuo])

  return (
    <div className={styles.wrap}>
      <div className={styles.sourceBanner}>
        {t.sourceBanner(FONTE_DATI)}{' '}
        <a href={FONTE_URL} target="_blank" rel="noopener noreferrer">{FONTE_URL}</a>
        {' '}· {t.lastUpdate} {ULTIMO_AGGIORNAMENTO}
      </div>

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
              <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>PUN</span>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--amber)' }}>{PUN_RIFERIMENTO} €/kWh</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
              {t.fonte} <a href={FONTE_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', textDecoration: 'none' }}>{FONTE_DATI}</a> · {ULTIMO_AGGIORNAMENTO}
            </div>
          </div>
        </div>

        {results.length > 1 && (
          <div className={styles.summaryCard}>
            <div className={styles.cardTitle}>{t.risparmio}</div>
            <div className={styles.bigNum} style={{ color: 'var(--green)' }}>
              +{fmt(worst - best)} €/anno
            </div>
            <div className={styles.bigSub}>
              {t.scegliendo(results[0]?.nome)}
            </div>
          </div>
        )}

        <PremiumVerde inputs={inputs} t={tPremium} />
      </div>

      <div className={styles.right}>
        {strategia && (
          <div className={styles.strategyCard}>
            <div className={styles.cardTitle}>{t.strategyTitle}</div>
            <div className={styles.strategyGrid}>
              <StrategyBox label={t.strategyFissa} offerta={strategia.migliorFissa} t={t} />
              <StrategyBox label={t.strategyIndicizzata} offerta={strategia.migliorIndicizzata} t={t} />
            </div>
            <div className={styles.strategyVerdict}>
              {strategia.convieneIndicizzata
                ? t.strategyVerdictIndicizzata(strategia.migliorIndicizzata.nome, strategia.migliorFissa.nome, fmt(strategia.diff))
                : t.strategyVerdictFissa(strategia.migliorFissa.nome, strategia.migliorIndicizzata.nome, fmt(strategia.diff))
              }
            </div>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardTitle}>{t.title(results.length)}</div>
          {results.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>{t.nessuna}</p>
          ) : (
            <div className={styles.tableWrap}>
              {results.map((r, i) => {
                const isBest = i === 0
                const pct = Math.round((r.annual / maxCost) * 100)
                return (
                  <div key={r.id} className={`${styles.resultRow} ${isBest ? styles.bestRow : ''}`}>
                    <div className={styles.rank} style={{ color: isBest ? 'var(--amber)' : 'var(--text3)' }}>
                      {isBest ? '★' : `${i + 1}`}
                    </div>
                    <div className={styles.rMain}>
                      <div className={styles.rNameRow}>
                        <span className={styles.rName}>{r.fornitore} — {r.nome}</span>
                        {isBest && <span className={styles.bestBadge}>{t.migliore}</span>}
                      </div>
                      <div className={styles.rMeta}>
                        <span className={`${styles.badgeTipo} ${r.tipo === 'fissa' ? styles.badgeFissa : styles.badgeIndicizzata}`}>
                          {r.tipo === 'fissa' ? t.fisso : t.indicizzato}
                        </span>
                        <span className={styles.rDurata}>{r.durataMesi ? t.durataMesi(r.durataMesi) : t.senzaVincolo}</span>
                        <span className={styles.rQuota}>{t.quotaFissa}: {fmt(r.quotaFissaAnnua, 0)} €/anno</span>
                      </div>
                      <div className={styles.rIdeale}>{r.idealePer}</div>
                      <GreenBadge green={r.green} lang={lang} />
                    </div>
                    <div className={styles.rNums}>
                      <span className={styles.rMonth}>{fmt(r.annual)} €/anno</span>
                      <span className={styles.rYear}>~{fmt(r.annual / 12)} €/mese</span>
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
