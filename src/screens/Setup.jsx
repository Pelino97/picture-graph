import { useState } from 'react'
import GroupPicker from '../components/GroupPicker.jsx'
import { LIMITS, RECOMMENDED_TOPICS } from '../data/topics.js'
import { setupErrors } from '../lib/state.js'

// 메인 화면: 모둠 고르기 → 주제 고르기(추천 또는 직접 쓰기) → 항목 4가지 → 설문 시작
export default function Setup({ state, dispatch }) {
  // 직접 정하기가 먼저예요. 추천 주제는 탭을 눌러야 보여요.
  const [mode, setMode] = useState(state.topicId ? 'recommend' : 'custom')
  const [showErrors, setShowErrors] = useState(false)
  const errors = setupErrors(state)

  const start = () => {
    if (errors.length) {
      setShowErrors(true)
      return
    }
    dispatch({ type: 'startSurvey' })
  }

  return (
    <main className="screen setup">
      <section className="card">
        <h2 className="section-title">
          <span className="step">1</span> 우리 모둠은?
        </h2>
        <GroupPicker state={state} dispatch={dispatch} />
      </section>

      <section className="card">
        <h2 className="section-title">
          <span className="step">2</span> 조사 주제 정하기
        </h2>
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'custom'}
            className={`tab ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => {
              setMode('custom')
              if (state.topicId) dispatch({ type: 'customTopic', text: '' })
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
          <>
          <p className="hint">마음에 드는 주제를 누르면 예시 항목이 채워져요. 고쳐 써도 돼요.</p>
          <div className="topic-list">
            {RECOMMENDED_TOPICS.map((t) => (
              <button
                key={t.id}
                className={`topic-option ${state.topicId === t.id ? 'selected' : ''}`}
                onClick={() => dispatch({ type: 'pickTopic', id: t.id })}
              >
                <span className="topic-emoji" aria-hidden="true">
                  {t.icons[0]}
                </span>
                <span>{t.title}</span>
              </button>
            ))}
          </div>
          </>
        ) : (
          <label className="field">
            <span className="field-label">우리 모둠이 조사할 주제를 써 보세요.</span>
            <input
              className="input input-lg"
              value={state.topic}
              maxLength={LIMITS.topic}
              placeholder="예) 우리 반 친구들이 좋아하는 계절은?"
              onChange={(e) => dispatch({ type: 'customTopic', text: e.target.value })}
            />
            <span className="counter">
              {state.topic.length}/{LIMITS.topic}
            </span>
          </label>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">
          <span className="step">3</span> 조사 항목 4가지
        </h2>
        {state.topicId && <p className="hint">추천 주제의 예시 항목이 채워졌어요. 고쳐 써도 돼요!</p>}
        <div className="item-grid">
          {state.items.map((v, i) => (
            <label key={i} className="field item-field">
              <span className={`item-badge c${i}`}>{i + 1}</span>
              <input
                className="input"
                value={v}
                maxLength={LIMITS.item}
                placeholder={`항목 ${i + 1}`}
                aria-label={`조사 항목 ${i + 1}`}
                onChange={(e) => dispatch({ type: 'setItem', index: i, text: e.target.value })}
              />
            </label>
          ))}
        </div>
        <label className="field target-field">
          <span className="field-label">조사할 친구 수 (선택, 쓰면 다 모였는지 알려 줘요)</span>
          <input
            className="input input-num"
            type="number"
            inputMode="numeric"
            min={1}
            max={LIMITS.maxTarget}
            value={state.target}
            placeholder="예) 24"
            onChange={(e) => dispatch({ type: 'setTarget', value: e.target.value })}
          />
          <span>명</span>
        </label>
      </section>

      {showErrors && errors.length > 0 && (
        <div className="error-box" role="alert">
          {errors.map((e) => (
            <p key={e}>⚠️ {e}</p>
          ))}
        </div>
      )}

      <div className="bottom-bar">
        <button className="btn btn-primary btn-xl" onClick={start}>
          📋 설문조사 시작
        </button>
      </div>
    </main>
  )
}
