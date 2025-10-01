import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const AIChef = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recipe");
  const [dishName, setDishName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateRecipe = () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setLoading(false);
      setGeneratedRecipe({
        name: dishName || "Spaghetti Carbonara",
        servings: 4,
        time: "30 mins",
        difficulty: "Medium",
        ingredients: [
          { name: "Spaghetti", quantity: "400g" },
          { name: "Eggs", quantity: "4 large" },
          { name: "Parmesan cheese", quantity: "100g" },
          { name: "Pancetta", quantity: "150g" },
          { name: "Black pepper", quantity: "to taste" },
          { name: "Salt", quantity: "to taste" },
        ],
      });
    }, 2000);
  };

  const handleGenerateIdeas = () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setLoading(false);
      setGeneratedRecipe({
        name: "Creative Tuna Carrot Salad",
        servings: 2,
        time: "15 mins",
        difficulty: "Easy",
        ingredients: [
          { name: "Canned tuna", quantity: "200g" },
          { name: "Carrots", quantity: "2 medium" },
          { name: "Mixed greens", quantity: "100g" },
          { name: "Lemon juice", quantity: "2 tbsp" },
          { name: "Olive oil", quantity: "3 tbsp" },
          { name: "Cherry tomatoes", quantity: "10 pieces" },
        ],
        suggestions: [
          "Tuna Carrot Patties",
          "Tuna Carrot Stir Fry",
          "Carrot Tuna Pasta",
        ],
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
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
            <h1 className="text-2xl font-bold">AI Chef</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipe">Recipe Generator</TabsTrigger>
            <TabsTrigger value="ideas">Cooking Ideas</TabsTrigger>
          </TabsList>

          <TabsContent value="recipe" className="space-y-6 mt-6">
            {/* Recipe Generator Form */}
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Recipe Generator</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter a dish name to get a complete ingredient list
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., Chicken Tikka Masala"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>

                <Button
                  className="w-full h-12 font-semibold"
                  onClick={handleGenerateRecipe}
                  disabled={loading || !dishName}
                >
                  {loading ? (
                    "Generating..."
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Recipe
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Generated Recipe */}
            {generatedRecipe && activeTab === "recipe" && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-3">
                      {generatedRecipe.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {generatedRecipe.servings} servings
                      </Badge>
                      <Badge variant="secondary">
                        {generatedRecipe.time}
                      </Badge>
                      <Badge variant="secondary">
                        {generatedRecipe.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Ingredients</h4>
                    <div className="space-y-2">
                      {generatedRecipe.ingredients.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {item.quantity}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <Button className="w-full h-12 font-semibold">
                    <Plus className="mr-2 h-5 w-5" />
                    Add All to Shopping List
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ideas" className="space-y-6 mt-6">
            {/* Cooking Ideas Form */}
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Cooking Ideas</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter ingredients you have to discover new recipes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="e.g., tuna, carrot, onion"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="h-12"
                />

                <Button
                  className="w-full h-12 font-semibold"
                  onClick={handleGenerateIdeas}
                  disabled={loading || !ingredients}
                >
                  {loading ? (
                    "Generating..."
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Cooking Ideas
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Generated Ideas */}
            {generatedRecipe && activeTab === "ideas" && (
              <>
                {generatedRecipe.suggestions && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4">
                      Recipe Suggestions
                    </h3>
                    <div className="grid gap-3">
                      {generatedRecipe.suggestions.map(
                        (suggestion: string, index: number) => (
                          <button
                            key={index}
                            className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Utensils className="h-5 w-5 text-primary" />
                              <span className="font-medium">{suggestion}</span>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </Card>
                )}

                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-3">
                        {generatedRecipe.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {generatedRecipe.servings} servings
                        </Badge>
                        <Badge variant="secondary">
                          {generatedRecipe.time}
                        </Badge>
                        <Badge variant="secondary">
                          {generatedRecipe.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Ingredients</h4>
                      <div className="space-y-2">
                        {generatedRecipe.ingredients.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                            >
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {item.quantity}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <Button className="w-full h-12 font-semibold">
                      <Plus className="mr-2 h-5 w-5" />
                      Add All to Shopping List
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AIChef;
