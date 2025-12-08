import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 🟢 DEBUG SIGNAL: If you see this in the console, the file is loading.
console.log("🚀 SYSTEM BOOTLOADER INITIATED...");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)