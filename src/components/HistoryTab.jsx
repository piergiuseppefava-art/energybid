import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmt, fmtSign } from '../utils/calc'
import styles from './HistoryTab.module.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.ttLabel}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: 13, fontFamily: 'DM Mono, monospace' }}>
          {p.name}: {fmt(p.value)} €
        </div>
      ))}
    </div>
  )
}

export default function HistoryTab({ history, onClear, t }) {
  if (!history.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📊</div>
        <div className={styles.emptyTitle}>{t.empty}</div>
        <div className={styles.emptySub}>{t.emptySub}</div>
      </div>
    )
  }

  const chartData = [...history].reverse()
  const totalSaving = history.reduce((s, h) => s + (h.costoAttuale - h.costoPunRiferimento), 0)
  const avgKwh = Math.round(history.reduce((s, h) => s + h.consumoAnnuo, 0) / history.length)

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t.risparmio}</div>
          <div className={styles.statVal} style={{ color: totalSaving >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {fmtSign(totalSaving)} €
          </div>
          <div className={styles.statSub}>{t.risparmioSub}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t.mesi}</div>
          <div className={styles.statVal}>{history.length}</div>
          <div className={styles.statSub}>{t.mesiSub(Math.min(history.length, 24))}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t.consumo}</div>
          <div className={styles.statVal}>{avgKwh}</div>
          <div className={styles.statSub}>{t.consumoSub}</div>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.cardTitle}>{t.chartTitle}</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="30%">
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#555', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#555', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#888' }}>{v}</span>} />
            <Bar dataKey="costoAttuale" name={t.attuale} fill="#4a9eff" radius={[3, 3, 0, 0]} />
            <Bar dataKey="costoPunRiferimento" name={t.pun} fill="#2ecc71" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.cardTitle}>{t.tableTitle}</div>
        <div className={styles.tableHead}>
          <span>{t.mese}</span><span>{t.kwh}</span><span>{t.attuale}</span><span>{t.pun}</span><span>{t.diff}</span>
        </div>
        {history.map((h) => {
          const delta = h.costoAttuale - h.costoPunRiferimento
          return (
            <div key={h.id} className={styles.tableRow}>
              <span className={styles.tMonth}>{h.label}</span>
              <span className={styles.tNum}>{h.consumoAnnuo}</span>
              <span className={styles.tNum}>{fmt(h.costoAttuale)} €</span>
              <span className={styles.tNum}>{fmt(h.costoPunRiferimento)} €</span>
              <span className={styles.tNum} style={{ color: Math.abs(delta) < 0.5 ? 'var(--text3)' : delta > 0 ? 'var(--green)' : 'var(--red)' }}>
                {fmtSign(delta)} €
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ paddingBottom: '2rem' }}>
        <button className={styles.clearBtn} onClick={() => { if (confirm(t.conferma)) onClear() }}>
          {t.cancella}
        </button>
      </div>
    </div>
  )
}
