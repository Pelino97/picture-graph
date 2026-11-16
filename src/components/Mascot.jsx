// 앱 캐릭터 '그래피': 클립보드를 든 동글동글한 친구 (직접 그린 SVG)
export default function Mascot({ size = 160, className = '' }) {
  return (
    <svg
      className={`mascot ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="설문조사를 하는 캐릭터 그래피"
    >
      <ellipse cx="100" cy="186" rx="52" ry="8" fill="#000" opacity="0.08" />
      <g className="mascot-body">
        <path d="M100 30c-44 0-66 34-66 76 0 40 26 72 66 72s66-32 66-72c0-42-22-76-66-76z" fill="#FFB84C" />
        <path d="M70 34c-4-16 4-26 14-24 8 2 8 14 6 22" fill="#FFB84C" />
        <path d="M130 34c4-16-4-26-14-24-8 2-8 14-6 22" fill="#FFB84C" />
        <ellipse cx="100" cy="128" rx="40" ry="34" fill="#FFE0A8" />
        <g className="mascot-eyes">
          <ellipse cx="78" cy="88" rx="9" ry="11" fill="#3B2F2F" />
          <ellipse cx="122" cy="88" rx="9" ry="11" fill="#3B2F2F" />
          <circle cx="81" cy="84" r="3" fill="#fff" />
          <circle cx="125" cy="84" r="3" fill="#fff" />
        </g>
        <ellipse cx="64" cy="106" rx="9" ry="6" fill="#FF7B9C" opacity="0.6" />
        <ellipse cx="136" cy="106" rx="9" ry="6" fill="#FF7B9C" opacity="0.6" />
        <path d="M90 106c5 6 15 6 20 0" stroke="#3B2F2F" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <g className="mascot-board">
        <rect x="128" y="112" width="48" height="60" rx="6" fill="#7BC4FF" />
        <rect x="134" y="120" width="36" height="46" rx="3" fill="#fff" />
        <rect x="142" y="106" width="20" height="10" rx="3" fill="#3B82C4" />
        <path d="M139 132h26M139 142h20M139 152h24" stroke="#9AA9B8" strokeWidth="3" strokeLinecap="round" />
        <path d="M140 131l3 3 5-6" stroke="#2FB36E" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <path className="mascot-arm" d="M150 140c-8 4-16 2-22-4" stroke="#E89A2E" strokeWidth="10" strokeLinecap="round" fill="none" />
    </svg>
  )
}
