import { useMemo, useState } from 'react'
import { isCorrect, makeQuiz } from '../lib/quiz.js'
import { play } from '../lib/sound.js'

// 그래프 읽기 퀴즈: 한 문제씩, 틀리면 힌트를 보고 다시 골라요.
// '가장 많은/적은 것' 문제는 같은 수가 여러 개면 모두 골라야 정답이에요.
export default function Quiz({ state, onStamp, questions: given, sound, wrongHint = '❌ 다시 그래프를 살펴볼까요? 그림의 수를 세어 보세요.' }) {
  const made = useMemo(
    () => (given ? null : makeQuiz({ items: state.items, counts: state.counts, unit: state.unit })),
    [given, state.items, state.counts, state.unit],
  )
  const questions = given || made
  const soundOn = sound ?? state.sound
  const [n, setN] = useState(0)
  const [picked, setPicked] = useState([]) // 고른 답 목록
  const [checked, setChecked] = useState(null) // null | 'right' | 'wrong'
  const [score, setScore] = useState(0)
  const [tries, setTries] = useState(0)

  const reset = (next) => {
    setN(next)
    setPicked([])
    setChecked(null)
    setTries(0)
  }

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
            reset(0)
            setScore(0)
          }}
        >
          다시 풀기
        </button>
      </div>
    )
  }

  const q = questions[n]
  const ok = checked === 'right'

  const grade = (list) => {
    const right = isCorrect(q, list)
    setChecked(right ? 'right' : 'wrong')
    if (right && tries === 0) setScore((s) => s + 1)
    if (!right) setTries((t) => t + 1)
    play(right ? 'correct' : 'wrong', soundOn)
    if (right && n === questions.length - 1) onStamp?.()
  }

  const choose = (c) => {
    if (ok) return
    if (q.multi) {
      setPicked((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]))
      setChecked(null)
      return
    }
    setPicked([c])
    grade([c])
  }

  const choiceClass = (c) => {
    if (!picked.includes(c)) return ''
    if (q.multi && checked === null) return 'selected'
    if (q.multi && checked === 'wrong') return 'selected'
    return q.answers.includes(c) ? 'right' : 'wrong'
  }

  return (
    <div className="quiz">
      <p className="quiz-progress">
        문제 {n + 1} / {questions.length}
      </p>
      <p className="quiz-q">Q. {q.q}</p>
      {q.multi && <p className="quiz-multi-tip">✅ 같은 수인 것이 있으면 모두 골라요. 다 골랐으면 '정답 확인'을 눌러요.</p>}
      <div className="quiz-choices">
        {q.choices.map((c) => (
          <button
            key={c}
            aria-pressed={q.multi ? picked.includes(c) : undefined}
            className={`chip quiz-choice ${choiceClass(c)}`}
            onClick={() => choose(c)}
          >
            {q.multi && <span className="quiz-box" aria-hidden="true">{picked.includes(c) ? '✔' : ''}</span>}
            {c}
          </button>
        ))}
      </div>
      {q.multi && !ok && (
        <button className="btn btn-primary" disabled={picked.length === 0} onClick={() => grade(picked)}>
          정답 확인
        </button>
      )}
      {checked && (
        <div className={`quiz-feedback ${ok ? 'right' : 'wrong'}`} role="status">
          {ok
            ? `⭕ 맞았어요! ${q.explain}`
            : q.multi && picked.length < q.answers.length && picked.every((p) => q.answers.includes(p))
              ? '🤔 거의 다 왔어요! 같은 수인 것이 더 있는지 살펴보세요.'
              : wrongHint}
        </div>
      )}
      {ok && (
        <button className="btn btn-primary" onClick={() => reset(n + 1)}>
          {n === questions.length - 1 ? '결과 보기' : '다음 문제 →'}
        </button>
      )}
    </div>
  )
}
