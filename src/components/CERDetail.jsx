import { useState } from 'react'
import { useOrganization } from '../store/organization.store'
import claudeClient from '../services/claude.client'
import { generatePDF } from '../utils/pdf'
import styles from './CERDetail.module.css'

const DOCUMENTI = [
  { key: 'statuto', method: 'generateStatuto', icon: '📜' },
  { key: 'regolamento', method: 'generateRegolamento', icon: '📋' },
  { key: 'letteraDistributore', method: 'generateLetteraDistributore', icon: '✉' },
  { key: 'checklistGSE', method: 'generateChecklistGSE', icon: '✓' },
]

export default function CERDetail({ cer, organizzazione, onBack, onDelete, t, lang }) {
  const [, store] = useOrganization()
  const [generating, setGenerating] = useState(null)
  const [errors, setErrors] = useState({})
  const [previewDoc, setPreviewDoc] = useState(null)

  const docsCompleted = Object.values(cer.documentiGenerati).filter(Boolean).length

  async function handleGenerate(docKey, method) {
    setGenerating(docKey)
    setErrors(prev => ({ ...prev, [docKey]: null }))
    try {
      const content = await claudeClient[method](cer, organizzazione)
      store.saveCERDocument(cer.id, docKey, content)
    } catch (e) {
      console.error(e)
      setErrors(prev => ({ ...prev, [docKey]: e.message }))
    }
    setGenerating(null)
  }

  function handleDownloadPDF(docKey) {
    const doc = cer.documentiGenerati[docKey]
    if (!doc) return
    generatePDF({
      title: t.docs[docKey],
      content: doc.content,
      filename: `${cer.nome.replace(/\s+/g, '_')}_${docKey}.pdf`,
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← {t.back}</button>
        <button className={styles.deleteBtn} onClick={onDelete}>{t.delete}</button>
      </div>

      <div className={styles.titleSection}>
        <div className={styles.cardTitle}>{cer.formaGiuridica}</div>
        <h1 className={styles.h1}>{cer.nome}</h1>
        <div className={styles.meta}>
          <span>{cer.indirizzoSede}, {cer.cap} {cer.provincia}</span>
          <span>·</span>
          <span>{cer.potenzaTotaleKw} kW</span>
          <span>·</span>
          <span>{cer.numeroMembri} {t.membersLabel}</span>
        </div>
      </div>

      <div className={styles.statusBox}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>{t.cabin}</span>
          <span className={styles.statusValue}>{cer.cabinaPrimaria}</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>{t.plantType}</span>
          <span className={styles.statusValue}>{cer.tipologiaImpianto}</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>{t.status_label}</span>
          <span className={`${styles.statusBadge} ${styles[`status_${cer.stato}`]}`}>
            {t.status[cer.stato]}
          </span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>{t.docsGenerated}</span>
          <span className={styles.statusValue}>{docsCompleted}/4</span>
        </div>
      </div>

      <div className={styles.docsSection}>
        <div className={styles.cardTitle}>{t.docsTitle}</div>
        <h2 className={styles.h2}>{t.docsSubtitle}</h2>

        <div className={styles.docsList}>
          {DOCUMENTI.map(doc => {
            const generated = cer.documentiGenerati[doc.key]
            const isGenerating = generating === doc.key
            const hasError = errors[doc.key]

            return (
              <div key={doc.key} className={styles.docCard}>
                <div className={styles.docHeader}>
                  <div className={styles.docIcon}>{doc.icon}</div>
                  <div className={styles.docInfo}>
                    <div className={styles.docName}>{t.docs[doc.key]}</div>
                    <div className={styles.docDesc}>{t.docsDesc[doc.key]}</div>
                  </div>
                  <div className={styles.docStatus}>
                    {generated && <span className={styles.docDone}>✓</span>}
                  </div>
                </div>

                {hasError && <div className={styles.docError}>{hasError}</div>}

                <div className={styles.docActions}>
                  {!generated && !isGenerating && (
                    <button className={styles.genBtn} onClick={() => handleGenerate(doc.key, doc.method)}>
                      {t.generate}
                    </button>
                  )}
                  {isGenerating && (
                    <div className={styles.generating}>
                      <div className={styles.spinner} />
                      <span>{t.generating}</span>
                    </div>
                  )}
                  {generated && (
                    <>
                      <button className={styles.previewBtn} onClick={() => setPreviewDoc(doc.key)}>
                        {t.preview}
                      </button>
                      <button className={styles.downloadBtn} onClick={() => handleDownloadPDF(doc.key)}>
                        ↓ PDF
                      </button>
                      <button className={styles.regenBtn} onClick={() => handleGenerate(doc.key, doc.method)}>
                        {t.regenerate}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {previewDoc && (
        <div className={styles.modalOverlay} onClick={() => setPreviewDoc(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t.docs[previewDoc]}</h3>
              <button className={styles.modalClose} onClick={() => setPreviewDoc(null)}>×</button>
            </div>
            <div className={styles.modalContent}>
              <pre>{cer.documentiGenerati[previewDoc].content}</pre>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.downloadBtn} onClick={() => handleDownloadPDF(previewDoc)}>
                ↓ {t.downloadPDF}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
