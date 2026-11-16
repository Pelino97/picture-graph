// 앱 캐릭터 '그래피': 머리에 새싹이 난 말랑한 복숭아빛 떡 친구 (직접 그린 원본 SVG)
export default function Mascot({ size = 160, className = '' }) {
  const ink = '#5B4636'
  return (
    <svg
      className={`mascot ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="설문조사를 하는 캐릭터 그래피"
    >
      <ellipse cx="96" cy="188" rx="54" ry="7" fill={ink} opacity="0.1" />
      <g className="mascot-body" stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* 새싹 */}
        <path d="M96 52c0-10 2-18 6-24" fill="none" />
        <path d="M102 30c8-10 22-10 26-4-6 8-18 10-26 4z" fill="#B5E6C3" />
        <path d="M100 34c-8-9-20-8-24-2 6 7 16 8 24 2z" fill="#CDEFD8" />
        {/* 몸 */}
        <path d="M96 52c-42 0-64 34-64 76 0 36 28 54 64 54s64-18 64-54c0-42-22-76-64-76z" fill="#FFE4D6" />
        {/* 작은 팔·발 */}
        <path d="M38 132c-10 2-14 10-10 14 4 3 12-2 14-8" fill="#FFE4D6" />
        <ellipse cx="72" cy="182" rx="14" ry="7" fill="#FFE4D6" />
        <ellipse cx="120" cy="182" rx="14" ry="7" fill="#FFE4D6" />
      </g>
      <g className="mascot-eyes">
        <ellipse cx="76" cy="112" rx="5" ry="6.5" fill={ink} />
        <ellipse cx="116" cy="112" rx="5" ry="6.5" fill={ink} />
        <circle cx="77.5" cy="109.5" r="1.6" fill="#fff" />
        <circle cx="117.5" cy="109.5" r="1.6" fill="#fff" />
      </g>
      <ellipse cx="62" cy="128" rx="10" ry="6" fill="#FFB3C6" opacity="0.85" />
      <ellipse cx="130" cy="128" rx="10" ry="6" fill="#FFB3C6" opacity="0.85" />
      <path d="M90 124q6 6 12 0" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* 클립보드 */}
      <g className="mascot-board" stroke={ink} strokeWidth="3.5" strokeLinejoin="round">
        <rect x="132" y="112" width="46" height="58" rx="8" fill="#A8D8FF" />
        <rect x="138" y="120" width="34" height="44" rx="4" fill="#fff" />
        <rect x="146" y="106" width="18" height="10" rx="4" fill="#FFF1B8" />
        <path d="M143 133h22M143 143h17M143 153h20" stroke="#C9B8A8" strokeWidth="3" strokeLinecap="round" />
        <path d="M143 131l3 3 5-6" stroke="#7CCF94" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <path className="mascot-arm" d="M156 146c-8 6-18 6-24 0" stroke={ink} strokeWidth="4" fill="#FFE4D6" strokeLinecap="round" />
    </svg>
  )
}
