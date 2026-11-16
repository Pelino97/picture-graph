// 그림그래프 계산과 채점 로직 (화면과 분리해서 테스트하기 쉽게)

/** 사람 수 n을 큰 그림(unit명)과 작은 그림(1명)으로 나눔 */
export function expectedIcons(n, unit) {
  const safe = Math.max(0, Math.floor(Number(n) || 0))
  return { big: Math.floor(safe / unit), small: safe % unit }
}

/** 행에 놓인 그림이 나타내는 사람 수 */
export function rowValue(row, unit) {
  return row.big * unit + row.small
}

/**
 * 그림그래프를 채점하고, 틀린 항목마다 아이에게 보여줄 안내 문장을 만든다.
 * 정답을 바로 알려주기보다 '무엇이 몇 개 많은지/적은지'를 알려준다.
 */
export function checkGraph({ items, counts, rows, unit }) {
  const problems = []
  items.forEach((name, i) => {
    const want = expectedIcons(counts[i], unit)
    const have = rows[i]
    if (have.big === want.big && have.small === want.small) return

    const tips = []
    if (have.big !== want.big) {
      tips.push(diffText('큰 그림', have.big - want.big))
    }
    if (have.small !== want.small) {
      tips.push(diffText('작은 그림', have.small - want.small))
    }
    let hint = ''
    if (have.small >= unit) {
      hint = `작은 그림 ${unit}개는 큰 그림 1개로 바꿀 수 있어요.`
    } else if (rowValue(have, unit) === counts[i]) {
      hint = '나타내는 수는 맞지만, 큰 그림을 먼저 최대한 사용해 보세요.'
    }
    problems.push({ index: i, name, count: counts[i], tips, hint })
  })
  return { ok: problems.length === 0, problems }
}

function diffText(label, diff) {
  return diff > 0 ? `${label}이 ${diff}개 많아요` : `${label}이 ${-diff}개 부족해요`
}
