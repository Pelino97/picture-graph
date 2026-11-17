import { SELF_CHECKS } from '../data/selfCheck.js'

// 스스로 평가: 누르면 칭찬 스티커가 붙어요
const STICKERS = ['🌸', '⭐', '🍀', '💖']

export default function SelfCheck({ checks, onToggle, items = SELF_CHECKS }) {
  const done = checks.filter(Boolean).length
  return (
    <div className="selfcheck">
      <ul>
        {items.map((text, i) => (
          <li key={text}>
            <button
              className={`check-btn ${checks[i] ? 'on' : ''}`}
              aria-pressed={checks[i]}
              onClick={() => onToggle(i)}
            >
              <span className="check-sticker" aria-hidden="true">
                {checks[i] ? STICKERS[i] : ''}
              </span>
              <span>{text}</span>
            </button>
          </li>
        ))}
      </ul>
      {done === items.length && <p className="selfcheck-all">🎉 모두 해냈어요! 참 잘했어요!</p>}
    </div>
  )
}
