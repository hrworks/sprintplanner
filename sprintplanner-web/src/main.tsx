import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

if (location.hostname === 'localhost') {
  document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', '/favicon-dev.png');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
