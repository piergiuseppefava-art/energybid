import { useEffect } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef, isOpen) {
  useEffect(() => {
    if (!isOpen) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused = document.activeElement

    const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    const initial = getFocusable()[0] || container
    initial.focus()

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const goingBack = e.shiftKey

      if (goingBack && (document.activeElement === first || !container.contains(document.activeElement))) {
        e.preventDefault()
        last.focus()
      } else if (!goingBack && (document.activeElement === last || !container.contains(document.activeElement))) {
        e.preventDefault()
        first.focus()
      }
      e.stopPropagation()
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [isOpen, containerRef])
}
