import { useState } from 'react'
import { useOrganization } from '../store/organization.store'
import claudeClient from '../services/claude.client'
import { ESG_INDICATORS, getColorByClass } from '../data/esg-indicators'
import { generatePDF } from '../utils/pdf'
import MarkdownView from './MarkdownView'
import styles from './ESGReport.module.css'

export default function ESGReport({ onBack, score, risposte, organizzazione, t }) {
  const [, store] = useOrganization()
  const [stato, setStato] = useState('idle')
  const [errore, setErrore] = useState(null)

  const reportEsistente = organizzazione.esg?.ultimoReport

  async function handleGenerate() {
    setStato('generating')
    setErrore(null)
    try {
      const content = await claudeClient.generateReportESG(
        organizzazione,
        risposte,
        score,
        ESG_INDICATORS
      )
      store.setESGReport(content)
      setStato('idle')
    } catch (e) {
      console.error(e)
      setErrore(e.message)
      setStato('idle')
    }
  }

  function handleDownloadPDF() {
    if (!reportEsistente) return
    generatePDF({
      title: `Report ESG — ${organizzazione.nome}`,
      headerLines: [
        `Score: ${score.total}/100 — Classe ${score.classe}`,
        `Generato: ${new Date(reportEsistente.generatedAt).toLocaleDateString('it-IT')}`,
      ],
      content: reportEsistente.content,
      filename: `Report_ESG_${organizzazione.nome.replace(/\s+/g, '_')}.pdf`,
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← {t.back}</button>
        {reportEsistente && (
          <button className={styles.downloadBtn} onClick={handleDownloadPDF}>
            ↓ {t.downloadPDF}
          </button>
        )}
      </div>

      <div className={styles.titleSection}>
        <div className={styles.cardTitle}>{t.reportTitle}</div>
        <h1 className={styles.h1}>{organizzazione.nome}</h1>
        <div className={styles.scoreSummary}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Score</span>
            <span className={styles.scoreValue}>{score.total}/100</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>{t.class}</span>
            <span className={styles.classBadge} style={{ background: getColorByClass(score.classe) }}>
              {score.classe}
            </span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>E / S / G</span>
            <span className={styles.scoreValue}>{score.E} · {score.S} · {score.G}</span>
          </div>
        </div>
      </div>

      {!reportEsistente && stato !== 'generating' && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📄</div>
          <div className={styles.emptyTitle}>{t.noReportYet}</div>
          <div className={styles.emptySub}>{t.noReportSub}</div>
          {errore && <div className={styles.error}>{errore}</div>}
          <button className={styles.primaryBtn} onClick={handleGenerate}>
            {t.generateReport} →
          </button>
        </div>
      )}

      {stato === 'generating' && (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <div className={styles.loadingTitle}>{t.generatingReport}</div>
          <div className={styles.loadingSub}>{t.generatingReportSub}</div>
        </div>
      )}

      {reportEsistente && stato !== 'generating' && (
        <>
          <div className={styles.reportMeta}>
            <span>
              {t.generatedAt}: {new Date(reportEsistente.generatedAt).toLocaleString('it-IT')}
            </span>
            <button className={styles.regenBtn} onClick={handleGenerate}>
              {t.regenerate}
            </button>
          </div>

          <div className={styles.reportContent}>
            <MarkdownView content={reportEsistente.content} />
          </div>
        </>
      )}
    </div>
  )
}

