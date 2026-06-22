export function isValidPartitaIva(piva) {
  const digits = piva.trim().toUpperCase().replace(/^IT/, '')
  return /^\d{11}$/.test(digits)
}
