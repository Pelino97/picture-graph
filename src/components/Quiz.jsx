import { useMemo, useState } from 'react'
import { makeQuiz } from '../lib/quiz.js'
import { play } from '../lib/sound.js'

// 그래프 읽기 퀴즈: 한 문제씩, 틀리면 힌트를 보고 다시 골라요
export default function Quiz({ state, onStamp }) {
  const questions = useMemo(
    () => makeQuiz({ items: state.items, counts: state.counts, unit: state.unit }),
    [state.items, state.counts, state.unit],
  )
  const [n, setN] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [tries, setTries] = useState(0)

  if (n >= questions.length) {
    return (
      <div className="quiz-done">
        <p className="quiz-done-title">🏅 퀴즈 완료!</p>
        <p>
          {questions.length}문제 중 <strong>{score}문제</strong>를 한 번에 맞혔어요.
        </p>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setN(0)
            setPicked(null)
            setScore(0)
            setTries(0)
          }}
        >
          다시 풀기
        </button>
      </div>
    )
  }

  const q = questions[n]
  const ok = picked !== null && q.answers.includes(picked)

  const choose = (c) => {
    if (ok) return
    setPicked(c)
    const right = q.answers.includes(c)
    if (right && tries === 0) setScore((s) => s + 1)
    if (!right) setTries((t) => t + 1)
    play(right ? 'correct' : 'wrong', state.sound)
    if (right && n === questions.length - 1) onStamp?.()
  }

  return (
    <div className="quiz">
      <p className="quiz-progress">
        문제 {n + 1} / {questions.length}
      </p>
      <p className="quiz-q">Q. {q.q}</p>
      <div className="quiz-choices">
        {q.choices.map((c) => (
          <button
            key={c}
            className={`chip quiz-choice ${picked === c ? (q.answers.includes(c) ? 'right' : 'wrong') : ''}`}
            onClick={() => choose(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className={`quiz-feedback ${ok ? 'right' : 'wrong'}`} role="status">
          {ok ? `⭕ 맞았어요! ${q.explain}` : '❌ 다시 그래프를 살펴볼까요? 그림의 수를 세어 보세요.'}
        </div>
      )}
      {ok && (
        <button
          className="btn btn-primary"
          onClick={() => {
            setN(n + 1)
            setPicked(null)
            setTries(0)
          }}
        >
          {n === questions.length - 1 ? '결과 보기' : '다음 문제 →'}
        </button>
      )}
    </div>
  )
}
