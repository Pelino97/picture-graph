import { LINE_LIMITS as L, findLineTopic } from '../data/lineTopics.js'

// 4학년 꺾은선그래프: 상태, 눈금 계산, 채점, 퀴즈를 한곳에 모았어요.

export const GRAPH_TYPES = ['bar', 'line', 'band', 'pie']
export const STEP_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 25, 50, 100]
export const COLORS = ['pink', 'blue', 'green', 'purple']

const blank = (n, v) => Array.from({ length: n }, () => v)

export const initialDraw = (n = 5) => ({
  stage: 1,
  horizontal: null, // 'x'(시간) | 'y'(값)
  waveOn: false,
  waveTo: 0,
  step: null,
  points: blank(n, null),
  title: '',
  finished: false,
})

export const initialTool = {
  type: 'line',
  step: 0, // 0 = 자동
  wave: false,
  showValues: true,
  showChange: false,
  title: '',
  color: 'pink',
}

export const initialLine = {
  topicId: null,
  topic: '',
  xName: '',
  xUnit: '',
  yName: '',
  yUnit: '',
  labels: blank(5, ''),
  values: blank(5, ''),
  draw: initialDraw(5),
  tool: initialTool,
  insight: '',
  selfCheck: [false, false, false, false],
}

const text = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '')
export function toValue(v) {
  if (v === '' || v === null || v === undefined) return ''
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return ''
  return Math.min(L.maxValue, Math.max(0, n))
}

/** 저장된 꺾은선 자료를 하나씩 검사해서 되살려요 */
export function sanitizeLine(raw) {
  if (!raw || typeof raw !== 'object') return structuredClone(initialLine)
  const s = structuredClone(initialLine)
  if (typeof raw.topicId === 'string' && findLineTopic(raw.topicId)) s.topicId = raw.topicId
  s.topic = text(raw.topic, L.topic)
  s.xName = text(raw.xName, L.axisName)
  s.yName = text(raw.yName, L.axisName)
  s.xUnit = text(raw.xUnit, L.unit)
  s.yUnit = text(raw.yUnit, L.unit)
  const n =
    Array.isArray(raw.labels) && raw.labels.length >= L.minPoints && raw.labels.length <= L.maxPoints
      ? raw.labels.length
      : 5
  s.labels = blank(n, '').map((_, i) => text(raw.labels?.[i], L.label))
  s.values = blank(n, '').map((_, i) => toValue(Array.isArray(raw.values) ? raw.values[i] : ''))
  const d = raw.draw && typeof raw.draw === 'object' ? raw.draw : {}
  s.draw = {
    ...initialDraw(n),
    stage: [1, 2, 3, 4, 5].includes(d.stage) ? d.stage : 1,
    horizontal: d.horizontal === 'x' || d.horizontal === 'y' ? d.horizontal : null,
    waveOn: d.waveOn === true,
    waveTo: toValue(d.waveTo) || 0,
    step: STEP_OPTIONS.includes(d.step) ? d.step : null,
    points: blank(n, null).map((_, i) => {
      const v = Array.isArray(d.points) ? d.points[i] : null
      return v === null || v === undefined || v === '' ? null : toValue(v)
    }),
    title: text(d.title, L.topic),
    finished: d.finished === true,
  }
  const t = raw.tool && typeof raw.tool === 'object' ? raw.tool : {}
  s.tool = {
    type: GRAPH_TYPES.includes(t.type) ? t.type : 'line',
    step: STEP_OPTIONS.includes(t.step) ? t.step : 0,
    wave: t.wave === true,
    showValues: t.showValues !== false,
    showChange: t.showChange === true,
    title: text(t.title, L.topic),
    color: COLORS.includes(t.color) ? t.color : 'pink',
  }
  s.insight = text(raw.insight, L.insight)
  if (Array.isArray(raw.selfCheck) && raw.selfCheck.length === 4) s.selfCheck = raw.selfCheck.map((v) => v === true)
  return s
}

export function lineSetupErrors(line) {
  const e = []
  if (!line.topic.trim()) e.push('조사 주제를 정해 주세요.')
  if (!line.xName.trim() || !line.yName.trim()) e.push('가로와 세로에 나타낼 것의 이름을 써 주세요.')
  return e
}

export function lineTableErrors(line) {
  const e = []
  if (line.labels.some((v) => !String(v).trim())) e.push(`${line.xName || '가로'} 칸을 모두 채워 주세요.`)
  else if (new Set(line.labels.map((v) => String(v).trim())).size !== line.labels.length)
    e.push(`${line.xName || '가로'} 칸이 서로 겹치지 않게 써 주세요.`)
  if (line.values.some((v) => v === '')) e.push(`${line.yName || '세로'} 값을 모두 채워 주세요.`)
  return e
}

/** 눈금 정보: base(물결선 위 시작 값), step(한 칸 크기), rows(칸 수), top(맨 위 값) */
export function scaleFor(values, { step, waveTo = 0, wave = false } = {}) {
  const nums = values.filter((v) => v !== '' && v !== null).map(Number)
  const max = nums.length ? Math.max(...nums) : 10
  const base = wave ? waveTo : 0
  const s = step || autoStep(max, base)
  const rows = Math.max(1, Math.floor((max - base) / s) + 1)
  return { base, step: s, rows, top: base + rows * s, wave: wave && base > 0 }
}

/** 공학 도구 설정(눈금 간격·물결선)에 맞는 눈금 */
export function toolScale(line) {
  const vals = line.values.map(Number)
  const waveTo = line.tool.wave ? suggestWave(line.values) : 0
  const opts = { step: line.tool.step || 0, waveTo, wave: waveTo > 0 }
  const sc = scaleFor(vals, opts)
  // 눈금이 너무 촘촘하면(40칸 넘게) 알맞은 간격으로 바꿔요
  return sc.rows > 40 ? scaleFor(vals, { ...opts, step: 0 }) : sc
}

export function autoStep(max, base = 0) {
  const span = Math.max(1, max - base)
  return STEP_OPTIONS.find((s) => span / s <= 10) || 100
}

/** 물결선 아래쪽에서 시작할 수 있는 값(눈금에 맞게 내림) */
export function suggestWave(values) {
  const nums = values.filter((v) => v !== '').map(Number)
  if (!nums.length) return 0
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  if (min < 10 || min < max * 0.4) return 0
  const s = autoStep(max - min)
  return Math.floor(min / s) * s - s > 0 ? Math.floor(min / s) * s - s : 0
}

// ----- 교과서 5단계 채점 -----
export function checkHorizontal(choice) {
  if (choice === 'x') return { ok: true, msg: '맞아요! 시간처럼 차례대로 변하는 것은 가로에, 조사한 수는 세로에 나타내요.' }
  return { ok: false, msg: '가로에는 시간(차례)을, 세로에는 조사한 수를 나타내야 변화가 잘 보여요.' }
}

export function checkWave(on, waveTo, values) {
  const nums = values.map(Number)
  const min = Math.min(...nums)
  if (!on) {
    const sug = suggestWave(values)
    return sug > 0
      ? { ok: true, msg: `좋아요. 물결선 없이 그려요. (가장 작은 값이 ${min}이라 0과 ${sug} 사이에 물결선을 넣으면 변화가 더 잘 보여요.)` }
      : { ok: true, msg: '좋아요. 가장 작은 값이 0에 가까워서 물결선 없이 그려도 돼요.' }
  }
  if (waveTo <= 0) return { ok: false, msg: '물결선은 0보다 큰 값과 0 사이에 넣어야 해요.' }
  if (waveTo > min) return { ok: false, msg: `가장 작은 값이 ${min}이에요. 물결선 위 시작 값은 ${min}보다 작거나 같아야 해요.` }
  return { ok: true, msg: `0과 ${waveTo} 사이에 물결선을 넣어 필요 없는 부분을 줄였어요.` }
}

export function checkStep(step, values, base) {
  if (!step) return { ok: false, msg: '눈금 한 칸의 크기를 골라 주세요.' }
  const max = Math.max(...values.map(Number))
  const rows = Math.floor((max - base) / step) + 1
  if (rows > 20) return { ok: false, rows, msg: `칸이 ${rows}칸이나 필요해서 그래프가 너무 길어져요. 한 칸을 더 크게 해 볼까요?` }
  if (rows < 3) return { ok: false, rows, msg: `칸이 ${rows}칸뿐이라 변화가 잘 보이지 않아요. 한 칸을 더 작게 해 볼까요?` }
  return { ok: true, rows, msg: `한 칸 = ${step}. 가장 큰 값 ${max}까지 ${rows}칸으로 나타낼 수 있어요.` }
}

export function checkPoints(points, values) {
  const wrong = points.map((p, i) => (p === null || p !== Number(values[i]) ? i : -1)).filter((i) => i >= 0)
  return { ok: wrong.length === 0, wrong }
}

// ----- 그래프 읽기 퀴즈 -----
export function labelText(label, unit) {
  return /^\d+$/.test(String(label)) && unit ? `${label}${unit}` : String(label)
}

function numberChoices(answer) {
  const set = new Set([answer])
  for (const d of [1, -1, 2, 3, -2, 5]) {
    if (set.size >= 4) break
    if (answer + d >= 0) set.add(answer + d)
  }
  return [...set].sort((a, b) => a - b).map(String)
}

export function makeLineQuiz(line) {
  const vals = line.values.map(Number)
  const names = line.labels.map((l) => labelText(l, line.xUnit))
  const unit = line.yUnit
  const qs = []
  const max = Math.max(...vals)
  const top = names.filter((_, i) => vals[i] === max)
  qs.push({
    q: `${line.yName}이(가) 가장 많은(높은) 때는 언제인가요?`,
    multi: true,
    choices: names,
    answers: top,
    explain: `${top.join(', ')}에 ${max}${unit}로 가장 많아요. 그래프에서 점이 가장 높은 곳이에요.`,
  })
  const segs = vals.slice(1).map((v, i) => ({ name: `${names[i]} → ${names[i + 1]}`, diff: v - vals[i] }))
  const up = Math.max(...segs.map((s) => s.diff))
  if (up > 0) {
    const a = segs.filter((s) => s.diff === up).map((s) => s.name)
    qs.push({
      q: '바로 전보다 가장 많이 늘어난 때는 언제인가요?',
      multi: true,
      choices: segs.map((s) => s.name),
      answers: a,
      explain: `${a.join(', ')}에 ${up}${unit} 늘어났어요. 선분이 가장 가파르게 올라간 곳이에요.`,
    })
  }
  const down = Math.min(...segs.map((s) => s.diff))
  if (down < 0) {
    const a = segs.filter((s) => s.diff === down).map((s) => s.name)
    qs.push({
      q: '바로 전보다 가장 많이 줄어든 때는 언제인가요?',
      multi: true,
      choices: segs.map((s) => s.name),
      answers: a,
      explain: `${a.join(', ')}에 ${-down}${unit} 줄어들었어요. 선분이 가장 가파르게 내려간 곳이에요.`,
    })
  }
  const diff = Math.abs(vals[vals.length - 1] - vals[0])
  qs.push({
    q: `처음(${names[0]})과 마지막(${names[names.length - 1]})의 ${line.yName}은(는) 몇 ${unit} 차이가 나나요?`,
    choices: numberChoices(diff),
    answers: [String(diff)],
    explain: `${Math.max(vals[0], vals.at(-1))} − ${Math.min(vals[0], vals.at(-1))} = ${diff}${unit}예요.`,
  })
  qs.push({
    q: '꺾은선그래프에서 선분이 오른쪽 위로 올라가면 무엇을 뜻하나요?',
    choices: ['값이 늘어나요', '값이 줄어들어요', '값이 변하지 않아요'],
    answers: ['값이 늘어나요'],
    explain: '선분이 올라가면 늘어나고, 내려가면 줄어들고, 평평하면 변화가 없어요. 기울기가 클수록 변화가 커요.',
  })
  return qs
}

// ----- 상태 변경 -----
function resize(arr, n, fill) {
  return Array.from({ length: n }, (_, i) => (i < arr.length ? arr[i] : fill))
}

export function lineReducer(line, action) {
  switch (action.type) {
    case 'line/pickTopic': {
      const t = findLineTopic(action.id)
      if (!t) return line
      return {
        ...structuredClone(initialLine),
        topicId: t.id,
        topic: t.title,
        xName: t.xName,
        xUnit: t.xUnit,
        yName: t.yName,
        yUnit: t.yUnit,
        labels: [...t.labels],
      }
    }
    case 'line/custom':
      return line.topicId
        ? { ...structuredClone(initialLine), topic: text(action.text, L.topic) }
        : { ...line, topic: text(action.text, L.topic) }
    case 'line/field': {
      const max = action.name.endsWith('Unit') ? L.unit : L.axisName
      return { ...line, [action.name]: text(action.value, max) }
    }
    case 'line/label': {
      const labels = [...line.labels]
      labels[action.index] = text(action.value, L.label)
      return { ...line, labels }
    }
    case 'line/value': {
      const values = [...line.values]
      values[action.index] = toValue(action.value)
      return { ...line, values }
    }
    case 'line/count': {
      const n = Math.min(L.maxPoints, Math.max(L.minPoints, action.n))
      return {
        ...line,
        labels: resize(line.labels, n, ''),
        values: resize(line.values, n, ''),
        draw: { ...line.draw, points: resize(line.draw.points, n, null) },
      }
    }
    case 'line/sample': {
      const t = findLineTopic(line.topicId)
      if (!t) return line
      return { ...line, labels: [...t.labels], values: [...t.sample], draw: initialDraw(t.labels.length) }
    }
    case 'line/draw':
      return { ...line, draw: { ...line.draw, ...action.patch } }
    case 'line/drawPoint': {
      const points = [...line.draw.points]
      points[action.index] = action.value === null ? null : toValue(action.value)
      return { ...line, draw: { ...line.draw, points } }
    }
    case 'line/drawReset':
      return { ...line, draw: initialDraw(line.labels.length) }
    case 'line/tool':
      return { ...line, tool: { ...line.tool, ...action.patch } }
    case 'line/insight':
      return { ...line, insight: text(action.text, L.insight) }
    case 'line/selfCheck':
      return { ...line, selfCheck: line.selfCheck.map((v, i) => (i === action.index ? !v : v)) }
    default:
      return line
  }
}
