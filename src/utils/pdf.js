import { jsPDF } from 'jspdf'

export function generatePDF({ title, headerLines = [], content, filename }) {
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
  const lines = pdf.splitTextToSize(content, 180)
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
