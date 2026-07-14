import { useState, useMemo } from 'react'
import { useOrganization } from '../store/organization.store'
import { ESG_INDICATORS, calcolaScoreESG, contaRisposte, TOTAL_INDICATORS, getColorByClass, getColorByScore } from '../data/esg-indicators'
import { FATTORE_EMISSIONI } from '../data/offerte'
import ESGQuestionnaire from './ESGQuestionnaire'
import ESGReport from './ESGReport'
import ConfirmModal from './ConfirmModal'
import styles from './ESGTab.module.css'

export default function ESGTab({ t, lang }) {
  const [org, store] = useOrganization()
  const [view, setView] = useState('dashboard')
  const [confirmReset, setConfirmReset] = useState(false)

  const risposte = org.esg?.risposte || {}
  const completate = contaRisposte(risposte)
  const percentualeCompletamento = Math.round((completate / TOTAL_INDICATORS) * 100)

  const scoreCorrente = useMemo(() => {
    if (completate === 0) return null
    return calcolaScoreESG(risposte)
  }, [risposte, completate])

  // Auto-popolamento da bollette ed energia condivisa CER
  const datiAutomatici = useMemo(() => {
    const dati = {}

    // Da consumo annuo dichiarato (Profilo Consumi — manuale o da bolletta) o, in mancanza, stima da bollette EnergyBid
    let totalKwhAnnuo = null
    if (org.consumoAnnuoDichiarato) {
      totalKwhAnnuo = org.consumoAnnuoDichiarato
    } else if (org.bollette && org.bollette.length > 0) {
      totalKwhAnnuo = (org.bollette.reduce((sum, b) => sum + (b.kwh || 0), 0) / org.bollette.length) * 12
    }
    if (totalKwhAnnuo) {
      const co2 = (totalKwhAnnuo * FATTORE_EMISSIONI) / 1000
      dati.E01 = Math.round(co2 * 100) / 100
      dati.E02 = Math.round(totalKwhAnnuo / 1000 * 100) / 100
    }

    // Da CER
    if (org.cerAssociate && org.cerAssociate.length > 0) {
      dati.E06 = true
    }

    // Da organizzazione
    if (org.numeroDipendenti) {
      dati.S01 = org.numeroDipendenti
    }

    return dati
  }, [org])

  function handleStart() {
    // Auto-popola con dati esistenti se mancano
    const toAdd = {}
    Object.entries(datiAutomatici).forEach(([k, v]) => {
      if (risposte[k] === undefined) toAdd[k] = v
    })
    if (Object.keys(toAdd).length > 0) {
      store.setESGAnswers(toAdd)
    }
    setView('questionnaire')
  }

  function handleSaveAnswers(newAnswers) {
    store.setESGAnswers(newAnswers)
    // newAnswers è lo stato completo locale (inizializzato da risposte + modifiche utente)
    const newScore = calcolaScoreESG(newAnswers)
    store.setESGScore(newScore)
  }

  function handleReset() {
    setConfirmReset(true)
  }

  if (view === 'questionnaire') {
    return (
      <ESGQuestionnaire
        risposte={risposte}
        datiAutomatici={datiAutomatici}
        onSave={handleSaveAnswers}
        onClose={() => setView('dashboard')}
        t={t}
      />
    )
  }

  if (view === 'report') {
    return (
      <ESGReport
        onBack={() => setView('dashboard')}
        score={scoreCorrente}
        risposte={risposte}
        organizzazione={org}
        t={t}
      />
    )
  }

  return (
    <div className={styles.wrap}>
      <ConfirmModal
        isOpen={confirmReset}
        message={t.confirmReset}
        onConfirm={() => { store.resetESG(); setConfirmReset(false) }}
        onCancel={() => setConfirmReset(false)}
        confirmLabel={t.reset}
        cancelLabel={t.cancel}
      />
      <div className={styles.header}>
        <div>
          <div className={styles.cardTitle}>{t.title}</div>
          <h1 className={styles.h1}>{t.subtitle}</h1>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t.completion}</div>
          <div className={styles.statValBig}>{percentualeCompletamento}%</div>
          <div className={styles.statSub}>{completate}/{TOTAL_INDICATORS} {t.indicators}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percentualeCompletamento}%` }} />
          </div>
        </div>

        {scoreCorrente && (
          <>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{t.totalScore}</div>
              <div className={styles.statValBig} style={{ color: getColorByClass(scoreCorrente.classe) }}>
                {scoreCorrente.total}<span className={styles.statUnit}>/100</span>
              </div>
              <div className={styles.classBadge} style={{ background: getColorByClass(scoreCorrente.classe) }}>
                {t.class} {scoreCorrente.classe}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>{t.breakdown}</div>
              <div className={styles.breakdown}>
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>E</span>
                  <span className={styles.breakdownVal}>{scoreCorrente.E}</span>
                </div>
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>S</span>
                  <span className={styles.breakdownVal}>{scoreCorrente.S}</span>
                </div>
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>G</span>
                  <span className={styles.breakdownVal}>{scoreCorrente.G}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!scoreCorrente && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyTitle}>{t.emptyTitle}</div>
          <div className={styles.emptySub}>{t.emptySub}</div>
          <button className={styles.primaryBtn} onClick={handleStart}>
            {t.start} →
          </button>
          {Object.keys(datiAutomatici).length > 0 && (
            <div className={styles.autoNote}>
              {t.autoFromData(Object.keys(datiAutomatici).length)}
            </div>
          )}
        </div>
      )}

      {scoreCorrente && (
        <>
          <div className={styles.actionsRow}>
            <button className={styles.primaryBtn} onClick={handleStart}>
              {percentualeCompletamento < 100 ? t.continue : t.review} →
            </button>
            <button className={styles.secondaryBtn} onClick={() => setView('report')}>
              {t.viewReport} →
            </button>
            <button className={styles.dangerBtn} onClick={handleReset}>
              {t.reset}
            </button>
          </div>

          <div className={styles.dimensionGrid}>
            {['E', 'S', 'G'].map(cat => {
              const indicators = ESG_INDICATORS.filter(i => i.category === cat)
              const answered = indicators.filter(i => risposte[i.id] !== undefined && risposte[i.id] !== null && risposte[i.id] !== '').length
              const score = scoreCorrente[cat]
              const labels = { E: t.environmental, S: t.social, G: t.governance }
              return (
                <div key={cat} className={styles.dimensionCard}>
                  <div className={styles.dimHeader}>
                    <span className={styles.dimCat}>{cat}</span>
                    <span className={styles.dimName}>{labels[cat]}</span>
                  </div>
                  <div className={styles.dimScore} style={{ color: getColorByScore(score) }}>
                    {score}<span className={styles.dimScoreUnit}>/100</span>
                  </div>
                  <div className={styles.dimMeta}>
                    {answered}/{indicators.length} {t.answered}
                  </div>
                  <div className={styles.miniBar}>
                    <div className={styles.miniBarFill} style={{ width: `${score}%`, background: getColorByScore(score) }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

