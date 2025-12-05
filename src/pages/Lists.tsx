import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Users,
  ChefHat,
  Check,
  Trash2,
  Share2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import ShareList from "@/components/ShareList";
import RewardedAdSlot from "@/components/ads/RewardedAdSlot";
import { ADS_ENABLED } from "@/config/featureFlags";
import { maybeAutoplayOnStart } from "@/lib/adManager";
import { useSubscription } from "@/hooks/useSubscription";
import { LimitReachedDialog } from "@/components/LimitReachedDialog";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import i18n from "@/i18n";
import { AddFriendDialog } from "@/components/friends/AddFriendDialog";
import { FriendRequests } from "@/components/friends/FriendRequests";

const Lists = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { canPerformAction, incrementAction, plan, rewardAdWatched } = useSubscription();

  // ✅ Firestore hook
  const {
    lists,
    loading: listsLoading,
    createList,
    addItem,
    updateItem,
    deleteAllItems,
    deleteItem: deleteItemFromList,
  } = useShoppingLists();

  // ✅ State'leri explicit initialize et
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("my-lists");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState<boolean>(false);
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "Fruits",
  });

  // ✅ İlk liste oluştur (eğer yoksa) - Sadece 1 kez çalışsın
  useEffect(() => {
    const createInitialList = async () => {
      if (!listsLoading && lists.length === 0) {
        console.log('Creating initial list...');
        await createList(t('lists.weeklyGroceries'));
      }
    };

    // ✅ Timeout ile çalıştır (loading bitince)
    const timer = setTimeout(createInitialList, 500);
    return () => clearTimeout(timer);
  }, [listsLoading, lists.length, t]);

  // If ads are enabled later, auto-play once on app start for free users
  useEffect(() => {
    if (!ADS_ENABLED) return;
    maybeAutoplayOnStart(plan, "autoplay_lists");
  }, [plan]);

  // ✅ İlk listeyi seç
  const selectedList = lists.length > 0 ? lists[0] : null;
  const items = selectedList?.items || [];

  // 🔍 DEBUG: Items'ı logla
  useEffect(() => {
    console.log('📦 Current items in UI:', items.length);
    console.log('📋 Items:', items.map(i => ({ id: i.id, name: i.name })));
  }, [items]);

  const detectCategory = (itemName: string): string => {
    const name = itemName.toLowerCase().trim();

    const categoryKeywords: Record<string, string[]> = {
      Cleaning: [
        "bleach", "detergent", "soap", "cleaner", "disinfectant", "wipes",
        "mop", "broom", "sponge", "scrub", "polish", "spray", "toilet cleaner",
        "floor cleaner", "glass cleaner", "dishwashing", "laundry",
        "çamaşır suyu", "deterjan", "sabun", "temizleyici", "dezenfektan",
        "mendil", "islak mendil", "paspas", "sünger", "ovma", "parlatıcı",
        "sprey", "tuvalet temizleyici", "yer temizleyici", "cam temizleyici",
        "bulaşık", "çamaşır", "yumuşatıcı", "kir sökücu"
      ],
      "Personal Care": [
        "shampoo", "conditioner", "toothpaste", "toothbrush", "deodorant",
        "perfume", "cologne", "razor", "shaving", "cream", "lotion",
        "tissue", "toilet paper", "soap", "body wash", "face wash",
        "makeup", "cosmetic", "skincare", "moisturizer",
        "şampuan", "saç kremi", "diş macunu", "diş fırçası", "deodorant",
        "parfüm", "kolonya", "tıraş", "krem", "losyon", "peçete",
        "tuvalet kağıdı", "duş jeli", "yüz yıkama", "makyaj", "kozmetik",
        "cilt bakım", "nemlendirici"
      ],
      "Baby Care": [
        "diaper", "baby food", "formula", "wipes", "baby oil", "powder",
        "pacifier", "bottle", "baby shampoo", "baby soap",
        "bebek bezi", "mama", "bebek maması", "ıslak mendil", "bebek yağı",
        "pudra", "emzik", "biberon", "bebek şampuanı", "bebek sabunu"
      ],
      "Pet Care": [
        "pet food", "dog food", "cat food", "litter", "pet toy",
        "kedi maması", "köpek maması", "kedi kumu", "mama", "oyuncak"
      ],
      Household: [
        "battery", "light bulb", "candle", "matches", "foil", "wrap",
        "bag", "trash bag", "ziplock", "container", "tape",
        "pil", "ampul", "mum", "kibrit", "folyo", "streç film",
        "poşet", "çöp torbası", "kilitli poşet", "saklama kabı", "bant"
      ],
      Frozen: [
        "frozen", "ice cream", "popsicle", "frozen pizza", "frozen vegetable",
        "dondurulmuş", "donmuş", "dondurma", "buz", "donmuş pizza", "donmuş sebze"
      ],
      Canned: [
        "canned", "jar", "pickle", "olive", "tomato paste", "tomato sauce",
        "konserve", "turşu", "zeytin", "salça", "domates salçası", "biber salçası",
        "reçel", "bal", "kavanoz"
      ],
      Grains: [
        "rice", "pasta", "noodle", "spaghetti", "macaroni", "flour", "bulgur",
        "couscous", "quinoa", "oats", "cereal", "bread", "wheat",
        "pirinç", "makarna", "erişte", "spagetti", "un", "bulgur",
        "kuskus", "kinoa", "yulaf", "tahıl", "gevrek", "buğday"
      ],
      Condiments: [
        "salt", "pepper", "spice", "sauce", "ketchup", "mayonnaise", "mustard",
        "vinegar", "oil", "olive oil", "soy sauce", "hot sauce",
        "tuz", "karabiber", "baharat", "sos", "ketçap", "mayonez", "hardal",
        "sirke", "yağ", "zeytinyağı", "soya sosu", "acı sos"
      ],
      Fruits: [
        "apple", "banana", "orange", "grape", "strawberry", "watermelon",
        "melon", "peach", "cherry", "pear", "plum", "avocado", "lemon",
        "lime", "kiwi", "mango", "pineapple", "apricot", "fig", "pomegranate",
        "tangerine", "grapefruit", "blueberry", "raspberry", "blackberry",
        "elma", "muz", "portakal", "üzüm", "çilek", "karpuz", "kavun",
        "şeftali", "kiraz", "armut", "erik", "avokado", "limon", "mandalina",
        "greyfurt", "kayısı", "incir", "nar", "meyve"
      ],
      Vegetables: [
        "tomato", "potato", "onion", "carrot", "pepper", "cucumber",
        "lettuce", "spinach", "broccoli", "cauliflower", "cabbage", "eggplant",
        "zucchini", "pumpkin", "garlic", "celery", "leek", "radish",
        "corn", "mushroom", "bean", "peas", "okra", "artichoke", "asparagus",
        "domates", "patates", "soğan", "havuç", "biber", "salatalık",
        "marul", "ıspanak", "brokoli", "karnabahar", "lahana", "patlıcan",
        "kabak", "balkabağı", "sarımsak", "kereviz", "pırasa", "turp",
        "mısır", "mantar", "fasulye", "bezelye", "bamya", "enginar", "sebze"
      ],
      Dairy: [
        "milk", "cheese", "yogurt", "butter", "cream", "kefir",
        "ice cream", "cottage cheese", "cheddar", "mozzarella", "feta",
        "süt", "peynir", "yoğurt", "tereyağı", "krema", "ayran",
        "dondurma", "lor", "kaşar", "beyaz peynir", "tulum"
      ],
      Bakery: [
        "bread", "baguette", "roll", "croissant", "cake", "pastry",
        "cookie", "muffin", "donut", "bagel", "biscuit", "cracker",
        "ekmek", "poğaça", "simit", "kruvasan", "kek", "pasta",
        "kurabiye", "börek", "açma", "francala", "somun"
      ],
      Meat: [
        "chicken", "beef", "meat", "pork", "lamb", "turkey",
        "sausage", "salami", "steak", "bacon", "ham", "meatball",
        "tavuk", "dana", "et", "kuzu", "hindi", "sosis",
        "sucuk", "pastırma", "köfte", "jambon", "kangal"
      ],
      Seafood: [
        "fish", "salmon", "tuna", "shrimp", "crab", "lobster",
        "mussel", "squid", "octopus", "anchovy", "sea bass", "trout",
        "balık", "som balığı", "ton balığı", "karides", "yengeç",
        "ıstakoz", "midye", "kalamar", "ahtapot", "hamsi", "levrek", "alabalık"
      ],
      Beverages: [
        "water", "juice", "soda", "tea", "coffee", "wine", "beer",
        "cola", "lemonade", "drink", "milk shake", "smoothie",
        "su", "meyve suyu", "kola", "çay", "kahve", "şarap", "bira",
        "limonata", "içecek", "gazoz", "şalgam", "ayran"
      ],
      Snacks: [
        "chips", "chocolate", "candy", "nuts", "popcorn",
        "cracker", "pretzel", "biscuit", "wafer", "bar",
        "cips", "çikolata", "şeker", "fındık", "ceviz", "badem",
        "patlamış mısır", "kraker", "bisküvi", "gofret"
      ]
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          return category;
        }
      }
    }
    return "Other";
  };

  const getCategoryEmoji = (itemName: string) => {
    const specificIcons: Record<string, string> = {
      // EKMEK & UNLU MAMÜLLER
      "ekmek": "🍞",
      "bread": "🍞",
      "simit": "🥨",
      "poğaça": "🥐",
      "börek": "🥟",

      // SÜT ÜRÜNLERİ
      "süt": "🥛",
      "milk": "🥛",
      "yoğurt": "🥛",
      "peynir": "🧀",
      "cheese": "🧀",
      "tereyağı": "🧈",
      "butter": "🧈",
      "ayran": "🥛",

      // MEYVELER
      "elma": "🍎",
      "apple": "🍎",
      "muz": "🍌",
      "banana": "🍌",
      "portakal": "🍊",
      "orange": "🍊",
      "üzüm": "🍇",
      "grape": "🍇",
      "çilek": "🍓",
      "strawberry": "🍓",
      "karpuz": "🍉",
      "watermelon": "🍉",
      "limon": "🍋",
      "lemon": "🍋",

      // SEBZELER
      "domates": "🍅",
      "tomato": "🍅",
      "patates": "🥔",
      "potato": "🥔",
      "soğan": "🧅",
      "onion": "🧅",
      "havuç": "🥕",
      "carrot": "🥕",
      "biber": "🌶️",
      "pepper": "🌶️",
      "salatalık": "🥒",
      "cucumber": "🥒",
      "marul": "🥬",
      "brokoli": "🥦",
      "sarımsak": "🧄",
      "mısır": "🌽",
      "mantar": "🍄",

      // ET & DENİZ ÜRÜNLERİ
      "tavuk": "🍗",
      "chicken": "🍗",
      "et": "🥩",
      "meat": "🥩",
      "balık": "🐟",
      "fish": "🐟",
      "sucuk": "🌭",
      "sosis": "🌭",

      // İÇECEKLER
      "su": "💧",
      "water": "💧",
      "kahve": "☕",
      "coffee": "☕",
      "çay": "🍵",
      "tea": "🍵",
      "kola": "🥤",
      "cola": "🥤",
      "meyve suyu": "🧃",
      "juice": "🧃",

      // TAHILLAR
      "pirinç": "🍚",
      "rice": "🍚",
      "makarna": "🍝",
      "pasta": "🍝",

      // ATIŞTIRMALIKLAR
      "çikolata": "🍫",
      "chocolate": "🍫",
      "bisküvi": "🍪",
      "kurabiye": "🍪",
      "cips": "🥔",
      "fındık": "🥜",
      "patlamış mısır": "🍿",

      // TATLILAR
      "kek": "🍰",
      "cake": "🍰",
      "dondurma": "🍦",
      "ice cream": "🍦",

      // TEMİZLİK & KİŞİSEL BAKIM
      "sabun": "🧼",
      "soap": "🧼",
      "şampuan": "🧴",
      "shampoo": "🧴",
      "deterjan": "🧴",
      "diş macunu": "🪥",
      "toothpaste": "🪥",
      "tuvalet kağıdı": "🧻",
      "toilet paper": "🧻",

      // YUMURTA
      "yumurta": "🥚",
      "egg": "🥚"
    };

    const normalizedName = itemName.toLowerCase().trim();
    const sortedKeys = Object.keys(specificIcons).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (normalizedName.includes(key)) {
        return specificIcons[key];
      }
    }
    return "🛒";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fruits: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      Vegetables: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Dairy: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Bakery: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      Meat: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      Seafood: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      Beverages: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      Snacks: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      Cleaning: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
      "Personal Care": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return colors[category] || colors.Other;
  };

  // ✅ Ürün tamamla/geri al
  const toggleItem = async (itemId: string) => {
    if (!selectedList) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    await updateItem(selectedList.id, itemId, {
      completed: !item.completed,
    });
  };

  // ✅ Ürün sil
  const deleteItem = async (itemId: string) => {
    if (!selectedList) return;
    await deleteItemFromList(selectedList.id, itemId);
  };

  // ✅ Tümünü sil
  const handleDeleteAllItems = async () => {
    if (!selectedList || items.length === 0 || isDeletingAll) return;

    const itemsToDelete = [...items];
    const totalCount = itemsToDelete.length;

    const confirmMessage = i18n.language === 'tr'
      ? `${totalCount} ürünü silmek istediğinize emin misiniz?`
      : `Are you sure you want to delete ${totalCount} items?`;

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) return;

    setIsDeletingAll(true);

    try {
      await deleteAllItems(selectedList.id);
      toast({
        title: t('common.success'),
        description: `${totalCount} ${i18n.language === 'tr' ? 'ürün silindi' : 'items deleted'}`,
        duration: 1500,
      });
    } catch (error) {
      console.error('❌ Error deleting items:', error);
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr' ? 'Silme işlemi başarısız' : 'Failed to delete items',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  // ✅ Ürün ekle
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) return;
    if (!selectedList) return;

    if (!canPerformAction()) {
      setLimitDialogOpen(true);
      setIsAddDialogOpen(false);
      return;
    }

    const detectedCategory = detectCategory(newItem.name);

    await addItem(selectedList.id, {
      name: newItem.name,
      quantity: newItem.quantity,
      category: detectedCategory,
      completed: false,
    });

    await incrementAction();
    setNewItem({ name: "", quantity: "", category: "Fruits" });
    setIsAddDialogOpen(false);

    toast({
      title: t('common.success'),
      description: t('lists.itemAdded'),
      duration: 1500,
    });
  };

  // Loading durumu
  if (listsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t('lists.title')}</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('lists.addItem')}
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('lists.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6">
        <Tabs defaultValue="my-lists" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-lists">{t('lists.myLists')}</TabsTrigger>
            <TabsTrigger value="shared">{t('lists.sharedLists')}</TabsTrigger>
          </TabsList>

          <TabsContent value="my-lists" className="space-y-4">
            {/* ✅ Rewarded Ad Slot - Listelerin üstünde gösterilir */}
            {ADS_ENABLED && plan === 'free' && (
              <div className="mb-4">
                <RewardedAdSlot onReward={rewardAdWatched} plan={plan} />
              </div>
            )}

            {items.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <ChefHat className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{t('lists.emptyList')}</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      {t('lists.emptyListDesc')}
                    </p>
                  </div>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('lists.addItem')}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 transition-colors ${item.completed ? "bg-muted/50" : "hover:bg-muted/50"
                      }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 rounded-full border ${item.completed
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground"
                          }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        {item.completed && <Check className="h-4 w-4" />}
                      </Button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                            {item.name}
                          </span>
                          <Badge variant="outline" className={getCategoryColor(item.category)}>
                            {getCategoryEmoji(item.name)} {item.category}
                          </Badge>
                        </div>
                        {item.quantity && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </Card>
            )}

            {/* ✅ TÜMÜNÜ SİL BUTONU */}
            {items.length > 0 && (
              <Button
                variant="destructive"
                className="w-full mt-3"
                onClick={handleDeleteAllItems}
                disabled={isDeletingAll}
              >
                {isDeletingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {i18n.language === 'tr' ? 'Siliniyor...' : 'Deleting...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {i18n.language === 'tr' ? 'Tümünü Sil' : 'Delete All'}
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="shared" className="space-y-4 mt-6">
            <FriendRequests />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('lists.sharedLists')}</h3>
              <AddFriendDialog />
            </div>

            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('lists.noSharedLists')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('lists.inviteFriends')}
              </p>
              <Button onClick={() => setIsShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('lists.shareList')}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      <ShareList
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        listId={selectedList?.id || ""}
      />

      <LimitReachedDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        feature={t('lists.addItem')}
        currentPlan={plan}
        rewardAdWatched={rewardAdWatched}
      />

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('lists.addItem')}</DialogTitle>
            <DialogDescription>
              {t('lists.addItemDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('lists.itemName')}</label>
              <Input
                placeholder={t('lists.itemNamePlaceholder')}
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('lists.quantity')}</label>
              <Input
                placeholder="1 kg, 2 pcs..."
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleAddItem}>
              {t('common.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lists;