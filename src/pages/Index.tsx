import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    if (hasSeenOnboarding === "true") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-6">
        <ShoppingCart className="mx-auto h-20 w-20 text-primary" />
        <h1 className="text-4xl font-bold">SmartMarket</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Organize all your shopping with collaborative lists, AI chef, and smart scanning
        </p>
        <Button onClick={() => navigate("/welcome")} size="lg">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;