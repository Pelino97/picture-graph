import Mascot from '../components/Mascot.jsx'

const FRIENDS = ['#FF8FAB', '#7BC4FF', '#8FD694', '#C3A6FF']
const DEMO_ROWS = [
  { label: '🎲', n: 4 },
  { label: '🧩', n: 2 },
  { label: '🎨', n: 3 },
]

// 인트로: 그래피가 친구들에게 물어보고(설문) → 그림그래프를 완성하는 짧은 애니메이션
export default function Intro({ onStart, canResume, onResume }) {
  return (
    <main className="intro">
      <h1 className="intro-title">
        <span>그림</span> <span>그래프</span> <span>그리기</span>
      </h1>

      <div className="intro-stage" aria-hidden="true">
        <div className="intro-mascot">
          <Mascot size={150} />
          <div className="bubble bubble-ask">어떤 놀이를 좋아해?</div>
        </div>

        <div className="intro-friends">
          {FRIENDS.map((c, i) => (
            <div key={c} className="friend" style={{ '--d': `${1.2 + i * 0.25}s` }}>
              <div className="friend-head" style={{ background: c }}>
                <span className="friend-eye" />
                <span className="friend-eye" />
              </div>
              <div className="friend-hand" style={{ background: c }} />
              <div className="friend-check">✔</div>
            </div>
          ))}
        </div>

        <div className="intro-graph">
          {DEMO_ROWS.map((row, r) => (
            <div key={row.label} className="intro-row">
              <span className="intro-row-label">{row.label}</span>
              {Array.from({ length: row.n }).map((_, i) => (
                <span
                  key={i}
                  className="intro-dot"
                  style={{ '--d': `${2.8 + r * 0.45 + i * 0.12}s` }}
                >
                  ●
                </span>
              ))}
            </div>
          ))}
          <div className="bubble bubble-done">그림그래프 완성!</div>
        </div>
      </div>

      <div className="intro-buttons">
        <button className="btn btn-primary btn-xl pop-in" onClick={onStart}>
          시작하기
        </button>
        {canResume && (
          <button className="btn btn-ghost btn-lg pop-in" onClick={onResume}>
            하던 활동 이어하기
          </button>
        )}
      </div>
    </main>
  )
}
