import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  addedBy: string;
  completed: boolean;
}

const Lists = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-lists");

  const [items, setItems] = useState<ShoppingItem[]>([
    {
      id: "1",
      name: "Organic Apples",
      quantity: "2kg",
      category: "Fruits",
      addedBy: "You",
      completed: false,
    },
    {
      id: "2",
      name: "Whole Wheat Bread",
      quantity: "2 loaf",
      category: "Bakery",
      addedBy: "Alex",
      completed: false,
    },
    {
      id: "3",
      name: "Almond Milk",
      quantity: "1L",
      category: "Dairy",
      addedBy: "You",
      completed: true,
    },
    {
      id: "4",
      name: "Spinach",
      quantity: "1 bag",
      category: "Vegetables",
      addedBy: "Sarah",
      completed: false,
    },
    {
      id: "5",
      name: "Avocado",
      quantity: "3 units",
      category: "Produce",
      addedBy: "You",
      completed: false,
    },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fruits: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      Bakery: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      Dairy: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Vegetables: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Produce: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">My Lists</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-lists">My Lists</TabsTrigger>
            <TabsTrigger value="shared">Shared Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="my-lists" className="space-y-4 mt-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/scanner")}
              >
                <ScanBarcode className="h-6 w-6" />
                <span className="text-sm">Scan Barcode</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/ai-chef")}
              >
                <ChefHat className="h-6 w-6" />
                <span className="text-sm">AI Chef</span>
              </Button>
            </div>

            {/* Shopping List */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Weekly Groceries</h2>
                <Button variant="ghost" size="icon">
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
                            {item.quantity} · Added by {item.addedBy}
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

              <Button className="w-full mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="shared" className="space-y-4 mt-6">
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Shared Lists</h3>
              <p className="text-muted-foreground mb-4">
                Invite friends and family to collaborate on shopping lists
              </p>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share a List
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-4 gap-1 py-2">
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/lists")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">My Lists</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/scanner")}
            >
              <ScanBarcode className="h-5 w-5" />
              <span className="text-xs">Scanner</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/ai-chef")}
            >
              <ChefHat className="h-5 w-5" />
              <span className="text-xs">AI Chef</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Lists;
