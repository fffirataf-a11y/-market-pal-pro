import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// MINIMAL TEST APP - v19
// Bu basit bir test. Eğer bu bile açılmazsa, sorun React/Capacitor seviyesinde.
const MinimalTestApp = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    console.log('[MinimalTestApp] Component mounted!');
    // Hide web splash
    const webSplash = document.getElementById('web-splash');
    if (webSplash) webSplash.style.display = 'none';
  }, []);

  return (
    <div style={{
      backgroundColor: '#14b8a6',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ color: 'white', fontSize: '32px', marginBottom: '20px' }}>
        🛒 SmartMarket v19 TEST
      </h1>
      <p style={{ color: 'white', fontSize: '18px', marginBottom: '30px' }}>
        Bu ekranı görüyorsanız, React ÇALIŞIYOR!
      </p>
      <button
        onClick={() => setCounter(c => c + 1)}
        style={{
          backgroundColor: 'white',
          color: '#14b8a6',
          fontSize: '18px',
          padding: '15px 30px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Tıkla: {counter}
      </button>
    </div>
  );
};

console.log('[DEBUG] main.tsx: Rendering MinimalTestApp...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MinimalTestApp />
  </StrictMode>,
);