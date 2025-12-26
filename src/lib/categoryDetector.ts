export const detectCategory = (itemName: string): string => {
    const name = itemName.toLowerCase().trim();

    const categoryKeywords: Record<string, string[]> = {
        Cleaning: [
            "bleach", "detergent", "soap", "cleaner", "disinfectant", "wipes",
            "mop", "broom", "sponge", "scrub", "polish", "spray", "toilet cleaner",
            "floor cleaner", "glass cleaner", "dishwashing", "laundry",
            "çamaşır suyu", "deterjan", "sabun", "temizleyici", "dezenfektan",
            "mendil", "islak mendil", "paspas", "sünger", "ovma", "parlatıcı",
            "sprey", "tuvalet temizleyici", "yer temizleyici", "cam temizleyici",
            "bulaşık", "çamaşır", "yumuşatıcı", "kir sökücu",
            // DE
            "reiniger", "waschmittel", "seife", "spülmittel", "bleiche", "schwamm",
            // FR
            "nettoyant", "lessive", "savon", "javel", "éponge", "lingettes",
            // JA
            "洗剤", "石鹸", "漂白剤", "スポンジ", "クリーナー",
            // KO
            "세제", "비누", "표백제", "스펀지", "클리너"
        ],
        "Personal Care": [
            "shampoo", "conditioner", "toothpaste", "toothbrush", "deodorant",
            "perfume", "cologne", "razor", "shaving", "cream", "lotion",
            "tissue", "toilet paper", "soap", "body wash", "face wash",
            "makeup", "cosmetic", "skincare", "moisturizer",
            "şampuan", "saç kremi", "diş macunu", "diş fırçası", "deodorant",
            "parfüm", "kolonya", "tıraş", "krem", "losyon", "peçete",
            "tuvalet kağıdı", "duş jeli", "yüz yıkama", "makyaj", "kozmetik",
            "cilt bakım", "nemlendirici",
            // DE
            "shampoo", "zahnpasta", "seife", "creme", "rasierer", "deodorant", "toilettenpapier",
            // FR
            "shampoing", "dentifrice", "savon", "crème", "rasoir", "déodorant", "papier toilette",
            // JA
            "シャンプー", "歯磨き粉", "石鹸", "クリーム", "髭剃り", "トイレットペーパー",
            // KO
            "샴푸", "치약", "비누", "로션", "면도기", "화장지"
        ],
        "Baby Care": [
            "diaper", "baby food", "formula", "wipes", "baby oil", "powder",
            "pacifier", "bottle", "baby shampoo", "baby soap",
            "bebek bezi", "mama", "bebek maması", "ıslak mendil", "bebek yağı",
            "pudra", "emzik", "biberon", "bebek şampuanı", "bebek sabunu",
            // DE
            "windel", "babynahrung", "schnuller", "babyöl",
            // FR
            "couche", "bébé", "lingettes bébé", "biberon",
            // JA
            "おむつ", "ベビーフード", "哺乳瓶",
            // KO
            "기저귀", "분유", "젖병", "이유식"
        ],
        "Pet Care": [
            "pet food", "dog food", "cat food", "litter", "pet toy",
            "kedi maması", "köpek maması", "kedi kumu", "mama", "oyuncak",
            // DE
            "hundefutter", "katzenfutter", "katzenstreu", "tiernahrung",
            // FR
            "croquettes", "litière", "nourriture chat", "nourriture chien",
            // JA
            "ドッグフード", "キャットフード", "ペットフード", "猫砂",
            // KO
            "사료", "고양이 모래", "개껌", "반려동물"
        ],
        Household: [
            "battery", "light bulb", "candle", "matches", "foil", "wrap",
            "bag", "trash bag", "ziplock", "container", "tape",
            "pil", "ampul", "mum", "kibrit", "folyo", "streç film",
            "poşet", "çöp torbası", "kilitli poşet", "saklama kabı", "bant",
            // DE
            "batterie", "glühbirne", "kerze", "folie", "müllbeutel",
            // FR
            "pile", "ampoule", "bougie", "aluminium", "sac poubelle",
            // JA
            "電池", "電球", "ろうそく", "ホイル", "ゴミ袋",
            // KO
            "건전지", "전구", "양초", "호일", "쓰레기 봉투"
        ],
        Frozen: [
            "frozen", "ice cream", "popsicle", "frozen pizza", "frozen vegetable",
            "dondurulmuş", "donmuş", "dondurma", "buz", "donmuş pizza", "donmuş sebze",
            // DE
            "tiefkühl", "eis", "pizza", "gefroren",
            // FR
            "surgelé", "glace", "pizza",
            // JA
            "冷凍", "アイス", "ピザ",
            // KO
            "냉동", "아이스크림", "피자"
        ],
        Canned: [
            "canned", "jar", "pickle", "olive", "tomato paste", "tomato sauce",
            "konserve", "turşu", "zeytin", "salça", "domates salçası", "biber salçası",
            "reçel", "bal", "kavanoz",
            // DE
            "konserve", "dose", "glas", "marmelade", "honig",
            // FR
            "conserve", "bocal", "confiture", "miel",
            // JA
            "缶詰", "瓶詰", "ジャム", "蜂蜜",
            // KO
            "통조림", "잼", "꿀"
        ],
        Grains: [
            "rice", "pasta", "noodle", "spaghetti", "macaroni", "flour", "bulgur",
            "couscous", "quinoa", "oats", "cereal", "bread", "wheat",
            "pirinç", "makarna", "erişte", "spagetti", "un", "bulgur",
            "kuskus", "kinoa", "yulaf", "tahıl", "gevrek", "buğday",
            // DE
            "reis", "nudeln", "spaghetti", "mehl", "brötchen", "haferflocken",
            // FR
            "riz", "pâtes", "farine", "céréales",
            // JA
            "米", "パスタ", "麺", "小麦粉", "シリアル",
            // KO
            "쌀", "파스타", "국수", "밀가루", "시리얼"
        ],
        Condiments: [
            "salt", "pepper", "spice", "sauce", "ketchup", "mayonnaise", "mustard",
            "vinegar", "oil", "olive oil", "soy sauce", "hot sauce",
            "tuz", "karabiber", "baharat", "sos", "ketçap", "mayonez", "hardal",
            "sirke", "yağ", "zeytinyağı", "soya sosu", "acı sos", "şeker", "sugar",
            // DE
            "salz", "pfeffer", "gewürz", "soße", "öl", "zucker", "essig",
            // FR
            "sel", "poivre", "épice", "sauce", "huile", "sucre", "vinaigre",
            // JA
            "塩", "胡椒", "スパイス", "ソース", "油", "砂糖", "酢", "醤油",
            // KO
            "소금", "후추", "양념", "소스", "기름", "설탕", "식초", "간장"
        ],
        Fruits: [
            "apple", "banana", "orange", "grape", "strawberry", "watermelon",
            "melon", "peach", "cherry", "pear", "plum", "avocado", "lemon",
            "lime", "kiwi", "mango", "pineapple", "apricot", "fig", "pomegranate",
            "tangerine", "grapefruit", "blueberry", "raspberry", "blackberry",
            "elma", "muz", "portakal", "üzüm", "çilek", "karpuz", "kavun",
            "şeftali", "kiraz", "armut", "erik", "avokado", "limon", "mandalina",
            "greyfurt", "kayısı", "incir", "nar", "meyve",
            // DE
            "apfel", "banane", "orange", "traube", "erdbeere", "zitrone", "obst", "birne",
            // FR
            "pomme", "banane", "orange", "raisin", "fraise", "citron", "fruit", "poire",
            // JA
            "りんご", "バナナ", "オレンジ", "ぶどう", "いちご", "レモン", "果物", "梨",
            // KO
            "사과", "바나나", "오렌지", "포도", "딸기", "레몬", "과일", "배"
        ],
        Vegetables: [
            "tomato", "potato", "onion", "carrot", "pepper", "cucumber",
            "lettuce", "spinach", "broccoli", "cauliflower", "cabbage", "eggplant",
            "zucchini", "pumpkin", "garlic", "celery", "leek", "radish",
            "corn", "mushroom", "bean", "peas", "okra", "artichoke", "asparagus",
            "domates", "patates", "soğan", "havuç", "biber", "salatalık",
            "marul", "ıspanak", "brokoli", "karnabahar", "lahana", "patlıcan",
            "kabak", "balkabağı", "sarımsak", "kereviz", "pırasa", "turp",
            "mısır", "mantar", "fasulye", "bezelye", "bamya", "enginar", "sebze",
            "maydanoz", "dereotu", "nane", "roka", "parsley", "mint", "dill", "arugula",
            // DE
            "tomate", "kartoffel", "zwiebel", "karotte", "paprika", "gurke", "salat", "knoblauch", "gemüse",
            // FR
            "tomate", "pomme de terre", "oignon", "carotte", "poivron", "concombre", "salade", "ail", "légume",
            // JA
            "トマト", "じゃがいも", "玉ねぎ", "人参", "ピーマン", "きゅうり", "レタス", "にんにく", "野菜",
            // KO
            "토마토", "감자", "양파", "당근", "고추", "오이", "상추", "마늘", "채소", "야채"
        ],
        Dairy: [
            "milk", "cheese", "yogurt", "butter", "cream", "kefir",
            "ice cream", "cottage cheese", "cheddar", "mozzarella", "feta",
            "süt", "peynir", "yoğurt", "tereyağı", "krema", "ayran",
            "dondurma", "lor", "kaşar", "beyaz peynir", "tulum", "kaymak",
            // DE
            "milch", "käse", "joghurt", "butter", "sahne",
            // FR
            "lait", "fromage", "yaourt", "beurre", "crème",
            // JA
            "牛乳", "チーズ", "ヨーグルト", "バター", "クリーム",
            // KO
            "우유", "치즈", "요거트", "버터", "크림"
        ],
        Bakery: [
            "bread", "baguette", "roll", "croissant", "cake", "pastry",
            "cookie", "muffin", "donut", "bagel", "biscuit", "cracker", "yeast",
            "ekmek", "poğaça", "simit", "kruvasan", "kek", "pasta",
            "kurabiye", "börek", "açma", "francala", "somun", "maya", "yufka",
            // DE
            "brot", "brötchen", "kuchen", "keks", "gebäck",
            // FR
            "pain", "baguette", "gâteau", "biscuit", "viennoiserie",
            // JA
            "パン", "ケーキ", "クッキー", "菓子",
            // KO
            "빵", "케이크", "쿠키", "과자"
        ],
        Meat: [
            "chicken", "beef", "meat", "pork", "lamb", "turkey",
            "sausage", "salami", "steak", "bacon", "ham", "meatball",
            "tavuk", "dana", "et", "kuzu", "hindi", "sosis",
            "sucuk", "pastırma", "köfte", "jambon", "kangal", "kıyma",
            // DE
            "hähnchen", "rind", "fleisch", "schwein", "wurst", "steak",
            // FR
            "poulet", "bœuf", "viande", "porc", "saucisse", "steak", "jambon",
            // JA
            "鶏肉", "牛肉", "肉", "豚肉", "ソーセージ", "ステーキ", "ハム",
            // KO
            "닭고기", "쇠고기", "고기", "돼지고기", "소시지", "스테이크", "햄"
        ],
        Seafood: [
            "fish", "salmon", "tuna", "shrimp", "crab", "lobster",
            "mussel", "squid", "octopus", "anchovy", "sea bass", "trout",
            "balık", "som balığı", "ton balığı", "karides", "yengeç",
            "ıstakoz", "midye", "kalamar", "ahtapot", "hamsi", "levrek", "alabalık",
            // DE
            "fisch", "lachs", "thunfisch", "garnele",
            // FR
            "poisson", "saumon", "thon", "crevette",
            // JA
            "魚", "サーモン", "マグロ", "海老",
            // KO
            "생선", "연어", "참치", "새우"
        ],
        Beverages: [
            "water", "juice", "soda", "tea", "coffee", "wine", "beer",
            "cola", "lemonade", "drink", "milk shake", "smoothie",
            "su", "meyve suyu", "kola", "çay", "kahve", "şarap", "bira",
            "limonata", "içecek", "gazoz", "şalgam", "ayran",
            // DE
            "wasser", "saft", "tee", "kaffee", "wein", "bier", "cola",
            // FR
            "eau", "jus", "thé", "café", "vin", "bière",
            // JA
            "水", "ジュース", "茶", "コーヒー", "ワイン", "ビール",
            // KO
            "물", "주스", "차", "커피", "와인", "맥주"
        ],
        Snacks: [
            "chips", "chocolate", "candy", "nuts", "popcorn",
            "cracker", "pretzel", "biscuit", "wafer", "bar",
            "cips", "çikolata", "şeker", "fındık", "ceviz", "badem",
            "patlamış mısır", "kraker", "bisküvi", "gofret",
            // DE
            "chips", "schokolade", "bonbon", "nüsse",
            // FR
            "chips", "chocolat", "bonbon", "noix",
            // JA
            "チップス", "チョコレート", "飴", "ナッツ",
            // KO
            "칩", "초콜릿", "사탕", "견과류"
        ]
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (name.includes(keyword)) {
                return category;
            }
        }
    }
    return "Groceries";
};
