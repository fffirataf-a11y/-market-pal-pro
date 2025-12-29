import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { SubscriptionProvider } from "@/hooks/useSubscription"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import './index.css'
import App from './App.tsx'
import './i18n'

const queryClient = new QueryClient()

// Web splash'ı gizle ve scroll'u aç
const hideWebSplash = () => {
  const webSplash = document.getElementById('web-splash');
  if (webSplash) {
    webSplash.style.transition = 'opacity 0.5s';
    webSplash.style.opacity = '0';
    setTimeout(() => {
      webSplash.remove(); // DOM'dan tamamen sil
    }, 500);
  }
  // Scroll'u tekrar aktif et
  document.body.style.overflow = 'auto';
};

// Loading component
const LoadingFallback = () => (
  <div style={{
    backgroundColor: '#14b8a6',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <p style={{ color: 'white', fontSize: '18px' }}>Yükleniyor...</p>
  </div>
);

console.log('[DEBUG] main.tsx: Starting full app render...');

// Hide splash after a short delay to ensure React has mounted
setTimeout(hideWebSplash, 500);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <HashRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <SubscriptionProvider>
                  <Toaster />
                  <Sonner />
                  <App />
                </SubscriptionProvider>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HashRouter>
    </Suspense>
  </StrictMode>,
);