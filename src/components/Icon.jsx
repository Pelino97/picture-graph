// 그림그래프에 쓰는 그림 하나. iconId 형식: 'emoji:🎲' 또는 'line:star'
const LINE_PATHS = {
  circle: (
    <>
      <circle cx="24" cy="24" r="17" />
      <circle cx="18" cy="21" r="1.6" fill="currentColor" />
      <circle cx="30" cy="21" r="1.6" fill="currentColor" />
      <path d="M17 29c4 4 10 4 14 0" />
    </>
  ),
  star: <path d="M24 6l5.3 11.2 12.2 1.5-9 8.4 2.4 12.1L24 33.2l-10.9 6 2.4-12.1-9-8.4 12.2-1.5z" />,
  heart: <path d="M24 40S7 29.5 7 17.8C7 12.4 11 8.5 16 8.5c3.4 0 6.3 1.9 8 4.7 1.7-2.8 4.6-4.7 8-4.7 5 0 9 3.9 9 9.3C41 29.5 24 40 24 40z" />,
  person: (
    <>
      <circle cx="24" cy="13" r="6.5" />
      <path d="M11 41c0-8 5.8-14 13-14s13 6 13 14" />
    </>
  ),
  square: <rect x="9" y="9" width="30" height="30" rx="5" />,
  triangle: <path d="M24 8l17 31H7z" />,
}

export default function Icon({ iconId, size = 40, className = '' }) {
  if (!iconId) return null
  if (iconId.startsWith('emoji:')) {
    return (
      <span
        className={`pg-icon pg-emoji ${className}`}
        style={{ fontSize: size * 0.82, width: size, height: size }}
        aria-hidden="true"
      >
        {iconId.slice(6)}
      </span>
    )
  }
  const name = iconId.slice(5)
  return (
    <svg
      className={`pg-icon pg-line ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={size > 44 ? 3 : 3.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {LINE_PATHS[name]}
    </svg>
  )
}
