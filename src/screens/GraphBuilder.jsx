import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ErrorHunt from '../components/ErrorHunt.jsx'
import Explore from '../components/Explore.jsx'
import Icon from '../components/Icon.jsx'
import SelfCheck from '../components/SelfCheck.jsx'
import { useSticker } from '../components/Sticker.jsx'
import Modal from '../components/Modal.jsx'
import PictureGraph from '../components/PictureGraph.jsx'
import { LIMITS, LINE_ICONS, LINE_ICON_NAMES, findTopic } from '../data/topics.js'
import { checkGraph } from '../lib/graph.js'
import { play } from '../lib/sound.js'

const DRAG_THRESHOLD = 8

export default function GraphBuilder({ state, dispatch, onOpenWhiteboard }) {
  const topic = findTopic(state.topicId)
  const iconOptions = [
    ...(topic ? topic.icons.map((e) => `emoji:${e}`) : []),
    ...LINE_ICONS.map((n) => `line:${n}`),
  ]
  const unit = state.unit
  const [selected, setSelected] = useState(null) // 탭으로 고른 그림 종류
  const [drag, setDrag] = useState(null)
  const [hoverRow, setHoverRow] = useState(null)
  const [result, setResult] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [rowFull, setRowFull] = useState(false)
  const dragRef = useRef(null)
  const [hunting, setHunting] = useState(false)
  const [sticker, showSticker] = useSticker()

  const place = (index, kind) => {
    const row = state.rows[index]
    if (row.big + row.small >= LIMITS.maxIconsPerRow) {
      setRowFull(true)
      return
    }
    dispatch({ type: 'place', index, kind })
    play('place', state.sound)
  }

  // 손가락·마우스·전자펜 모두 같은 방식으로 끌어다 놓기 (Pointer Events)
  useEffect(() => {
    if (!drag) return
    const rowAt = (x, y) => {
      const el = document.elementFromPoint(x, y)?.closest('[data-row]')
      return el ? Number(el.dataset.row) : null
    }
    const move = (e) => {
      const d = dragRef.current
      if (!d) return
      const moved = d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > DRAG_THRESHOLD
      dragRef.current = { ...d, x: e.clientX, y: e.clientY, moved }
      setDrag(dragRef.current)
      setHoverRow(moved ? rowAt(e.clientX, e.clientY) : null)
    }
    const up = (e) => {
      const d = dragRef.current
      dragRef.current = null
      setDrag(null)
      setHoverRow(null)
      if (!d) return
      if (!d.moved) {
        setSelected((s) => (s === d.kind ? null : d.kind))
        return
      }
      const r = rowAt(e.clientX, e.clientY)
      if (r !== null) place(r, d.kind)
    }
    const cancel = () => {
      dragRef.current = null
      setDrag(null)
      setHoverRow(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null, state.rows])

  const startDrag = (kind) => (e) => {
    if (!state.iconId) return
    e.preventDefault()
    dragRef.current = { kind, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, moved: false }
    setDrag(dragRef.current)
  }

  const check = () => {
    const r = checkGraph({ items: state.items, counts: state.counts, rows: state.rows, unit })
    setResult(r)
    play(r.ok ? 'correct' : 'wrong', state.sound)
    if (r.ok) {
      dispatch({ type: 'graphOk' })
      showSticker('참 잘했어요 💮', 'stamp')
    }
  }

  const total = state.counts.reduce((a, b) => a + b, 0)

  return (
    <main className="screen graph-screen">
      <div className="candy candy-topic small">
        <h2>{state.topic}</h2>
      </div>

      <div className="graph-layout">
        <aside className="graph-side">
          <section className="card">
            <h3 className="section-title sm">
              <span className="step">1</span> 그림 고르기
            </h3>
            {topic ? (
              <p className="hint">주제에 어울리는 그림과 단순한 선 그림 중에서 골라요.</p>
            ) : (
              <p className="hint">간단하게 그리기 쉬운 선 그림 중에서 골라요.</p>
            )}
            <div className="icon-options" role="radiogroup" aria-label="그림 모양">
              {iconOptions.map((id) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={state.iconId === id}
                  aria-label={id.startsWith('line:') ? LINE_ICON_NAMES[id.slice(5)] : id.slice(6)}
                  className={`icon-option ${state.iconId === id ? 'selected' : ''}`}
                  onClick={() => dispatch({ type: 'setIcon', iconId: id })}
                >
                  <Icon iconId={id} size={44} />
                  <Icon iconId={id} size={24} />
                </button>
              ))}
            </div>
            <div className="unit-choice" role="radiogroup" aria-label="큰 그림이 나타내는 수">
              {[10, 5].map((u) => (
                <button
                  key={u}
                  role="radio"
                  aria-checked={unit === u}
                  className={`chip ${unit === u ? 'selected' : ''}`}
                  onClick={() => unit !== u && dispatch({ type: 'setUnit', unit: u })}
                >
                  큰 그림 = {u}명
                </button>
              ))}
            </div>
          </section>

          <button className="btn btn-ghost hunt-btn" onClick={() => setHunting(true)}>
            🔍 연습: 그래피의 실수 찾기
          </button>

          <section className="card">
            <h3 className="section-title sm">
              <span className="step">2</span> 조사 결과
            </h3>
            <ul className="status-list">
              {state.items.map((n, i) => (
                <li key={n} className={`status-item c${i}`}>
                  <span>{n}</span>
                  <strong>{state.counts[i]}명</strong>
                </li>
              ))}
              <li className="status-item total">
                <span>합계</span>
                <strong>{total}명</strong>
              </li>
            </ul>
          </section>
        </aside>

        <section className="card graph-main">
          <h3 className="section-title sm">
            <span className="step">3</span> 그림을 끌어다 놓아요
          </h3>

          <div className={`palette ${state.iconId ? '' : 'disabled'} ${state.graphChecked ? 'unstick' : ''}`}>
            {['big', 'small'].map((kind) => (
              <button
                key={kind}
                className={`piece piece-${kind} ${selected === kind ? 'selected' : ''}`}
                onPointerDown={startDrag(kind)}
                disabled={!state.iconId}
                aria-label={kind === 'big' ? `큰 그림 (${unit}명)` : '작은 그림 (1명)'}
              >
                {state.iconId ? <Icon iconId={state.iconId} size={kind === 'big' ? 52 : 28} /> : <span>?</span>}
                <span className="piece-label">{kind === 'big' ? `${unit}명` : '1명'}</span>
              </button>
            ))}
            <p className="palette-tip">
              {state.iconId
                ? selected
                  ? '이제 그림을 넣을 줄을 눌러요.'
                  : '그림을 끌어다 줄에 놓아요. (눌러서 고른 뒤 줄을 눌러도 돼요)'
                : '먼저 왼쪽에서 그림을 골라 주세요.'}
            </p>
          </div>

          <PictureGraph
            state={state}
            hoverRow={hoverRow}
            interactive
            onRowTap={(i) => selected && state.iconId && place(i, selected)}
            onIconTap={(i, kind) => {
              dispatch({ type: 'remove', index: i, kind })
              play('minus', state.sound)
            }}
          />
          <p className="hint">잘못 놓은 그림은 그 그림을 누르면 하나씩 빠져요.</p>

          <div className="tool-row">
            <button className="btn btn-ghost" disabled={state.history.length === 0} onClick={() => dispatch({ type: 'undo' })}>
              ↩️ 되돌리기
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirmClear(true)}>
              🧽 모두 지우기
            </button>
            <button className="btn btn-primary" disabled={!state.iconId} onClick={check}>
              ✅ 확인하기
            </button>
          </div>

          {state.graphChecked && (
            <div className="insight">
              <h3 className="section-title sm">
                <span className="step">4</span> 그래프 더 살펴보기
              </h3>
              <Explore state={state} onStamp={() => showSticker('퀴즈 박사 🏅', 'stamp')} />
              <label className="field">
                <span className="section-title sm">
                  <span className="step">5</span> 그림그래프를 보고 알게 된 점
                </span>
                <textarea
                  className="input textarea"
                  rows={3}
                  maxLength={LIMITS.insight}
                  value={state.insight}
                  placeholder="예) 가장 많은 친구들이 고른 것은 ○○이고, 가장 적은 것은 ○○이에요."
                  onChange={(e) => dispatch({ type: 'setInsight', text: e.target.value })}
                />
                <span className="counter">
                  {state.insight.length}/{LIMITS.insight}
                </span>
              </label>
              <h3 className="section-title sm">
                <span className="step">6</span> 스스로 평가해요
              </h3>
              <SelfCheck checks={state.selfCheck} onToggle={(i) => {
                dispatch({ type: 'toggleSelfCheck', index: i })
                if (!state.selfCheck[i]) play('place', state.sound)
              }} />
              <button className="btn btn-primary btn-lg" disabled={!state.insight.trim()} onClick={onOpenWhiteboard}>
                🖥️ 확인하기 (화이트보드로 보기)
              </button>
            </div>
          )}
        </section>
      </div>

      {drag?.moved &&
        state.iconId &&
        createPortal(
          <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
            <Icon iconId={state.iconId} size={drag.kind === 'big' ? 56 : 30} />
          </div>,
          document.body,
        )}

      {sticker}
      {hunting && <ErrorHunt state={state} onClose={() => setHunting(false)} />}

      {result && (
        <Modal
          title={result.ok ? '🎉 정확하게 그렸어요!' : '🔍 다시 살펴볼까요?'}
          tone={result.ok ? 'success' : 'warn'}
          onClose={() => setResult(null)}
          actions={
            <button className="btn btn-primary btn-lg" onClick={() => setResult(null)}>
              {result.ok ? '알게 된 점 쓰러 가기' : '고치러 가기'}
            </button>
          }
        >
          {result.ok ? (
            <p>조사 결과와 그림그래프가 꼭 맞아요. 이제 그림그래프를 보고 알게 된 점을 써 보세요.</p>
          ) : (
            <ul className="problem-list">
              {result.problems.map((p) => (
                <li key={p.index}>
                  <strong className={`tag c${p.index}`}>{p.name}</strong> ({p.count}명): {p.tips.join(', ')}.
                  {p.hint && <div className="problem-hint">💡 {p.hint}</div>}
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {confirmClear && (
        <Modal
          title="그린 그림을 모두 지울까요?"
          onClose={() => setConfirmClear(false)}
          actions={
            <>
              <button className="btn btn-ghost btn-lg" onClick={() => setConfirmClear(false)}>
                아니요
              </button>
              <button
                className="btn btn-danger btn-lg"
                onClick={() => {
                  dispatch({ type: 'clearRows' })
                  setConfirmClear(false)
                }}
              >
                모두 지우기
              </button>
            </>
          }
        >
          <p>지운 뒤에도 '되돌리기'로 다시 살릴 수 있어요.</p>
        </Modal>
      )}

      {rowFull && (
        <Modal
          title="이 줄이 꽉 찼어요"
          onClose={() => setRowFull(false)}
          actions={
            <button className="btn btn-primary btn-lg" onClick={() => setRowFull(false)}>
              알겠어요
            </button>
          }
        >
          <p>한 줄에는 그림을 {LIMITS.maxIconsPerRow}개까지 놓을 수 있어요. 작은 그림 대신 큰 그림을 써 볼까요?</p>
        </Modal>
      )}
    </main>
  )
}
