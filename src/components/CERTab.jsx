import { useState } from 'react'
import { useOrganization } from '../store/organization.store'
import CERForm from './CERForm'
import CERDetail from './CERDetail'
import styles from './CERTab.module.css'

export default function CERTab({ t, lang }) {
  const [org, store] = useOrganization()
  const [view, setView] = useState('list')
  const [selectedCERId, setSelectedCERId] = useState(null)

  const cerList = org.cerAssociate || []
  const selectedCER = cerList.find(c => c.id === selectedCERId)

  function handleCreated(cer) {
    setSelectedCERId(cer.id)
    setView('detail')
  }

  function handleDelete(cerId) {
    if (confirm(t.confirmDelete)) {
      store.removeCER(cerId)
      setView('list')
      setSelectedCERId(null)
    }
  }

  if (view === 'form') {
    return <CERForm onCreated={handleCreated} onCancel={() => setView('list')} t={t} />
  }

  if (view === 'detail' && selectedCER) {
    return (
      <CERDetail
        cer={selectedCER}
        organizzazione={org}
        onBack={() => setView('list')}
        onDelete={() => handleDelete(selectedCER.id)}
        t={t}
        lang={lang}
      />
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <div className={styles.cardTitle}>{t.title}</div>
          <h1 className={styles.h1}>{t.subtitle}</h1>
        </div>
        <button className={styles.newBtn} onClick={() => setView('form')}>
          + {t.newCER}
        </button>
      </div>

      {cerList.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⚡</div>
          <div className={styles.emptyTitle}>{t.emptyTitle}</div>
          <div className={styles.emptySub}>{t.emptySub}</div>
          <button className={styles.emptyBtn} onClick={() => setView('form')}>
            {t.startNow}
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {cerList.map(cer => (
            <div
              key={cer.id}
              className={styles.card}
              onClick={() => { setSelectedCERId(cer.id); setView('detail') }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>{cer.nome}</span>
                <span className={`${styles.statusBadge} ${styles[`status_${cer.stato}`]}`}>
                  {t.status[cer.stato] || cer.stato}
                </span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>{t.power}</span>
                  <span className={styles.cardValue}>{cer.potenzaTotaleKw} kW</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>{t.members}</span>
                  <span className={styles.cardValue}>{cer.numeroMembri}</span>
                </div>
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>{t.cabin}</span>
                  <span className={styles.cardValue}>{cer.cabinaPrimaria || '—'}</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.docs}>
                  {Object.values(cer.documentiGenerati).filter(Boolean).length}/4 {t.docs}
                </span>
                <span className={styles.openLink}>{t.open} →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
