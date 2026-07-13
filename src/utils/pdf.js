function sanitizeForPDF(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/—/g, '--')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
}

export async function generatePDF({ title, headerLines = [], content, filename }) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF()
  let y = 20

  pdf.setFontSize(14)
  pdf.text(title, 15, y)
  y += 10

  if (headerLines.length > 0) {
    pdf.setFontSize(10)
    headerLines.forEach(line => {
      pdf.text(line, 15, y)
      y += 6
    })
  }

  pdf.setFontSize(10)
  const plain = sanitizeForPDF(content)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, (m) => m)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^---+$/gm, '')
  const lines = pdf.splitTextToSize(plain, 180)
  lines.forEach(line => {
    if (y > 280) {
      pdf.addPage()
      y = 20
    }
    pdf.text(line, 15, y)
    y += 5
  })

  pdf.save(filename)
}
