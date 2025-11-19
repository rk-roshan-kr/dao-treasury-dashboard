import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import './index.css'
import App from './App'

import ErrorBoundary from './components/common/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Use HashRouter instead of BrowserRouter */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)


