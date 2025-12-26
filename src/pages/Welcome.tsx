import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, Users, ChefHat, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
            color: "from-blue-500 to-indigo-600",
            bgGradient: "from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20"
        },
        {
            image: onboarding1,
            title: t('welcome.step2.title'),
            description: t('welcome.step2.description'),
            icon: Check,
            color: "from-emerald-500 to-teal-600",
            bgGradient: "from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20"
        },
        {
            image: onboarding2,
            title: t('welcome.step3.title'),
            description: t('welcome.step3.description'),
            icon: Users,
            color: "from-orange-500 to-amber-600",
            bgGradient: "from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20"
        },
        {
            image: onboarding3,
            title: t('welcome.step4.title'),
            description: t('welcome.step4.description'),
            icon: Sparkles,
            color: "from-violet-500 to-purple-600",
            bgGradient: "from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20"
        },
    ];

    const currentStep = onboardingSteps[step];
    const Icon = currentStep.icon;

    const handleNext = () => {
        // Haptic feedback if available (using Web Vibration API as fallback/demo)
        if (navigator.vibrate) navigator.vibrate(10);

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
        navigate("/auth");
    };

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-700 bg-gradient-to-br ${currentStep.bgGradient}`}>
            {/* Background Decorative Blurs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${currentStep.color}`}
                />
                <motion.div
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute -bottom-32 -left-20 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr ${currentStep.color}`}
                />
            </div>

            <main className="relative flex-1 flex flex-col items-center justify-between px-6 pt-12 pb-8 min-h-screen">

                {/* Top Section: Indicators & Skip */}
                <div className="w-full flex justify-between items-center z-10">
                    <div className="flex gap-1.5">
                        {onboardingSteps.map((_, index) => (
                            <motion.div
                                key={index}
                                initial={false}
                                animate={{
                                    width: index === step ? 32 : 8,
                                    backgroundColor: index === step ? "currentColor" : "rgba(100,100,100,0.2)"
                                }}
                                className={`h-2 rounded-full transition-colors duration-300 ${index === step ? `text-primary` : ''}`}
                            />
                        ))}
                    </div>

                    {step < onboardingSteps.length - 1 && (
                        <Button
                            onClick={handleSkip}
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground hover:bg-black/5"
                        >
                            {t('welcome.skip')}
                        </Button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full flex flex-col items-center justify-center -mt-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="flex flex-col items-center text-center space-y-8 w-full max-w-sm"
                        >
                            {/* Image Container with Floating Effect */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="relative w-full aspect-square"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-tr ${currentStep.color} opacity-10 rounded-full blur-2xl transform scale-90`} />
                                <img
                                    src={currentStep.image}
                                    alt={currentStep.title}
                                    className="relative w-full h-full object-contain drop-shadow-xl"
                                />
                            </motion.div>

                            {/* Text Content */}
                            <div className="space-y-4 px-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm mb-2"
                                >
                                    <Icon className={`w-8 h-8 bg-gradient-to-br ${currentStep.color} bg-clip-text text-transparent`} />
                                    {/* Note: bg-clip-text doesn't apply to Icon components directly easily without wrapper, simplified approach below */}
                                    <Icon className={`absolute w-8 h-8 text-black dark:text-white opacity-0`} />
                                    {/* Re-rendering icon for correct coloring logic */}
                                    <div className={`absolute w-8 h-8 bg-gradient-to-br ${currentStep.color} opacity-20 rounded-lg blur-sm`} />
                                </motion.div>

                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    <span className={`bg-gradient-to-br ${currentStep.color} bg-clip-text text-transparent`}>
                                        {currentStep.title}
                                    </span>
                                </h1>

                                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                    {currentStep.description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom Action Button */}
                <div className="w-full max-w-sm pt-8 z-10">
                    <Button
                        onClick={handleNext}
                        className={`w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-black/5 
              bg-gradient-to-r ${currentStep.color} text-white 
              hover:opacity-90 transition-all duration-300 transform active:scale-[0.98]`}
                    >
                        <span className="flex items-center gap-2">
                            {step < onboardingSteps.length - 1 ? t('welcome.next') : t('welcome.getStarted')}
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Welcome;
