import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayerStatsComponent } from "@/components/player/player-stats";
import { PlayerRadarChart } from "@/components/player/player-radar-chart";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { questAPI, workoutAPI, userAPI } from "@/services/api";
import {
  Calendar,
  Target,
  Trophy,
  Activity,
  Apple,
  Dumbbell,
  Clock,
  TrendingUp,
  Plus,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's player stats
  const { data: playerStats, isLoading: statsLoading } = useQuery({
    queryKey: ['player-stats'],
    queryFn: () => userAPI.getPlayerStats(),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  // Fetch ALL quests (not just active ones) with normalization
  const { data: allQuests = [], isLoading: questsLoading } = useQuery({
    queryKey: ['quests', 'all'],
    queryFn: async () => {
      try {
        const response = await questAPI.getAll(); // Get all quests, not just active
        // console.log('Dashboard - Raw quest data from API:', response.data);
        
        // Normalize quest data to ensure quest_id field exists
        const normalizedQuests = response.data.map((quest: any, index: number) => {
          // Try multiple possible ID field names from your backend
          const questId = quest.quest_id || quest.id || quest.questId || quest.questID || (Date.now() + index);
          
          // console.log(`Dashboard - Quest "${quest.title}" - Original:`, quest, 'Extracted ID:', questId);
          
          return {
            ...quest,
            quest_id: questId, // Ensure quest_id field exists
            // Also keep the original ID field if it exists
            id: quest.id || questId,
          };
        });
        
        // console.log('Dashboard - Normalized quest data:', normalizedQuests);
        return normalizedQuests;
      } catch (error) {
        console.warn('Dashboard - API quest fetch failed:', error);
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  // Fetch recent workouts
  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['workouts', 'recent'],
    queryFn: () => workoutAPI.getUserWorkouts(3),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async (questId: number) => {
      // Validate questId before making the API call
      if (!questId || questId === undefined || isNaN(questId)) {
        throw new Error('Invalid quest ID');
      }
      
      // console.log('Dashboard - Attempting to complete quest with ID:', questId);
      
      try {
        const response = await questAPI.complete(questId);
        // console.log('Dashboard - Quest completion response:', response.data);
        return response.data;
      } catch (error) {
        console.warn('Dashboard - API quest completion failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh quests and player stats
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['player-stats'] });
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>Quest completed! XP awarded!</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    },
    onError: (error) => {
      console.error('Dashboard - Error completing quest:', error);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>Error completing quest. Please try again.</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    },
  });

  // Mock nutrition data (replace with real API when available)
  const [todayNutrition] = useState({
    calories: 1450,
    protein: 85,
    carbs: 120,
    fat: 45,
    targets: {
      calories: 2200,
      protein: 120,
      carbs: 200,
      fat: 70,
    }
  });

  // Helper function to get quest ID (handles both quest_id and id fields)
  const getQuestId = (quest: any): number => {
    const questId = quest.quest_id || quest.id || quest.questId || quest.questID;
    // console.log(`Dashboard - Getting quest ID for "${quest.title}":`, questId, 'from quest object:', quest);
    return questId;
  };

  const handleCompleteQuest = (questId: number) => {
    // Validate questId before calling mutation
    if (!questId || questId === undefined || isNaN(questId)) {
      console.error('Dashboard - Invalid quest ID:', questId);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>Error: Invalid quest ID</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      return;
    }
    
    // console.log('Dashboard - Completing quest with ID:', questId);
    completeQuestMutation.mutate(questId);
  };

  // Helper function to check if a quest is due today
  const isQuestDueToday = (quest: any): boolean => { //due_date = datetime.utcnow() + timedelta(days=due_days)
    const today = new Date();
    const currentDay = today.getDate();
    today.setDate(currentDay + 1);
    const newday = today.toDateString();
    const questDate = new Date(quest.due_date).toDateString();
    return newday === questDate;
  };

  // Helper function to check if a quest is overdue
  const isQuestOverdue = (quest: any): boolean => {
    const today = new Date();
    const questDate = new Date(quest.due_date);
    return questDate < today && quest.status !== 'completed';
  };

  // Filter quests for dashboard display
  const todayQuests = allQuests.filter(quest => isQuestDueToday(quest));
  const overdueQuests = allQuests.filter(quest => isQuestOverdue(quest));
  
  // Combine today's quests with overdue quests for dashboard display
  const dashboardQuests = [...todayQuests, ...overdueQuests];

  // Calculate quest progress for today's quests only
  const todayCompletedQuests = todayQuests.filter(q => q.status === 'completed').length;
  const todayTotalQuests = todayQuests.length;
  const questProgress = todayTotalQuests > 0 ? (todayCompletedQuests / todayTotalQuests) * 100 : 0;

  // Show loading state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your dashboard.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, <span className="text-purple-600">{user?.username || 'User'}</span>!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to level up your life today? Let's check your progress.
          </p>
        </div>

        {/* Debug Info for Dashboard Quests */}
        {/* {dashboardQuests.length > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>Dashboard Debug:</strong> Found {dashboardQuests.length} quests ({todayQuests.length} today, {overdueQuests.length} overdue). 
            Check browser console for detailed quest data and ID information.
          </div>
        )} */}

        {/* Player Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Radar Chart */}
          <div className="lg:col-span-1">
            {statsLoading ? (
              <Card className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </Card>
            ) : playerStats ? (
              <PlayerRadarChart stats={playerStats} />
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                No player stats available
              </div>
            )}
          </div>

          {/* Detailed Stats */}
          <div className="lg:col-span-2">
            {statsLoading ? (
              <Card className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </Card>
            ) : playerStats ? (
              <PlayerStatsComponent stats={playerStats} />
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                No player stats available
              </div>
            )}
          </div>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Daily Quest Progress */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                <Target className="h-5 w-5" />
                <span>Today's Quests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {questsLoading ? '...' : `${todayCompletedQuests}/${todayTotalQuests}`}
                  </span>
                  <Badge variant="secondary" className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                    {questsLoading ? '...' : `${Math.round(questProgress)}%`}
                  </Badge>
                </div>
                <Progress value={questProgress} className="h-2" />
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {questsLoading ? 'Loading...' : `${todayTotalQuests - todayCompletedQuests} quests remaining today`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workout Streak */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <Activity className="h-5 w-5" />
                <span>Recent Workouts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {workoutsLoading ? '...' : workouts.length}
                  </span>
                  <Badge variant="secondary" className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                    This week
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-sm text-green-700 dark:text-green-300">
                  <TrendingUp className="h-3 w-3" />
                  <span>Keep it up!</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Progress */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
                <Apple className="h-5 w-5" />
                <span>Nutrition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {todayNutrition.calories}
                  </span>
                  <Badge variant="secondary" className="bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200">
                    kcal
                  </Badge>
                </div>
                <Progress 
                  value={(todayNutrition.calories / todayNutrition.targets.calories) * 100} 
                  className="h-2" 
                />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {todayNutrition.targets.calories - todayNutrition.calories} kcal remaining
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly XP */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <Trophy className="h-5 w-5" />
                <span>Total XP</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {statsLoading ? '...' : (playerStats?.total_xp || 0).toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                    XP
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 text-sm text-blue-700 dark:text-blue-300">
                  <TrendingUp className="h-3 w-3" />
                  <span>Level {statsLoading ? '...' : (playerStats?.level || 1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quest List - Today's Quests + Overdue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Today's Quests & Overdue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading quests...</span>
              </div>
            ) : dashboardQuests.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quests for today</p>
                <p className="text-sm text-muted-foreground">Create some quests to start your journey!</p>
                <Button className="mt-4" onClick={() => window.location.href = '/quests'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quest
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Today's Quests Section */}
                {todayQuests.length > 0 && (
                  <>
                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-foreground">Today's Quests</h3>
                      <Badge variant="secondary">{todayQuests.length}</Badge>
                    </div>
                    {todayQuests.map((quest) => {
                      const isCompleted = quest.status === 'completed';
                      const totalXpReward: number = Object.values(quest.xp_reward || {}).reduce((sum: number, xp: unknown) => {
                        return sum + (typeof xp === 'number' ? xp : 0);
                      }, 0);
                      
                      // Get quest ID using helper function
                      const questId = getQuestId(quest);
                      const hasValidId = questId && !isNaN(questId) && questId !== undefined && questId !== null;

                      // console.log('Dashboard - Today Quest card - Quest:', quest.title, 'ID:', questId, 'Valid:', hasValidId, 'Full quest:', quest);
                      
                      return (
                        <div 
                          key={questId || quest.title} 
                          className={`p-4 rounded-lg border transition-all duration-200 ${
                            isCompleted 
                              ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 opacity-60' 
                              : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2 flex-wrap">
                                <h3 className={`font-semibold ${isCompleted ? 'text-green-800 dark:text-green-200' : 'text-foreground'}`}>
                                  {quest.title}
                                </h3>
                                {isCompleted && (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    quest.type === 'fitness' ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950/50' :
                                    quest.type === 'nutrition' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-950/50' :
                                    quest.type === 'learning' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/50' :
                                    'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-950/50'
                                  }`}
                                >
                                  {quest.type}
                                </Badge>
                                {!hasValidId && (
                                  <Badge variant="outline" className="text-red-600 border-red-200">
                                    Invalid ID
                                  </Badge>
                                )}
                                {/* Debug badge showing the actual ID */}
                                <Badge variant="outline" className="text-xs text-slate-500">
                                  ID: {questId || 'missing'}
                                </Badge>
                              </div>
                              <p className={`text-sm mb-3 ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
                                {quest.description}
                              </p>
                              
                              {/* XP Reward Display */}
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Zap className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-medium text-foreground">
                                    {totalXpReward} XP Reward
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {Object.entries(quest.xp_reward || {}).map(([stat, xp]) => (
                                    <Badge key={stat} variant="secondary" className="text-xs">
                                      {stat} +{typeof xp === 'number' ? xp : 0}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              <Button 
                                size="sm" 
                                onClick={() => handleCompleteQuest(questId)}
                                disabled={isCompleted || completeQuestMutation.isPending || !hasValidId}
                                className={`${
                                  isCompleted 
                                    ? 'bg-green-600 hover:bg-green-600 text-white cursor-default' 
                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                }`}
                              >
                                {completeQuestMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Completing...
                                  </>
                                ) : isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Complete Quest
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {!hasValidId && (
                            <div className="text-xs text-red-600 text-center mt-2">
                              Quest ID missing - cannot perform actions
                            </div>
                          )}
                          
                          {isCompleted && quest.completed_at && (
                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Completed on {new Date(quest.completed_at).toLocaleDateString()} at {new Date(quest.completed_at).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Overdue Quests Section */}
                {overdueQuests.length > 0 && (
                  <>
                    {todayQuests.length > 0 && <div className="my-6 border-t border-border"></div>}
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-600">Overdue Quests</h3>
                      <Badge variant="destructive">{overdueQuests.length}</Badge>
                    </div>
                    {overdueQuests.map((quest) => {
                      const isCompleted = quest.status === 'completed';
                      const totalXpReward: number = Object.values(quest.xp_reward || {}).reduce((sum: number, xp: unknown) => {
                        return sum + (typeof xp === 'number' ? xp : 0);
                      }, 0);
                      
                      // Get quest ID using helper function
                      const questId = getQuestId(quest);
                      const hasValidId = questId && !isNaN(questId) && questId !== undefined && questId !== null;

                      // console.log('Dashboard - Overdue Quest card - Quest:', quest.title, 'ID:', questId, 'Valid:', hasValidId, 'Full quest:', quest);
                      
                      return (
                        <div 
                          key={questId || quest.title} 
                          className={`p-4 rounded-lg border transition-all duration-200 ${
                            isCompleted 
                              ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 opacity-60' 
                              : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2 flex-wrap">
                                <h3 className={`font-semibold ${isCompleted ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                  {quest.title}
                                </h3>
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    quest.type === 'fitness' ? 'border-red-300 text-red-800 bg-red-100 dark:border-red-700 dark:text-red-200 dark:bg-red-900/50' :
                                    quest.type === 'nutrition' ? 'border-orange-300 text-orange-800 bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:bg-orange-900/50' :
                                    quest.type === 'learning' ? 'border-blue-300 text-blue-800 bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:bg-blue-900/50' :
                                    'border-purple-300 text-purple-800 bg-purple-100 dark:border-purple-700 dark:text-purple-200 dark:bg-purple-900/50'
                                  }`}
                                >
                                  {quest.type}
                                </Badge>
                                <Badge variant="destructive" className="text-xs">
                                  Overdue
                                </Badge>
                                {!hasValidId && (
                                  <Badge variant="outline" className="text-red-600 border-red-200">
                                    Invalid ID
                                  </Badge>
                                )}
                                {/* Debug badge showing the actual ID */}
                                <Badge variant="outline" className="text-xs text-slate-500">
                                  ID: {questId || 'missing'}
                                </Badge>
                              </div>
                              <p className={`text-sm mb-3 ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                {quest.description}
                              </p>
                              
                              {/* Due Date Display */}
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4 text-red-500" />
                                  <span className="text-sm font-medium text-red-600">
                                    Due: {new Date(quest.due_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Zap className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-medium text-foreground">
                                    {totalXpReward} XP Reward
                                  </span>
                                </div>
                              </div>
                              
                              {/* XP Breakdown */}
                              <div className="flex items-center space-x-2">
                                {Object.entries(quest.xp_reward || {}).map(([stat, xp]) => (
                                  <Badge key={stat} variant="secondary" className="text-xs">
                                    {stat} +{typeof xp === 'number' ? xp : 0}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              <Button 
                                size="sm" 
                                onClick={() => handleCompleteQuest(questId)}
                                disabled={isCompleted || completeQuestMutation.isPending || !hasValidId}
                                className={`${
                                  isCompleted 
                                    ? 'bg-green-600 hover:bg-green-600 text-white cursor-default' 
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                              >
                                {completeQuestMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Completing...
                                  </>
                                ) : isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Complete Quest
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {!hasValidId && (
                            <div className="text-xs text-red-600 text-center mt-2">
                              Quest ID missing - cannot perform actions
                            </div>
                          )}
                          
                          {isCompleted && quest.completed_at && (
                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Completed on {new Date(quest.completed_at).toLocaleDateString()} at {new Date(quest.completed_at).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5" />
                <span>Recent Workouts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Dumbbell className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {workout.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {new Date(workout.date_logged).toLocaleDateString()} •{" "}
                          {workout.duration_minutes} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {Object.entries(workout.xp_earned || {}).map(([stat, xp]) => (
                        <Badge key={stat} variant="secondary" className="text-xs">
                          {stat} +{typeof xp === 'number' ? xp : 0}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}