import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import App from './App.jsx'
import SplashScreen from './components/SplashScreen'
import './index.css'

const rootEl = document.getElementById('root')

if (!rootEl) {
  console.error('[Myra] Impossible de trouver #root dans index.html')
} else {
  ReactDOM.createRoot(rootEl).render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SplashScreen />
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}