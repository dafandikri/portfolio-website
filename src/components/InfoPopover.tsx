import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface InfoPopoverProps {
  className: string
  panelClassName: string
  label: string
  visible: boolean
  children: ReactNode
}

/**
 * An attribution control whose panel remains mounted while it closes.
 *
 * Native details elements remove their non-summary content as soon as `open`
 * disappears, so a declared CSS exit transition never gets a frame in which
 * to run. Keeping the panel in the tree and exposing state through classes
 * gives both the eye and every line of its panel a real fade/pop in and out.
 */
export default function InfoPopover({
  className,
  panelClassName,
  label,
  visible,
  children,
}: InfoPopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!visible) setOpen(false)
  }, [visible])

  useEffect(() => {
    if (!open) return

    const dismissFromOutside = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && !rootRef.current?.contains(target)) setOpen(false)
    }
    const dismissFromKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', dismissFromOutside, true)
    document.addEventListener('keydown', dismissFromKeyboard)
    return () => {
      document.removeEventListener('pointerdown', dismissFromOutside, true)
      document.removeEventListener('keydown', dismissFromKeyboard)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`${className}${visible ? ' is-visible' : ''}${open ? ' is-open' : ''}`}
      inert={!visible}
      aria-hidden={!visible}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        i
      </button>
      <div id={panelId} className={panelClassName} aria-hidden={!open}>
        {children}
      </div>
    </div>
  )
}
