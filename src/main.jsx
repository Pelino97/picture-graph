import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import '@fontsource/jua/400.css'
import './styles.css'
import './theme-soft.css'
import './grade.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Vercel 접속 통계: 같은 사이트 주소(/_vercel/insights)로만 보내고, 개인정보·쿠키는 쓰지 않아요 */}
    <Analytics />
  </StrictMode>,
)
