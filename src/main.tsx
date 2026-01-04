import { StrictMode, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { SubscriptionProvider } from "@/hooks/useSubscription"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { initializeAdMob } from '@/lib/adManager' // ✅ YENİ EKLENDI
import { Capacitor } from '@capacitor/core' // ✅ YENİ EKLENDI
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
      webSplash.remove();
    }, 500);
  }
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

// ✅ YENİ EKLENDI: AdMob Wrapper Component
const AppWithAdMob = () => {
  useEffect(() => {
    // AdMob'u sadece mobil platformda başlat
    if (Capacitor.isNativePlatform()) {
      console.log('[AdMob] 🚀 Initializing AdMob...');

      const initAds = async () => {
        try {
          await initializeAdMob();
          console.log('[AdMob] ✅ Successfully initialized');
        } catch (error) {
          console.error('[AdMob] ❌ Initialization failed:', error);
        }
      };

      // Kısa bir gecikme ile başlat (splash screen sonrası)
      const timer = setTimeout(() => {
        initAds();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('[AdMob] 🌐 Web platform - AdMob disabled');
    }
  }, []);

  return <App />;
};

console.log('[DEBUG] main.tsx: Starting full app render...');

// Hide splash after a short delay
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
                  <AppWithAdMob /> {/* ✅ DEĞİŞTİ: App yerine AppWithAdMob */}
                </SubscriptionProvider>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HashRouter>
    </Suspense>
  </StrictMode>,
);