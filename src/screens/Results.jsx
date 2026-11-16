// 설문 결과 화면: 주제 + 항목별 결과 표, 조사가 끝나면 '그림그래프로 그리기' 버튼이 반짝여요
export default function Results({ state, dispatch }) {
  const total = state.counts.reduce((a, b) => a + b, 0)
  const target = state.target || null
  const done = total > 0 && (target === null || total === target)

  return (
    <main className="screen results">
      <div className="candy candy-topic">
        <h2>{state.topic}</h2>
      </div>

      <div className="card">
        <table className="result-table">
          <caption>{state.group}조 설문 결과</caption>
          <thead>
            <tr>
              <th scope="col">항목</th>
              {state.items.map((n, i) => (
                <th key={n} scope="col" className={`th-c${i}`}>
                  {n}
                </th>
              ))}
              <th scope="col">합계</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">사람 수(명)</th>
              {state.counts.map((c, i) => (
                <td key={i}>{c}</td>
              ))}
              <td className="td-total">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!done && (
        <p className="hint center">
          {target
            ? `아직 ${target - total > 0 ? `${target - total}명이 투표하지 않았어요.` : `조사할 친구 수(${target}명)보다 ${total - target}명 많아요.`} 설문을 마저 해 주세요.`
            : '설문을 먼저 해 주세요.'}
        </p>
      )}

      <div className="bottom-bar">
        <button className="btn btn-ghost btn-lg" onClick={() => dispatch({ type: 'go', screen: 'survey' })}>
          ← 설문으로 돌아가기
        </button>
        <button
          className={`btn btn-primary btn-xl ${done ? 'sparkle' : ''}`}
          disabled={!done}
          onClick={() => dispatch({ type: 'go', screen: 'graph' })}
        >
          ✨ 그림그래프로 그리기
        </button>
      </div>
    </main>
  )
}
