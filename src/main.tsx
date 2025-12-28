import { StrictMode } from 'react'
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

console.log('[DEBUG] main.tsx: Starting React render...')

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
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
    </StrictMode>,
  )
} catch (error) {
  console.error('[DEBUG] main.tsx: FATAL ERROR during render:', error);
  document.body.innerHTML = '<h1 style="color:red;padding:20px">App Crash: ' + error + '</h1>';
}