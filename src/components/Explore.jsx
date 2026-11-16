import { useState } from 'react'
import PictureGraph from './PictureGraph.jsx'
import Quiz from './Quiz.jsx'
import { expectedIcons } from '../lib/graph.js'

const TABS = [
  { id: 'quiz', label: '📝 그래프 읽기 퀴즈' },
  { id: 'unit', label: '⚖️ 단위 바꿔 비교' },
  { id: 'bar', label: '📊 막대그래프로 보기' },
]

// 그래프를 완성한 뒤 더 살펴보는 활동 모음
export default function Explore({ state, onStamp }) {
  const [tab, setTab] = useState('quiz')
  return (
    <div className="explore">
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'quiz' && <Quiz state={state} onStamp={onStamp} />}
      {tab === 'unit' && <UnitCompare state={state} />}
      {tab === 'bar' && <BarGraph state={state} />}
    </div>
  )
}

function UnitCompare({ state }) {
  const view = (unit) => ({ ...state, unit, rows: state.counts.map((c) => expectedIcons(c, unit)) })
  const iconCount = (unit) => view(unit).rows.reduce((a, r) => a + r.big + r.small, 0)
  return (
    <div className="unit-compare">
      <p className="hint">같은 조사 결과를 큰 그림의 크기만 바꿔서 나타냈어요.</p>
      <div className="compare-grid">
        {[10, 5].map((u) => (
          <div key={u} className="compare-col">
            <h4>
              큰 그림 = {u}명 <span className="badge-soft">그림 {iconCount(u)}개</span>
            </h4>
            <PictureGraph state={view(u)} big={30} small={18} />
          </div>
        ))}
      </div>
      <p className="think">💭 생각해 봐요: 어느 쪽이 그리기 편한가요? 큰 그림을 쓰면 무엇이 좋을까요?</p>
    </div>
  )
}

function BarGraph({ state }) {
  const max = Math.max(1, ...state.counts)
  const top = Math.max(5, Math.ceil(max / 5) * 5)
  const ticks = Array.from({ length: top + 1 }, (_, i) => top - i)
  return (
    <div className="bar-wrap">
      <p className="hint">그림 대신 막대의 길이로 나타내면 이렇게 돼요. (4학년에서 더 배워요!)</p>
      <div className="bar-graph" style={{ '--rows': top }}>
        <div className="bar-axis">
          <span className="bar-unit">(명)</span>
          {ticks.map((t) => (
            <span key={t} className="bar-tick">
              {t % 5 === 0 ? t : ''}
            </span>
          ))}
        </div>
        <div className="bar-plot">
          {ticks.slice(0, -1).map((t) => (
            <div key={t} className={`bar-gridline ${t % 5 === 0 ? 'major' : ''}`} />
          ))}
          <div className="bar-bars">
            {state.items.map((name, i) => (
              <div key={name} className="bar-col">
                <div className={`bar c${i}`} style={{ height: `${(state.counts[i] / top) * 100}%` }}>
                  <span className="bar-val">{state.counts[i]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div />
        <div className="bar-labels">
          {state.items.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
