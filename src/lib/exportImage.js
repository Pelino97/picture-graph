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

export async function makeWhiteboardImage(state, rootEl) {
  try {
    await document.fonts?.ready
  } catch {
    /* 무시 */
  }
  const isEmoji = state.iconId?.startsWith('emoji:')
  const lineImg = isEmoji ? null : await loadSvgIcon(rootEl?.querySelector('svg.pg-line'))

  const W = 1600
  const pad = 60
  const labelW = 260
  const big = 64
  const small = 38
  const rowH = 110

  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `44px ${FONT}`
  const titleLines = wrap(measure, state.topic, W - pad * 2 - 160)
  measure.font = `40px ${FONT}`
  const noteLines = wrap(measure, state.insight, W - pad * 2 - 60)

  const titleH = titleLines.length * 58 + 30
  const graphH = 70 + rowH * 4 + 80
  const noteH = 100 + noteLines.length * 60 + 30
  const checksDone = state.selfCheck.filter(Boolean).length
  const H = pad + titleH + graphH + 30 + noteH + 80 + pad

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFDF8'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#EEF3F8'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  // 제목
  let y = pad
  roundRect(ctx, pad, y, 120, 60, 30, '#FFF1B8')
  ctx.fillStyle = INK
  ctx.font = `34px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${state.group}조`, pad + 60, y + 31)
  ctx.textAlign = 'left'
  ctx.font = `44px ${FONT}`
  titleLines.forEach((line, i) => ctx.fillText(line, pad + 150, y + 30 + i * 58))
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
  y += noteH + 50

  ctx.font = `28px ${FONT}`
  ctx.fillStyle = '#9A8577'
  ctx.fillText(`스스로 평가 ${checksDone}/${SELF_CHECKS.length}  ·  그림 그래프 그리기`, pad, y)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('blob'))), 'image/png')
  })
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
