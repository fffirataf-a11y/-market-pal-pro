import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Globe,
  Moon,
  Sun,
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const languages = [
    { code: "en", name: "English" },
    { code: "tr", name: "Turkish" },
    { code: "es", name: "Spanish" },
    { code: "zh", name: "Chinese" },
    { code: "fr", name: "French" },
  ];

  const subscriptionTiers = [
    {
      name: "Free",
      price: "$0",
      items: "15 items",
      current: true,
    },
    {
      name: "Basic",
      price: "$4.99",
      items: "50 items",
      current: false,
    },
    {
      name: "Standard",
      price: "$9.99",
      items: "200 items",
      current: false,
    },
    {
      name: "Premium",
      price: "$19.99",
      items: "Unlimited",
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/lists")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl py-6 space-y-6">
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" alt="Sophia Chen" />
              <AvatarFallback className="text-xl font-semibold bg-gradient-primary text-primary-foreground">
                SC
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Sophia Chen</h2>
              <p className="text-sm text-muted-foreground">View Profile</p>
            </div>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              Free Plan
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>sophia.chen@email.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+1(888)123-4567</span>
            </div>
          </div>
        </Card>

        {/* Subscription */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Subscription</h3>
            <Crown className="h-5 w-5 text-accent" />
          </div>

          <div className="grid gap-3">
            {subscriptionTiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-4 rounded-lg border transition-colors ${
                  tier.current
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{tier.name}</h4>
                      {tier.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Up to {tier.items}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{tier.price}</div>
                    <div className="text-xs text-muted-foreground">/month</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4" variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Preferences</h3>

          <div className="space-y-6">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications" className="font-medium">
                    Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and alerts
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="theme" className="font-medium">
                    Theme
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {darkMode ? "Dark" : "Light"} mode
                  </p>
                </div>
              </div>
              <Switch
                id="theme"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            {/* Language */}
            <button className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Language</div>
                  <p className="text-sm text-muted-foreground">English</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </Card>

        {/* App Settings */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">App Settings</h3>

          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start h-auto py-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span>Clear Cache</span>
              </div>
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full h-12 font-semibold"
          onClick={() => navigate("/")}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
      </main>
    </div>
  );
};

export default Settings;
