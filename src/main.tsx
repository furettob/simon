import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SimonGame from './SimonGame'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimonGame />
  </StrictMode>,
)
