import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Target,
  Apple,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { nutritionAnalyticsAPI } from "@/services/api";

export default function NutritionHistory() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");

  // Fetch nutrition history from real API
  const { data: nutritionHistoryResponse, isLoading } = useQuery({
    queryKey: ['nutrition', 'history'],
    queryFn: () => nutritionAnalyticsAPI.getNutritionHistory(30, 0),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  const nutritionHistory = nutritionHistoryResponse?.data || [];

  // Filter and sort history
  const filteredHistory = nutritionHistory
    .filter((day: any) => {
      const matchesSearch = day.date.includes(searchTerm);
      const matchesFilter = filterBy === "all" || 
        (filterBy === "high_protein" && day.total_protein_g > 120) ||
        (filterBy === "low_calorie" && day.total_calories < 2000) ||
        (filterBy === "complete" && day.meals_logged >= 4);
      return matchesSearch && matchesFilter;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "calories":
          return b.total_calories - a.total_calories;
        case "protein":
          return b.total_protein_g - a.total_protein_g;
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalDays = nutritionHistory.length;
  const avgCalories = totalDays > 0 ? Math.round(nutritionHistory.reduce((sum: number, day: any) => sum + day.total_calories, 0) / totalDays) : 0;
  const avgProtein = totalDays > 0 ? Math.round(nutritionHistory.reduce((sum: number, day: any) => sum + day.total_protein_g, 0) / totalDays) : 0;
  const totalXP = nutritionHistory.reduce((sum: number, day: any) => sum + Object.values(day.xp_earned).reduce((a: any, b: any) => a + b, 0), 0);

  // Transform data for charts
  const chartData = nutritionHistory.slice().reverse().map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: day.total_calories,
    protein: day.total_protein_g,
    carbs: day.total_carbs_g,
    fat: day.total_fat_g,
    fiber: day.total_fiber_g,
  }));

  // Average macros for pie chart
  const avgMacros = totalDays > 0 ? nutritionHistory.reduce((acc: any, day: any) => ({
    protein: acc.protein + day.total_protein_g,
    carbs: acc.carbs + day.total_carbs_g,
    fat: acc.fat + day.total_fat_g,
  }), { protein: 0, carbs: 0, fat: 0 }) : { protein: 0, carbs: 0, fat: 0 };

  const macroData = totalDays > 0 ? [
    { name: 'Protein', value: Math.round(avgMacros.protein / totalDays), color: '#ef4444' },
    { name: 'Carbs', value: Math.round(avgMacros.carbs / totalDays), color: '#3b82f6' },
    { name: 'Fat', value: Math.round(avgMacros.fat / totalDays), color: '#f59e0b' },
  ] : [];

  const viewDayDetails = (dayId: number) => {
    console.log("Viewing day details for:", dayId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view nutrition history.</p>
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nutrition History</h1>
        <p className="text-slate-600">Analyze your nutrition trends and progress</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Days Tracked</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : totalDays}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Calories</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : avgCalories}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Protein</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : avgProtein}g
                </p>
              </div>
              <Apple className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total XP</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : totalXP}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {!isLoading && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calorie Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Calorie Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
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
            </CardContent>
          </Card>

          {/* Average Macro Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Apple className="h-5 w-5" />
                <span>Average Macro Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {macroData.length > 0 ? (
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
                        <div className="text-xs text-slate-600">{macro.value}g avg</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Apple className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No nutrition data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Macro Trends */}
      {!isLoading && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Macro Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="protein" stroke="#ef4444" strokeWidth={2} name="Protein" />
                  <Line type="monotone" dataKey="carbs" stroke="#3b82f6" strokeWidth={2} name="Carbs" />
                  <Line type="monotone" dataKey="fat" stroke="#f59e0b" strokeWidth={2} name="Fat" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="calories">Calories</SelectItem>
                <SelectItem value="protein">Protein</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                <SelectItem value="high_protein">High Protein</SelectItem>
                <SelectItem value="low_calorie">Low Calorie</SelectItem>
                <SelectItem value="complete">Complete Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading nutrition history...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Apple className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No nutrition data found
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || filterBy !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start logging your nutrition to see your history here"
                }
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setFilterBy("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((day: any) => (
            <Card key={day.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {day.meals_logged} meals
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-900">{day.total_calories}</div>
                        <div className="text-xs text-blue-700">Calories</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-900">{day.total_protein_g}g</div>
                        <div className="text-xs text-red-700">Protein</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-900">{day.total_carbs_g}g</div>
                        <div className="text-xs text-yellow-700">Carbs</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-900">{day.total_fat_g}g</div>
                        <div className="text-xs text-green-700">Fat</div>
                      </div>
                    </div>

                    {/* XP Earned */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">XP Earned:</span>
                      {Object.entries(day.xp_earned).map(([stat, xp]) => (
                        <Badge key={stat} variant="secondary" className="text-xs">
                          {stat} +{xp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewDayDetails(day.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredHistory.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Days
          </Button>
        </div>
      )}
    </div>
  );
}