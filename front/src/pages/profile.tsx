import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { userAPI, questAPI, workoutAPI } from "@/services/api";
import {
  User,
  Edit3,
  Save,
  Camera,
  Crown,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Star,
  Trophy,
  Dumbbell,
  Activity,
  Heart,
  Brain,
  Users,
  Sword,
  Wind,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

const statIcons = {
  STR: Sword,
  AGI: Wind,
  END: Heart,
  INT: Brain,
  CHA: Users,
};

const statColors = {
  STR: "text-red-600 bg-red-100 border-red-200",
  AGI: "text-green-600 bg-green-100 border-green-200",
  END: "text-blue-600 bg-blue-100 border-blue-200",
  INT: "text-purple-600 bg-purple-100 border-purple-200",
  CHA: "text-yellow-600 bg-yellow-100 border-yellow-200",
};

const statNames = {
  STR: "Strength",
  AGI: "Agility",
  END: "Endurance",
  INT: "Intelligence",
  CHA: "Charisma",
};

export default function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [editedUser, setEditedUser] = useState(user || {});

  // Fetch player stats
  const { data: playerStats, isLoading: statsLoading } = useQuery({
    queryKey: ['player-stats'],
    queryFn: () => userAPI.getPlayerStats(),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  // Fetch completed quests for recent activity
  const { data: completedQuests = [] } = useQuery({
    queryKey: ['quests', 'completed'],
    queryFn: () => questAPI.getAll('completed'),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  // Fetch user's workouts for estimated workout count
  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutAPI.getUserWorkouts(),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (userData: any) => userAPI.updateProfile(userData),
    onSuccess: (response) => {
      updateUser(response.data);
      queryClient.invalidateQueries({ queryKey: ['player-stats'] });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(editedUser);
  };

  const handleCancel = () => {
    setEditedUser(user || {});
  };

  const levelProgress = playerStats ? ((playerStats.total_xp % 1000) / 1000 * 100) : 0;

  // Calculate achievements based on real data
  const calculateAchievements = () => {
    const achievements = [];
    
    // First workout achievement
    if (workouts.length > 0) {
      achievements.push({
        id: 1,
        title: "First Steps",
        description: "Complete your first workout",
        icon: "🏃",
        unlocked: true,
        unlockedAt: workouts[workouts.length - 1]?.created_at || new Date().toISOString(),
        xpReward: 50,
      });
    }

    // Consistency achievement (7+ workouts)
    if (workouts.length >= 7) {
      achievements.push({
        id: 2,
        title: "Consistency King",
        description: "Log 7 or more workouts",
        icon: "👑",
        unlocked: true,
        unlockedAt: workouts[6]?.created_at || new Date().toISOString(),
        xpReward: 200,
      });
    }

    // Strength achievement (STR >= 15)
    if (playerStats?.attributes.STR.value >= 15) {
      achievements.push({
        id: 3,
        title: "Strength Seeker",
        description: "Reach 15 Strength points",
        icon: "💪",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        xpReward: 150,
      });
    }

    // Quest completion achievement
    if (completedQuests.length >= 10) {
      achievements.push({
        id: 4,
        title: "Quest Master",
        description: "Complete 10 quests",
        icon: "📚",
        unlocked: true,
        unlockedAt: completedQuests[9]?.completed_at || new Date().toISOString(),
        xpReward: 300,
      });
    }

    // Level achievement
    if (playerStats?.level >= 10) {
      achievements.push({
        id: 5,
        title: "Level Master",
        description: "Reach level 10",
        icon: "⭐",
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        xpReward: 500,
      });
    }

    return achievements;
  };

  const achievements = calculateAchievements();
  const totalXpFromAchievements = achievements.reduce((sum, a) => sum + a.xpReward, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Player Profile</h1>
          <p className="text-lg text-slate-600">Manage your character and track your journey</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Header */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={user?.username} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {user?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-slate-200">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">{user?.username}</h2>
                      <p className="text-lg text-slate-600">{user?.email}</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                        <Crown className="w-4 h-4 mr-1" />
                        Level {playerStats?.level || 1}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                        <Zap className="w-4 h-4 mr-1" />
                        {(playerStats?.total_xp || 0).toLocaleString()} XP
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                        <Target className="w-4 h-4 mr-1" />
                        {user?.primary_goal?.replace('_', ' ') || 'General Fitness'}
                      </Badge>
                    </div>

                    {/* Level Progress */}
                    {playerStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Progress to Level {playerStats.level + 1}</span>
                          <span>{playerStats.xp_to_next_level || 0} XP needed</span>
                        </div>
                        <Progress value={levelProgress} className="h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.floor((new Date().getTime() - new Date(user?.created_at || 0).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-slate-600">Days Active</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Dumbbell className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900">
                    {workouts.length}
                  </div>
                  <div className="text-sm text-slate-600">Workouts Completed</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900">{completedQuests.length}</div>
                  <div className="text-sm text-slate-600">Quests Completed</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedQuests.slice(0, 3).map((quest) => (
                    <div key={quest.quest_id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">Completed "{quest.title}" quest</div>
                        <div className="text-sm text-slate-600">
                          Gained {Object.values(quest.xp_reward).reduce((sum, xp) => sum + xp, 0)} XP • {quest.completed_at ? new Date(quest.completed_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {completedQuests.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">Complete some quests to see your activity here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading stats...</span>
              </div>
            ) : playerStats ? (
              <>
                {/* Attribute Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(playerStats.attributes).map(([statKey, statData]) => {
                    const Icon = statIcons[statKey as keyof typeof statIcons];
                    const colorClass = statColors[statKey as keyof typeof statColors];
                    const statName = statNames[statKey as keyof typeof statNames];
                    const statProgress = ((statData.xp % 100) / 100) * 100;

                    return (
                      <Card key={statKey} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="text-center space-y-4">
                            <div className={`p-3 rounded-lg mx-auto w-fit ${colorClass}`}>
                              <Icon className="h-8 w-8" />
                            </div>
                            
                            <div>
                              <div className="text-3xl font-bold text-slate-900">{statData.value}</div>
                              <div className="text-sm font-medium text-slate-700">{statName}</div>
                            </div>

                            <div className="space-y-2">
                              <Progress value={statProgress} className="h-2" />
                              <div className="text-xs text-slate-500">
                                {statData.xp} XP • {100 - (statData.xp % 100)} to next level
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Stat History Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Stat Progression</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                      <div className="text-center space-y-2">
                        <TrendingUp className="w-12 h-12 text-slate-400 mx-auto" />
                        <div className="text-lg font-medium text-slate-600">Stat Progression Chart</div>
                        <div className="text-sm text-slate-500">Track your attribute growth over time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No stats available</h3>
                <p className="text-slate-600">Complete some quests and workouts to see your stats!</p>
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Achievement Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-yellow-900">{achievements.length}</div>
                  <div className="text-sm text-yellow-700">Unlocked</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900">{Math.max(0, 5 - achievements.length)}</div>
                  <div className="text-sm text-blue-700">Available</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900">
                    {totalXpFromAchievements}
                  </div>
                  <div className="text-sm text-green-700">XP Earned</div>
                </CardContent>
              </Card>
            </div>

            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Unlocked Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-green-900">{achievement.title}</div>
                            <div className="text-sm text-green-700 mb-2">{achievement.description}</div>
                            <div className="flex items-center justify-between">
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                +{achievement.xpReward} XP
                              </Badge>
                              <div className="text-xs text-green-600">
                                {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No achievements yet</h3>
                    <p className="text-slate-600">Complete workouts and quests to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Available Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workouts.length === 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl opacity-50">🏃</div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">First Steps</div>
                          <div className="text-sm text-slate-600 mb-2">Complete your first workout</div>
                          <Badge variant="outline" className="text-slate-600">+50 XP</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {workouts.length < 7 && workouts.length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl opacity-50">👑</div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">Consistency King</div>
                          <div className="text-sm text-slate-600 mb-2">Log 7 or more workouts</div>
                          <div className="space-y-2 mb-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-medium">{workouts.length}/7</span>
                            </div>
                            <Progress value={(workouts.length / 7) * 100} className="h-2" />
                          </div>
                          <Badge variant="outline" className="text-slate-600">+200 XP</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!playerStats || playerStats.attributes.STR.value < 15) && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl opacity-50">💪</div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">Strength Seeker</div>
                          <div className="text-sm text-slate-600 mb-2">Reach 15 Strength points</div>
                          {playerStats && (
                            <div className="space-y-2 mb-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Progress</span>
                                <span className="font-medium">{playerStats.attributes.STR.value}/15</span>
                              </div>
                              <Progress value={(playerStats.attributes.STR.value / 15) * 100} className="h-2" />
                            </div>
                          )}
                          <Badge variant="outline" className="text-slate-600">+150 XP</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {completedQuests.length < 10 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl opacity-50">📚</div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">Quest Master</div>
                          <div className="text-sm text-slate-600 mb-2">Complete 10 quests</div>
                          <div className="space-y-2 mb-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-medium">{completedQuests.length}/10</span>
                            </div>
                            <Progress value={(completedQuests.length / 10) * 100} className="h-2" />
                          </div>
                          <Badge variant="outline" className="text-slate-600">+300 XP</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!playerStats || playerStats.level < 10) && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl opacity-50">⭐</div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">Level Master</div>
                          <div className="text-sm text-slate-600 mb-2">Reach level 10</div>
                          {playerStats && (
                            <div className="space-y-2 mb-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Progress</span>
                                <span className="font-medium">{playerStats.level}/10</span>
                              </div>
                              <Progress value={(playerStats.level / 10) * 100} className="h-2" />
                            </div>
                          )}
                          <Badge variant="outline" className="text-slate-600">+500 XP</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit3 className="h-5 w-5" />
                  <span>Edit Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24 border-4 border-slate-200">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={editedUser.username} />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {editedUser.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                    <div className="text-sm text-slate-500">JPG, PNG or GIF (max. 2MB)</div>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editedUser.username || ''}
                      onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email || ''}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editedUser.age || ''}
                      onChange={(e) => setEditedUser({...editedUser, age: parseInt(e.target.value) || undefined})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={editedUser.gender || ''} onValueChange={(value) => setEditedUser({...editedUser, gender: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={editedUser.height_cm || ''}
                      onChange={(e) => setEditedUser({...editedUser, height_cm: parseInt(e.target.value) || undefined})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={editedUser.weight_kg || ''}
                      onChange={(e) => setEditedUser({...editedUser, weight_kg: parseFloat(e.target.value) || undefined})}
                    />
                  </div>
                </div>

                <Separator />

                {/* Fitness Goals */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Fitness Goals</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-goal">Primary Goal</Label>
                      <Select value={editedUser.primary_goal} onValueChange={(value) => setEditedUser({...editedUser, primary_goal: value as any})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="general_fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activity-level">Activity Level</Label>
                      <Select value={editedUser.activity_level} onValueChange={(value) => setEditedUser({...editedUser, activity_level: value as any})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="lightly_active">Lightly Active</SelectItem>
                          <SelectItem value="moderately_active">Moderately Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                          <SelectItem value="extremely_active">Extremely Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}