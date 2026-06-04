import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthContext } from './context/UserContext.jsx'
import { ThemeContextProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthContext>
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  </AuthContext>,
)
