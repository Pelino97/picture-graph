import { groupLabel } from './state.js'
import { SELF_CHECKS } from '../data/selfCheck.js'

// 화이트보드 내용을 PNG 그림으로 만들어 저장해요 (모두 이 기기 안에서 처리)
const INK = '#5B4636'
const COLORS = ['#FFF0F4', '#EDF7FF', '#EEFAF1', '#F5F0FF']
const FONT = "'Jua', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
const EMOJI_FONT = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"

function wrap(ctx, text, maxWidth) {
  const lines = []
  for (const para of String(text).split('\n')) {
    let line = ''
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line)
        line = ch.trim() ? ch : ''
      } else line += ch
    }
    lines.push(line)
  }
  return lines
}

function roundRect(ctx, x, y, w, h, r, fill, stroke = INK) {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = stroke
  ctx.stroke()
}

function loadSvgIcon(svgEl) {
  return new Promise((resolve) => {
    if (!svgEl) return resolve(null)
    const clone = svgEl.cloneNode(true)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', '96')
    clone.setAttribute('height', '96')
    const markup = new XMLSerializer().serializeToString(clone).replaceAll('currentColor', INK)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup)
  })
}

// 파일 이름은 영어로만 (일부 브라우저가 한글 파일 이름을 바꿔 버려요)
export function fileName(state, prefix) {
  const tag = state.groupMode === 'name' ? 'my-group' : `group${state.group || ''}`
  return `${prefix}-${tag}.png`
}

/** 바탕: 모눈 + 테두리 띠(파스텔 점무늬·별) */
function drawBackdrop(ctx, W, H) {
  ctx.fillStyle = '#FFF4F7'
  ctx.fillRect(0, 0, W, H)
  const dots = ['#FFB3C6', '#A8D8FF', '#B5E6C3', '#D7C8FF', '#FFE08A']
  let k = 0
  for (let y = 18; y < H; y += 36) {
    for (let x = (y / 36) % 2 ? 18 : 36; x < W; x += 36) {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = dots[k++ % dots.length]
      ctx.globalAlpha = 0.55
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  roundRect(ctx, 30, 30, W - 60, H - 60, 36, '#FFFDF8')
  ctx.save()
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(30, 30, W - 60, H - 60, 36)
  else ctx.rect(30, 30, W - 60, H - 60)
  ctx.clip()
  ctx.strokeStyle = '#EEF3F8'
  ctx.lineWidth = 1
  for (let x = 30; x < W; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 30; y < H; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.restore()
  ctx.lineWidth = 3
  ctx.strokeStyle = INK
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(30, 30, W - 60, H - 60, 36)
  else ctx.rect(30, 30, W - 60, H - 60)
  ctx.stroke()
  ctx.font = `34px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ;[
    [30, 30, '🌸'],
    [W - 30, 30, '⭐'],
    [30, H - 30, '🍀'],
  ].forEach(([x, y, e]) => ctx.fillText(e, x, y))
}

/** 화면의 SVG(캐릭터, 그래프)를 그림으로 바꿔요 */
function loadSvg(svgEl, w, h) {
  return new Promise((resolve) => {
    if (!svgEl) return resolve(null)
    const clone = svgEl.cloneNode(true)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', String(w))
    clone.setAttribute('height', String(h))
    clone.querySelectorAll('.hit, .ghost').forEach((n) => n.remove())
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = CHART_CSS
    clone.insertBefore(style, clone.firstChild)
    const markup = new XMLSerializer().serializeToString(clone).replaceAll('currentColor', INK)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup)
  })
}

// 그림으로 바꿀 때는 페이지의 CSS가 따라가지 않아서, 그래프 모양을 여기에 같이 넣어요
const CHART_CSS = `
text{font-family:${FONT};fill:${INK}}
.chart-title{font-size:26px;text-anchor:middle}
.grid{stroke:#E6DCD2;stroke-width:1}
.grid-major{stroke:#CDBFB2;stroke-width:1.6}
.grid-v{stroke:#EFE6DD;stroke-width:1}
.axis{stroke:${INK};stroke-width:3}
.tick{font-size:17px}
.unit,.corner{font-size:16px;fill:#8A7464}
.xlabel{font-size:18px}
.val{font-size:17px;paint-order:stroke;stroke:#fff;stroke-width:5px}
.wave-line{fill:none;stroke:${INK};stroke-width:2.5}
.wave rect{fill:#fff}
.change rect.up{fill:#FFE1E8;stroke:#E9809B;stroke-width:2}
.change rect.down{fill:#E3F1FF;stroke:#4A9BE0;stroke-width:2}
.change rect.flat{fill:#F1EDE8;stroke:#B9A898;stroke-width:2}
.change text{font-size:15px}
.chart-note{font-size:17px;fill:#8A7464}
.slice-name{font-size:18px}
.slice-pct{font-size:20px}
.legend-t{font-size:17px}
`

function badge(ctx, text, x, y) {
  ctx.font = `34px ${FONT}`
  const w = Math.max(120, ctx.measureText(text).width + 48)
  roundRect(ctx, x, y, w, 60, 30, '#FFF1B8')
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + w / 2, y + 31)
  return w
}

/** 4학년 꺾은선그래프(또는 고른 그래프) 화이트보드를 그림으로 */
export async function makeLineImage(state, rootEl, checksTotal) {
  try {
    await document.fonts?.ready
  } catch {
    /* 무시 */
  }
  const line = state.line
  const W = 1600
  const pad = 90
  const chartW = W - pad * 2
  const chartH = Math.round((chartW * 430) / 680)
  const chartImg = await loadSvg(rootEl?.querySelector('svg.chart'), chartW, chartH)
  const mascot = await loadSvg(rootEl?.querySelector('svg.mascot'), 170, 170)
  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `40px ${FONT}`
  const noteLines = wrap(measure, line.insight, W - pad * 2 - 260)
  const noteH = Math.max(200, 100 + noteLines.length * 60 + 30)
  const H = pad + 90 + chartH + 40 + noteH + 70 + pad

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  drawBackdrop(ctx, W, H)

  let y = pad
  const bw = badge(ctx, groupLabel(state), pad, y)
  ctx.textAlign = 'left'
  ctx.font = `42px ${FONT}`
  ctx.fillText(line.topic, pad + bw + 24, y + 31, W - pad * 2 - bw - 24)
  y += 90
  roundRect(ctx, pad, y, chartW, chartH, 20, '#FFFFFF')
  if (chartImg) ctx.drawImage(chartImg, pad, y, chartW, chartH)
  y += chartH + 40
  roundRect(ctx, pad, y, W - pad * 2, noteH, 24, '#FFF7D1')
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.font = `34px ${FONT}`
  ctx.fillText('✏️ 알게 된 점', pad + 30, y + 50)
  ctx.font = `40px ${FONT}`
  noteLines.forEach((l, i) => ctx.fillText(l, pad + 30, y + 120 + i * 60))
  if (mascot) ctx.drawImage(mascot, W - pad - 200, y + noteH - 190, 170, 170)
  y += noteH + 50
  ctx.font = `28px ${FONT}`
  ctx.fillStyle = '#9A8577'
  const done = line.selfCheck.filter(Boolean).length
  ctx.fillText(`스스로 평가 ${done}/${checksTotal}  ·  꺾은선그래프 그리기`, pad, y)
  return toPng(canvas)
}

function toPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('blob'))), 'image/png')
  })
}

export async function makeWhiteboardImage(state, rootEl) {
  try {
    await document.fonts?.ready
  } catch {
    /* 무시 */
  }
  const isEmoji = state.iconId?.startsWith('emoji:')
  const lineImg = isEmoji ? null : await loadSvgIcon(rootEl?.querySelector('svg.pg-line'))

  const mascot = await loadSvg(rootEl?.querySelector('svg.mascot'), 170, 170)
  const W = 1600
  const pad = 90
  const labelW = 260
  const big = 64
  const small = 38
  const rowH = 110

  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `44px ${FONT}`
  const titleLines = wrap(measure, state.topic, W - pad * 2 - 300)
  measure.font = `40px ${FONT}`
  const noteLines = wrap(measure, state.insight, W - pad * 2 - 260)

  const titleH = titleLines.length * 58 + 30
  const graphH = 70 + rowH * 4 + 80
  const noteH = Math.max(200, 100 + noteLines.length * 60 + 30)
  const checksDone = state.selfCheck.filter(Boolean).length
  const H = pad + titleH + graphH + 30 + noteH + 80 + pad

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  drawBackdrop(ctx, W, H)

  // 제목
  let y = pad
  const bw = badge(ctx, groupLabel(state), pad, y)
  ctx.textAlign = 'left'
  ctx.font = `44px ${FONT}`
  titleLines.forEach((line, i) => ctx.fillText(line, pad + bw + 30, y + 30 + i * 58))
  y += titleH

  // 그림그래프 표
  const tableW = W - pad * 2
  roundRect(ctx, pad, y, tableW, 70, 0, '#FFF6D6')
  ctx.font = `30px ${FONT}`
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.fillText('항목', pad + labelW / 2, y + 36)
  ctx.fillText('사람 수', pad + labelW + (tableW - labelW) / 2, y + 36)
  ctx.beginPath()
  ctx.moveTo(pad + labelW, y)
  ctx.lineTo(pad + labelW, y + 70)
  ctx.stroke()
  y += 70

  const drawIcon = (x, cy, size) => {
    if (isEmoji) {
      ctx.font = `${size * 0.85}px ${EMOJI_FONT}`
      ctx.textAlign = 'center'
      ctx.fillText(state.iconId.slice(6), x + size / 2, cy + size * 0.05)
    } else if (lineImg) {
      ctx.drawImage(lineImg, x, cy - size / 2, size, size)
    }
  }

  state.items.forEach((name, i) => {
    roundRect(ctx, pad, y, labelW, rowH, 0, COLORS[i])
    roundRect(ctx, pad + labelW, y, tableW - labelW, rowH, 0, '#FFFFFF')
    ctx.fillStyle = INK
    ctx.font = `32px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText(name, pad + labelW / 2, y + rowH / 2)
    let x = pad + labelW + 20
    const cy = y + rowH / 2
    for (let k = 0; k < state.rows[i].big; k++) {
      drawIcon(x, cy, big)
      x += big + 8
    }
    for (let k = 0; k < state.rows[i].small; k++) {
      drawIcon(x, cy, small)
      x += small + 6
    }
    y += rowH
  })

  // 범례
  y += 20
  ctx.textAlign = 'left'
  ctx.fillStyle = INK
  let lx = W - pad - 420
  drawIcon(lx, y + 30, 50)
  ctx.font = `30px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText(`${state.unit}명`, lx + 60, y + 32)
  lx += 200
  drawIcon(lx, y + 30, 32)
  ctx.font = `30px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText('1명', lx + 44, y + 32)
  y += 90

  // 알게 된 점
  roundRect(ctx, pad, y, W - pad * 2, noteH, 24, '#FFF7D1')
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.font = `34px ${FONT}`
  ctx.fillText('✏️ 알게 된 점', pad + 30, y + 50)
  ctx.font = `40px ${FONT}`
  noteLines.forEach((line, i) => ctx.fillText(line, pad + 30, y + 120 + i * 60))
  if (mascot) ctx.drawImage(mascot, W - pad - 200, y + noteH - 190, 170, 170)
  y += noteH + 50

  ctx.font = `28px ${FONT}`
  ctx.fillStyle = '#9A8577'
  ctx.fillText(`스스로 평가 ${checksDone}/${SELF_CHECKS.length}  ·  그림 그래프 그리기`, pad, y)

  return toPng(canvas)
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
