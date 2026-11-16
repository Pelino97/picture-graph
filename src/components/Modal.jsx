import { useEffect, useRef } from 'react'

// 화면 가운데 뜨는 팝업. 바깥을 누르거나 Esc를 누르면 닫혀요.
export default function Modal({ title, children, actions, onClose, tone = 'default' }) {
  const boxRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    boxRef.current?.querySelector('button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={boxRef}
        className={`modal modal-${tone}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  )
}
