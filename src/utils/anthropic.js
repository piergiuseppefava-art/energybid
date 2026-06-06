const PROXY_URL = '/api/claude'

export async function callAnthropic({ model, messages, maxTokens = 1024, tools, system }) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, tools, system, maxTokens, model }),
  })

  if (!response.ok) {
    const errData = await response.json()
    throw new Error(`Claude API ${response.status}: ${errData.error?.message || 'errore sconosciuto'}`)
  }

  return await response.json()
}
