import { describe, expect, it } from 'vitest'
import { LINE_TOPICS } from '../data/lineTopics.js'
import { RECOMMENDED_TOPICS } from '../data/topics.js'
import {
  checkHorizontal,
  checkPoints,
  checkStep,
  checkWave,
  initialLine,
  lineReducer,
  makeLineQuiz,
  sanitizeLine,
  scaleFor,
  suggestWave,
} from './lineLogic.js'
import { groupLabel, initialState, reducer, sanitize } from './state.js'

describe('4학년 꺾은선그래프', () => {
  it('추천 주제는 3학년과 같은 7개', () => {
    expect(LINE_TOPICS).toHaveLength(RECOMMENDED_TOPICS.length)
  })

  it('눈금: 가장 큰 값이 들어가도록 칸을 만든다', () => {
    const s = scaleFor([12, 18, 15, 21, 30], { step: 5 })
    expect(s).toMatchObject({ base: 0, step: 5, rows: 7, top: 35, wave: false })
    expect(checkStep(1, [12, 18, 15, 21, 30], 0).ok).toBe(false) // 31칸은 너무 길어요
    expect(checkStep(5, [12, 18, 15, 21, 30], 0).ok).toBe(true)
  })

  it('물결선: 큰 값들에서만 제안하고, 가장 작은 값보다 크면 틀린다', () => {
    expect(suggestWave([612, 598, 587, 590, 571])).toBeGreaterThan(0)
    expect(suggestWave([2, 5, 9, 14, 17])).toBe(0)
    expect(checkWave(true, 600, [612, 598, 587, 590, 571]).ok).toBe(false)
    expect(checkWave(true, 550, [612, 598, 587, 590, 571]).ok).toBe(true)
  })

  it('가로·세로와 점 채점', () => {
    expect(checkHorizontal('x').ok).toBe(true)
    expect(checkHorizontal('y').ok).toBe(false)
    expect(checkPoints([1, 2, null], [1, 3, 4]).wrong).toEqual([1, 2])
  })

  it('그래프 읽기 퀴즈: 가장 많이 늘어난 때', () => {
    const line = { ...initialLine, xName: '연도', xUnit: '년', yName: '폭염일수', yUnit: '일', labels: ['2020', '2021', '2022', '2023', '2024'], values: [12, 18, 15, 21, 30] }
    const qs = makeLineQuiz(line)
    expect(qs[0].answers).toEqual(['2024년'])
    expect(qs[1].answers).toEqual(['2023년 → 2024년'])
    expect(qs[2].answers).toEqual(['2021년 → 2022년'])
    qs.forEach((q) => q.answers.forEach((a) => expect(q.choices).toContain(a)))
  })

  it('예시 자료와 조사 횟수 바꾸기', () => {
    let l = lineReducer(initialLine, { type: 'line/pickTopic', id: 'bean' })
    l = lineReducer(l, { type: 'line/sample' })
    expect(l.values).toEqual([2, 5, 9, 14, 17])
    l = lineReducer(l, { type: 'line/count', n: 99 })
    expect(l.labels).toHaveLength(8)
    l = lineReducer(l, { type: 'line/value', index: 0, value: -5 })
    expect(l.values[0]).toBe(0)
  })

  it('저장된 꺾은선 자료가 이상하면 안전하게 되살린다', () => {
    const l = sanitizeLine({ topic: 'x'.repeat(99), labels: ['<b>', 1], values: ['abc', 1e9], tool: { type: 'hack', color: 'red' } })
    expect(l.topic.length).toBe(40)
    expect(l.labels).toHaveLength(5)
    expect(l.values[0]).toBe('')
    expect(l.tool.type).toBe('line')
    expect(l.tool.color).toBe('pink')
  })
})

describe('학년·모둠', () => {
  it('학년을 고르면 맞는 첫 화면으로 간다', () => {
    expect(reducer(initialState, { type: 'setGrade', grade: 4 }).screen).toBe('l-setup')
    expect(reducer(initialState, { type: 'setGrade', grade: 3 }).screen).toBe('setup')
  })

  it('모둠 이름 쓰기', () => {
    let s = reducer(initialState, { type: 'setGroupMode', mode: 'name' })
    s = reducer(s, { type: 'setGroupName', text: '햇살 모둠이에요 아주 긴 이름' })
    expect(groupLabel(s).length).toBeLessThanOrEqual(12)
    expect(groupLabel(s).startsWith('햇살 모둠')).toBe(true)
    s = reducer(s, { type: 'setGroupMode', mode: 'number' })
    s = reducer(s, { type: 'setGroup', group: 3 })
    expect(groupLabel(s)).toBe('3조')
  })

  it('4학년 화면인데 학년이 없으면 학년 선택으로', () => {
    expect(sanitize({ screen: 'l-tool' }).screen).toBe('grade')
    expect(sanitize({ screen: 'l-tool', grade: 4 }).screen).toBe('l-setup')
  })
})
