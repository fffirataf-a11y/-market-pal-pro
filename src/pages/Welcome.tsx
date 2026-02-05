import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, Users, Check, Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from "framer-motion"; // Bringing back for lightweight entry anims
import welcomeHero from "@/assets/welcome-hero.png";
import onboarding1 from "@/assets/onboarding-1.png";
import onboarding2 from "@/assets/onboarding-2.png";
import onboarding3 from "@/assets/onboarding-3.png";

const Welcome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onboardingSteps = [
        {
            image: welcomeHero,
            title: t('welcome.step1.title'),
            description: t('welcome.step1.description'),
            icon: ShoppingBag,
            color: "from-blue-500 to-indigo-600",
            bgGradient: "from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20",
            iconColor: "text-blue-600"
        },
        {
            image: onboarding1, // New Flat Style Image
            title: t('welcome.step2.title'),
            description: t('welcome.step2.description'),
            icon: Check,
            color: "from-emerald-500 to-teal-600",
            bgGradient: "from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20",
            iconColor: "text-emerald-600"
        },
        {
            image: onboarding2,
            title: t('welcome.step3.title'),
            description: t('welcome.step3.description'),
            icon: Users,
            color: "from-orange-500 to-amber-600",
            bgGradient: "from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20",
            iconColor: "text-orange-600"
        },
        {
            image: onboarding3,
            title: t('welcome.step4.title'),
            description: t('welcome.step4.description'),
            icon: Sparkles,
            color: "from-violet-500 to-purple-600",
            bgGradient: "from-violet-50/80 to-purple-50/80 dark:from-violet-950/20 dark:to-purple-950/20",
            iconColor: "text-purple-600"
        }
    ];

    const currentStep = onboardingSteps[selectedIndex];

    const onSelect = useCallback(async () => {
        if (!emblaApi) return;
        const index = emblaApi.selectedScrollSnap();
        setSelectedIndex(index);

        // Haptic Feedback for "Real App" feel
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Fallback or ignore on web
        }
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        // Force re-layout in case of asset loading issues
        emblaApi.reInit();
    }, [emblaApi, onSelect]);

    const handleNext = async () => {
        // Haptic on button press
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }

        if (!emblaApi) return;
        if (emblaApi.canScrollNext()) {
            emblaApi.scrollNext();
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

    const scrollTo = (index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    };

    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 bg-gradient-to-br ${currentStep.bgGradient}`}>

            {/* Static Background Decor - Replaces Motion Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${currentStep.color} transition-all duration-700`} />
                <div className={`absolute -bottom-32 -left-20 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr ${currentStep.color} transition-all duration-700`} />
            </div>

            <main className="relative flex-1 flex flex-col items-center justify-between px-6 pt-12 pb-8 min-h-screen h-full">

                {/* Top Section: Indicators & Skip */}
                <div className="w-full flex justify-between items-center z-10 transition-all duration-300">
                    <div className="flex gap-1.5">
                        {onboardingSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                                    ? `w-8 ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-emerald-600' : index === 2 ? 'bg-orange-600' : 'bg-purple-600'}`
                                    : "w-2 bg-gray-300/50" // Neutral inactive color
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleSkip}
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground hover:bg-black/5"
                    >
                        {t('welcome.skip')}
                    </Button>
                </div>

                {/* Carousel Area */}
                <div className="flex-1 w-full overflow-hidden flex items-center justify-center -mt-10" ref={emblaRef}>
                    <div className="flex w-full">
                        {onboardingSteps.map((stepItem, index) => (
                            <div className="flex-[0_0_100%] min-w-0 pl-4 pr-4 flex flex-col items-center text-center space-y-8" key={index}>
                                {/* Animated Content Wrapper */}
                                <AnimatePresence mode="wait">
                                    {/* Only animate if this is the active slide to capture attention */}
                                    {index === selectedIndex && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="w-full flex flex-col items-center"
                                        >

                                            {/* Image */}
                                            <div className="relative w-full aspect-square max-w-[320px] mx-auto">
                                                <div className={`absolute inset-0 bg-gradient-to-tr ${stepItem.color} opacity-10 rounded-full blur-2xl transform scale-90`} />
                                                <img
                                                    src={stepItem.image}
                                                    alt={stepItem.title}
                                                    className="relative w-full h-full object-contain drop-shadow-md select-none"
                                                    draggable="false"
                                                    loading={index === 0 ? "eager" : "lazy"}
                                                />
                                            </div>

                                            {/* Text Content */}
                                            <div className="space-y-4 px-2 max-w-sm mx-auto mt-8">
                                                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm mb-2">
                                                    <stepItem.icon className={`w-8 h-8 ${stepItem.iconColor}`} />
                                                </div>

                                                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                                                    {stepItem.title}
                                                </h1>

                                                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                                    {stepItem.description}
                                                </p>
                                            </div>

                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Action Button */}
                <div className="w-full max-w-sm pt-8 z-10">
                    <Button
                        onClick={handleNext}
                        className={`w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-black/5 
              bg-gradient-to-r ${currentStep.color} text-white 
              hover:opacity-90 hover:scale-[1.02] transition-all duration-300 transform active:scale-[0.98]
              animate-in fade-in zoom-in duration-300`}
                    >
                        <span className="flex items-center gap-2">
                            {selectedIndex < onboardingSteps.length - 1 ? t('welcome.next') : t('welcome.getStarted')}
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Welcome;
