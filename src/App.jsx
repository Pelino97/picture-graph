import { useCallback, useEffect, useReducer, useState } from 'react'
import Modal from './components/Modal.jsx'
import { clearSaved, loadState, reducer, saveState } from './lib/state.js'
import GraphBuilder from './screens/GraphBuilder.jsx'
import Intro from './screens/Intro.jsx'
import Results from './screens/Results.jsx'
import Setup from './screens/Setup.jsx'
import Survey from './screens/Survey.jsx'
import Whiteboard from './screens/Whiteboard.jsx'

const STEPS = [
  { screen: 'setup', label: '주제 정하기' },
  { screen: 'survey', label: '설문조사' },
  { screen: 'results', label: '결과 보기' },
  { screen: 'graph', label: '그림그래프' },
]

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [whiteboard, setWhiteboard] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.screen])

  const closeWhiteboard = useCallback(() => setWhiteboard(false), [])

  if (state.screen === 'intro') {
    const resume = state.resumeScreen && state.resumeScreen !== 'intro' ? state.resumeScreen : null
    return (
      <Intro
        onStart={() => dispatch({ type: 'go', screen: 'setup' })}
        canResume={!!resume && resume !== 'setup'}
        onResume={() => dispatch({ type: 'go', screen: resume })}
      />
    )
  }

  const stepIndex = STEPS.findIndex((s) => s.screen === state.screen)

  return (
    <div className={`app ${state.bigText ? 'big-text' : ''}`}>
      <header className="topbar">
        <button className="brand" onClick={() => dispatch({ type: 'go', screen: 'intro' })} aria-label="처음 화면으로">
          📊 그림 그래프 그리기
        </button>
        <ol className="stepper" aria-label="활동 단계">
          {STEPS.map((s, i) => (
            <li key={s.screen} className={i === stepIndex ? 'now' : i < stepIndex ? 'done' : ''}>
              <span className="dot">{i < stepIndex ? '✓' : i + 1}</span>
              <span className="lbl">{s.label}</span>
            </li>
          ))}
        </ol>
        <div className="topbar-right">
          {state.group && <span className="group-badge">{state.group}조</span>}
          <button
            className="btn btn-ghost btn-sm icon-toggle"
            aria-pressed={state.sound}
            aria-label={state.sound ? '소리 끄기' : '소리 켜기'}
            onClick={() => dispatch({ type: 'toggleSound' })}
          >
            {state.sound ? '🔊' : '🔇'}
          </button>
          <button
            className="btn btn-ghost btn-sm icon-toggle"
            aria-pressed={state.bigText}
            aria-label={state.bigText ? '보통 글씨로' : '큰 글씨로'}
            onClick={() => dispatch({ type: 'toggleBigText' })}
          >
            {state.bigText ? '가-' : '가+'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(true)}>
            새로 시작
          </button>
        </div>
      </header>

      {state.screen === 'setup' && <Setup state={state} dispatch={dispatch} />}
      {state.screen === 'survey' && <Survey state={state} dispatch={dispatch} />}
      {state.screen === 'results' && <Results state={state} dispatch={dispatch} />}
      {state.screen === 'graph' && (
        <GraphBuilder state={state} dispatch={dispatch} onOpenWhiteboard={() => setWhiteboard(true)} />
      )}

      {whiteboard && <Whiteboard state={state} onClose={closeWhiteboard} />}

      {confirmReset && (
        <Modal
          title="처음부터 새로 시작할까요?"
          onClose={() => setConfirmReset(false)}
          actions={
            <>
              <button className="btn btn-ghost btn-lg" onClick={() => setConfirmReset(false)}>
                아니요
              </button>
              <button
                className="btn btn-danger btn-lg"
                onClick={() => {
                  clearSaved()
                  dispatch({ type: 'reset' })
                  setConfirmReset(false)
                }}
              >
                새로 시작
              </button>
            </>
          }
        >
          <p>지금까지 고른 주제, 설문 결과, 그림그래프가 모두 지워져요.</p>
        </Modal>
      )}
    </div>
  )
}
