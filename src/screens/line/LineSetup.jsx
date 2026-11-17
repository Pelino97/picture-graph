import { useState } from 'react'
import GroupPicker from '../../components/GroupPicker.jsx'
import { LINE_LIMITS as L, LINE_TOPICS } from '../../data/lineTopics.js'
import { lineStartErrors } from '../../lib/state.js'

// 4학년 1단계: 모둠 → 주제(직접 정하기 먼저) → 가로·세로에 나타낼 것
export default function LineSetup({ state, dispatch }) {
  const line = state.line
  const [mode, setMode] = useState(line.topicId ? 'recommend' : 'custom')
  const [showErrors, setShowErrors] = useState(false)
  const errors = lineStartErrors(state)
  const field = (name) => (e) => dispatch({ type: 'line/field', name, value: e.target.value })

  const next = () => {
    if (errors.length) return setShowErrors(true)
    dispatch({ type: 'go', screen: 'l-table' })
  }

  return (
    <main className="screen setup line-setup">
      <section className="card">
        <h2 className="section-title">
          <span className="step">1</span> 우리 모둠은?
        </h2>
        <GroupPicker state={state} dispatch={dispatch} />
      </section>

      <section className="card">
        <h2 className="section-title">
          <span className="step">2</span> 무엇의 변화를 조사할까요?
        </h2>
        <p className="hint">꺾은선그래프는 <strong>시간에 따라 변하는 것</strong>을 나타낼 때 좋아요. (예: 연도별, 월별, 주별, 시각별)</p>
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'custom'}
            className={`tab ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => {
              setMode('custom')
              if (line.topicId) dispatch({ type: 'line/custom', text: '' })
            }}
          >
            ✏️ 직접 정하기
          </button>
          <button
            role="tab"
            aria-selected={mode === 'recommend'}
            className={`tab ${mode === 'recommend' ? 'active' : ''}`}
            onClick={() => setMode('recommend')}
          >
            ⭐ 추천 주제
          </button>
        </div>
        {mode === 'recommend' ? (
          <div className="topic-list">
            {LINE_TOPICS.map((t) => (
              <button
                key={t.id}
                className={`topic-option ${line.topicId === t.id ? 'selected' : ''}`}
                onClick={() => dispatch({ type: 'line/pickTopic', id: t.id })}
              >
                <span className="topic-emoji" aria-hidden="true">
                  {t.icon}
                </span>
                <span>{t.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <label className="field">
            <span className="field-label">우리 모둠이 조사할 주제를 써 보세요.</span>
            <input
              className="input input-lg"
              value={line.topic}
              maxLength={L.topic}
              placeholder="예) 우리 동네의 월별 비 온 날수는 어떻게 변할까?"
              onChange={(e) => dispatch({ type: 'line/custom', text: e.target.value })}
            />
            <span className="counter">
              {line.topic.length}/{L.topic}
            </span>
          </label>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">
          <span className="step">3</span> 가로와 세로에 나타낼 것
        </h2>
        {line.topicId && <p className="hint">추천 주제에 맞게 채워 두었어요. 고쳐 써도 돼요!</p>}
        <div className="axis-grid">
          <div className="axis-card axis-x">
            <span className="axis-tag">➡️ 가로 (시간)</span>
            <input className="input" aria-label="가로 이름" value={line.xName} maxLength={L.axisName} placeholder="예) 연도" onChange={field('xName')} />
            <input className="input input-unit" aria-label="가로 단위" value={line.xUnit} maxLength={L.unit} placeholder="단위(년)" onChange={field('xUnit')} />
          </div>
          <div className="axis-card axis-y">
            <span className="axis-tag">⬆️ 세로 (조사한 수)</span>
            <input className="input" aria-label="세로 이름" value={line.yName} maxLength={L.axisName} placeholder="예) 폭염일수" onChange={field('yName')} />
            <input className="input input-unit" aria-label="세로 단위" value={line.yUnit} maxLength={L.unit} placeholder="단위(일)" onChange={field('yUnit')} />
          </div>
        </div>
      </section>

      {showErrors && errors.length > 0 && (
        <div className="error-box" role="alert">
          {errors.map((e) => (
            <p key={e}>⚠️ {e}</p>
          ))}
        </div>
      )}
      <div className="bottom-bar">
        <button className="btn btn-primary btn-xl" onClick={next}>
          📋 자료 조사하러 가기
        </button>
      </div>
    </main>
  )
}
