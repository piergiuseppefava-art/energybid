import { useEffect, useId, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import styles from './ConfirmModal.module.css'

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel, confirmLabel = 'OK', cancelLabel = '✕' }) {
  const panelRef = useRef(null)
  const messageId = useId()
  useFocusTrap(panelRef, isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={messageId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <p id={messageId} className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
