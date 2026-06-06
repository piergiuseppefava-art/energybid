import { useState } from 'react'
import { ESG_INDICATORS } from '../data/esg-indicators'
import styles from './ESGQuestionnaire.module.css'

const CATEGORY_LABELS = {
  E: { it: 'Environmental', en: 'Environmental', icon: '🌱' },
  S: { it: 'Social', en: 'Social', icon: '👥' },
  G: { it: 'Governance', en: 'Governance', icon: '⚖' },
}

export default function ESGQuestionnaire({ risposte, datiAutomatici, onSave, onClose, t }) {
  const [activeCategory, setActiveCategory] = useState('E')
  const [localAnswers, setLocalAnswers] = useState({ ...risposte })

  const indicatorsByCategory = {
    E: ESG_INDICATORS.filter(i => i.category === 'E'),
    S: ESG_INDICATORS.filter(i => i.category === 'S'),
    G: ESG_INDICATORS.filter(i => i.category === 'G'),
  }

  const currentIndicators = indicatorsByCategory[activeCategory]

  function handleChange(id, value) {
    setLocalAnswers({ ...localAnswers, [id]: value })
  }

  function handleSaveAndClose() {
    onSave(localAnswers)
    onClose()
  }

  function countAnswered(cat) {
    return indicatorsByCategory[cat].filter(i => {
      const r = localAnswers[i.id]
      return r !== undefined && r !== null && r !== ''
    }).length
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleSaveAndClose}>← {t.back}</button>
        <button className={styles.saveBtn} onClick={handleSaveAndClose}>{t.saveExit}</button>
      </div>

      <div className={styles.titleSection}>
        <div className={styles.cardTitle}>{t.questionnaireTitle}</div>
        <h1 className={styles.h1}>{t.questionnaireSub}</h1>
      </div>

      <div className={styles.tabs}>
        {['E', 'S', 'G'].map(cat => {
          const total = indicatorsByCategory[cat].length
          const answered = countAnswered(cat)
          return (
            <button
              key={cat}
              className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className={styles.tabIcon}>{CATEGORY_LABELS[cat].icon}</span>
              <span className={styles.tabName}>{CATEGORY_LABELS[cat].it}</span>
              <span className={styles.tabCount}>{answered}/{total}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.indicatorsList}>
        {currentIndicators.map(ind => {
          const value = localAnswers[ind.id]
          const isAuto = datiAutomatici[ind.id] !== undefined && value === datiAutomatici[ind.id]

          return (
            <div key={ind.id} className={styles.indicatorCard}>
              <div className={styles.indHeader}>
                <span className={styles.indCode}>{ind.id}</span>
                <span className={styles.indQuestion}>{ind.question}</span>
                {isAuto && <span className={styles.autoBadge}>{t.autoFilled}</span>}
              </div>

              <div className={styles.indInput}>
                {ind.type === 'boolean' && (
                  <div className={styles.boolGroup}>
                    <button
                      className={`${styles.boolBtn} ${value === true ? styles.boolActive : ''}`}
                      onClick={() => handleChange(ind.id, true)}
                    >
                      {t.yes}
                    </button>
                    <button
                      className={`${styles.boolBtn} ${value === false ? styles.boolActive : ''}`}
                      onClick={() => handleChange(ind.id, false)}
                    >
                      {t.no}
                    </button>
                  </div>
                )}

                {ind.type === 'number' && (
                  <div className={styles.numWrap}>
                    <input
                      type="number"
                      value={value ?? ''}
                      onChange={(e) => handleChange(ind.id, e.target.value === '' ? null : parseFloat(e.target.value))}
                      placeholder="0"
                      min={0}
                      step="any"
                    />
                    {ind.unit && <span className={styles.numUnit}>{ind.unit}</span>}
                  </div>
                )}

                {ind.type === 'percentage' && (
                  <div className={styles.numWrap}>
                    <input
                      type="number"
                      value={value ?? ''}
                      onChange={(e) => handleChange(ind.id, e.target.value === '' ? null : parseFloat(e.target.value))}
                      placeholder="0"
                      min={0}
                      max={100}
                      step="any"
                    />
                    <span className={styles.numUnit}>%</span>
                  </div>
                )}

                {ind.type === 'select' && (
                  <div className={styles.selectGroup}>
                    {ind.options.map(opt => (
                      <button
                        key={opt}
                        className={`${styles.selectBtn} ${value === opt ? styles.selectActive : ''}`}
                        onClick={() => handleChange(ind.id, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.indMeta}>
                <span className={styles.weight}>{t.weight}: {'★'.repeat(ind.weight)}{'☆'.repeat(5 - ind.weight)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.primaryBtn} onClick={handleSaveAndClose}>
          {t.saveAndContinue}
        </button>
      </div>
    </div>
  )
}
