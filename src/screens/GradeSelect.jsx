import Mascot from '../components/Mascot.jsx'

// 학년 고르기: 3학년은 그림그래프, 4학년은 꺾은선그래프
export default function GradeSelect({ dispatch, current }) {
  return (
    <main className="screen grade-select">
      <div className="grade-head">
        <Mascot size={110} />
        <div className="bubble grade-bubble">몇 학년 그래프를 그려 볼까요?</div>
      </div>
      <div className="grade-cards">
        <button className="grade-card g3" onClick={() => dispatch({ type: 'setGrade', grade: 3 })}>
          <span className="grade-num">3학년</span>
          <span className="grade-name">그림그래프</span>
          <span className="grade-pic" aria-hidden="true">
            <span>🍎🍎🍏</span>
            <span>🍎🍏🍏🍏</span>
            <span>🍎🍎🍎</span>
          </span>
          <span className="grade-desc">조사한 수를 큰 그림·작은 그림으로 나타내요</span>
          {current === 3 && <span className="grade-now">하던 활동</span>}
        </button>
        <button className="grade-card g4" onClick={() => dispatch({ type: 'setGrade', grade: 4 })}>
          <span className="grade-num">4학년</span>
          <span className="grade-name">꺾은선그래프</span>
          <span className="grade-pic" aria-hidden="true">
            <svg viewBox="0 0 160 80" width="160" height="80">
              <path d="M8 4v68h148" fill="none" stroke="#5B4636" strokeWidth="3" />
              <polyline className="grade-line" points="22,58 52,44 82,50 112,26 142,14" fill="none" stroke="#4A9BE0" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
              {[
                [22, 58],
                [52, 44],
                [82, 50],
                [112, 26],
                [142, 14],
              ].map(([x, y]) => (
                <circle key={x} cx={x} cy={y} r="5" fill="#fff" stroke="#4A9BE0" strokeWidth="3" />
              ))}
            </svg>
          </span>
          <span className="grade-desc">시간에 따라 변하는 모습을 선으로 나타내요</span>
          {current === 4 && <span className="grade-now">하던 활동</span>}
        </button>
      </div>
    </main>
  )
}
