import { useState } from 'react'
import Modal from '../components/Modal.jsx'

// 설문조사 화면: 주제 캔디바 + 2x2 항목 캔디바 + 실시간 투표자 수
export default function Survey({ state, dispatch }) {
  const [asking, setAsking] = useState(null) // 고르려는 항목 번호
  const [notice, setNotice] = useState('')
  const [bump, setBump] = useState(null)
  const total = state.counts.reduce((a, b) => a + b, 0)
  const target = state.target || null
  const full = target !== null && total >= target

  const add = (i) => {
    if (full) {
      setNotice(`조사할 친구 ${target}명이 모두 투표했어요! 숫자를 고치려면 − 버튼을 먼저 눌러 주세요.`)
      return
    }
    dispatch({ type: 'vote', index: i, delta: 1 })
    setBump(i)
    setTimeout(() => setBump(null), 450)
  }

  return (
    <main className="screen survey">
      <div className="candy candy-topic">
        <h2>{state.topic}</h2>
      </div>

      <div className="vote-grid">
        {state.items.map((name, i) => (
          <div key={name} className={`candy candy-item c${i} ${bump === i ? 'bump' : ''}`}>
            <button className="vote-main" onClick={() => (full ? add(i) : setAsking(i))}>
              <span className="vote-name">{name}</span>
              <span className="vote-count" aria-live="polite">
                {state.counts[i]}
                <small>명</small>
              </span>
            </button>
            <div className="vote-adjust">
              <button
                className="round-btn"
                aria-label={`${name} 한 명 빼기`}
                disabled={state.counts[i] === 0}
                onClick={() => dispatch({ type: 'vote', index: i, delta: -1 })}
              >
                −
              </button>
              <button className="round-btn" aria-label={`${name} 한 명 더하기`} onClick={() => add(i)}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="voter-bar">
        <div className="voter-total">
          🙋 투표한 친구 <strong>{total}</strong>명{target && <span> / {target}명</span>}
        </div>
        {target && (
          <div className="progress" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${Math.min(100, (total / target) * 100)}%` }} />
          </div>
        )}
        <button className="btn btn-primary btn-lg" disabled={total === 0} onClick={() => dispatch({ type: 'go', screen: 'results' })}>
          📊 설문 결과 확인하기
        </button>
      </div>

      {asking !== null && (
        <Modal
          title="이 항목을 고를까요?"
          onClose={() => setAsking(null)}
          actions={
            <>
              <button className="btn btn-ghost btn-lg" onClick={() => setAsking(null)}>
                아니요
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  add(asking)
                  setAsking(null)
                }}
              >
                네, 골라요!
              </button>
            </>
          }
        >
          <p className={`modal-choice c${asking}`}>{state.items[asking]}</p>
        </Modal>
      )}

      {notice && (
        <Modal
          title="알려 줄게요"
          onClose={() => setNotice('')}
          actions={
            <button className="btn btn-primary btn-lg" onClick={() => setNotice('')}>
              알겠어요
            </button>
          }
        >
          <p>{notice}</p>
        </Modal>
      )}
    </main>
  )
}
