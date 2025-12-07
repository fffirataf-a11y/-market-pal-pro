import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ScanBarcode,
  Camera,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Plus,
  Keyboard,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useSubscription } from "@/hooks/useSubscription";
import { useShoppingLists } from "@/hooks/useShoppingLists";

const Scanner = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { canPerformAction, incrementAction } = useSubscription();
  const { lists, addItem } = useShoppingLists();

  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [activeTab, setActiveTab] = useState("camera");

  const analyzeProductWithAI = async (productName: string, barcode: string, brandInfo?: string) => {
    console.log("🔍 Starting AI analysis for:", productName, barcode);

    try {
      const isTurkish = i18n.language === 'tr';
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      console.log("🔑 API Key exists:", !!apiKey);

      if (!apiKey) {
        throw new Error('API key not found');
      }

      // ✅ DÜZELTME: Daha kesin ve açık prompt
      const prompt = isTurkish
        ? `🔍 ÜRÜN ANALİZİ - TÜRKÇE

BARKOD: ${barcode}
ÜRÜN ADI: ${productName}
${brandInfo ? `MARKA: ${brandInfo}` : ''}

📋 TALİMATLAR:
1. SADECE bu barkoda ait ürünü analiz et.
2. Obyektif ve gerçekçi ol. Markayı kötülemeden sadece besin/içerik gerçeklerine odaklan.
3. Eğer "${productName}" "Bilinmeyen Ürün" içeriyorsa, "Ürün bilgisi bulunamadı" yaz.
4. TAM 5 İNSİGHT VER (sırayla):
 a) 1 öne çıkan olumlu özellik (positive)
 b) 1 başka faydalı özellik (positive)  
 c) 1 önemli not veya besin uyarısı (örn: şeker/tuz oranı veya "Dengeli tüketiniz") (warning/neutral)
 d) 1 genel kullanım bilgisi (neutral)
 e) 1 alerjen veya saklama bilgisi (neutral)
5. Her insight KISA ve ÖZ olmalı (maksimum 2 cümle).

JSON FORMATINDA YANIT VER (markdown YOK):

{
"name": "Tam ürün adı",
"category": "Kategori",
"brand": "Marka veya Bilinmiyor",
"insights": [
  {"type": "positive", "text": "✓ Olumlu: [Özellik] (Kısa ve net ol)"},
  {"type": "positive", "text": "✓ Fayda: [Özellik] (Kısa ve net ol)"},
  {"type": "warning", "text": "⚠️ Not: [Besin değeri/Uyarı] (Obyektif dille yaz)"},
  {"type": "neutral", "text": "ℹ️ Bilgi: [Kullanım/İçerik]"},
  {"type": "neutral", "text": "ℹ️ Ekstra: [Saklama/Alerjen]"}
]
}

Kategori Listesi: Fruits, Vegetables, Dairy, Bakery, Meat, Seafood, Beverages, Snacks, Cleaning, Personal Care, Baby Care, Pet Care, Household, Frozen, Canned, Grains, Condiments, Other

✅ TÜRKÇE, KISA, TARAFSIZ VE PROFESYONEL!`
        : `🔍 PRODUCT ANALYSIS - ENGLISH

BARCODE: ${barcode}
PRODUCT NAME: ${productName}
${brandInfo ? `BRAND: ${brandInfo}` : ''}

📋 INSTRUCTIONS:
1. Analyze ONLY this barcode product.
2. Be objective and factual. Focus on nutritional facts, do NOT criticize the brand subjectively.
3. If "${productName}" contains "Bilinmeyen Ürün", write "Product info not found".
4. PROVIDE EXACTLY 5 INSIGHTS (in order):
 a) 1 highlight positive feature (positive)
 b) 1 another useful feature (positive)
 c) 1 important note or nutritional caution (e.g. sugar/salt level or "Consume moderately") (warning/neutral)
 d) 1 general usage info (neutral)
 e) 1 allergen or storage info (neutral)
5. Each insight SHORT and CONCISE (max 2 sentences).

RETURN JSON FORMAT (NO markdown):

{
"name": "Full product name",
"category": "Category",
"brand": "Brand or Unknown",
"insights": [
  {"type": "positive", "text": "✓ Positive: [Feature] (Short & clear)"},
  {"type": "positive", "text": "✓ Benefit: [Feature] (Short & clear)"},
  {"type": "warning", "text": "⚠️ Note: [Nutritional Fact/Caution] (Objective tone)"},
  {"type": "neutral", "text": "ℹ️ Info: [Usage/Content]"},
  {"type": "neutral", "text": "ℹ️ Extra: [Storage/Allergy]"}
]
}

Category List: Fruits, Vegetables, Dairy, Bakery, Meat, Seafood, Beverages, Snacks, Cleaning, Personal Care, Baby Care, Pet Care, Household, Frozen, Canned, Grains, Condiments, Other

✅ ENGLISH, SHORT, OBJECTIVE & PROFESSIONAL!`;

      console.log("📤 Sending request to Gemini API...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.1, // ✅ Daha da düşürdüm (0.1) ki yorum katmasın, sadece bilgi versin
              maxOutputTokens: 1000,
            }
          })
        }
      );

      console.log("📥 API Response status:", response.status);

      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait and try again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 API Response data:", data);

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      let analysisText = data.candidates[0].content.parts[0].text.trim();
      console.log("📝 Raw AI text:", analysisText.substring(0, 200) + "...");

      // ✅ DÜZELTME: Markdown/kod bloklarını temizle
      analysisText = analysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/`/g, '')
        .trim();

      // ✅ DÜZELTME: JSON'u bul ve çıkar
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("❌ No JSON found in:", analysisText);
        throw new Error('No valid JSON in AI response');
      }

      analysisText = jsonMatch[0];

      // ✅ DÜZELTME: JSON parse
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
        console.log("✅ Parsed analysis:", analysis);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('📄 Attempted to parse:', analysisText.substring(0, 300));
        throw new Error('Invalid JSON format from AI');
      }

      return {
        ...analysis,
        barcode: barcode,
      };
    } catch (error) {
      console.error('❌ AI Analysis Error:', error);
      throw error;
    }
  };

  const lookupAndAnalyzeProduct = async (barcode: string) => {
    console.log("🔎 Looking up barcode:", barcode);

    if (!canPerformAction()) {
      toast({
        title: t('common.error'),
        description: "Daily limit reached. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ ADIM 1: Open Food Facts'ten ürün bilgisi al
      console.log("📡 Fetching from Open Food Facts...");
      const foodResponse = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const foodData = await foodResponse.json();
      console.log("📦 Open Food Facts response:", foodData);

      let productName = "";
      let brandInfo = "";

      if (foodData.status === 1 && foodData.product) {
        // ✅ Ürün bulundu
        const product = foodData.product;

        // Ürün adını bul (Türkçe öncelikli)
        productName = product.product_name_tr ||
          product.product_name ||
          product.generic_name ||
          product.product_name_en ||
          "";

        // Marka bilgisi
        brandInfo = product.brands || "";

        console.log("✅ Product found:", {
          name: productName,
          brand: brandInfo,
          categories: product.categories
        });
      } else {
        // ❌ Ürün bulunamadı
        console.log("⚠️ Product NOT found in Open Food Facts");
        productName = `Bilinmeyen Ürün (Barkod: ${barcode})`;
      }

      // ✅ ADIM 2: AI ile analiz
      console.log("🤖 Starting AI analysis...");
      const analysis = await analyzeProductWithAI(productName, barcode, brandInfo);

      if (analysis) {
        setScannedProduct(analysis);
        incrementAction();

        // Ses efekti
        try {
          const audio = new Audio('/sounds/success.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => { });
        } catch { }

        toast({
          title: t('common.success'),
          description: isTurkish ? "Ürün başarıyla analiz edildi" : "Product analyzed successfully",
          duration: 4500, // 4,5 saniye sonra otomatik kapanır
        });
      }
    } catch (error: any) {
      console.error('❌ Product lookup error:', error);

      let errorMessage = "Failed to analyze product";

      if (error.message.includes('rate limit')) {
        errorMessage = "Too many requests. Please wait and try again.";
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = "Could not analyze product. Please try again.";
      } else if (error.message.includes('API key')) {
        errorMessage = "Configuration error. Please contact support.";
      }

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    console.log("📷 Camera detected barcode:", barcode);
    setScanning(false);
    await lookupAndAnalyzeProduct(barcode);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("⌨️ Manual barcode submitted:", manualBarcode);

    if (!manualBarcode.trim()) {
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr'
          ? "Lütfen bir barkod numarası girin"
          : "Please enter a barcode number",
        variant: "destructive",
      });
      return;
    }

    await lookupAndAnalyzeProduct(manualBarcode.trim());
    setManualBarcode("");
  };

  const handleAddToList = async () => {
    if (!scannedProduct) return;

    // ✅ İlk listeyi al (veya oluştur)
    let targetList = lists.length > 0 ? lists[0] : null;

    if (!targetList) {
      console.log('❌ No list found');
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr'
          ? "Liste bulunamadı. Lütfen önce bir liste oluşturun."
          : "No shopping list found. Please create one first.",
        variant: "destructive",
      });
      return;
    }

    console.log('📦 Target list:', targetList.name);

    // ✅ Firestore'a ekle
    try {
      await addItem(targetList.id, {
        name: scannedProduct.name,
        quantity: "1",
        category: scannedProduct.category || "Other",
        completed: false,
      });

      console.log('✅ Item added to Firestore');

      toast({
        title: t('common.success'),
        description: `${scannedProduct.name} ${t('lists.addedByYou')}`,
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/lists");
      }, 1500);

    } catch (error) {
      console.error('❌ Error adding item:', error);
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr'
          ? "Ürün listeye eklenirken bir hata oluştu"
          : "Failed to add item to list",
        variant: "destructive",
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const isTurkish = i18n.language === 'tr';

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <h1 className="text-2xl font-bold">{t('scanner.title')}</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6 space-y-6">
        {!scannedProduct ? (
          <div className="space-y-6">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center">
                    <ScanBarcode className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{t('scanner.scanProduct')}</h2>
                  <p className="text-muted-foreground">
                    {t('scanner.subtitle')}
                  </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="camera">
                      <Camera className="mr-2 h-4 w-4" />
                      {t('scanner.scanWithCamera')}
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <Keyboard className="mr-2 h-4 w-4" />
                      {t('scanner.enterManually')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="camera">
                    {scanning ? (
                      <div className="space-y-4">
                        <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
                        <Button
                          variant="outline"
                          onClick={() => setScanning(false)}
                          className="w-full"
                        >
                          {t('scanner.stopScanning')}
                        </Button>
                      </div>
                    ) : loading ? (
                      <div className="py-12">
                        <div className="relative w-64 h-64 mx-auto">
                          {/* Tarama çerçevesi animasyonu */}
                          <div className="absolute inset-0 rounded-2xl border-4 border-primary/30 animate-scan-pulse" />
                          <div className="absolute inset-2 rounded-xl border-2 border-primary/50 animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="absolute inset-4 rounded-lg border border-primary/70 animate-pulse" style={{ animationDelay: '0.4s' }} />

                          {/* Tarama çizgisi animasyonu */}
                          <div className="absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-primary/80 to-transparent animate-scan-line shadow-lg shadow-primary/50" />

                          {/* Merkez ikon */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="relative">
                              <Loader2 className="w-16 h-16 text-primary animate-spin" />
                              <ScanBarcode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-foreground" />
                            </div>
                          </div>

                          {/* Nokta animasyonları */}
                          <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                          <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                          <div className="absolute bottom-4 left-4 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                          <div className="absolute bottom-4 right-4 w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
                        </div>

                        <div className="mt-6 space-y-2">
                          <p className="text-base font-semibold text-center animate-pulse">
                            {isTurkish ? "Ürün analiz ediliyor..." : "Analyzing product..."}
                          </p>
                          <p className="text-sm text-muted-foreground text-center">
                            {isTurkish ? "Lütfen bekleyin, bu birkaç saniye sürebilir" : "Please wait, this may take a few seconds"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold"
                        onClick={() => setScanning(true)}
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        {t('scanner.startScanning')}
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="manual">
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="barcode">
                          {t('scanner.barcodeNumber')}
                        </Label>
                        <Input
                          id="barcode"
                          type="text"
                          placeholder={t('scanner.barcodePlaceholder')}
                          value={manualBarcode}
                          onChange={(e) => setManualBarcode(e.target.value)}
                          className="h-12 text-base"
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-base font-semibold"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {isTurkish ? "Analiz ediliyor..." : "Analyzing..."}
                          </>
                        ) : (
                          <>
                            <ScanBarcode className="mr-2 h-5 w-5" />
                            {t('scanner.searchProduct')}
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">{t('scanner.howItWorks')}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>{t('scanner.feature1')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>{t('scanner.feature2')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>{t('scanner.feature3')}</span>
                </li>
              </ul>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h2 className="text-2xl font-bold">
                      {scannedProduct.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {scannedProduct.brand}
                    </p>
                    <Badge variant="secondary">{scannedProduct.category}</Badge>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('scanner.barcode')}: {scannedProduct.barcode}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">{t('scanner.healthInsights')}</h3>
              <div className="space-y-4">
                {scannedProduct.insights?.map(
                  (insight: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      {getInsightIcon(insight.type)}
                      <p className="text-sm flex-1">{insight.text}</p>
                    </div>
                  )
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                className="w-full h-12 font-semibold"
                size="lg"
                onClick={handleAddToList}
              >
                <Plus className="mr-2 h-5 w-5" />
                {t('scanner.addToList')}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                size="lg"
                onClick={() => {
                  setScannedProduct(null);
                  setActiveTab("camera");
                }}
              >
                <ScanBarcode className="mr-2 h-5 w-5" />
                {t('scanner.scanAnother')}
              </Button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Scanner;