import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import './index.css'
import SimonGame from './SimonGame'
import { simonReducer, initialState } from './utils/simonReducer'

const simonStore = configureStore({
  reducer: simonReducer,
  preloadedState: initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={simonStore}>
      <SimonGame />
    </Provider>
  </StrictMode>,
)
