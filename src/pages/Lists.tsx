import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useInterstitialAd } from '@/hooks/useInterstitialAd'; // ✅ Import var
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { auth } from "@/config/firebase";
import {
  Plus,
  Search,
  Users,
  ChefHat,
  Check,
  Trash2,
  Share2,
  Loader2,
  Lock, // ✅ EKLE
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ShareList from "@/components/ShareList";

import { ADS_ENABLED } from "@/config/featureFlags";
import { showInterstitialAd } from "@/lib/adManager";

import { useSubscription } from "@/hooks/useSubscription";
import { LimitReachedDialog } from "@/components/LimitReachedDialog";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import i18n from "@/i18n";
import { AddFriendDialog } from "@/components/friends/AddFriendDialog";
import { FriendRequests } from "@/components/friends/FriendRequests";
import { detectCategory } from "@/lib/categoryDetector";

const Lists = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { canPerformAction, incrementAction, plan, rewardAdWatched, getRemainingActions, dailyLimit } = useSubscription();
  const currentUserId = auth.currentUser?.uid;

  // ✅ YENİ EKLENEN - Interstitial Reklam Hook'u
  const { showAd } = useInterstitialAd({
    plan,
    interval: 5 // Her 5 işlemde bir reklam
  });

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
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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



  // ✅ İlk listeyi seç
  const selectedList = lists.length > 0 ? lists[0] : null;
  const items = selectedList?.items || [];

  // 🔍 DEBUG: Items'ı logla
  useEffect(() => {
    console.log('📦 Current items in UI:', items.length);
    console.log('📋 Items:', items.map(i => ({ id: i.id, name: i.name })));
  }, [items]);



  const getCategoryEmoji = (itemName: string, category: string) => {
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

    // 2. Fallback to Category Icon
    const categoryIcons: Record<string, string> = {
      Fruits: "🍎",
      Vegetables: "🥦",
      Dairy: "🥛",
      Bakery: "🍞",
      Meat: "🥩",
      Seafood: "🐟",
      Beverages: "🥤",
      Snacks: "🍪",
      Condiments: "🧂",
      Grains: "🌾",
      Canned: "🥫",
      Frozen: "❄️",
      Cleaning: "🧹",
      "Personal Care": "🧴",
      "Baby Care": "👶",
      "Pet Care": "🐾",
      Household: "🏠",
      Other: "🛒"
    };

    return categoryIcons[category] || "🛒";
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
      Groceries: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      "Personal Care": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return colors[category] || colors.Other;
  };

  const getLocalizedCategory = (category: string) => {
    return t(`lists.categories.${category}`, category);
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

  // ✅ Tümünü sil onayı
  const handleDeleteAllItems = () => {
    if (!selectedList || items.length === 0 || isDeletingAll) return;
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteAll = async () => {
    if (!selectedList) return;
    setIsDeleteAlertOpen(false);

    setIsDeletingAll(true);
    const totalCount = items.length;

    try {
      await deleteAllItems(selectedList.id);

      // ✅ YENİ: Hook üzerinden reklam göster (plan kontrolü otomatik)
      showAd();

      toast({
        title: t('common.success'),
        description: `${totalCount} ${i18n.language === 'tr' ? 'ürün silindi' : 'items deleted'}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('❌ Error deleting items:', error);
      toast({
        title: t('common.error'),
        description: i18n.language === 'tr' ? 'Silme işlemi başarısız' : 'Failed to delete items',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  // ✅ Ürün ekle
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) return;
    if (!selectedList || isSubmitting) return;

    if (!canPerformAction()) {
      setLimitDialogOpen(true);
      setIsAddDialogOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const detectedCategory = detectCategory(newItem.name);

      await addItem(selectedList.id, {
        name: newItem.name,
        quantity: newItem.quantity,
        category: detectedCategory,
        completed: false,
      });

      await incrementAction();

      // ✅ YENİ: Reklam göster (sadece free için, her 5 işlemde bir)
      showAd();

      setNewItem({ name: "", quantity: "", category: "Fruits" });
      setIsAddDialogOpen(false);

      toast({
        title: t('common.success'),
        description: t('lists.itemAdded'),
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="container max-w-4xl py-2.5 sm:py-3">
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
            {/* Using standard input to avoid character mapping issues (ü -> st) */}
            <input
              placeholder={t('lists.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-3 pb-20 sm:py-4">
        <Tabs defaultValue="my-lists" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-10">
            <TabsTrigger value="my-lists">{t('lists.myLists')}</TabsTrigger>
            <TabsTrigger value="shared">{t('lists.sharedLists')}</TabsTrigger>
          </TabsList>

          <TabsContent value="my-lists" className="space-y-4">


            {items.length === 0 ? (
              <Card className="p-4 sm:p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
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
                {items.map((item, index) => {
                  // ✅ Görünürlük Kontrolü (Sadece listenin sahibi değilsek)
                  // Eğer liste bizim değilse (paylaşılan) ve index > GÜNLÜK LİMİT ise blurla
                  // Bu sayede reklam izleyip limit artırınca, buğulanan ürünler açılır!
                  const isSharedList = selectedList?.ownerId !== currentUserId;

                  // Pro ise limit yok (9999), değilse dinamik dailyLimit'i kullan
                  const effectiveLimit = plan === 'pro' ? 9999 : dailyLimit;

                  const isLocked = isSharedList && index >= effectiveLimit;

                  return (
                    <div
                      key={item.id}
                      className={`relative flex items-center justify-between p-4 transition-colors ${item.completed ? "bg-muted/50" : "hover:bg-muted/50"} ${isLocked ? "blur-sm select-none pointer-events-none opacity-50" : ""}`}
                      onClick={(e) => {
                        if (isLocked) {
                          e.stopPropagation();
                          e.preventDefault();
                          // Burada premium dialog açılabilir
                          return;
                        }
                      }}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto cursor-pointer" onClick={(e) => {
                          e.stopPropagation();
                          // setShowUpgradeDialog(true); // Basit bir toast ile başlayalım
                          toast({
                            title: t('common.limitReached'),
                            description: "Upgrade to see more items!",
                            variant: "destructive"
                          });
                        }}>
                          <div className="bg-background/80 p-2 rounded-full shadow-lg border">
                            <Lock className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      )}
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
                              {getCategoryEmoji(item.name, item.category)} {getLocalizedCategory(item.category)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col mt-1 space-y-0.5">
                          {item.quantity && (
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}
                            </p>
                          )}
                          {item.addedByName && (
                            <p className="text-[10px] text-muted-foreground/70 italic">
                              {i18n.language === 'tr' ? 'Ekleyen:' : 'Added by:'} {item.addedByName}
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
                  );
                })}
              </Card>
            )}

            {/* ✅ TÜMÜNÜ SİL BUTONU */}
            {items.length > 0 && (
              <Button
                variant="destructive"
                className="w-full mt-2 h-10 sm:h-11"
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

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle i18n-key="lists.deleteAllTitle">
              {i18n.language === 'tr' ? 'Tümünü Sil?' : 'Delete All Items?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.language === 'tr'
                ? `Listenizdeki ${items.length} ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
                : `Are you sure you want to delete ${items.length} items from your list? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAll}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteAll();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeletingAll}
            >
              {isDeletingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {i18n.language === 'tr' ? 'Siliniyor...' : 'Deleting...'}
                </>
              ) : (
                i18n.language === 'tr' ? 'Evet, Sil' : 'Yes, Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('lists.addItem')}</DialogTitle>
            <DialogDescription>
              {t('lists.addItemDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('lists.itemName')}</label>
              <input
                placeholder={t('lists.itemNamePlaceholder')}
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('lists.quantity')}</label>
              <input
                placeholder="1 kg, 2 pcs..."
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button className="w-full h-10 sm:h-11" onClick={handleAddItem} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('common.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Lists;