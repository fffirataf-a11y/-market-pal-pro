import { Routes, Route, Navigate } from "react-router-dom";
import { useRealtimeNotifications } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { initializeAdMob, preloadRewardedAd, preloadInterstitialAd } from "@/lib/adManager";
import { useSubscription } from "@/hooks/useSubscription";
import { usePurchases } from "@/hooks/usePurchases";
import { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import NotificationPermissionDialog from "./components/NotificationPermissionDialog";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Lists from "./pages/Lists";
import AIChef from "./pages/AIChef";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import IconPreview from "./pages/IconPreview";
import Checkout from "./pages/Checkout";
import DebugAudit from "./pages/DebugAudit";

const App = () => {
  // ✅ Gerçek zamanlı notification dinleyici (Web)
  useRealtimeNotifications();

  // ✅ Native Push Notifications (iOS/Android)
  usePushNotifications();




  const { plan, upgradeToPremium, upgradeToPro, downgradeToFree } = useSubscription();
  const { customerInfo, isLoading: purchasesLoading } = usePurchases();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("userToken")
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem("onboardingCompleted") === "true"
  );

  // RevenueCat ile abonelik durumunu senkronize et
  // RevenueCat ile abonelik durumunu senkronize et
  useEffect(() => {
    if (!purchasesLoading && customerInfo) {
      const entitlements = customerInfo.entitlements.active;

      if (entitlements['pro'] && plan !== 'pro') {
        console.log('🔄 Syncing subscription: Upgrading to PRO');
        const productId = entitlements['pro'].productIdentifier;
        const isYearly = productId.includes('yearly') || productId.includes('annual');
        upgradeToPro(isYearly ? 'yearly' : 'monthly');
      } else if (entitlements['premium'] && plan !== 'premium' && plan !== 'pro') {
        console.log('🔄 Syncing subscription: Upgrading to PREMIUM');
        const productId = entitlements['premium'].productIdentifier;
        const isYearly = productId.includes('yearly') || productId.includes('annual');
        upgradeToPremium(isYearly ? 'yearly' : 'monthly');
      } else if (!entitlements['pro'] && !entitlements['premium'] && plan !== 'free') {
        // ✅ NEW: Two-way sync - Downgrade if no active entitlements
        console.log('🔄 Syncing subscription: Downgrading to FREE (No active entitlements)');
        downgradeToFree();
      }
    }
  }, [customerInfo, purchasesLoading, plan, upgradeToPremium, upgradeToPro, downgradeToFree]);

  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("userToken"));
      setHasCompletedOnboarding(
        localStorage.getItem("onboardingCompleted") === "true"
      );
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
    // Initialize Ads and Preload
    const initAds = async () => {
      try {
        await initializeAdMob();
        // Start preloading immediately
        preloadRewardedAd();
        preloadInterstitialAd();
      } catch (e) {
        console.error("Failed to init ads:", e);
      }
    };
    initAds();

  }, []);

  return (
    <ErrorBoundary>
      <NotificationPermissionDialog />
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

        {/* AUDIT ROUTE - REMOVE BEFORE PROD */}
        <Route
          path="/debug-audit"
          element={isAuthenticated ? <DebugAudit /> : <Navigate to="/auth" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;