import { useState } from 'react'
import Chart from '../../components/Chart.jsx'
import { LINE_LIMITS as L, findLineTopic } from '../../data/lineTopics.js'
import { labelText, lineTableErrors, scaleFor } from '../../lib/lineLogic.js'
import { play } from '../../lib/sound.js'

const LINKS = {
  heatwave: { href: 'https://data.kma.go.kr', name: '기상자료개방포털' },
  dust: { href: 'https://www.airkorea.or.kr', name: '에어코리아' },
}

// 4학년 2단계: 조사한 자료를 표로 정리해요. 표를 고치면 옆 그래프가 바로 움직여요.
export default function LineTable({ state, dispatch }) {
  const line = state.line
  const topic = findLineTopic(line.topicId)
  const [showErrors, setShowErrors] = useState(false)
  const errors = lineTableErrors(line)
  const nums = line.values.map((v) => (v === '' ? null : Number(v)))
  const scale = scaleFor(nums.map((v) => (v === null ? '' : v)), {})

  const setValue = (i, v) => dispatch({ type: 'line/value', index: i, value: v })
  const bump = (i, d) => {
    const cur = line.values[i] === '' ? 0 : Number(line.values[i])
    setValue(i, Math.max(0, cur + d))
    play(d > 0 ? 'pop' : 'minus', state.sound)
  }
  const next = () => {
    if (errors.length) return setShowErrors(true)
    dispatch({ type: 'go', screen: 'l-draw' })
  }
  const link = LINKS[line.topicId]

  return (
    <main className="screen line-table">
      <section className="card research-card">
        <h2 className="section-title">
          <span className="step">🔎</span> 자료를 조사해요
        </h2>
        <p className="topic-line">{line.topic}</p>
        <p className="hint">
          {topic ? topic.how : '언제(가로)마다 얼마인지(세로)를 같은 방법으로 여러 번 조사해요.'}
          {link && (
            <>
              {' '}
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.name} 열기 ↗
              </a>
            </>
          )}
        </p>
        {topic && (
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'line/sample' })}>
            🧪 연습용 예시 자료 넣기
          </button>
        )}
      </section>

      <div className="table-layout">
        <section className="card">
          <h2 className="section-title">
            <span className="step">2</span> 표로 정리하기
          </h2>
          <table className="line-input-table">
            <thead>
              <tr>
                <th>
                  {line.xName}
                  {line.xUnit && `(${line.xUnit})`}
                </th>
                <th>
                  {line.yName}
                  {line.yUnit && `(${line.yUnit})`}
                </th>
              </tr>
            </thead>
            <tbody>
              {line.labels.map((l, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className="input"
                      value={l}
                      maxLength={L.label}
                      aria-label={`${i + 1}번째 ${line.xName}`}
                      placeholder={`${i + 1}번째`}
                      onChange={(e) => dispatch({ type: 'line/label', index: i, value: e.target.value })}
                    />
                  </td>
                  <td>
                    <div className="stepper-input">
                      <button className="btn btn-round minus" aria-label="1 빼기" onClick={() => bump(i, -1)}>
                        −
                      </button>
                      <input
                        className="input input-num"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={L.maxValue}
                        value={line.values[i]}
                        aria-label={`${labelText(l, line.xUnit) || i + 1 + '번째'}의 ${line.yName}`}
                        onChange={(e) => setValue(i, e.target.value)}
                      />
                      <button className="btn btn-round plus" aria-label="1 더하기" onClick={() => bump(i, 1)}>
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="count-row">
            <span>조사한 횟수 {line.labels.length}번</span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={line.labels.length <= L.minPoints}
              onClick={() => dispatch({ type: 'line/count', n: line.labels.length - 1 })}
            >
              − 줄이기
            </button>
            <button
              className="btn btn-ghost btn-sm"
              disabled={line.labels.length >= L.maxPoints}
              onClick={() => dispatch({ type: 'line/count', n: line.labels.length + 1 })}
            >
              + 늘리기
            </button>
          </div>
        </section>

        <section className="card preview-card">
          <h2 className="section-title">
            <span className="step">👀</span> 미리 보기
          </h2>
          <p className="hint">표의 수를 바꾸면 점이 움직여요. 점을 위아래로 끌어도 표가 바뀌어요!</p>
          <Chart
            type="line"
            labels={line.labels.map((l) => labelText(l, ''))}
            values={nums}
            scale={scale}
            xName={line.xName}
            xUnit={line.xUnit}
            yName={line.yName}
            yUnit={line.yUnit}
            interactive
            onChange={(i, v) => setValue(i, v)}
          />
        </section>
      </div>

      {showErrors && errors.length > 0 && (
        <div className="error-box" role="alert">
          {errors.map((e) => (
            <p key={e}>⚠️ {e}</p>
          ))}
        </div>
      )}
      <div className="bottom-bar">
        <button className="btn btn-ghost btn-lg" onClick={() => dispatch({ type: 'go', screen: 'l-setup' })}>
          ← 주제
        </button>
        <button className="btn btn-primary btn-xl" onClick={next}>
          ✏️ 꺾은선그래프 그리기
        </button>
      </div>
    </main>
  )
}
