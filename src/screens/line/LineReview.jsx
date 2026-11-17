import { useMemo, useState } from 'react'
import Chart from '../../components/Chart.jsx'
import Quiz from '../../components/Quiz.jsx'
import SelfCheck from '../../components/SelfCheck.jsx'
import { LINE_SELF_CHECKS } from '../../data/selfCheck.js'
import { LINE_LIMITS as L } from '../../data/lineTopics.js'
import { makeLineQuiz, toolScale } from '../../lib/lineLogic.js'

const STARTERS = ['가장 많이 늘어난 때는', '가장 적은 때는', '전체적으로', '앞으로는 ~ 될 것 같아요. 왜냐하면']

// 4학년 5단계: 그래프를 읽고, 비교하고, 알게 된 점을 정리해요
export default function LineReview({ state, dispatch, onOpenWhiteboard }) {
  const line = state.line
  const vals = line.values.map(Number)
  const scale = toolScale(line)
  const questions = useMemo(() => makeLineQuiz(line), [line])
  const [compare, setCompare] = useState(false)
  const common = {
    labels: line.labels,
    values: vals,
    scale,
    xName: line.xName,
    xUnit: line.xUnit,
    yName: line.yName,
    yUnit: line.yUnit,
  }

  return (
    <main className="screen line-review">
      <section className="card">
        <h2 className="section-title">
          <span className="step">1</span> 그래프 읽기 퀴즈
        </h2>
        <div className="review-layout">
          <Chart type="line" {...common} title={line.tool.title || line.topic} color={line.tool.color} showValues showChange />
          <Quiz
            state={state}
            questions={questions}
            sound={state.sound}
            wrongHint="❌ 다시 살펴볼까요? 점의 높이와 선분의 기울기를 비교해 보세요."
          />
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          <span className="step">2</span> 막대그래프와 비교하기
        </h2>
        <p className="hint">같은 자료를 두 가지 그래프로 나타내 보았어요. 변화의 모습은 어느 그래프에서 더 잘 보이나요?</p>
        {compare ? (
          <div className="compare-grid">
            <figure>
              <Chart type="bar" {...common} title="막대그래프" showValues />
            </figure>
            <figure>
              <Chart type="line" {...common} title="꺾은선그래프" color={line.tool.color} showValues />
            </figure>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sun" onClick={() => setCompare(true)}>
            📊📈 나란히 놓고 보기
          </button>
        )}
        <ul className="talk-list">
          <li>💬 다른 모둠의 그래프와 비교해 보고, 같은 점과 다른 점을 이야기해 보세요.</li>
          <li>💬 변화가 가장 큰 때에 무슨 일이 있었을지 까닭을 생각해 보세요.</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="section-title">
          <span className="step">3</span> 알게 된 점 쓰기
        </h2>
        <div className="starter-row">
          {STARTERS.map((s) => (
            <button
              key={s}
              className="chip chip-sm"
              onClick={() => dispatch({ type: 'line/insight', text: (line.insight ? line.insight + ' ' : '') + s + ' ' })}
            >
              {s}…
            </button>
          ))}
        </div>
        <textarea
          className="input textarea"
          rows={4}
          maxLength={L.insight}
          value={line.insight}
          placeholder="그래프를 보고 알게 된 점과 앞으로의 변화를 예상해 써 보세요."
          onChange={(e) => dispatch({ type: 'line/insight', text: e.target.value })}
        />
        <span className="counter">
          {line.insight.length}/{L.insight}
        </span>
      </section>

      <section className="card">
        <h2 className="section-title">
          <span className="step">4</span> 스스로 평가
        </h2>
        <SelfCheck items={LINE_SELF_CHECKS} checks={line.selfCheck} onToggle={(i) => dispatch({ type: 'line/selfCheck', index: i })} />
      </section>

      <div className="bottom-bar">
        <button className="btn btn-ghost btn-lg" onClick={() => dispatch({ type: 'go', screen: 'l-tool' })}>
          ← 공학 도구
        </button>
        <button className="btn btn-primary btn-xl" disabled={!line.insight.trim()} onClick={onOpenWhiteboard}>
          🖥️ 화이트보드로 발표하기
        </button>
      </div>
    </main>
  )
}
