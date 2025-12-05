import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Lists from "./pages/Lists";
import Scanner from "./pages/Scanner";
import AIChef from "./pages/AIChef";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import IconPreview from "./pages/IconPreview";
import Checkout from "./pages/Checkout";
import { useState, useEffect, useRef } from "react";
import { useRealtimeNotifications } from "@/hooks/useNotifications";
import { useSubscription } from "@/hooks/useSubscription";
import { usePurchases } from "@/hooks/usePurchases";
import { showAppOpenAd } from "@/lib/adManager";
import { Capacitor } from "@capacitor/core";

const queryClient = new QueryClient();

const App = () => {
  // ✅ Gerçek zamanlı notification dinleyici
  useRealtimeNotifications();

  const { plan, upgradeToPremium, upgradeToPro } = useSubscription();
  const { customerInfo, isLoading: purchasesLoading } = usePurchases();
  const appOpenAdShown = useRef(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("userToken")
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem("onboardingCompleted") === "true"
  );

  // RevenueCat ile abonelik durumunu senkronize et
  useEffect(() => {
    if (!purchasesLoading && customerInfo) {
      const entitlements = customerInfo.entitlements.active;

      if (entitlements['pro'] && plan !== 'pro') {
        console.log('🔄 Syncing subscription: Upgrading to PRO');
        upgradeToPro();
      } else if (entitlements['premium'] && plan !== 'premium' && plan !== 'pro') {
        console.log('🔄 Syncing subscription: Upgrading to PREMIUM');
        upgradeToPremium();
      }
    }
  }, [customerInfo, purchasesLoading, plan, upgradeToPremium, upgradeToPro]);

  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("userToken"));
      setHasCompletedOnboarding(
        localStorage.getItem("onboardingCompleted") === "true"
      );
    };

    // Storage event listener (farklı tab'lar için)
    window.addEventListener("storage", handleStorageChange);

    // Custom event listener (aynı tab için)
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
  }, []);

  // App Open Ad - Uygulama açılışında göster (sadece free plan kullanıcılarına)
  useEffect(() => {
    // Sadece mobil platformlarda ve ilk açılışta göster
    if (!Capacitor.isNativePlatform() || appOpenAdShown.current) {
      return;
    }

    // Kısa bir gecikme ile göster (splash screen'den sonra)
    const timer = setTimeout(() => {
      if (!appOpenAdShown.current) {
        appOpenAdShown.current = true;
        showAppOpenAd(plan);
      }
    }, 1000); // 1 saniye gecikme

    return () => clearTimeout(timer);
  }, [plan]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Onboarding - sadece ilk kez */}
                <Route
                  path="/"
                  element={
                    !hasCompletedOnboarding ? (
                      <Welcome />
                    ) : isAuthenticated ? (
                      <Navigate to="/lists" replace />
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  }
                />

                {/* Auth sayfası */}
                <Route
                  path="/auth"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/lists" replace />
                    ) : (
                      <Auth />
                    )
                  }
                />

                {/* Korumalı sayfalar */}
                <Route
                  path="/lists"
                  element={isAuthenticated ? <Lists /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/scanner"
                  element={isAuthenticated ? <Scanner /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/ai-chef"
                  element={isAuthenticated ? <AIChef /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/settings"
                  element={isAuthenticated ? <Settings /> : <Navigate to="/auth" replace />}
                />
                <Route
                  path="/profile"
                  element={isAuthenticated ? <Profile /> : <Navigate to="/auth" replace />}
                />

                {/* Icon Preview - Public */}
                <Route
                  path="/icon-preview"
                  element={<IconPreview />}
                />

                {/* Checkout - Protected */}
                <Route
                  path="/checkout"
                  element={isAuthenticated ? <Checkout /> : <Navigate to="/auth" replace />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;