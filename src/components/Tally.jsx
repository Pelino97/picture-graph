// 바를 정(正) 자로 수 세기: 5명마다 正 한 글자, 남은 수는 획을 차례로 그어요
const STROKES = [
  'M6 6H26', // ① 위 가로
  'M16 6V27', // ② 가운데 세로
  'M16 16H24', // ③ 가운데 짧은 가로
  'M8 16V27', // ④ 왼쪽 짧은 세로
  'M4 27H28', // ⑤ 아래 가로
]

export default function Tally({ count, size = 30, className = '' }) {
  const full = Math.floor(count / 5)
  const rest = count % 5
  const groups = [...Array(full).fill(5), ...(rest ? [rest] : [])]
  return (
    <span className={`tally ${className}`} role="img" aria-label={`바를 정 자로 ${count}`}>
      {groups.map((n, g) => (
        <svg
          key={g}
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {STROKES.slice(0, n).map((d, i) => (
            <path key={i} d={d} className={g === groups.length - 1 && i === n - 1 ? 'tally-new' : ''} />
          ))}
        </svg>
      ))}
    </span>
  )
}
