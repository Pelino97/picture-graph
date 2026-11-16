import { expectedIcons } from './graph.js'

// 그래프 읽기 퀴즈와 '그래피의 실수 찾기' 문제를 조사 결과로 자동으로 만들어요.

export function shuffle(list, rand = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function numberChoices(answer, rand) {
  const set = new Set([answer])
  const deltas = shuffle([1, -1, 2, -2, 3, -3, 5], rand)
  for (const d of deltas) {
    if (set.size >= 4) break
    if (answer + d >= 0) set.add(answer + d)
  }
  return shuffle([...set], rand).map(String)
}

function joinNames(names) {
  if (names.length === 1) return `'${names[0]}'이(가)`
  return `${names.map((n) => `'${n}'`).join(', ')}이(가) 모두`
}

/** 정답 확인: 여러 개 고르는 문제는 정답을 빠짐없이, 더 고르지 않아야 맞아요 */
export function isCorrect(q, picked) {
  const list = Array.isArray(picked) ? picked : [picked]
  if (!q.multi) return list.length === 1 && q.answers.includes(list[0])
  return list.length === q.answers.length && q.answers.every((a) => list.includes(a))
}

/** 퀴즈 문제 목록: { q, choices, answers(정답 목록), explain } */
export function makeQuiz({ items, counts, unit }, rand = Math.random) {
  const max = Math.max(...counts)
  const min = Math.min(...counts)
  const total = counts.reduce((a, b) => a + b, 0)
  const qs = []

  qs.push({
    q: `큰 그림 1개는 몇 명을 나타내나요?`,
    choices: shuffle(['1명', '5명', '10명', '2명'], rand),
    answers: [`${unit}명`],
    explain: `그래프 아래 표시를 보면 큰 그림 1개는 ${unit}명, 작은 그림 1개는 1명이에요.`,
  })

  if (max !== min) {
    const most = items.filter((_, i) => counts[i] === max)
    const least = items.filter((_, i) => counts[i] === min)
    qs.push({
      q: '가장 많은 친구들이 고른 것은 무엇인가요?',
      multi: true,
      choices: [...items],
      answers: most,
      explain: `${joinNames(most)} ${max}명으로 가장 많아요. 큰 그림부터 비교하면 빨라요!`,
    })
    qs.push({
      q: '가장 적은 친구들이 고른 것은 무엇인가요?',
      multi: true,
      choices: [...items],
      answers: least,
      explain: `${joinNames(least)} ${min}명으로 가장 적어요.`,
    })
    const hi = counts.indexOf(max)
    const lo = counts.indexOf(min)
    qs.push({
      q: `'${items[hi]}'은(는) '${items[lo]}'보다 몇 명 더 많나요?`,
      choices: numberChoices(max - min, rand),
      answers: [String(max - min)],
      explain: `${max}명 − ${min}명 = ${max - min}명이에요.`,
    })
  }

  qs.push({
    q: '조사한 친구는 모두 몇 명인가요?',
    choices: numberChoices(total, rand),
    answers: [String(total)],
    explain: `${counts.join(' + ')} = ${total}명이에요.`,
  })
  return qs
}

/**
 * 그래피가 일부러 한 줄을 틀리게 그린 그래프를 만든다.
 * 반환: { rows, wrongIndex, reason }
 */
export function makeMistake({ items, counts, unit }, rand = Math.random) {
  const correct = counts.map((c) => expectedIcons(c, unit))
  const options = []
  counts.forEach((c, i) => {
    if (c >= unit) {
      options.push({
        i,
        rows: { big: 0, small: c },
        reason: `'${items[i]}'은(는) ${c}명이에요. 작은 그림만 ${c}개 그렸는데, 큰 그림을 써야 해요. (큰 그림 ${correct[i].big}개, 작은 그림 ${correct[i].small}개)`,
      })
    }
    if (c > 0) {
      const r = { ...correct[i], small: correct[i].small > 0 ? correct[i].small - 1 : correct[i].small + 1 }
      if (r.small < unit) {
        options.push({
          i,
          rows: r,
          reason:
            r.small < correct[i].small
              ? `'${items[i]}'은(는) ${c}명인데 작은 그림이 1개 부족해요.`
              : `'${items[i]}'은(는) ${c}명인데 작은 그림이 1개 많아요.`,
        })
      }
    }
    options.push({
      i,
      rows: { ...correct[i], big: correct[i].big + 1 },
      reason: `'${items[i]}'은(는) ${c}명인데 큰 그림을 1개 더 그려서 ${c + unit}명이 되었어요.`,
    })
  })
  const pick = options[Math.floor(rand() * options.length)]
  const rows = correct.map((r, i) => (i === pick.i ? pick.rows : r))
  return { rows, wrongIndex: pick.i, reason: pick.reason }
}
