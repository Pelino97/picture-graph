import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const PRAISE = ['고마워요! 💖', '좋아요! ⭐', '한 표 추가! 🌸', '최고예요! 🍀', '쏙! 🎈']

// 잠깐 나타났다 사라지는 칭찬 스티커
export function useSticker() {
  const [sticker, setSticker] = useState(null)
  const timer = useRef(null)
  const show = useCallback((text, kind = 'small') => {
    clearTimeout(timer.current)
    setSticker({ text: text || PRAISE[Math.floor(Math.random() * PRAISE.length)], kind, key: Date.now() })
    timer.current = setTimeout(() => setSticker(null), kind === 'stamp' ? 1800 : 900)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  const node = sticker
    ? createPortal(
        <div key={sticker.key} className={`sticker sticker-${sticker.kind}`} aria-hidden="true">
          {sticker.text}
        </div>,
        document.body,
      )
    : null
  return [node, show]
}
