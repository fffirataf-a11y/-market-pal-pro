import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav"; // ✅ EKLE
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import {
  ChefHat,
  ArrowLeft,
  Sparkles,
  Plus,
  Utensils,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useInterstitialAd } from '@/hooks/useInterstitialAd'; // ✅ YENİ EKLENEN
import { detectCategory } from "@/lib/categoryDetector";
import { LimitReachedDialog } from "@/components/LimitReachedDialog";

import { Capacitor } from "@capacitor/core";

interface RecipeIngredient {
  name: string;
  quantity: string;
}



const AIChef = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { lists, addItem } = useShoppingLists();

  const { canPerformAction, incrementAction, plan, getRemainingActions } = useSubscription();

  // ✅ YENİ EKLENEN - Interstitial Reklam Hook'u
  const { showAd } = useInterstitialAd({
    plan,
    interval: 5 // Her 5 AI isteğinde bir reklam
  });

  const [activeTab, setActiveTab] = useState("recipe");
  const [dishName, setDishName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  const remainingUses = getRemainingActions();

  const handleAddToList = async () => {
    if (!generatedRecipe?.ingredients) {
      console.log('❌ No ingredients found');
      return;
    }

    console.log('🔍 Generated Recipe:', generatedRecipe);
    console.log('📋 Ingredients:', generatedRecipe.ingredients);

    // ✅ İlk listeyi al (veya oluştur)
    const targetList = lists.length > 0 ? lists[0] : null;

    if (!targetList) {
      console.log('❌ No list found');
      toast({
        title: t('common.error'),
        description: "No shopping list found. Please create one first.",
        variant: "destructive",
      });
      return;
    }

    console.log('📦 Target list:', targetList.name);

    // Limit kontrolü için local değişken
    let remaining = plan === 'pro' ? 9999 : Math.max(0, remainingUses);

    // ✅ Her malzemeyi Firestore'a ekle
    try {
      for (const ingredient of generatedRecipe.ingredients) {
        // Limit Kontrolü
        if (remaining <= 0 && plan !== 'pro') {
          console.log('⛔ Limit reached during bulk add');
          setLimitDialogOpen(true);
          break; // Döngüyü kır
        }

        await addItem(targetList.id, {
          name: ingredient.name || ingredient,
          quantity: ingredient.quantity || "1 adet",
          category: detectCategory(ingredient.name || ingredient.toString()),
          completed: false,
        }, { silent: true }); // ✅ Sessiz mod
        await incrementAction();
        remaining--; // Local sayacı düş
      }

      console.log('✅ All items added to Firestore');

      toast({
        title: t('common.success'),
        description: t('aichef.allAddedSuccess'),
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/lists");
      }, 1500);

    } catch (error) {
      console.error('❌ Error adding items:', error);
      toast({
        title: t('common.error'),
        description: "Failed to add items to list",
        variant: "destructive",
      });
    }
  };

  // ✅ FIREBASE FUNCTIONS PROXY (Moved to top)

  const handleGenerateRecipe = async () => {
    if (!dishName.trim()) return;

    if (!canPerformAction()) {
      setLimitDialogOpen(true);
      return;
    }

    setLoading(true);
    setGeneratedRecipe(null);

    try {
      const isTurkish = i18n.language === 'tr';

      const prompt = isTurkish
        ? `"${dishName}" için kısa tarif oluştur. Sadece JSON döndür (başka hiçbir şey yazma):
{"name":" yemek adı","servings":4,"time":"X dk","difficulty":"Kolay","ingredients":[{"name":"malzeme","quantity":"miktar"}]}

ÖNEMLI: Tüm metinler TÜRKÇE olmalı!`
        : `Create a short recipe for "${dishName}". Return ONLY this JSON (nothing else):
{"name":"dish name","servings":4,"time":"X mins","difficulty":"Easy","ingredients":[{"name":"ingredient","quantity":"amount"}]}

IMPORTANT: All text must be in ENGLISH!`;

      // 🔒 SECURE BACKEND CALL
      const generateAIContent = httpsCallable(functions, 'generateAIContent');
      const result = await generateAIContent({ prompt });
      const data = result.data as any;

      // 🛡️ Client-Side Error Mapping (No Throws!)
      if (!data.success) {
        console.warn(`⚠️ Backend Error: ${data.errorCode} - ${data.message}`);

        let userMessage = t('aichef.errorGeneric');
        if (data.errorCode === 'RATE_LIMIT' || data.errorCode === 'QUOTA') {
          userMessage = t('aichef.errorBusy');
        } else if (data.errorCode === 'AUTH') {
          userMessage = t('common.loginRequired');
        } else if (data.errorCode === 'MODEL_NOT_FOUND') {
          userMessage = "System update in progress. Please try again later.";
        }

        toast({
          title: t('common.error'),
          description: userMessage,
          variant: "destructive",
          duration: 4000
        });

        setLoading(false);
        return; // ✅ Exit gracefully
      }

      const candidate = data.data;

      // Extract text safely
      let recipeText = '';
      if (candidate.content?.parts?.[0]?.text) {
        recipeText = candidate.content.parts[0].text;
      } else if (candidate.text) {
        recipeText = candidate.text;
      } else {
        // Only throw here if schema is violated (unexpected success but no data)
        // But even better, handle it gracefully
        console.error("⚠️ Invalid payload from successful response");
        toast({ title: t('common.error'), description: t('aichef.errorInvalid'), variant: "destructive" });
        setLoading(false);
        return;
      }

      recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeText = jsonMatch[0];
      }

      try {
        const recipe = JSON.parse(recipeText);
        setGeneratedRecipe(recipe);

        incrementAction();
        showAd();

        try {
          const audio = new Audio('/sounds/success.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => { });
        } catch { }

        toast({
          title: t('common.success'),
          description: t('aichef.recipeGenerated'),
        });
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        toast({
          title: t('common.error'),
          description: t('aichef.errorParse'),
          variant: "destructive"
        });
      }

    } catch (error: any) {
      // Catch-all for network failure (Connection lost etc)
      console.error('❌ Network/Client Error:', error);
      toast({
        title: t('common.error'),
        description: t('common.networkError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!ingredients.trim()) return;

    if (!canPerformAction()) {
      setLimitDialogOpen(true);
      return;
    }

    setLoading(true);
    setGeneratedRecipe(null);

    try {
      const isTurkish = i18n.language === 'tr';

      const prompt = isTurkish
        ? `"${ingredients}" ile tarif yap. Sadece JSON döndür:
{"name":"yemek","servings":2,"time":"X dk","difficulty":"Kolay","ingredients":[{"name":"x","quantity":"y"}],"suggestions":["Yemek 1","Yemek 2","Yemek 3"]}

ÖNEMLI: Tüm metinler TÜRKÇE olmalı!`
        : `Recipe with: "${ingredients}". Return ONLY JSON:
{"name":"dish","servings":2,"time":"X mins","difficulty":"Easy","ingredients":[{"name":"x","quantity":"y"}],"suggestions":["Dish 1","Dish 2","Dish 3"]}

IMPORTANT: All text must be in ENGLISH!`;

      // 🔒 SECURE BACKEND CALL
      const generateAIContent = httpsCallable(functions, 'generateAIContent');
      const result = await generateAIContent({ prompt });
      const data = result.data as any;

      if (!data.success || !data.data) {
        throw new Error("Invalid response from chef");
      }

      const candidate = data.data;

      let recipeText = '';

      if (candidate.content?.parts?.[0]?.text) {
        recipeText = candidate.content.parts[0].text;
      } else if (candidate.text) {
        recipeText = candidate.text;
      } else {
        throw new Error('No text in response');
      }

      recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeText = jsonMatch[0];
      }

      const recipe = JSON.parse(recipeText);
      setGeneratedRecipe(recipe);

      incrementAction();
      showAd();

      try {
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
      } catch { }

      toast({
        title: t('common.success'),
        description: t('aichef.ideasGenerated'),
      });
    } catch (error: any) {
      console.error('AI Proxy Error:', error);

      // UX: Graceful Fallback
      let userMessage = error.message || "Failed to generate ideas";
      // Handle Firebase Functions error codes if needed, though mostly they map to message.
      const isTurkish = i18n.language === 'tr'; // accessing i18n from closure
      if (error.code === 'resource-exhausted' || error.message.includes('busy')) {
        userMessage = isTurkish
          ? "Şefimiz şu an çok yoğun. Lütfen 1 dakika sonra tekrar deneyin."
          : "Our chef is very busy right now. Please try again in a minute.";
      }

      toast({
        title: t('common.error'),
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b safe-top">
        <div className="container max-w-4xl px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => navigate("/lists")} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold truncate">{t('aichef.title')}</h1>
            </div>
            {plan !== 'pro' && (
              <Badge variant="secondary" className="shrink-0 text-sm">
                {remainingUses === -1 ? '∞' : remainingUses} {t('subscription.remaining')}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-3 pb-20 space-y-3 sm:space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger value="recipe" className="text-xs sm:text-sm px-2 sm:px-4 truncate">
              {t('aichef.recipeGenerator')}
            </TabsTrigger>
            <TabsTrigger value="ideas" className="text-xs sm:text-sm px-2 sm:px-4 truncate">
              {t('aichef.cookingIdeas')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipe" className="space-y-4 sm:space-y-5 mt-4">
            <Card className="p-4 sm:p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">{t('aichef.recipeGenerator')}</h2>
                  <p className="text-sm text-muted-foreground">{t('aichef.recipeSubtitle')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('aichef.dishPlaceholder')}
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateRecipe()}
                    className="pl-10 h-10 sm:h-11"
                  />
                </div>

                <Button
                  className="w-full h-10 sm:h-11 font-semibold"
                  onClick={handleGenerateRecipe}
                  disabled={loading || !dishName.trim()}
                >
                  {loading ? t('aichef.generating') : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t('aichef.generateRecipe')}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {loading && (
              <Card className="p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 animate-bounce">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-20 blur-xl"></div>
                    </div>
                    <div className="relative animate-pulse">
                      <ChefHat className="w-32 h-32 text-primary" />
                    </div>
                  </div>

                  <div className="text-center space-y-1.5">
                    <h3 className="text-xl font-semibold">{t('aichef.preparingRecipe')}</h3>
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {dishName ? `Cooking up ${dishName}...` : t('aichef.gettingReady')}
                  </p>
                </div>
              </Card>
            )}

            {generatedRecipe && activeTab === "recipe" && !loading && (
              <Card className="p-4 sm:p-5">
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{generatedRecipe.name}</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <Badge variant="secondary">{generatedRecipe.servings} {t('aichef.servings')}</Badge>
                      <Badge variant="secondary">{generatedRecipe.time}</Badge>
                      <Badge variant="secondary">{generatedRecipe.difficulty}</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm sm:text-base mb-2">{t('aichef.ingredients')}</h4>
                    <div className="space-y-1.5 sm:space-y-2">
                      {generatedRecipe.ingredients.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border bg-muted/30">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full h-10 sm:h-11 font-semibold" onClick={handleAddToList}>
                    <Plus className="mr-2 h-5 w-5" />
                    {t('aichef.addAllToList')}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ideas" className="space-y-4 sm:space-y-5 mt-4">
            <Card className="p-4 sm:p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">{t('aichef.cookingIdeas')}</h2>
                  <p className="text-sm text-muted-foreground">{t('aichef.ideasSubtitle')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder={t('aichef.ingredientsPlaceholder')}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                  className="h-10 sm:h-11"
                />

                <Button
                  className="w-full h-10 sm:h-11 font-semibold"
                  onClick={handleGenerateIdeas}
                  disabled={loading || !ingredients.trim()}
                >
                  {loading ? t('aichef.generating') : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t('aichef.getCookingIdeas')}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {loading && (
              <Card className="p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 animate-bounce">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-20 blur-xl"></div>
                    </div>
                    <div className="relative animate-pulse">
                      <ChefHat className="w-32 h-32 text-primary" />
                    </div>
                  </div>

                  <div className="text-center space-y-1.5">
                    <h3 className="text-xl font-semibold">{t('aichef.findingIdeas')}</h3>
                    <div className="flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {ingredients ? `Exploring with ${ingredients}...` : t('aichef.gettingReady')}
                  </p>
                </div>
              </Card>
            )}

            {generatedRecipe && activeTab === "ideas" && !loading && (
              <>
                {generatedRecipe.suggestions && (
                  <Card className="p-4 sm:p-5">
                    <h3 className="font-semibold text-base sm:text-lg mb-3">{t('aichef.recipeSuggestions')}</h3>
                    <div className="grid gap-2 sm:gap-3">
                      {generatedRecipe.suggestions.map((suggestion: string, index: number) => (
                        <button key={index} className="p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left">
                          <div className="flex items-center gap-3">
                            <Utensils className="h-5 w-5 text-primary" />
                            <span className="font-medium">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-4 sm:p-5">
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{generatedRecipe.name}</h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <Badge variant="secondary">{generatedRecipe.servings} {t('aichef.servings')}</Badge>
                        <Badge variant="secondary">{generatedRecipe.time}</Badge>
                        <Badge variant="secondary">{generatedRecipe.difficulty}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-2">{t('aichef.ingredients')}</h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {generatedRecipe.ingredients.map((item: RecipeIngredient, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border bg-muted/30">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-muted-foreground">{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full h-10 sm:h-11 font-semibold" onClick={handleAddToList}>
                      <Plus className="mr-2 h-5 w-5" />
                      {t('aichef.addAllItems')}
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <LimitReachedDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        feature="AI Chef Recipes"
        currentPlan={plan}
      />
      <BottomNav />  {/* ✅ EKLE */}
    </div>
  );
};

export default AIChef;