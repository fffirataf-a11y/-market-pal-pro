import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, Users, ChefHat, Check } from "lucide-react";
import welcomeHero from "@/assets/welcome-hero.png";
import onboarding1 from "@/assets/onboarding-1.png";
import onboarding2 from "@/assets/onboarding-2.png";
import onboarding3 from "@/assets/onboarding-3.png";

const Welcome = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onboardingSteps = [
    {
      image: welcomeHero,
      title: t('welcome.step1.title'),
      description: t('welcome.step1.description'),
      icon: ShoppingBag,
    },
    {
      image: onboarding1,
      title: t('welcome.step2.title'),
      description: t('welcome.step2.description'),
      icon: Check,
    },
    {
      image: onboarding2,
      title: t('welcome.step3.title'),
      description: t('welcome.step3.description'),
      icon: Users,
    },
    {
      image: onboarding3,
      title: t('welcome.step4.title'),
      description: t('welcome.step4.description'),
      icon: ChefHat,
    },
  ];

  const currentStep = onboardingSteps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/auth"); // Bu satırı güncelle
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-square max-w-sm mx-auto">
            <img
              src={currentStep.image}
              alt={currentStep.title}
              className="w-full h-full object-contain animate-fade-in"
            />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {currentStep.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === step
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleNext}
              className="w-full h-14 text-base font-semibold"
              size="lg"
            >
              {step < onboardingSteps.length - 1 ? t('welcome.next') : t('welcome.getStarted')}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            {step < onboardingSteps.length - 1 && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                {t('welcome.skip')}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welcome;