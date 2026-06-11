import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

export function useCountUp(target, { start = 0, duration = 1500 } = {}) {
  const [value, setValue] = useState(start)
  const [done, setDone] = useState(false)
  const ref = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      setDone(true)
      return
    }

    const el = ref.current
    if (!el) return

    let started = false

    function runAnimation() {
      if (started) return
      started = true

      const startTime = performance.now()
      const range = target - start

      function tick(now) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        setValue(start + range * easeOutCubic(progress))
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setValue(target)
          setDone(true)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.unobserve(el)
        runAnimation()
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    // If already visible at mount, don't wait for the async observer callback
    const { top, bottom } = el.getBoundingClientRect()
    if (bottom > 0 && top < window.innerHeight) {
      runAnimation()
    }

    return () => {
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, start, duration])

  return [value, done, ref]
}
