import { useEffect, useRef, useState } from 'react'
import { labelText } from '../lib/lineLogic.js'

// 막대·꺾은선·띠·원그래프를 그리는 SVG 그래프.
// 값이 바뀌면 부드럽게 움직이고(useTween), 점·막대를 끌어서 값을 바꿀 수 있어요.

const W = 680
const H = 430
const PAD = { l: 74, r: 30, t: 54, b: 70 }
const WAVE_BAND = 34
const SLICE = ['#FFB3C6', '#A8D8FF', '#B5E6C3', '#D7C8FF', '#FFE08A', '#FFC9A8', '#9EE3DA', '#E5C1F5']
export const LINE_COLORS = { pink: '#E9809B', blue: '#4A9BE0', green: '#3FAE6A', purple: '#8D6CE0' }
const INK = '#5B4636'

/** 값 배열을 이전 값에서 새 값으로 부드럽게 바꿔 줘요 */
export function useTween(values, ms = 450) {
  const [shown, setShown] = useState(values)
  const from = useRef(values)
  const raf = useRef(0)
  const key = values.map((v) => (v === null || v === '' ? 'n' : v)).join(',')
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    const b = values
    cancelAnimationFrame(raf.current)
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms)
      const e = 1 - Math.pow(1 - t, 3)
      const cur = b.map((v, i) => {
        if (v === null || v === '') return v
        const p = a[i] === null || a[i] === '' || a[i] === undefined ? Number(v) : Number(a[i])
        return p + (Number(v) - p) * e
      })
      from.current = cur
      setShown(cur)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ms])
  return shown
}

export default function Chart({
  type = 'line',
  labels,
  values,
  scale,
  xName = '',
  xUnit = '',
  yName = '',
  yUnit = '',
  title = '',
  color = 'pink',
  showValues = true,
  showChange = false,
  showLine = true,
  interactive = false,
  onChange,
  marks = {},
  svgRef,
}) {
  const tv = useTween(values)
  const n = labels.length
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const colW = plotW / n
  const bottom = H - PAD.b
  const baseY = scale.wave ? bottom - WAVE_BAND : bottom
  const usableH = baseY - PAD.t
  const lineColor = LINE_COLORS[color] || LINE_COLORS.pink
  const x = (i) => PAD.l + colW * (i + 0.5)
  const y = (v) => {
    const c = Math.max(scale.base, Math.min(scale.top, v))
    return baseY - ((c - scale.base) / (scale.top - scale.base)) * usableH
  }

  // 끌어서 값 바꾸기
  const ownRef = useRef(null)
  const ref = svgRef || ownRef
  const drag = useRef(null)
  const toValue = (clientY) => {
    const svg = ref.current
    const pt = svg.createSVGPoint()
    pt.x = 0
    pt.y = clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    const v = scale.base + ((baseY - p.y) / usableH) * (scale.top - scale.base)
    return Math.round(Math.max(scale.base, Math.min(scale.top, v)))
  }
  const startDrag = (i) => (e) => {
    if (!interactive) return
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = i
    onChange?.(i, toValue(e.clientY))
  }
  const moveDrag = (e) => {
    if (drag.current === null) return
    onChange?.(drag.current, toValue(e.clientY))
  }
  const endDrag = () => {
    drag.current = null
  }

  if (type === 'band' || type === 'pie') {
    return (
      <svg ref={ref} className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} ${type === 'band' ? '띠그래프' : '원그래프'}`}>
        {title && (
          <text x={W / 2} y={30} className="chart-title">
            {title}
          </text>
        )}
        {type === 'band' ? <Band labels={labels} values={tv} xUnit={xUnit} /> : <Pie labels={labels} values={tv} xUnit={xUnit} />}
      </svg>
    )
  }

  const ticks = Array.from({ length: scale.rows + 1 }, (_, k) => scale.base + k * scale.step)
  const labelEvery = scale.rows > 12 ? 2 : 1
  const pts = tv.map((v, i) => (v === null || v === '' ? null : { x: x(i), y: y(Number(v)), v, i }))
  const segs = []
  for (let i = 0; i < n - 1; i++) if (pts[i] && pts[i + 1]) segs.push([pts[i], pts[i + 1]])
  const diffs = values.slice(1).map((v, i) => (v === '' || values[i] === '' || v === null || values[i] === null ? null : v - values[i]))
  const bigUp = Math.max(0, ...diffs.filter((d) => d !== null))

  return (
    <svg
      ref={ref}
      className={`chart ${interactive ? 'chart-interactive' : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${title} ${type === 'bar' ? '막대그래프' : '꺾은선그래프'}`}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      {title && (
        <text x={W / 2} y={30} className="chart-title">
          {title}
        </text>
      )}
      <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} fill="#fff" />
      {/* 가로 눈금선 */}
      {ticks.map((t, k) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className={k % 5 === 0 ? 'grid-major' : 'grid'} />
          {k % labelEvery === 0 && (
            <text x={PAD.l - 10} y={y(t) + 6} className="tick" textAnchor="end">
              {t}
            </text>
          )}
        </g>
      ))}
      {/* 세로 눈금선 */}
      {type === 'line' &&
        labels.map((_, i) => <line key={i} x1={x(i)} x2={x(i)} y1={PAD.t} y2={baseY} className="grid-v" />)}
      {/* 물결선 */}
      {scale.wave && (
        <g className="wave">
          <line x1={PAD.l} x2={W - PAD.r} y1={bottom} y2={bottom} className="axis" />
          <text x={PAD.l - 10} y={bottom + 6} className="tick" textAnchor="end">
            0
          </text>
          <path d={wavePath(PAD.l - 8, W - PAD.r, bottom - WAVE_BAND / 2 - 5)} className="wave-line" />
          <path d={wavePath(PAD.l - 8, W - PAD.r, bottom - WAVE_BAND / 2 + 5)} className="wave-line" />
        </g>
      )}
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={bottom} className="axis" />
      <line x1={PAD.l} x2={W - PAD.r} y1={bottom} y2={bottom} className="axis" />
      {/* 축 이름 */}
      <text x={PAD.l - 10} y={PAD.t - 12} className="unit" textAnchor="end">
        ({yUnit})
      </text>
      <text x={W - PAD.r} y={bottom + 52} className="unit" textAnchor="end">
        ({xUnit})
      </text>
      <text x={PAD.l - 8} y={bottom + 26} className="corner" textAnchor="end">
        {yName}
      </text>
      <text x={PAD.l - 8} y={bottom + 46} className="corner" textAnchor="end">
        {xName}
      </text>
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={bottom + 28} className="xlabel" textAnchor="middle">
          {l}
        </text>
      ))}

      {type === 'bar' &&
        tv.map((v, i) =>
          v === null || v === '' ? null : (
            <g key={i} className={marks[i] ? `mark-${marks[i]}` : ''}>
              <rect
                x={x(i) - colW * 0.28}
                y={y(Number(v))}
                width={colW * 0.56}
                height={Math.max(0, baseY - y(Number(v)))}
                rx="6"
                fill={SLICE[i % SLICE.length]}
                stroke={INK}
                strokeWidth="2.5"
              />
              {interactive && (
                <rect
                  x={x(i) - colW * 0.4}
                  y={y(Number(v)) - 22}
                  width={colW * 0.8}
                  height={44}
                  className="hit"
                  onPointerDown={startDrag(i)}
                />
              )}
              {showValues && (
                <text x={x(i)} y={y(Number(v)) - 10} className="val" textAnchor="middle">
                  {Math.round(v)}
                </text>
              )}
            </g>
          ),
        )}

      {type === 'line' && (
        <g>
          {showLine &&
            segs.map(([a, b]) => (
              <line
                key={`${a.i}-${b.i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={lineColor}
                strokeWidth={showChange && diffs[a.i] === bigUp && bigUp > 0 ? 7 : 4.5}
                strokeLinecap="round"
                className="seg"
                pathLength={1}
              />
            ))}
          {showChange &&
            segs.map(([a, b]) => {
              const d = diffs[a.i]
              if (d === null) return null
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2 - 14
              return (
                <g key={`c${a.i}`} className="change">
                  <rect x={mx - 30} y={my - 18} width="60" height="26" rx="13" className={d > 0 ? 'up' : d < 0 ? 'down' : 'flat'} />
                  <text x={mx} y={my + 1} textAnchor="middle">
                    {d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : '–0'}
                  </text>
                </g>
              )
            })}
          {labels.map((_, i) => {
            const p = pts[i]
            const m = marks[i]
            if (!p) {
              // 아직 찍지 않은 점: 맨 아래에서 끌어 올려요
              return interactive ? (
                <g key={i} className="ghost" onPointerDown={startDrag(i)}>
                  <circle cx={x(i)} cy={baseY} r="13" />
                  <text x={x(i)} y={baseY + 5} textAnchor="middle">
                    ↕
                  </text>
                  <rect x={x(i) - 26} y={PAD.t} width="52" height={baseY - PAD.t + 14} className="hit" />
                </g>
              ) : null
            }
            return (
              <g key={i} className={`pt ${m ? `mark-${m}` : ''}`}>
                <circle cx={p.x} cy={p.y} r={interactive ? 10 : 7} fill="#fff" stroke={m === 'wrong' ? '#E5484D' : m === 'right' ? '#3FAE6A' : lineColor} strokeWidth="4" />
                {showValues && (
                  <text x={p.x} y={p.y - 16} className="val" textAnchor="middle">
                    {Math.round(p.v)}
                  </text>
                )}
                {interactive && (
                  <rect x={x(i) - 26} y={PAD.t} width="52" height={baseY - PAD.t + 14} className="hit" onPointerDown={startDrag(i)} />
                )}
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}

function wavePath(x1, x2, yMid) {
  let d = `M${x1} ${yMid}`
  const step = 14
  for (let xx = x1, k = 0; xx < x2; xx += step, k++) {
    d += ` Q${xx + step / 2} ${yMid + (k % 2 ? 6 : -6)} ${xx + step} ${yMid}`
  }
  return d
}

function pct(values) {
  const nums = values.map((v) => Math.max(0, Number(v) || 0))
  const sum = nums.reduce((a, b) => a + b, 0) || 1
  return nums.map((v) => v / sum)
}

function Band({ labels, values, xUnit }) {
  const p = pct(values)
  const x0 = 50
  const width = W - 100
  const starts = p.map((_, i) => p.slice(0, i).reduce((a, b) => a + b, 0))
  return (
    <g>
      <text x={W / 2} y={84} textAnchor="middle" className="chart-note">
        전체를 100%로 보고 각 부분이 차지하는 비율을 길이로 나타내요
      </text>
      {p.map((r, i) => {
        const x = x0 + starts[i] * width
        const w = r * width
        return (
          <g key={i}>
            <rect x={x} y={130} width={Math.max(0, w)} height={90} fill={SLICE[i % SLICE.length]} stroke={INK} strokeWidth="2.5" />
            {w > 46 && (
              <>
                <text x={x + w / 2} y={168} textAnchor="middle" className="slice-name">
                  {labelText(labels[i], xUnit)}
                </text>
                <text x={x + w / 2} y={196} textAnchor="middle" className="slice-pct">
                  {Math.round(r * 100)}%
                </text>
              </>
            )}
          </g>
        )
      })}
      <Legend labels={labels} p={p} xUnit={xUnit} y={270} />
    </g>
  )
}

function Pie({ labels, values, xUnit }) {
  const p = pct(values)
  const cx = 230
  const cy = 245
  const r = 150
  const starts = p.map((_, i) => -Math.PI / 2 + p.slice(0, i).reduce((s, b) => s + b, 0) * Math.PI * 2)
  return (
    <g>
      {p.map((ratio, i) => {
        const a = starts[i]
        const a2 = a + ratio * Math.PI * 2
        const large = ratio > 0.5 ? 1 : 0
        const path =
          ratio >= 0.9999
            ? `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
            : `M${cx} ${cy} L${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)} Z`
        const mid = (a + a2) / 2
        return (
          <g key={i}>
            <path d={path} fill={SLICE[i % SLICE.length]} stroke={INK} strokeWidth="2.5" />
            {ratio > 0.06 && (
              <text x={cx + r * 0.62 * Math.cos(mid)} y={cy + r * 0.62 * Math.sin(mid) + 7} textAnchor="middle" className="slice-pct">
                {Math.round(ratio * 100)}%
              </text>
            )}
          </g>
        )
      })}
      <Legend labels={labels} p={p} xUnit={xUnit} x={430} y={110} vertical />
    </g>
  )
}

function Legend({ labels, p, xUnit, x = 60, y, vertical = false }) {
  return (
    <g className="legend-g">
      {labels.map((l, i) => {
        const lx = vertical ? x : x + (i % 4) * 150
        const ly = vertical ? y + i * 36 : y + Math.floor(i / 4) * 36
        return (
          <g key={i}>
            <rect x={lx} y={ly} width="22" height="22" rx="5" fill={SLICE[i % SLICE.length]} stroke={INK} strokeWidth="2" />
            <text x={lx + 30} y={ly + 18} className="legend-t">
              {labelText(l, xUnit)} ({Math.round(p[i] * 100)}%)
            </text>
          </g>
        )
      })}
    </g>
  )
}
