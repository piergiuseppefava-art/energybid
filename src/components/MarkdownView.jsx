import ReactMarkdown from 'react-markdown'
import styles from './MarkdownView.module.css'

export default function MarkdownView({ content }) {
  return (
    <div className={styles.root}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
