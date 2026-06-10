import { useEffect } from 'react'
import styles from './Drawer.module.css'

export default function Drawer({ open, onClose, modulo, onSelectModulo, onHome, onOpenProfile, t }) {
  // Block body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on ESC key
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const services = t.hub.selector.services
  // service ids: 'calc' → modulo 'energybid', 'cer' → 'cer', 'esg' → 'esg'
  const activeServiceId = modulo === 'energybid' ? 'calc' : modulo

  return (
    <div
      className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.navHeader}>{t.drawer.nav}</div>
        <nav className={styles.nav}>
          {services.map(svc => (
            <button
              key={svc.id}
              className={`${styles.item} ${svc.id === activeServiceId ? styles.itemActive : ''}`}
              onClick={() => { onSelectModulo(svc.id); onClose() }}
            >
              <span className={styles.itemIcon}>{svc.icon}</span>
              <span className={styles.itemName}>{svc.name}</span>
            </button>
          ))}
        </nav>
        <div className={styles.divider} />
        <button className={styles.homeBtn} onClick={() => { onOpenProfile(); onClose() }}>
          <span className={styles.itemIcon}>⚙️</span>
          <span>{t.drawer.profile}</span>
        </button>
        <button className={styles.homeBtn} onClick={() => { onHome(); onClose() }}>
          <span className={styles.itemIcon}>🏠</span>
          <span>{t.drawer.home}</span>
        </button>
      </div>
    </div>
  )
}
