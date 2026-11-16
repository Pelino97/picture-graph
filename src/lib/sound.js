// 효과음: 소리 파일 없이 브라우저에서 바로 만들어요 (외부 요청 없음)
let ctx = null

function getCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime + start
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

const SOUNDS = {
  pop: () => {
    tone(660, 0, 0.12, 'triangle')
    tone(990, 0.06, 0.14, 'triangle')
  },
  minus: () => tone(330, 0, 0.12, 'triangle', 0.12),
  place: () => tone(780, 0, 0.08, 'sine', 0.12),
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.25, 'triangle')),
  wrong: () => {
    tone(392, 0, 0.18, 'sine', 0.14)
    tone(330, 0.15, 0.25, 'sine', 0.14)
  },
}

export function play(name, enabled) {
  if (!enabled) return
  try {
    SOUNDS[name]?.()
  } catch {
    /* 소리가 안 나도 수업은 계속 */
  }
}
