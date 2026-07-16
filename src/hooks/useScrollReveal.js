import { useEffect, useRef } from 'react'

export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-revealed', 'true')
          observer.unobserve(el)
        }
      },
      { threshold: 0.12, ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // Intenzionale: observer one-shot al mount. Nessun chiamante attuale passa
    // options dinamiche (verificato in Landing.jsx); se in futuro qualcuno passasse
    // un oggetto inline, aggiungerlo alle deps ricreerebbe l'observer ad ogni
    // render, rompendo l'animazione di reveal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
