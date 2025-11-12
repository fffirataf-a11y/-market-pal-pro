import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { writeBatch, getDocs } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  ShoppingCart,
  Users,
  Settings,
  ScanBarcode,
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

const Lists = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();  // ✅ i18n ekle
  const { toast } = useToast();  // ✅ EKLE
  const { canPerformAction, incrementAction, plan, getRemainingActions } = useSubscription();
  
  // ✅ Firestore hook
  const {
    lists,
    loading: listsLoading,
    createList,
    deleteList,
    addItem,
    updateItem,
    deleteAllItems,
    deleteItem: deleteItemFromList,
  } = useShoppingLists();

  // ✅ State'leri explicit initialize et
  const [searchQuery, setSearchQuery] = useState<string>(""); // ✅ Type + default
  const [activeTab, setActiveTab] = useState<string>("my-lists"); // ✅ Type + default
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState<boolean>(false);
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false); // ✅ EKLE
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "Fruits",
  });

  const remainingActions = getRemainingActions();

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

  const categories = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Bakery",
    "Meat",
    "Seafood",
    "Beverages",
    "Snacks",
    "Cleaning",
    "Personal Care",
    "Baby Care",
    "Pet Care",
    "Household",
    "Frozen",
    "Canned",
    "Grains",
    "Condiments",
    "Other"
  ];

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
        "limonata", "içecek", "gazoz", "şalgam"
      ],
      Snacks: [
        "chips", "chocolate", "candy", "nuts", "popcorn",
        "cracker", "pretzel", "biscuit", "wafer", "bar",
        "cips", "çikolata", "şeker", "fındık", "ceviz", "badem",
        "patlamış mısır", "kraker", "bisküvi", "gofret", "bar"
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

  const getCategoryIcon = (category: string, itemName: string) => {
    const specificIcons: Record<string, string> = {
      // Önce uzun/özel kelimeler (sucuk, mantı gibi) - UZUN KELİMELER ÖNCE
      "çamaşır suyu": "🧴",
      "meyve suyu": "🧃",
      "ice cream": "🍦",
      "organic apples": "🍎",
      "whole wheat bread": "🍞",
      "almond milk": "🥛",
      "toothpaste": "🪥",
      "toilet paper": "🧻",
      "tuvalet kağıdı": "🧻",
      "peçete": "🧻",
      "tissue": "🧻",
      "paper towel": "🧻",
      "kağıt havlu": "🧻",
      
      // İÇECEKLER - Gazlı İçecekler
      "fanta": "🥤",
      "cola": "🥤",
      "coca cola": "🥤",
      "pepsi": "🥤",
      "sprite": "🥤",
      "7up": "🥤",
      "gazoz": "🥤",
      "limonata": "🧃",
      "ayran": "🥛",
      "kefir": "🥛",
      "smoothie": "🥤",
      "milkshake": "🥤",
      "soda": "🥤",
      "tonic": "🥤",
      "enerji içeceği": "⚡",
      "energy drink": "⚡",
      "red bull": "⚡",
      "monster": "⚡",
      
      // İÇECEKLER - Meyve Suları
      "portakal suyu": "🧃",
      "elma suyu": "🧃",
      "vişne suyu": "🧃",
      "şeftali suyu": "🧃",
      "kayısı suyu": "🧃",
      "nar suyu": "🧃",
      "orange juice": "🧃",
      "apple juice": "🧃",
      "cherry juice": "🧃",
      "peach juice": "🧃",
      "apricot juice": "🧃",
      "pomegranate juice": "🧃",
      
      // ET ÜRÜNLERİ
      "sucuk": "🌭",
      "pastırma": "🥩",
      "sosis": "🌭",
      "salam": "🥓",
      "jambon": "🥓",
      "ham": "🥓",
      "bacon": "🥓",
      "salami": "🥓",
      "köfte": "🍖",
      "meatball": "🍖",
      "dana eti": "🥩",
      "kuzu eti": "🥩",
      "kıyma": "🥩",
      "ground meat": "🥩",
      "minced meat": "🥩",
      "steak": "🥩",
      "biftek": "🥩",
      "hindi": "🦃",
      "turkey": "🦃",
      "kuzu": "🥩",
      "lamb": "🥩",
      "pork": "🥩",
      "domuz eti": "🥩",
      
      // SÜT ÜRÜNLERİ
      "yoğurt": "🥛",
      "yogurt": "🥛",
      "kaşar": "🧀",
      "beyaz peynir": "🧀",
      "lor": "🧀",
      "tulum peyniri": "🧀",
      "labne": "🧀",
      "cream cheese": "🧀",
      "cheddar": "🧀",
      "mozzarella": "🧀",
      "feta": "🧀",
      "tereyağı": "🧈",
      "butter": "🧈",
      "margarin": "🧈",
      "margarine": "🧈",
      "krema": "🥛",
      "cream": "🥛",
      
      // ATIŞTIRMALIKLAR
      "çips": "🥔",
      "chips": "🥔",
      "patates cipsi": "🥔",
      "gofret": "🍫",
      "wafer": "🍫",
      "bisküvi": "🍪",
      "biscuit": "🍪",
      "kraker": "🍘",
      "cracker": "🍘",
      "pretzel": "🥨",
      "simit": "🥨",
      "fındık": "🥜",
      "hazelnut": "🥜",
      "ceviz": "🥜",
      "walnut": "🥜",
      "badem": "🥜",
      "almond": "🥜",
      "fıstık": "🥜",
      "peanut": "🥜",
      "antep fıstığı": "🥜",
      "pistachio": "🥜",
      "patlamış mısır": "🍿",
      "popcorn": "🍿",
      "çekirdek": "🌻",
      "sunflower seeds": "🌻",
      "kabak çekirdeği": "🌻",
      "pumpkin seeds": "🌻",
      "bar": "🍫",
      "granola bar": "🍫",
      "enerji barı": "🍫",
      "energy bar": "🍫",
      
      // TATLILAR
      "baklava": "🍯",
      "lokum": "🍬",
      "turkish delight": "🍬",
      "helva": "🍯",
      "halva": "🍯",
      "revani": "🍰",
      "sütlaç": "🍮",
      "rice pudding": "🍮",
      "muhallebi": "🍮",
      "pudding": "🍮",
      "tulumba": "🍩",
      "doughnut": "🍩",
      "donut": "🍩",
      "waffle": "🧇",
      
      // TAHILLAR & BAKLAGİLLER
      "bulgur": "🌾",
      "mercimek": "🫘",
      "lentil": "🫘",
      "nohut": "🫘",
      "chickpea": "🫘",
      "fasulye": "🫘",
      "bean": "🫘",
      "barbunya": "🫘",
      "kidney bean": "🫘",
      "kuru fasulye": "🫘",
      "kırmızı mercimek": "🫘",
      "yeşil mercimek": "🫘",
      "kuskus": "🌾",
      "couscous": "🌾",
      "kinoa": "🌾",
      "quinoa": "🌾",
      "yulaf": "🌾",
      "oats": "🌾",
      "un": "🌾",
      "flour": "🌾",
      "buğday": "🌾",
      "wheat": "🌾",
      "gevrek": "🥣",
      "cereal": "🥣",
      "cornflakes": "🥣",
      "mısır gevreği": "🥣",
      
      // KONSERVE & TURŞU
      "turşu": "🥒",
      "pickle": "🥒",
      "salça": "🍅",
      "tomato paste": "🍅",
      "domates salçası": "🍅",
      "biber salçası": "🌶️",
      "pepper paste": "🌶️",
      "zeytin": "🫒",
      "olive": "🫒",
      "yeşil zeytin": "🫒",
      "siyah zeytin": "🫒",
      "konserve": "🥫",
      "canned": "🥫",
      "konserve domates": "🥫",
      "canned tomato": "🥫",
      "konserve mısır": "🥫",
      "canned corn": "🥫",
      "konserve ton": "🥫",
      "canned tuna": "🥫",
      "reçel": "🍯",
      "jam": "🍯",
      "marmelat": "🍯",
      "marmalade": "🍯",
      "bal": "🍯",
      "honey": "🍯",
      
      // DONMUŞ GIDALAR
      "dondurulmuş": "🧊",
      "frozen": "🧊",
      "donmuş pizza": "🍕",
      "frozen pizza": "🍕",
      "donmuş sebze": "🧊",
      "frozen vegetable": "🧊",
      "donmuş meyve": "🧊",
      "frozen fruit": "🧊",
      "buz": "🧊",
      "ice": "🧊",
      "buz küpü": "🧊",
      "ice cube": "🧊",
      
      // YEMEKLER & HAZIR GIDALAR
      "mantı": "🥟",
      "dumpling": "🥟",
      "börek": "🥟",
      "borek": "🥟",
      "çorba": "🍲",
      "soup": "🍲",
      "mercimek çorbası": "🍲",
      "lentil soup": "🍲",
      "tavuk çorbası": "🍲",
      "chicken soup": "🍲",
      "hazır çorba": "🍲",
      "instant soup": "🍲",
      "noodle": "🍜",
      "erişte": "🍜",
      "ramen": "🍜",
      "hazır yemek": "🍱",
      "ready meal": "🍱",
      "döner": "🌯",
      "doner": "🌯",
      "lahmacun": "🌮",
      "pide": "🥖",
      "poğaça": "🥐",
      "açma": "🥐",
      "croissant": "🥐",
      
      // MEYVELER (ekstra)
      "kiraz": "🍒",
      "cherry": "🍒",
      "şeftali": "🍑",
      "peach": "🍑",
      "kayısı": "🍑",
      "apricot": "🍑",
      "armut": "🍐",
      "pear": "🍐",
      "erik": "🟣",
      "plum": "🟣",
      "incir": "🟣",
      "fig": "🟣",
      "nar": "🟣",
      "pomegranate": "🟣",
      "mango": "🥭",
      "ananas": "🍍",
      "pineapple": "🍍",
      "kivi": "🥝",
      "kiwi": "🥝",
      "kavun": "🍈",
      "melon": "🍈",
      "mandalina": "🍊",
      "tangerine": "🍊",
      "greyfurt": "🍊",
      "grapefruit": "🍊",
      "yaban mersini": "🫐",
      "blueberry": "🫐",
      "ahududu": "🫐",
      "raspberry": "🫐",
      "böğürtlen": "🫐",
      "blackberry": "🫐",
      
      // SEBZELER (ekstra)
      "patlıcan": "🍆",
      "eggplant": "🍆",
      "aubergine": "🍆",
      "kabak": "🥒",
      "zucchini": "🥒",
      "balkabağı": "🎃",
      "pumpkin": "🎃",
      "karnabahar": "🥦",
      "cauliflower": "🥦",
      "lahana": "🥬",
      "cabbage": "🥬",
      "kereviz": "🥬",
      "celery": "🥬",
      "pırasa": "🥬",
      "leek": "🥬",
      "turp": "🥕",
      "radish": "🥕",
      "bezelye": "🫛",
      "peas": "🫛",
      "bamya": "🥘",
      "okra": "🥘",
      "enginar": "🥘",
      "artichoke": "🥘",
      "kuşkonmaz": "🥘",
      "asparagus": "🥘",
      "ıspanak": "🥬",
      "spinach": "🥬",
      "roka": "🥬",
      "arugula": "🥬",
      "tere": "🥬",
      "watercress": "🥬",
      
      // TEMİZLİK ÜRÜNLERİ
      "bulaşık deterjanı": "🧴",
      "dish soap": "🧴",
      "dishwashing liquid": "🧴",
      "çamaşır deterjanı": "🧴",
      "laundry detergent": "🧴",
      "yumuşatıcı": "🧴",
      "fabric softener": "🧴",
      "kir sökücü": "🧴",
      "stain remover": "🧴",
      "cam temizleyici": "🧴",
      "glass cleaner": "🧴",
      "yer temizleyici": "🧴",
      "floor cleaner": "🧴",
      "tuvalet temizleyici": "🧴",
      "toilet cleaner": "🧴",
      "dezenfektan": "🧴",
      "disinfectant": "🧴",
      "çöp poşeti": "🗑️",
      "trash bag": "🗑️",
      "garbage bag": "🗑️",
      "bulaşık süngeri": "🧽",
      "sponge": "🧽",
      "bulaşık bezi": "🧽",
      "dishcloth": "🧽",
      "paspas": "🧹",
      "mop": "🧹",
      "süpürge": "🧹",
      "broom": "🧹",
      "elektrikli süpürge": "🧹",
      "vacuum": "🧹",
      
      // KİŞİSEL BAKIM
      "deodorant": "🧴",
      "parfüm": "🧴",
      "perfume": "🧴",
      "kolonya": "🧴",
      "cologne": "🧴",
      "duş jeli": "🧴",
      "body wash": "🧴",
      "shower gel": "🧴",
      "yüz yıkama": "🧴",
      "face wash": "🧴",
      "nemlendirici": "🧴",
      "moisturizer": "🧴",
      "güneş kremi": "🧴",
      "sunscreen": "🧴",
      "tıraş köpüğü": "🧴",
      "shaving foam": "🧴",
      "tıraş bıçağı": "🪒",
      "razor": "🪒",
      "saç kremi": "🧴",
      "conditioner": "🧴",
      "saç spreyi": "🧴",
      "hair spray": "🧴",
      "jöle": "🧴",
      "hair gel": "🧴",
      "diş fırçası": "🪥",
      "toothbrush": "🪥",
      "diş ipi": "🧵",
      "dental floss": "🧵",
      "ağız gargarası": "🧴",
      "mouthwash": "🧴",
      "tırnak makası": "✂️",
      "nail clipper": "✂️",
      
      // BEBEK BAKIMI
      "bebek bezi": "👶",
      "diaper": "👶",
      "nappy": "👶",
      "bebek maması": "🍼",
      "baby food": "🍼",
      "mama": "🍼",
      "formula": "🍼",
      "bebek şampuanı": "🧴",
      "baby shampoo": "🧴",
      "bebek sabunu": "🧴",
      "baby soap": "🧴",
      "bebek yağı": "🧴",
      "baby oil": "🧴",
      "bebek pudrası": "🧴",
      "baby powder": "🧴",
      "ıslak mendil": "🧻",
      "baby wipes": "🧻",
      "emzik": "🍼",
      "pacifier": "🍼",
      "biberon": "🍼",
      "bottle": "🍼",
      
      // EV EŞYALARI
      "ampul": "💡",
      "light bulb": "💡",
      "led ampul": "💡",
      "led bulb": "💡",
      "pil": "🔋",
      "battery": "🔋",
      "kalem pil": "🔋",
      "aa battery": "🔋",
      "aaa battery": "🔋",
      "mum": "🕯️",
      "candle": "🕯️",
      "kibrit": "🔥",
      "match": "🔥",
      "çakmak": "🔥",
      "lighter": "🔥",
      "bant": "📎",
      "tape": "📎",
      "yapışkan bant": "📎",
      "adhesive tape": "📎",
      "seloteyp": "📎",
      "scotch tape": "📎",
      "folyo": "📄",
      "foil": "📄",
      "aluminum foil": "📄",
      "streç film": "📄",
      "plastic wrap": "📄",
      "cling film": "📄",
      "saklama kabı": "🥡",
      "container": "🥡",
      "storage container": "🥡",
      "ziploc": "🥡",
      "kilitli poşet": "🥡",
      "ziplock bag": "🥡",
      "poşet": "🛍️",
      "bag": "🛍️",
      "plastik poşet": "🛍️",
      "plastic bag": "🛍️",
      
      // GENEL ÜRÜNLER (kısa kelimeler en sonda)
      "apple": "🍎", "apples": "🍎",
      "bread": "🍞",
      "milk": "🥛",
      "avocado": "🥑", "avocados": "🥑",
      "banana": "🍌", "bananas": "🍌",
      "tomato": "🍅", "tomatoes": "🍅",
      "carrot": "🥕", "carrots": "🥕",
      "potato": "🥔", "potatoes": "🥔",
      "cheese": "🧀",
      "egg": "🥚", "eggs": "🥚",
      "chicken": "🍗",
      "fish": "🐟",
      "shrimp": "🦐",
      "orange": "🍊", "oranges": "🍊",
      "grape": "🍇", "grapes": "🍇",
      "strawberry": "🍓", "strawberries": "🍓",
      "watermelon": "🍉",
      "lemon": "🍋",
      "onion": "🧅", "onions": "🧅",
      "garlic": "🧄",
      "pepper": "🌶️", "peppers": "🌶️",
      "broccoli": "🥦",
      "cucumber": "🥒",
      "lettuce": "🥬",
      "corn": "🌽",
      "mushroom": "🍄", "mushrooms": "🍄",
      "rice": "🍚",
      "pasta": "🍝",
      "pizza": "🍕",
      "burger": "🍔",
      "cake": "🍰",
      "cookie": "🍪", "cookies": "🍪",
      "chocolate": "🍫",
      "candy": "🍬",
      "coffee": "☕",
      "tea": "🍵",
      "juice": "🧃",
      "water": "💧",
      "wine": "🍷",
      "beer": "🍺",
      "soap": "🧼",
      "elma": "🍎",
      "ekmek": "🍞",
      "süt": "🥛",
      "avokado": "🥑",
      "muz": "🍌",
      "domates": "🍅",
      "havuç": "🥕",
      "patates": "🥔",
      "peynir": "🧀",
      "yumurta": "🥚",
      "tavuk": "🍗",
      "balık": "🐟",
      "karides": "🦐",
      "portakal": "🍊",
      "üzüm": "🍇",
      "çilek": "🍓",
      "karpuz": "🍉",
      "limon": "🍋",
      "soğan": "🧅",
      "sarımsak": "🧄",
      "biber": "🌶️",
      "brokoli": "🥦",
      "salatalık": "🥒",
      "marul": "🥬",
      "mısır": "🌽",
      "mantar": "🍄",
      "pirinç": "🍚",
      "makarna": "🍝",
      "hamburger": "🍔",
      "kek": "🍰",
      "kurabiye": "🍪",
      "çikolata": "🍫",
      "şeker": "🍬",
      "dondurma": "🍦",
      "kahve": "☕",
      "çay": "🍵",
      "su": "💧",
      "şarap": "🍷",
      "bira": "🍺",
      "sabun": "🧼",
      "şampuan": "🧴",
      "diş macunu": "🪥",
      "deterjan": "🧴",
    };
    
    const normalizedName = itemName.toLowerCase().trim();
    // Önce uzun eşleşmeleri kontrol et (daha spesifik)
    const sortedKeys = Object.keys(specificIcons).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (normalizedName.includes(key)) {
        return specificIcons[key];
      }
    }
    
    // Eğer ürünün emojisi listede yoksa market arabası emojisi döndür
    return "🛒";
  };

  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      Fruits: "bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10",
      Vegetables: "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10",
      Dairy: "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10",
      Bakery: "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10",
      Meat: "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-800/10",
      Seafood: "bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/20 dark:to-cyan-800/10",
      Beverages: "bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10",
      Snacks: "bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10",
      Cleaning: "bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/20 dark:to-teal-800/10",
      "Personal Care": "bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/20 dark:to-pink-800/10",
      "Baby Care": "bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/20 dark:to-rose-800/10",
      "Pet Care": "bg-gradient-to-br from-lime-100 to-lime-50 dark:from-lime-900/20 dark:to-lime-800/10",
      Household: "bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900/20 dark:to-slate-800/10",
      Frozen: "bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-sky-800/10",
      Canned: "bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-900/20 dark:to-stone-800/10",
      Grains: "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10",
      Condiments: "bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10",
      Other: "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/20 dark:to-gray-800/10",
    };
    return gradients[category] || "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/20 dark:to-gray-800/10";
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
  // ✅ Tümünü sil (Paralel Silme - Optimize Edilmiş)
  // ✅ Tümünü sil (Loading state ile koruma)
const handleDeleteAllItems = async () => {
  if (!selectedList || items.length === 0 || isDeletingAll) return; // ✅ isDeletingAll ekle

  // İLK ÖNCE SNAPSHOT AL (state değişmeden önce)
  const itemsToDelete = [...items];
  const totalCount = itemsToDelete.length;

  console.log('🗑️ Delete all clicked, items count:', totalCount);

  const confirmMessage = i18n.language === 'tr' 
    ? `${totalCount} ürünü silmek istediğinize emin misiniz?` 
    : `Are you sure you want to delete ${totalCount} items?`;
  
  const confirmed = window.confirm(confirmMessage);

  if (!confirmed) {
    console.log('❌ User cancelled');
    return;
  }

  setIsDeletingAll(true); // ✅ Loading başlat

  try {
    console.log('⚡ Deleting all items with single operation...');
  
    // ✅ Tek seferde tüm itemleri sil
    await deleteAllItems(selectedList.id);
  
    console.log('✅ All items deleted successfully!');

    toast({
      title: t('common.success'),
      description: `${totalCount} ${i18n.language === 'tr' ? 'ürün silindi' : 'items deleted'}`,
      duration: 3000,
    });

  } catch (error) {
    console.error('❌ Error deleting items:', error);
    toast({
      title: t('common.error'),
      description: i18n.language === 'tr' ? 'Silme işlemi başarısız' : 'Failed to delete items',
      variant: 'destructive',
    });
  } finally {
    setIsDeletingAll(false); // ✅ Loading bitir
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

    incrementAction();
    setNewItem({ name: "", quantity: "", category: "Fruits" });
    setIsAddDialogOpen(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fruits: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      Vegetables: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Dairy: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Bakery: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      Meat: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      Seafood: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      Beverages: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      Snacks: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      Cleaning: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      "Personal Care": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
      "Baby Care": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
      "Pet Care": "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
      Household: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
      Frozen: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
      Canned: "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400",
      Grains: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      Condiments: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      Other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

 // ✅ Loading state'i iyileştir
if (listsLoading) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t('lists.title')}</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            placeholder={t('common.search')}
  value={searchQuery || ""}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="pl-10 h-12"
/>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6">
        <div className="space-y-4">
          {/* Skeleton Cards */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{t('lists.title')}</h1>
              {plan !== 'pro' && (
                <p className="text-sm text-muted-foreground">
                  {remainingActions === -1 ? '∞' : remainingActions} {t('subscription.remaining')}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
  placeholder={t('common.search')}
  value={searchQuery || ""}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="pl-10 h-12"
/>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-6 space-y-6">
        {ADS_ENABLED && plan === 'free' && (
          <RewardedAdSlot
            plan={plan}
            placement="lists_main_reward"
            onReward={() =>
              toast({
                title: t('ads.rewardToastTitle'),
                description: t('ads.rewardToastDescription'),
              })
            }
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-lists">{t('nav.myLists')}</TabsTrigger>
            <TabsTrigger value="shared">{t('lists.sharedLists')}</TabsTrigger>
          </TabsList>

          <TabsContent value="my-lists" className="space-y-4 mt-6">
            {selectedList && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">
                    {selectedList.name === "Weekly Groceries" 
                      ? t('lists.weeklyGroceries') 
                      : selectedList.name}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsShareDialogOpen(true)}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        item.completed
                          ? "bg-muted/50 opacity-60"
                          : "bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-lg ${getCategoryGradient(item.category)} flex items-center justify-center flex-shrink-0 text-3xl`}>
                        {getCategoryIcon(item.category, item.name)}
                      </div>

                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          item.completed
                            ? "bg-success border-success"
                            : "border-muted-foreground/30 hover:border-primary"
                        }`}
                      >
                        {item.completed && (
                          <Check className="h-3 w-3 text-success-foreground" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                item.completed ? "line-through" : ""
                              }`}
                            >
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {item.quantity} · {t('lists.addedBy')} {item.addedByName || 'You'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <Badge
                          className={`mt-2 ${getCategoryColor(item.category)}`}
                          variant="secondary"
                        >
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('lists.addItem')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('lists.addItem')}</DialogTitle>
                      <DialogDescription>
                        {t('lists.itemName')} {t('common.and')} {t('lists.quantity')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="itemName">{t('lists.itemName')}</Label>
                        <Input
                          id="itemName"
                          placeholder={t('lists.itemNamePlaceholder')}
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">{t('lists.quantity')}</Label>
                        <Input
                          id="quantity"
                          placeholder={t('lists.quantityPlaceholder')}
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddItem} className="w-full">
                        {t('common.add')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {/* ✅ TÜMÜNÜ SİL BUTONU */}
{items.length > 0 && (
  <Button
    variant="destructive"
    className="w-full mt-3"
    onClick={handleDeleteAllItems}
    disabled={isDeletingAll} // ✅ EKLE
  >
    {isDeletingAll ? ( // ✅ EKLE
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
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shared" className="space-y-4 mt-6">
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
      />
    </div>
  );
};

export default Lists