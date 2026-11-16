import { useEffect, useRef, useState } from 'react'
import PictureGraph from '../components/PictureGraph.jsx'
import { SELF_CHECKS } from '../data/selfCheck.js'
import { downloadBlob, makeWhiteboardImage } from '../lib/exportImage.js'

const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement)

function exitFull() {
  if (!isFull()) return Promise.resolve()
  const exit = document.exitFullscreen || document.webkitExitFullscreen
  try {
    return Promise.resolve(exit?.call(document)).catch(() => {})
  } catch {
    return Promise.resolve()
  }
}

// 화이트보드: 전체 화면으로 그림그래프와 '알게 된 점'을 크게 보여줘요
export default function Whiteboard({ state, onClose }) {
  const ref = useRef(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

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
    const onKey = (e) => e.key === 'Escape' && !isFull() && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const close = () => {
    exitFull()
    onClose()
  }

  const save = async () => {
    setSaving(true)
    setMsg('')
    try {
      const blob = await makeWhiteboardImage(state, ref.current)
      downloadBlob(blob, `picture-graph-group${state.group}.png`)
      setMsg('그림을 저장했어요! (다운로드 폴더를 확인해 주세요)')
    } catch {
      setMsg('이 기기에서는 그림 저장이 어려워요. 인쇄 버튼을 이용해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  const print = async () => {
    await exitFull()
    setTimeout(() => window.print(), 300)
  }

  const done = state.selfCheck.filter(Boolean).length

  return (
    <div ref={ref} className="whiteboard" role="dialog" aria-modal="true" aria-label="화이트보드">
      <div className="wb-tools no-print">
        <button className="btn btn-ghost" onClick={save} disabled={saving}>
          {saving ? '만드는 중…' : '🖼️ 그림으로 저장'}
        </button>
        <button className="btn btn-ghost" onClick={print}>
          🖨️ 인쇄
        </button>
        <button className="btn btn-ghost" onClick={close}>
          ✕ 닫기
        </button>
      </div>
      {msg && (
        <p className="wb-msg no-print" role="status">
          {msg}
        </p>
      )}
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
          <p className="wb-self">
            스스로 평가 {'🌸⭐🍀💖'.match(/./gu).slice(0, done).join('')} {done}/{SELF_CHECKS.length}
          </p>
        </div>
      </div>
    </div>
  )
}
