import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Apple,
  Target,
  TrendingUp,
  Zap,
  Droplets,
  Clock,
  Plus,
  Calendar,
  Activity,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { nutritionAPI, nutritionAnalyticsAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";

export default function NutritionDashboard() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's nutrition data
  const { data: todayNutrition, isLoading: nutritionLoading, error: nutritionError } = useQuery({
    queryKey: ['nutrition', 'daily-summary', today],
    queryFn: () => nutritionAPI.getDailySummary(today),
    enabled: isAuthenticated,
    select: (response) => response.data,
    retry: false,
  });

  // Fetch recent food logs
  const { data: recentMeals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ['nutrition', 'food-logs', today],
    queryFn: () => nutritionAPI.getFoodLogs(today),
    enabled: isAuthenticated,
    select: (response) => response.data.slice(0, 3), // Get last 3 meals
    retry: false,
  });

  // Fetch water intake data from real API
  const { data: waterData, isLoading: waterLoading } = useQuery({
    queryKey: ['nutrition', 'water'],
    queryFn: () => nutritionAnalyticsAPI.getWaterIntake(),
    enabled: isAuthenticated,
    select: (response) => response.data.data,
    retry: false,
  });

  // Fetch weekly nutrition data from real API
  const { data: weeklyNutritionResponse, isLoading: weeklyLoading } = useQuery({
    queryKey: ['nutrition', 'weekly'],
    queryFn: () => nutritionAnalyticsAPI.getWeeklyNutrition(1), // Get 1 week
    enabled: isAuthenticated,
    select: (response) => response.data,
    retry: false,
  });

  const weeklyData = weeklyNutritionResponse?.data || [];

  // Log water mutation
  const logWaterMutation = useMutation({
    mutationFn: (amount_ml: number) => nutritionAnalyticsAPI.logWater(amount_ml),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'water'] });
    },
  });

  // Default targets (these would come from user preferences in real app)
  const targets = {
    calories: 2200,
    protein: 150,
    carbs: 220,
    fat: 75,
    fiber: 30,
    sugar: 50,
    sodium: 2000,
    water: 3.0,
  };

  // Calculate progress percentages
  const calorieProgress = todayNutrition ? (todayNutrition.total_calories / targets.calories) * 100 : 0;
  const proteinProgress = todayNutrition ? (todayNutrition.total_protein_g / targets.protein) * 100 : 0;
  const carbProgress = todayNutrition ? (todayNutrition.total_carbs_g / targets.carbs) * 100 : 0;
  const fatProgress = todayNutrition ? (todayNutrition.total_fat_g / targets.fat) * 100 : 0;

  // Water progress from real API data
  const waterProgress = waterData ? (waterData.total_ml / waterData.target_ml) * 100 : 0;
  const waterRemaining = waterData ? (waterData.target_ml - waterData.total_ml) / 1000 : 0; // Convert to liters

  // Prepare macro data for pie chart
  const macroData = todayNutrition ? [
    { name: 'Protein', value: todayNutrition.total_protein_g, color: '#ef4444', target: targets.protein },
    { name: 'Carbs', value: todayNutrition.total_carbs_g, color: '#3b82f6', target: targets.carbs },
    { name: 'Fat', value: todayNutrition.total_fat_g, color: '#f59e0b', target: targets.fat },
  ] : [];

  const handleLogWater = (amount: number) => {
    logWaterMutation.mutate(amount);
  };

  const navigateToLogFood = () => {
    navigate('/nutrition?tab=log-food');
  };

  const navigateToMealPlanner = () => {
    navigate('/nutrition?tab=meal-planner');
  };

  const navigateToHistory = () => {
    navigate('/nutrition?tab=history');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view nutrition data.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, <span className="text-green-600">Nutrition Warrior</span>!
        </h1>
        <p className="text-lg text-slate-600">Track your fuel and optimize your performance</p>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Calories */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-blue-700">
              <span className="text-lg font-bold">Calories</span>
              <Target className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-900">
                  {nutritionLoading ? '...' : (todayNutrition?.total_calories || 0)}
                </span>
                <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                  {Math.round(calorieProgress)}%
                </Badge>
              </div>
              <Progress value={calorieProgress} className="h-2" />
              <p className="text-sm text-blue-700">
                {targets.calories - (todayNutrition?.total_calories || 0)} kcal remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Protein */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-red-700">
              <span className="text-lg font-bold">Protein</span>
              <Activity className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-900">
                  {nutritionLoading ? '...' : Math.round(todayNutrition?.total_protein_g || 0)}g
                </span>
                <Badge variant="secondary" className="bg-red-200 text-red-800">
                  {Math.round(proteinProgress)}%
                </Badge>
              </div>
              <Progress value={proteinProgress} className="h-2" />
              <p className="text-sm text-red-700">
                {targets.protein - Math.round(todayNutrition?.total_protein_g || 0)}g remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Carbs */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-yellow-700">
              <span className="text-lg font-bold">Carbs</span>
              <Zap className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-yellow-900">
                  {nutritionLoading ? '...' : Math.round(todayNutrition?.total_carbs_g || 0)}g
                </span>
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                  {Math.round(carbProgress)}%
                </Badge>
              </div>
              <Progress value={carbProgress} className="h-2" />
              <p className="text-sm text-yellow-700">
                {targets.carbs - Math.round(todayNutrition?.total_carbs_g || 0)}g remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Water - Using real API data */}
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-cyan-700">
              <span className="text-lg font-bold">Water</span>
              <Droplets className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-cyan-900">
                  {waterLoading ? '...' : waterData ? `${(waterData.total_ml / 1000).toFixed(1)}L` : '0L'}
                </span>
                <Badge variant="secondary" className="bg-cyan-200 text-cyan-800">
                  {Math.round(waterProgress)}%
                </Badge>
              </div>
              <Progress value={waterProgress} className="h-2" />
              <p className="text-sm text-cyan-700">
                {waterRemaining > 0 ? `${waterRemaining.toFixed(1)}L remaining` : 'Target reached!'}
              </p>
              
              {/* Quick water logging buttons */}
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleLogWater(250)}
                  disabled={logWaterMutation.isPending}
                  className="flex-1 text-xs"
                >
                  +250ml
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleLogWater(500)}
                  disabled={logWaterMutation.isPending}
                  className="flex-1 text-xs"
                >
                  +500ml
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Log Food */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={navigateToLogFood}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <Plus className="h-6 w-6" />
              <span>Log Food</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 mb-4">Add meals and track your nutrition intake.</p>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToLogFood();
                    }}>
              <Plus className="h-4 w-4 mr-2" />
              Log Food
            </Button>
          </CardContent>
        </Card>

        {/* Meal Planner */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={navigateToMealPlanner}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Calendar className="h-6 w-6" />
              <span>Meal Planner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-600 mb-4">Plan your meals and optimize nutrition.</p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToMealPlanner();
                    }}>
              <Calendar className="h-4 w-4 mr-2" />
              Plan Meals
            </Button>
          </CardContent>
        </Card>

        {/* Nutrition History */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={navigateToHistory}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <TrendingUp className="h-6 w-6" />
              <span>View History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-600 mb-4">Analyze your nutrition trends and progress.</p>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToHistory();
                    }}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Macro Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Apple className="h-5 w-5" />
              <span>Today's Macros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nutritionLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : nutritionError ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Unable to load nutrition data</p>
                  <p className="text-sm text-slate-500">Check your backend connection</p>
                </div>
              </div>
            ) : macroData.length > 0 && todayNutrition ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}g`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  {macroData.map((macro) => (
                    <div key={macro.name} className="text-center">
                      <div className="flex items-center space-x-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: macro.color }}
                        ></div>
                        <span className="text-sm font-medium">{macro.name}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {Math.round(macro.value)}g / {macro.target}g
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Apple className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No nutrition data for today</p>
                  <p className="text-sm text-slate-500">Start logging food to see your macros</p>
                  <Button className="mt-4" onClick={navigateToLogFood}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your First Meal
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trends - Using real API data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Weekly Calories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : weeklyData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No weekly nutrition data</p>
                  <p className="text-sm text-slate-500">Log nutrition for a few days to see trends</p>
                  <Button className="mt-4" onClick={navigateToLogFood}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Logging
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Meals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Meals</span>
            </div>
            <Button variant="outline" size="sm" onClick={navigateToHistory}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mealsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading meals...</span>
            </div>
          ) : recentMeals.length > 0 ? (
            <div className="space-y-4">
              {recentMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Apple className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{meal.food_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>{new Date(meal.logged_at).toLocaleTimeString()}</span>
                        <Badge variant="outline" className="text-xs">
                          {meal.meal_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {Math.round(meal.calories_per_serving * meal.servings_consumed)} kcal
                    </div>
                    <div className="text-sm text-slate-600">
                      P: {Math.round(meal.protein_g * meal.servings_consumed)}g • 
                      C: {Math.round(meal.carbs_g * meal.servings_consumed)}g • 
                      F: {Math.round(meal.fat_g * meal.servings_consumed)}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Apple className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">No meals logged today</p>
              <p className="text-sm text-slate-500">Start logging food to track your nutrition</p>
              <Button className="mt-4" onClick={navigateToLogFood}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Meal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}