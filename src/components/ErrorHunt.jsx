import { useState } from 'react'
import Mascot from './Mascot.jsx'
import Modal from './Modal.jsx'
import PictureGraph from './PictureGraph.jsx'
import { makeMistake } from '../lib/quiz.js'
import { play } from '../lib/sound.js'

const ROUNDS = 3

// 그래피의 실수 찾기: 일부러 한 줄을 틀리게 그린 그래프에서 틀린 줄을 찾아요
export default function ErrorHunt({ state, onClose }) {
  const make = () => makeMistake({ items: state.items, counts: state.counts, unit: state.unit })
  const [round, setRound] = useState(1)
  const [puzzle, setPuzzle] = useState(make)
  const [tapped, setTapped] = useState(null)
  const found = tapped === puzzle.wrongIndex
  const iconId = state.iconId || 'line:circle'

  const tap = (i) => {
    if (found) return
    setTapped(i)
    play(i === puzzle.wrongIndex ? 'correct' : 'wrong', state.sound)
  }

  return (
    <Modal title={`🔍 그래피의 실수 찾기 (${round}/${ROUNDS})`} onClose={onClose}>
      <div className="hunt">
        <div className="hunt-head">
          <Mascot size={70} />
          <p className="bubble-inline">앗, 그림그래프를 그리다가 한 줄을 틀렸어요! 틀린 줄을 눌러 주세요.</p>
        </div>
        <div className="hunt-body">
          <ul className="status-list hunt-data">
            {state.items.map((n, i) => (
              <li key={n} className={`status-item c${i}`}>
                <span>{n}</span>
                <strong>{state.counts[i]}명</strong>
              </li>
            ))}
          </ul>
          <PictureGraph
            state={{ ...state, iconId, rows: puzzle.rows }}
            onRowTap={tap}
            markRow={tapped}
            markTone={found ? 'right' : 'wrong'}
            big={34}
            small={20}
          />
        </div>
        {tapped !== null && (
          <div className={`quiz-feedback ${found ? 'right' : 'wrong'}`} role="status">
            {found ? `⭕ 찾았어요! ${puzzle.reason}` : '❌ 이 줄은 맞게 그렸어요. 조사 결과와 하나씩 비교해 볼까요?'}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost btn-lg" onClick={onClose}>
            그만하기
          </button>
          {found &&
            (round < ROUNDS ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  setRound(round + 1)
                  setPuzzle(make())
                  setTapped(null)
                }}
              >
                다음 문제 →
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={onClose}>
                🎉 다 찾았어요! 이제 직접 그리기
              </button>
            ))}
        </div>
      </div>
    </Modal>
  )
}
