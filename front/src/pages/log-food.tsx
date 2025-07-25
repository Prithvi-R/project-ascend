import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Minus,
  Save,
  X,
  Apple,
  Clock,
  Target,
  Zap,
  Camera,
  Scan,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { nutritionAPI, foodDatabaseAPI } from "@/services/api";

interface LoggedFood {
  id: number;
  food_name: string;
  brand?: string;
  serving_size: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  servings_consumed: number;
  meal_type: string;
}

export default function LogFood() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Search food database using the new food database API
  const { data: searchResults = [], isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['food-database', 'search', searchTerm],
    queryFn: async () => {
      const response = await foodDatabaseAPI.search(searchTerm, 20);
      return response.data.data;
    },
    enabled: isAuthenticated && searchTerm.length > 2,
  });

  // Log food mutation
  const logFoodMutation = useMutation({
    mutationFn: async (foodData: any) => {
      // Format the data properly for the backend
      const now = new Date();
      const formattedData = {
        ...foodData,
        // logged_at: now,
        calories_per_serving: Number(foodData.calories_per_serving),
        protein_g: Number(foodData.protein_g),
        carbs_g: Number(foodData.carbs_g),
        fat_g: Number(foodData.fat_g),
        fiber_g: foodData.fiber_g ? Number(foodData.fiber_g) : null,
        sugar_g: foodData.sugar_g ? Number(foodData.sugar_g) : null,
        sodium_mg: foodData.sodium_mg ? Number(foodData.sodium_mg) : null,
        servings_consumed: Number(foodData.servings_consumed),
      };
      
      console.log('Sending food data to backend:', formattedData);
      const response = await nutritionAPI.logFood(formattedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      // Reset form
      setLoggedFoods([]);
      setSelectedMealType("breakfast");
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>Meal logged successfully!</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    },
    onError: (error) => {
      console.error('Error logging meal:', error);
      // Create error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>Error logging meal. Please try again.</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    },
  });

  const addFood = (food: any) => {
    setSelectedFood(food);
    setServings(1);
    setIsDialogOpen(true);
  };

  const confirmAddFood = () => {
    if (selectedFood) {
      const newLoggedFood: LoggedFood = {
        id: Date.now(),
        food_name: selectedFood.name,
        brand: selectedFood.brand,
        serving_size: selectedFood.serving_size,
        calories_per_serving: selectedFood.calories,
        protein_g: selectedFood.protein,
        carbs_g: selectedFood.carbs,
        fat_g: selectedFood.fat,
        fiber_g: selectedFood.fiber,
        sugar_g: selectedFood.sugar,
        sodium_mg: selectedFood.sodium,
        servings_consumed: servings,
        meal_type: selectedMealType,
      };
      setLoggedFoods([...loggedFoods, newLoggedFood]);
      setIsDialogOpen(false);
      setSelectedFood(null);
      setServings(1);
    }
  };

  const removeFood = (id: number) => {
    setLoggedFoods(loggedFoods.filter(food => food.id !== id));
  };

  const updateServings = (id: number, newServings: number) => {
    if (newServings <= 0) return;
    setLoggedFoods(loggedFoods.map(food => 
      food.id === id ? { ...food, servings_consumed: newServings } : food
    ));
  };

  // Calculate totals
  const totals = loggedFoods.reduce((acc, loggedFood) => {
    const multiplier = loggedFood.servings_consumed;
    return {
      calories: acc.calories + (loggedFood.calories_per_serving * multiplier),
      protein: acc.protein + (loggedFood.protein_g * multiplier),
      carbs: acc.carbs + (loggedFood.carbs_g * multiplier),
      fat: acc.fat + (loggedFood.fat_g * multiplier),
      fiber: acc.fiber + ((loggedFood.fiber_g || 0) * multiplier),
      sodium: acc.sodium + ((loggedFood.sodium_mg || 0) * multiplier),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });

  const saveMeal = async () => {
    if (loggedFoods.length === 0) return;

    try {
      // Log each food item
      for (const food of loggedFoods) {
        await logFoodMutation.mutateAsync({
          food_name: food.food_name,
          brand: food.brand || null,
          serving_size: food.serving_size,
          calories_per_serving: food.calories_per_serving,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fat_g: food.fat_g,
          fiber_g: food.fiber_g || null,
          sugar_g: food.sugar_g || null,
          sodium_mg: food.sodium_mg || null,
          servings_consumed: food.servings_consumed,
          meal_type: food.meal_type,
        });
      }
    } catch (error) {
      console.error('Error in saveMeal:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to log food.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Log Food</h1>
          <p className="text-slate-600">Track your nutrition intake</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button variant="outline" size="sm">
            <Scan className="w-4 h-4 mr-2" />
            Barcode
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Food Search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meal Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Meal Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Food Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Foods</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search for foods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchTerm.length > 2 && (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Searching...</span>
                      </div>
                    ) : searchError ? (
                      <div className="text-center text-red-500 py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Error searching foods. Please try again.</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((food, index) => (
                        <div
                          key={index}
                          className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => addFood(food)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{food.name}</div>
                              {food.brand && (
                                <div className="text-sm text-slate-600">{food.brand}</div>
                              )}
                              <div className="text-sm text-slate-500">{food.serving_size}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-slate-900">{food.calories} kcal</div>
                              <div className="text-xs text-slate-600">
                                P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-8">
                        No foods found. Try a different search term.
                      </div>
                    )}
                  </div>
                )}

                {searchTerm.length > 0 && searchTerm.length <= 2 && (
                  <div className="text-center text-slate-500 py-4">
                    Type at least 3 characters to search
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logged Foods */}
          {loggedFoods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Apple className="h-5 w-5" />
                  <span>Added Foods</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loggedFoods.map((loggedFood) => (
                    <div key={loggedFood.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{loggedFood.food_name}</div>
                          {loggedFood.brand && (
                            <div className="text-sm text-slate-600">{loggedFood.brand}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFood(loggedFood.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateServings(loggedFood.id, loggedFood.servings_consumed - 0.5)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-medium min-w-[60px] text-center">
                            {loggedFood.servings_consumed} serving{loggedFood.servings_consumed !== 1 ? 's' : ''}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateServings(loggedFood.id, loggedFood.servings_consumed + 0.5)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            {Math.round(loggedFood.calories_per_serving * loggedFood.servings_consumed)} kcal
                          </div>
                          <div className="text-xs text-slate-600">
                            P: {Math.round(loggedFood.protein_g * loggedFood.servings_consumed)}g • 
                            C: {Math.round(loggedFood.carbs_g * loggedFood.servings_consumed)}g • 
                            F: {Math.round(loggedFood.fat_g * loggedFood.servings_consumed)}g
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Nutrition Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Nutrition Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">
                    {Math.round(totals.calories)}
                  </div>
                  <div className="text-sm text-blue-700">Total Calories</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Protein:</span>
                    <span className="font-medium">{Math.round(totals.protein)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Carbs:</span>
                    <span className="font-medium">{Math.round(totals.carbs)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fat:</span>
                    <span className="font-medium">{Math.round(totals.fat)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fiber:</span>
                    <span className="font-medium">{Math.round(totals.fiber)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sodium:</span>
                    <span className="font-medium">{Math.round(totals.sodium)}mg</span>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-slate-500 text-center">
                  Estimated XP: {Math.round(totals.calories / 10)} INT, {Math.round(totals.protein / 5)} END
                </div>
              </div>
            </CardContent>
          </Card>

          {loggedFoods.length > 0 && (
            <Button 
              onClick={saveMeal} 
              className="w-full"
              disabled={logFoodMutation.isPending}
            >
              {logFoodMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Add Food Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedFood?.name}</DialogTitle>
            <DialogDescription>
              Adjust the serving size and confirm to add this food to your meal.
            </DialogDescription>
          </DialogHeader>
          {selectedFood && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-900">{selectedFood.name}</div>
                {selectedFood.brand && (
                  <div className="text-sm text-slate-600">{selectedFood.brand}</div>
                )}
                <div className="text-sm text-slate-500">{selectedFood.serving_size}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Number of Servings</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    step="0.5"
                    min="0.1"
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServings(servings + 0.5)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-900">
                    {Math.round(selectedFood.calories * servings)} kcal
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    P: {Math.round(selectedFood.protein * servings)}g • 
                    C: {Math.round(selectedFood.carbs * servings)}g • 
                    F: {Math.round(selectedFood.fat * servings)}g
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={confirmAddFood} className="flex-1">
                  Add Food
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}