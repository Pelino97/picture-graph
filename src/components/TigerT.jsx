// 만든 사람 TigerT의 호랑이 아이콘과 이름 배지 (직접 그린 원본 SVG)
export const OWNER = 'TigerT'

export function TigerIcon({ size = 40, className = '' }) {
  return (
    <svg className={`tiger-icon ${className}`} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${OWNER} 아이콘`}>
      <g stroke="#5B4636" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M28 34c-6-14 4-22 16-14" fill="#FFC98A" />
        <path d="M92 34c6-14-4-22-16-14" fill="#FFC98A" />
        <ellipse cx="60" cy="66" rx="44" ry="40" fill="#FFC98A" />
        <path d="M60 27v12M50 29l2 9M70 29l-2 9M17 60h10M18 70h9M103 60h-10M102 70h-9" fill="none" />
        <ellipse cx="60" cy="82" rx="22" ry="16" fill="#FFF4E6" />
      </g>
      <ellipse cx="44" cy="62" rx="4.5" ry="6" fill="#5B4636" />
      <ellipse cx="76" cy="62" rx="4.5" ry="6" fill="#5B4636" />
      <circle cx="45.5" cy="59.5" r="1.6" fill="#fff" />
      <circle cx="77.5" cy="59.5" r="1.6" fill="#fff" />
      <ellipse cx="32" cy="76" rx="7" ry="4.5" fill="#FFB3C6" opacity=".9" />
      <ellipse cx="88" cy="76" rx="7" ry="4.5" fill="#FFB3C6" opacity=".9" />
      <path d="M54 75q6 5 12 0l-6 6z" fill="#5B4636" stroke="#5B4636" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 81v4M52 88q8 6 16 0" stroke="#5B4636" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** "만든 사람 TigerT" 배지 */
export default function OwnerBadge({ size = 30, label = '만든 사람', className = '' }) {
  return (
    <span className={`owner-badge ${className}`}>
      <TigerIcon size={size} />
      <span>
        {label && <small>{label}</small>} <strong>{OWNER}</strong>
      </span>
    </span>
  )
}
