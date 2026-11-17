import { useState } from 'react'
import Chart, { LINE_COLORS } from '../../components/Chart.jsx'
import { LINE_LIMITS as L } from '../../data/lineTopics.js'
import { COLORS, STEP_OPTIONS, labelText, suggestWave, toolScale } from '../../lib/lineLogic.js'

// 4학년 4단계: 이지통계처럼 표를 넣고, 그래프를 고르고, 설정을 바꿔 보는 공학 도구
const TYPES = [
  { id: 'bar', name: '막대', icon: '📊' },
  { id: 'line', name: '꺾은선', icon: '📈' },
  { id: 'band', name: '띠', icon: '🎗️' },
  { id: 'pie', name: '원', icon: '🥧' },
]
const COLOR_NAMES = { pink: '분홍', blue: '파랑', green: '초록', purple: '보라' }

export default function EasyTool({ state, dispatch }) {
  const line = state.line
  const tool = line.tool
  const [order, setOrder] = useState('time') // 'time' | 'desc'
  const setTool = (patch) => dispatch({ type: 'line/tool', patch })
  const field = (name) => (e) => dispatch({ type: 'line/field', name, value: e.target.value })
  const vals = line.values.map(Number)
  const scale = toolScale(line)
  const canWave = suggestWave(line.values) > 0
  const sortable = tool.type !== 'line'

  let idx = line.labels.map((_, i) => i)
  if (sortable && order === 'desc') idx = [...idx].sort((a, b) => vals[b] - vals[a])
  const sliderMax = Math.max(10, Math.ceil((Math.max(...vals) * 1.5) / 10) * 10)

  return (
    <main className="screen easy-tool">
      <div className="tool-window">
        <div className="tool-titlebar">
          <span className="tool-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>우리 모둠 통계 도구</strong>
          <span className="tool-sub">표 입력 → 그래프 고르기 → 설정 바꾸기</span>
        </div>

        <div className="tool-grid">
          {/* ① 표 입력 */}
          <section className="tool-panel tool-data">
            <h3>① 표 입력</h3>
            <table className="tool-table">
              <thead>
                <tr>
                  <th>{line.xName}</th>
                  <th>{line.yName}</th>
                </tr>
              </thead>
              <tbody>
                {line.labels.map((l, i) => (
                  <tr key={i}>
                    <td>{labelText(l, line.xUnit)}</td>
                    <td>
                      <input
                        className="input input-num"
                        type="number"
                        min={0}
                        max={L.maxValue}
                        value={line.values[i]}
                        aria-label={`${labelText(l, line.xUnit)} ${line.yName}`}
                        onChange={(e) => dispatch({ type: 'line/value', index: i, value: e.target.value })}
                      />
                      <input
                        type="range"
                        className="tool-slider"
                        min={0}
                        max={sliderMax}
                        value={line.values[i]}
                        aria-label={`${labelText(l, line.xUnit)} 값 바꾸기`}
                        onChange={(e) => dispatch({ type: 'line/value', index: i, value: e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hint small">값을 바꾸면 그래프가 바로 움직여요. 그래프의 점·막대를 끌어도 돼요.</p>
          </section>

          {/* ② 그래프 */}
          <section className="tool-panel tool-chart">
            <div className="type-tabs" role="tablist" aria-label="그래프 종류">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tool.type === t.id}
                  className={`type-tab ${tool.type === t.id ? 'active' : ''}`}
                  onClick={() => setTool({ type: t.id })}
                >
                  <span aria-hidden="true">{t.icon}</span> {t.name}그래프
                </button>
              ))}
            </div>
            <Chart
              type={tool.type}
              labels={idx.map((i) => line.labels[i])}
              values={idx.map((i) => vals[i])}
              scale={scale}
              xName={line.xName}
              xUnit={line.xUnit}
              yName={line.yName}
              yUnit={line.yUnit}
              title={tool.title}
              color={tool.color}
              showValues={tool.showValues}
              showChange={tool.showChange && tool.type === 'line'}
              interactive={tool.type === 'line' || tool.type === 'bar'}
              onChange={(k, v) => dispatch({ type: 'line/value', index: idx[k], value: v })}
            />
            <p className={`type-note ${tool.type}`}>
              {tool.type === 'line' && '📈 꺾은선그래프: 시간에 따라 변하는 모습(늘어남·줄어듦)이 한눈에 보여요.'}
              {tool.type === 'bar' && '📊 막대그래프: 각각의 크기를 비교하기 좋아요. 변화의 흐름은 꺾은선그래프가 더 잘 보여요.'}
              {(tool.type === 'band' || tool.type === 'pie') &&
                '🔭 띠그래프·원그래프는 6학년에서 배워요. 전체에 대한 부분의 비율을 볼 때 써요. 시간에 따른 변화를 볼 때는 꺾은선그래프가 알맞아요.'}
            </p>
          </section>

          {/* ③ 설정 */}
          <section className="tool-panel tool-settings">
            <h3>③ 그래프 설정</h3>
            <label className="set-row">
              <span>그래프 제목</span>
              <input className="input" value={tool.title} maxLength={L.topic} onChange={(e) => setTool({ title: e.target.value })} />
            </label>
            <div className="set-row two">
              <label>
                <span>가로 이름</span>
                <input className="input" value={line.xName} maxLength={L.axisName} onChange={field('xName')} />
              </label>
              <label>
                <span>단위</span>
                <input className="input input-unit" value={line.xUnit} maxLength={L.unit} onChange={field('xUnit')} />
              </label>
            </div>
            <div className="set-row two">
              <label>
                <span>세로 이름</span>
                <input className="input" value={line.yName} maxLength={L.axisName} onChange={field('yName')} />
              </label>
              <label>
                <span>단위</span>
                <input className="input input-unit" value={line.yUnit} maxLength={L.unit} onChange={field('yUnit')} />
              </label>
            </div>
            {(tool.type === 'line' || tool.type === 'bar') && (
              <>
                <label className="set-row">
                  <span>눈금 간격</span>
                  <select className="input" value={tool.step} onChange={(e) => setTool({ step: Number(e.target.value) })}>
                    <option value={0}>자동 ({scale.step})</option>
                    {STEP_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="set-check">
                  <input type="checkbox" checked={tool.wave} disabled={!canWave} onChange={(e) => setTool({ wave: e.target.checked })} />
                  <span>〰️ 물결선 {canWave ? `(0~${suggestWave(line.values)} 줄이기)` : '(작은 값이 0에 가까워 필요 없어요)'}</span>
                </label>
              </>
            )}
            <label className="set-check">
              <input type="checkbox" checked={tool.showValues} onChange={(e) => setTool({ showValues: e.target.checked })} />
              <span>🔢 수량 보이기</span>
            </label>
            {tool.type === 'line' && (
              <label className="set-check">
                <input type="checkbox" checked={tool.showChange} onChange={(e) => setTool({ showChange: e.target.checked })} />
                <span>▲▼ 변화의 크기 보기</span>
              </label>
            )}
            {sortable && (
              <div className="set-row">
                <span>항목 정렬</span>
                <div className="seg-toggle small">
                  <button className={`seg ${order === 'time' ? 'active' : ''}`} onClick={() => setOrder('time')}>
                    원래 순서
                  </button>
                  <button className={`seg ${order === 'desc' ? 'active' : ''}`} onClick={() => setOrder('desc')}>
                    큰 순서
                  </button>
                </div>
              </div>
            )}
            {tool.type === 'line' && (
              <div className="set-row">
                <span>선 색</span>
                <div className="color-row">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className={`color-dot ${tool.color === c ? 'selected' : ''}`}
                      style={{ background: LINE_COLORS[c] }}
                      aria-label={`${COLOR_NAMES[c]}색`}
                      aria-pressed={tool.color === c}
                      onClick={() => setTool({ color: c })}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="bottom-bar">
        <button className="btn btn-ghost btn-lg" onClick={() => dispatch({ type: 'go', screen: 'l-draw' })}>
          ← 직접 그리기
        </button>
        <button className="btn btn-primary btn-xl" onClick={() => dispatch({ type: 'go', screen: 'l-review' })}>
          🔍 그래프 읽고 정리하기
        </button>
      </div>
    </main>
  )
}
