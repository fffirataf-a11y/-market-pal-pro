import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { AlertTriangle, Sparkles } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  
  interface LimitReachedDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feature: string;
    currentPlan: string;
  }
  
  export const LimitReachedDialog = ({
    open,
    onOpenChange,
    feature,
    currentPlan,
  }: LimitReachedDialogProps) => {
    const navigate = useNavigate();
  
    const handleUpgrade = () => {
      onOpenChange(false);
      navigate("/settings");
      // Scroll to subscription plans after navigation
      setTimeout(() => {
        document.getElementById("subscription-plans")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Limit Reached</DialogTitle>
            <DialogDescription className="text-center">
              You've reached your monthly limit for <strong>{feature}</strong> on the{" "}
              <strong>{currentPlan}</strong> plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="rounded-lg border p-4 space-y-2 bg-primary/5">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Upgrade to Premium or Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get more limits or unlimited access to all features
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Maybe Later
            </Button>
            <Button onClick={handleUpgrade} className="w-full sm:w-auto">
              <Sparkles className="mr-2 h-4 w-4" />
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };