import { LIMITS, LINE_ICONS, findTopic, GROUPS } from '../data/topics.js'
import { initialLine, lineReducer, lineSetupErrors, lineTableErrors, sanitizeLine } from './lineLogic.js'

// 수업 데이터는 이 브라우저 안(localStorage)에만 저장해요. 서버로 보내지 않아요.
const STORAGE_KEY = 'picture-graph-v1'
const SCREENS3 = ['setup', 'survey', 'results', 'graph']
const SCREENS4 = ['l-setup', 'l-table', 'l-draw', 'l-tool', 'l-review']
const SCREENS = ['intro', 'grade', ...SCREENS3, ...SCREENS4]
export const GROUP_NAME_MAX = 12
const UNITS = [5, 10]

export const emptyRows = () => [0, 1, 2, 3].map(() => ({ big: 0, small: 0 }))

export const initialState = {
  screen: 'intro',
  grade: null, // 3: 그림그래프, 4: 꺾은선그래프
  groupMode: 'number', // 'number'(1~8조) | 'name'(모둠 이름 쓰기)
  group: null,
  groupName: '',
  topicId: null,
  topic: '',
  items: ['', '', '', ''],
  target: '',
  counts: [0, 0, 0, 0],
  iconId: null,
  unit: 10,
  rows: emptyRows(),
  history: [],
  graphChecked: false,
  insight: '',
  selfCheck: [false, false, false, false],
  sound: true,
  bigText: false,
  line: initialLine,
}

/** 화면에 보여 줄 모둠 이름: '3조' 또는 직접 쓴 이름 */
export function groupLabel(s) {
  if (s.groupMode === 'name') return s.groupName.trim()
  return s.group ? `${s.group}조` : ''
}

const clampInt = (v, min, max) => {
  const n = Math.floor(Number(v))
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, n))
}
const cleanText = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '')

/** 저장된 값을 그대로 믿지 않고, 모양과 범위를 하나씩 확인해서 되살린다 */
export function sanitize(raw) {
  if (!raw || typeof raw !== 'object') return { ...initialState }
  const s = { ...initialState }
  if (SCREENS.includes(raw.screen)) s.screen = raw.screen
  if (raw.grade === 3 || raw.grade === 4) s.grade = raw.grade
  if (raw.groupMode === 'name') s.groupMode = 'name'
  if (GROUPS.includes(raw.group)) s.group = raw.group
  s.groupName = cleanText(raw.groupName, GROUP_NAME_MAX)
  if (typeof raw.topicId === 'string' && findTopic(raw.topicId)) s.topicId = raw.topicId
  s.topic = cleanText(raw.topic, LIMITS.topic)
  if (Array.isArray(raw.items) && raw.items.length === 4) {
    s.items = raw.items.map((v) => cleanText(v, LIMITS.item))
  }
  s.target = raw.target === '' || raw.target == null ? '' : clampInt(raw.target, 1, LIMITS.maxTarget)
  if (Array.isArray(raw.counts) && raw.counts.length === 4) {
    s.counts = raw.counts.map((v) => clampInt(v, 0, 999))
  }
  if (typeof raw.iconId === 'string' && isValidIconId(raw.iconId)) s.iconId = raw.iconId
  if (UNITS.includes(raw.unit)) s.unit = raw.unit
  if (Array.isArray(raw.rows) && raw.rows.length === 4) {
    s.rows = raw.rows.map((r) => ({
      big: clampInt(r?.big, 0, LIMITS.maxIconsPerRow),
      small: clampInt(r?.small, 0, LIMITS.maxIconsPerRow),
    }))
  }
  s.graphChecked = raw.graphChecked === true
  s.insight = cleanText(raw.insight, LIMITS.insight)
  if (Array.isArray(raw.selfCheck) && raw.selfCheck.length === 4) {
    s.selfCheck = raw.selfCheck.map((v) => v === true)
  }
  s.sound = raw.sound !== false
  s.bigText = raw.bigText === true
  s.line = sanitizeLine(raw.line)
  // 화면이 필요한 정보 없이 열리지 않도록 보정
  if (SCREENS3.includes(s.screen) && s.grade !== 3) s.screen = 'grade'
  if (SCREENS4.includes(s.screen) && s.grade !== 4) s.screen = 'grade'
  if (SCREENS3.includes(s.screen) && s.screen !== 'setup' && !isSetupComplete(s)) s.screen = 'setup'
  const i4 = SCREENS4.indexOf(s.screen)
  if (i4 > 0 && lineStartErrors(s).length) s.screen = 'l-setup'
  else if (i4 > 1 && lineTableErrors(s.line).length) s.screen = 'l-table'
  return s
}

export function isValidIconId(id) {
  if (id.startsWith('line:')) return LINE_ICONS.includes(id.slice(5))
  if (id.startsWith('emoji:')) {
    const emoji = id.slice(6)
    return emoji.length > 0 && emoji.length <= 8
  }
  return false
}

export function setupErrors(s) {
  const errors = []
  if (!groupLabel(s)) errors.push(s.groupMode === 'name' ? '우리 모둠 이름을 써 주세요.' : '우리 모둠을 골라 주세요.')
  if (!s.topic.trim()) errors.push('조사 주제를 정해 주세요.')
  const names = s.items.map((v) => v.trim())
  if (names.some((v) => !v)) errors.push('조사 항목 4가지를 모두 써 주세요.')
  else if (new Set(names).size !== 4) errors.push('조사 항목이 서로 겹치지 않게 써 주세요.')
  return errors
}

/** 4학년: 모둠 + 주제 + 가로·세로 이름 */
export function lineStartErrors(s) {
  const e = []
  if (!groupLabel(s)) e.push(s.groupMode === 'name' ? '우리 모둠 이름을 써 주세요.' : '우리 모둠을 골라 주세요.')
  return [...e, ...lineSetupErrors(s.line)]
}

export function isSetupComplete(s) {
  return setupErrors(s).length === 0
}

export function loadState() {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY)
    if (!text) return { ...initialState }
    const loaded = sanitize(JSON.parse(text))
    // 다시 열면 인트로부터 보이되, 이어서 할 수 있게 저장된 내용은 유지
    return { ...loaded, resumeScreen: loaded.screen, screen: 'intro' }
  } catch {
    return { ...initialState }
  }
}

export function saveState(s) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { history, resumeScreen, ...rest } = s
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  } catch {
    // 저장이 막힌 브라우저(시크릿 모드 등)에서도 수업은 그대로 진행
  }
}

export function clearSaved() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* 무시 */
  }
}

export function reducer(state, action) {
  if (typeof action.type === 'string' && action.type.startsWith('line/')) {
    return { ...state, line: lineReducer(state.line, action) }
  }
  switch (action.type) {
    case 'setGrade':
      return { ...state, grade: action.grade, screen: action.grade === 4 ? 'l-setup' : 'setup' }
    case 'setGroupMode':
      return { ...state, groupMode: action.mode === 'name' ? 'name' : 'number' }
    case 'setGroupName':
      return { ...state, groupName: cleanText(action.text, GROUP_NAME_MAX) }
    case 'go':
      if (action.screen === 'intro') return { ...state, screen: 'intro', resumeScreen: state.screen }
      return { ...state, screen: action.screen }
    case 'setGroup':
      return { ...state, group: action.group }
    case 'pickTopic': {
      const t = findTopic(action.id)
      if (!t) return state
      return { ...state, topicId: t.id, topic: t.title, items: [...t.items], iconId: null }
    }
    case 'customTopic':
      return {
        ...state,
        topicId: null,
        topic: cleanText(action.text, LIMITS.topic),
        items: state.topicId ? ['', '', '', ''] : state.items,
        iconId: state.topicId ? null : state.iconId,
      }
    case 'setItem': {
      const items = [...state.items]
      items[action.index] = cleanText(action.text, LIMITS.item)
      return { ...state, items }
    }
    case 'setTarget':
      return {
        ...state,
        target: action.value === '' ? '' : clampInt(action.value, 1, LIMITS.maxTarget),
      }
    case 'startSurvey':
      return {
        ...state,
        topic: state.topic.trim(),
        items: state.items.map((v) => v.trim()),
        counts: [0, 0, 0, 0],
        rows: emptyRows(),
        history: [],
        graphChecked: false,
        insight: '',
        selfCheck: [false, false, false, false],
        screen: 'survey',
      }
    case 'vote': {
      const counts = [...state.counts]
      counts[action.index] = Math.max(0, counts[action.index] + action.delta)
      return { ...state, counts, rows: emptyRows(), history: [], graphChecked: false }
    }
    case 'setIcon':
      return { ...state, iconId: action.iconId }
    case 'setUnit':
      return {
        ...state,
        unit: action.unit,
        rows: emptyRows(),
        history: [],
        graphChecked: false,
      }
    case 'place': {
      const row = state.rows[action.index]
      if (row.big + row.small >= LIMITS.maxIconsPerRow) return state
      const rows = state.rows.map((r, i) =>
        i === action.index ? { ...r, [action.kind]: r[action.kind] + 1 } : r,
      )
      return pushHistory(state, rows)
    }
    case 'remove': {
      const row = state.rows[action.index]
      if (row[action.kind] <= 0) return state
      const rows = state.rows.map((r, i) =>
        i === action.index ? { ...r, [action.kind]: r[action.kind] - 1 } : r,
      )
      return pushHistory(state, rows)
    }
    case 'undo': {
      if (state.history.length === 0) return state
      const history = state.history.slice(0, -1)
      return { ...state, rows: state.history[state.history.length - 1], history, graphChecked: false }
    }
    case 'clearRows':
      return pushHistory(state, emptyRows())
    case 'graphOk':
      return { ...state, graphChecked: true }
    case 'setInsight':
      return { ...state, insight: cleanText(action.text, LIMITS.insight) }
    case 'toggleSelfCheck': {
      const selfCheck = state.selfCheck.map((v, i) => (i === action.index ? !v : v))
      return { ...state, selfCheck }
    }
    case 'toggleSound':
      return { ...state, sound: !state.sound }
    case 'toggleBigText':
      return { ...state, bigText: !state.bigText }
    case 'reset':
      return { ...initialState, screen: 'grade', sound: state.sound, bigText: state.bigText }
    default:
      return state
  }
}

function pushHistory(state, rows) {
  const history = [...state.history, state.rows].slice(-50)
  return { ...state, rows, history, graphChecked: false }
}
