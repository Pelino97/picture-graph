import { describe, expect, it } from 'vitest'
import { checkGraph, expectedIcons } from './graph.js'
import { initialState, reducer, sanitize, setupErrors } from './state.js'

describe('그림그래프 계산', () => {
  it('큰 그림 10명, 작은 그림 1명으로 나눈다', () => {
    expect(expectedIcons(23, 10)).toEqual({ big: 2, small: 3 })
    expect(expectedIcons(7, 10)).toEqual({ big: 0, small: 7 })
    expect(expectedIcons(10, 5)).toEqual({ big: 2, small: 0 })
  })

  it('맞게 그리면 통과', () => {
    const r = checkGraph({
      items: ['a', 'b', 'c', 'd'],
      counts: [12, 3, 0, 5],
      unit: 10,
      rows: [{ big: 1, small: 2 }, { big: 0, small: 3 }, { big: 0, small: 0 }, { big: 0, small: 5 }],
    })
    expect(r.ok).toBe(true)
  })

  it('틀리면 무엇이 몇 개 많고 적은지 알려준다', () => {
    const r = checkGraph({
      items: ['a', 'b', 'c', 'd'],
      counts: [12, 3, 0, 5],
      unit: 10,
      rows: [{ big: 0, small: 12 }, { big: 0, small: 1 }, { big: 0, small: 0 }, { big: 0, small: 5 }],
    })
    expect(r.ok).toBe(false)
    expect(r.problems).toHaveLength(2)
    expect(r.problems[0].tips).toEqual(['큰 그림이 1개 부족해요', '작은 그림이 10개 많아요'])
    expect(r.problems[0].hint).toContain('큰 그림 1개로')
    expect(r.problems[1].tips).toEqual(['작은 그림이 2개 부족해요'])
  })
})

describe('상태 관리', () => {
  it('추천 주제를 고르면 항목 4개가 채워진다', () => {
    const s = reducer(initialState, { type: 'pickTopic', id: 'lunch' })
    expect(s.items).toEqual(['나물 반찬', '생선 반찬', '김치', '국'])
  })

  it('항목이 겹치거나 비면 시작할 수 없다', () => {
    const s = { ...initialState, group: 1, topic: '주제', items: ['가', '가', '나', '다'] }
    expect(setupErrors(s)).toContain('조사 항목이 서로 겹치지 않게 써 주세요.')
  })

  it('투표 수는 0 아래로 내려가지 않는다', () => {
    const s = reducer(initialState, { type: 'vote', index: 0, delta: -1 })
    expect(s.counts[0]).toBe(0)
  })

  it('되돌리기는 바로 전 상태로 돌아간다', () => {
    let s = reducer(initialState, { type: 'place', index: 0, kind: 'big' })
    s = reducer(s, { type: 'place', index: 0, kind: 'small' })
    s = reducer(s, { type: 'undo' })
    expect(s.rows[0]).toEqual({ big: 1, small: 0 })
    s = reducer(s, { type: 'clearRows' })
    s = reducer(s, { type: 'undo' })
    expect(s.rows[0]).toEqual({ big: 1, small: 0 })
  })

  it('저장된 값이 이상하면 안전한 값으로 바꾼다', () => {
    const s = sanitize({
      screen: 'hack',
      group: 99,
      topic: 'x'.repeat(500),
      items: ['<img src=x onerror=alert(1)>', 1, null, 'ok'],
      counts: [-5, 'abc', 1e9, 2],
      iconId: 'javascript:alert(1)',
      unit: 3,
      rows: [{ big: 999 }, null, {}, { small: -1 }],
    })
    expect(s.screen).toBe('intro')
    expect(s.group).toBe(null)
    expect(s.topic.length).toBe(40)
    expect(s.items[1]).toBe('')
    expect(s.counts).toEqual([0, 0, 999, 2])
    expect(s.iconId).toBe(null)
    expect(s.unit).toBe(10)
    expect(s.rows[0].big).toBe(20)
  })
})

import { makeMistake, makeQuiz } from './quiz.js'

describe('퀴즈와 실수 찾기', () => {
  const data = { items: ['가', '나', '다', '라'], counts: [12, 3, 7, 3], unit: 10 }

  it('퀴즈 정답이 조사 결과와 맞는다', () => {
    const qs = makeQuiz(data)
    expect(qs[0].answers).toEqual(['10명'])
    expect(qs[1].answers).toEqual(['가'])
    expect(qs[2].answers).toEqual(['나', '라']) // 같은 수는 둘 다 정답
    expect(qs[3].answers).toEqual(['9'])
    expect(qs.at(-1).answers).toEqual(['25'])
    qs.forEach((q) => q.answers.forEach((a) => expect(q.choices).toContain(a)))
  })

  it('모든 수가 같으면 많고 적음 문제는 빼요', () => {
    const qs = makeQuiz({ ...data, counts: [2, 2, 2, 2] })
    expect(qs).toHaveLength(2)
  })

  it('실수 찾기는 딱 한 줄만 틀리게 만든다', () => {
    for (let k = 0; k < 50; k++) {
      const m = makeMistake(data)
      const wrong = m.rows
        .map((r, i) => r.big * 10 + r.small !== data.counts[i] || r.small >= 10 || (r.big === 0 && r.small === data.counts[i] && data.counts[i] >= 10))
        .filter(Boolean)
      expect(wrong.length).toBe(1)
      expect(wrong).toBeTruthy()
      expect(m.reason).toContain(data.items[m.wrongIndex])
    }
  })
})
