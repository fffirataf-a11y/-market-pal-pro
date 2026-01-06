import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  ChefHat,
  Settings,
} from "lucide-react";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/lists", icon: ShoppingCart, label: t('nav.myLists') },
    { path: "/ai-chef", icon: ChefHat, label: t('nav.aiChef') },
    { path: "/settings", icon: Settings, label: t('nav.settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 pb-2 safe-bottom">
      <div className="container max-w-4xl">
        <div className="grid grid-cols-3 gap-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={`flex-col h-auto py-3 gap-1 ${isActive ? "text-primary" : ""
                  }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};