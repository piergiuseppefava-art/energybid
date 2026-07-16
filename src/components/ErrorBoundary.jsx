import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

export default class ErrorBoundary extends Component {
  static getDerivedStateFromError() {
    return { crashed: true }
  }

  constructor(props) {
    super(props)
    this.state = { crashed: false }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.crashed) {
      return (
        <div className={styles.wrap}>
          <div className={styles.box}>
            <div className={styles.logo}>⚡ Lumia</div>
            <h1 className={styles.title}>
              Qualcosa è andato storto<br />
              <span className={styles.titleEn}>Something went wrong</span>
            </h1>
            <p className={styles.sub}>
              Si è verificato un errore imprevisto.<br />
              An unexpected error occurred.
            </p>
            <button className={styles.btn} onClick={() => window.location.reload()}>
              Ricarica / Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
