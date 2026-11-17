import { useState } from 'react'
import Chart from '../../components/Chart.jsx'
import Mascot from '../../components/Mascot.jsx'
import { LINE_LIMITS as L } from '../../data/lineTopics.js'
import {
  STEP_OPTIONS,
  autoStep,
  checkHorizontal,
  checkPoints,
  checkStep,
  checkWave,
  labelText,
  scaleFor,
  suggestWave,
} from '../../lib/lineLogic.js'
import { play } from '../../lib/sound.js'

// 교과서(4-2 5단원) 꺾은선그래프 그리는 5단계를 하나씩 따라 해요
const STAGES = [
  '가로·세로 정하기',
  '물결선 정하기',
  '눈금 한 칸 정하기',
  '점 찍고 선분 잇기',
  '제목 쓰기',
]

export default function DrawLab({ state, dispatch }) {
  const line = state.line
  const d = line.draw
  const vals = line.values.map(Number)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const [feedback, setFeedback] = useState(null) // { ok, msg }
  const [joined, setJoined] = useState(d.finished || d.stage === 5)
  const sound = state.sound
  const set = (patch) => dispatch({ type: 'line/draw', patch })

  const base = d.waveOn ? d.waveTo : 0
  const scale = scaleFor(vals, { step: d.step || autoStep(max, base), waveTo: d.waveTo, wave: d.waveOn })
  const goStage = (n) => {
    setFeedback(null)
    set({ stage: n })
  }
  const say = (r) => {
    setFeedback(r)
    play(r.ok ? 'correct' : 'wrong', sound)
  }

  // 물결선 슬라이더 간격
  const waveStep = Math.max(1, autoStep(Math.max(1, max - min)))
  const waveMax = Math.floor(min / waveStep) * waveStep

  // 4단계: 점 채점
  const pointCheck = checkPoints(d.points, vals)
  const [marks, setMarks] = useState({})

  const stageBody = () => {
    if (d.stage === 1) {
      const pick = (c) => {
        set({ horizontal: c })
        say(checkHorizontal(c))
      }
      return (
        <>
          <p className="lab-q">가로와 세로에 무엇을 나타내면 좋을까요?</p>
          <div className="choice-cards">
            {[
              ['x', line.xName, line.yName],
              ['y', line.yName, line.xName],
            ].map(([c, h, v]) => (
              <button key={c} className={`choice-card ${d.horizontal === c ? 'selected' : ''}`} onClick={() => pick(c)}>
                <span className="mini-axes" aria-hidden="true">
                  <span className="mini-v">{v} ⬆</span>
                  <span className="mini-h">{h} ➡</span>
                </span>
                <span>
                  가로: <strong>{h}</strong> / 세로: <strong>{v}</strong>
                </span>
              </button>
            ))}
          </div>
        </>
      )
    }
    if (d.stage === 2) {
      const toggle = (on) => {
        const waveTo = on ? suggestWave(line.values) || waveMax : 0
        set({ waveOn: on, waveTo })
        setFeedback(null)
      }
      return (
        <>
          <p className="lab-q">
            가장 작은 값은 <strong>{min}</strong>, 가장 큰 값은 <strong>{max}</strong>이에요. 필요 없는 부분을 물결선으로 줄일까요?
          </p>
          <div className="seg-toggle">
            <button className={`seg ${!d.waveOn ? 'active' : ''}`} onClick={() => toggle(false)}>
              물결선 없이
            </button>
            <button className={`seg ${d.waveOn ? 'active' : ''}`} onClick={() => toggle(true)} disabled={waveMax <= 0}>
              〰️ 물결선 넣기
            </button>
          </div>
          {waveMax <= 0 && <p className="hint">가장 작은 값이 작아서 물결선을 넣을 자리가 없어요.</p>}
          {d.waveOn && (
            <label className="slider-field">
              <span>
                0과 <strong>{d.waveTo}</strong> 사이를 물결선으로 줄여요
              </span>
              <input
                type="range"
                min={0}
                max={waveMax}
                step={waveStep}
                value={d.waveTo}
                onChange={(e) => {
                  set({ waveTo: Number(e.target.value) })
                  setFeedback(null)
                }}
              />
            </label>
          )}
          <button className="btn btn-primary" onClick={() => say(checkWave(d.waveOn, d.waveTo, line.values))}>
            확인하기
          </button>
        </>
      )
    }
    if (d.stage === 3) {
      return (
        <>
          <p className="lab-q">
            가장 큰 값 <strong>{max}</strong>까지 나타낼 수 있도록 눈금 한 칸의 크기를 골라요.
          </p>
          <div className="step-chips" role="radiogroup" aria-label="눈금 한 칸의 크기">
            {STEP_OPTIONS.filter((s) => s <= Math.max(5, max)).map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={d.step === s}
                className={`chip ${d.step === s ? 'selected' : ''}`}
                onClick={() => {
                  set({ step: s })
                  say(checkStep(s, vals, base))
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )
    }
    if (d.stage === 4) {
      const check = () => {
        const m = {}
        d.points.forEach((p, i) => {
          if (p !== null) m[i] = pointCheck.wrong.includes(i) ? 'wrong' : 'right'
        })
        setMarks(m)
        if (pointCheck.ok) say({ ok: true, msg: '점을 모두 바르게 찍었어요! 이제 점들을 선분으로 이어 볼까요?' })
        else {
          const empty = d.points.filter((p) => p === null).length
          say({
            ok: false,
            msg: empty
              ? `아직 찍지 않은 점이 ${empty}개 있어요. ↕ 를 위로 끌어 올려요.`
              : `빨간 점 ${pointCheck.wrong.length}개를 다시 살펴보세요. 표의 수와 같은 눈금에 있나요?`,
          })
        }
      }
      return (
        <>
          <p className="lab-q">
            {line.xName}마다 {line.yName}에 맞게 <strong>↕ 점을 끌어 올려</strong> 찍어요.
          </p>
          <div className="target-strip">
            {line.labels.map((l, i) => (
              <span key={i} className={`target ${marks[i] || ''}`}>
                {labelText(l, line.xUnit)} <strong>{line.values[i]}</strong>
              </span>
            ))}
          </div>
          <div className="lab-actions">
            <button className="btn btn-primary" onClick={check}>
              점 확인하기
            </button>
            <button
              className="btn btn-ghost btn-sun"
              disabled={!pointCheck.ok}
              onClick={() => {
                setJoined(true)
                play('place', sound)
                setFeedback({ ok: true, msg: '선분으로 이었어요! 선분이 올라가면 늘어난 것, 내려가면 줄어든 것이에요.' })
              }}
            >
              〰 선분으로 잇기
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                dispatch({ type: 'line/draw', patch: { points: d.points.map(() => null) } })
                setMarks({})
                setJoined(false)
                setFeedback(null)
              }}
            >
              점 모두 지우기
            </button>
          </div>
        </>
      )
    }
    return (
      <>
        <p className="lab-q">무엇을 나타낸 그래프인지 알 수 있게 제목을 써요.</p>
        <label className="field">
          <input
            className="input input-lg"
            value={d.title}
            maxLength={L.topic}
            placeholder={`예) ${line.xName}별 ${line.yName}`}
            onChange={(e) => set({ title: e.target.value })}
          />
        </label>
        <button className="btn btn-ghost btn-sm" onClick={() => set({ title: `${line.xName}별 ${line.yName}` })}>
          💡 제목 예시 넣기
        </button>
      </>
    )
  }

  const stageOk = [
    d.horizontal === 'x',
    checkWave(d.waveOn, d.waveTo, line.values).ok && feedback?.ok !== false,
    d.step && checkStep(d.step, vals, base).ok,
    pointCheck.ok && joined,
    d.title.trim().length > 0,
  ][d.stage - 1]

  const nextStage = () => {
    if (!stageOk) return
    if (d.stage === 1) set({ stage: 2 })
    else if (d.stage === 2) set({ stage: 3, step: d.step && checkStep(d.step, vals, base).ok ? d.step : null })
    else if (d.stage < 5) set({ stage: d.stage + 1 })
    setFeedback(null)
    if (d.stage === 5) {
      set({ finished: true })
      play('correct', sound)
      dispatch({ type: 'line/tool', patch: { title: d.title.trim() } })
      dispatch({ type: 'go', screen: 'l-tool' })
    }
  }

  const showPoints = d.stage >= 4
  const chartValues = showPoints ? d.points : line.labels.map(() => null)

  return (
    <main className="screen draw-lab">
      <ol className="lab-steps" aria-label="꺾은선그래프 그리는 순서">
        {STAGES.map((s, i) => (
          <li key={s} className={i + 1 === d.stage ? 'now' : i + 1 < d.stage ? 'done' : ''}>
            <button disabled={i + 1 > d.stage} onClick={() => goStage(i + 1)}>
              <span className="dot">{i + 1 < d.stage ? '✓' : i + 1}</span> {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="lab-layout">
        <section className="card lab-panel">
          <h2 className="section-title">
            <span className="step">{d.stage}</span> {STAGES[d.stage - 1]}
          </h2>
          {stageBody()}
          {feedback && (
            <div className={`lab-feedback ${feedback.ok ? 'right' : 'wrong'}`} role="status">
              <Mascot size={54} />
              <p>
                {feedback.ok ? '⭕ ' : '🤔 '}
                {feedback.msg}
              </p>
            </div>
          )}
        </section>

        <section className="card lab-chart">
          {d.stage === 1 && d.horizontal !== 'x' ? (
            <div className="lab-empty">
              <Mascot size={90} />
              <p>가로와 세로를 정하면 그래프 종이가 나타나요.</p>
            </div>
          ) : (
            <Chart
              type="line"
              labels={line.labels}
              values={chartValues}
              scale={scale}
              xName={line.xName}
              xUnit={line.xUnit}
              yName={line.yName}
              yUnit={line.yUnit}
              title={d.stage === 5 ? d.title : ''}
              interactive={d.stage === 4 && !joined}
              showLine={joined}
              showValues={d.stage >= 4}
              marks={d.stage === 4 && !joined ? marks : {}}
              onChange={(i, v) => {
                dispatch({ type: 'line/drawPoint', index: i, value: v })
                if (marks[i]) setMarks((m) => ({ ...m, [i]: undefined }))
              }}
            />
          )}
          {d.stage >= 3 && (
            <p className="scale-note">
              눈금 한 칸 = <strong>{scale.step}</strong>
              {line.yUnit} · {scale.rows}칸{scale.wave ? ` · 물결선 0~${scale.base}` : ''}
            </p>
          )}
        </section>
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-ghost btn-lg"
          onClick={() => (d.stage > 1 ? goStage(d.stage - 1) : dispatch({ type: 'go', screen: 'l-table' }))}
        >
          ← {d.stage > 1 ? '이전 단계' : '자료 표'}
        </button>
        <button className="btn btn-primary btn-xl" disabled={!stageOk} onClick={nextStage}>
          {d.stage === 5 ? '🎉 완성! 공학 도구로' : '다음 단계 →'}
        </button>
      </div>
    </main>
  )
}
