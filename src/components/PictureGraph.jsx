import Icon from './Icon.jsx'

// 그림그래프 표: 왼쪽은 항목 이름, 오른쪽은 큰 그림 → 작은 그림 순서로 놓인 그림
export default function PictureGraph({ state, hoverRow = null, interactive = false, onRowTap, onIconTap, big = 40, small = 24 }) {
  const { items, rows, iconId, unit, topic } = state
  return (
    <div className="pgraph">
      <table className="pgraph-table">
        <caption className="sr-only">{topic} 그림그래프</caption>
        <thead>
          <tr>
            <th scope="col">항목</th>
            <th scope="col">사람 수</th>
          </tr>
        </thead>
        <tbody>
          {items.map((name, i) => (
            <tr key={name}>
              <th scope="row" className={`pgraph-label c${i}`}>
                {name}
              </th>
              <td
                data-row={interactive ? i : undefined}
                className={`pgraph-cell ${interactive ? 'drop' : ''} ${hoverRow === i ? 'hover' : ''}`}
                onClick={interactive ? () => onRowTap?.(i) : undefined}
              >
                {Array.from({ length: rows[i].big }).map((_, k) => (
                  <PlacedIcon key={`b${k}`} kind="big" size={big} {...{ iconId, interactive, onIconTap, i }} />
                ))}
                {Array.from({ length: rows[i].small }).map((_, k) => (
                  <PlacedIcon key={`s${k}`} kind="small" size={small} {...{ iconId, interactive, onIconTap, i }} />
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {iconId && (
        <div className="legend">
          <span>
            <Icon iconId={iconId} size={big * 0.8} /> {unit}명
          </span>
          <span>
            <Icon iconId={iconId} size={small * 0.9} /> 1명
          </span>
        </div>
      )}
    </div>
  )
}

function PlacedIcon({ kind, size, iconId, interactive, onIconTap, i }) {
  if (!interactive) return <Icon iconId={iconId} size={size} className={`placed placed-${kind}`} />
  return (
    <button
      className={`placed-btn placed-${kind}`}
      aria-label={kind === 'big' ? '큰 그림 빼기' : '작은 그림 빼기'}
      onClick={(e) => {
        e.stopPropagation()
        onIconTap?.(i, kind)
      }}
    >
      <Icon iconId={iconId} size={size} />
    </button>
  )
}
