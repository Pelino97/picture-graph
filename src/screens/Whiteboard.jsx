import { useEffect, useRef } from 'react'
import PictureGraph from '../components/PictureGraph.jsx'

// 화이트보드: 전체 화면으로 그림그래프와 '알게 된 점'을 크게 보여줘요
export default function Whiteboard({ state, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const request = el?.requestFullscreen || el?.webkitRequestFullscreen
    // 전체 화면을 지원하지 않는 기기(일부 아이패드)는 화면을 꽉 채운 창으로 대신 보여줘요
    try {
      const p = request?.call(el)
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } catch {
      /* 무시 */
    }
    const onKey = (e) => e.key === 'Escape' && !document.fullscreenElement && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const close = () => {
    const exit = document.exitFullscreen || document.webkitExitFullscreen
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      try {
        const p = exit?.call(document)
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch {
        /* 무시 */
      }
    }
    onClose()
  }

  return (
    <div ref={ref} className="whiteboard" role="dialog" aria-modal="true" aria-label="화이트보드">
      <button className="btn btn-ghost wb-close" onClick={close}>
        ✕ 닫기
      </button>
      <header className="wb-head">
        <span className="wb-group">{state.group}조</span>
        <h1>{state.topic}</h1>
      </header>
      <div className="wb-body">
        <div className="wb-graph">
          <PictureGraph state={state} big={52} small={30} />
        </div>
        <div className="wb-note">
          <h2>✏️ 알게 된 점</h2>
          <p>{state.insight}</p>
        </div>
      </div>
    </div>
  )
}
