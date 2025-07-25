import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Target,
  Plus,
  Clock,
  Zap,
  CheckCircle,
  Star,
  Trophy,
  Dumbbell,
  Apple,
  BookOpen,
  Users,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { questAPI } from "@/services/api";
import { Quest } from "@/types";

const questTypeIcons = {
  fitness: Dumbbell,
  nutrition: Apple,
  learning: BookOpen,
  social: Users,
};

const questTypeColors = {
  fitness: "border-red-200 text-red-700 bg-red-50",
  nutrition: "border-orange-200 text-orange-700 bg-orange-50",
  learning: "border-blue-200 text-blue-700 bg-blue-50",
  social: "border-purple-200 text-purple-700 bg-purple-50",
};

export default function Quests() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [lastAiGeneratedAt, setLastAiGeneratedAt] = useState<Date | null>(null);
  const aiGenerateInProgress = useRef(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: "",
    description: "",
    type: "fitness" as Quest['type'],
    xp_reward: { STR: 50 },
    due_date: "",
  });

  // Fetch all quests from API only
  const { data: allQuests = [], isLoading, error } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const response = await questAPI.getAll();
      console.log('Quest data from API:', response.data);

      // Normalize quest data to ensure quest_id field exists
      const normalizedQuests = response.data.map((quest: any, index: number) => {
        const questId = quest.quest_id || quest.id || quest.questId || quest.questID || (Date.now() + index);

        return {
          ...quest,
          quest_id: questId,
          id: quest.id || questId,
        };
      });

      return normalizedQuests;
    },
    enabled: isAuthenticated,
  });

  // Create quest mutation
  const createQuestMutation = useMutation({
    mutationFn: async (questData: any) => {
      const response = await questAPI.create(questData);
      console.log('Created quest response:', response.data);

      // Normalize the response
      const questId = response.data.quest_id || response.data.id || Date.now();
      const normalizedQuest = {
        ...response.data,
        quest_id: questId,
        id: response.data.id || questId,
      };

      return normalizedQuest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      setIsCreateDialogOpen(false);
      setNewQuest({
        title: "",
        description: "",
        type: "fitness",
        xp_reward: { STR: 50 },
        due_date: "",
      });

      showToast("Quest created successfully!", "success");
    },
    onError: (error) => {
      console.error('Error creating quest:', error);
      showToast("Error creating quest. Please try again.", "error");
    },
  });

  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async (questId: number) => {
      if (!questId || questId === undefined || isNaN(questId)) {
        throw new Error('Invalid quest ID');
      }

      console.log('Attempting to complete quest with ID:', questId);
      const response = await questAPI.complete(questId);
      console.log('Quest completion response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['player-stats'] });
      showToast("Quest completed! XP awarded!", "success");
    },
    onError: (error) => {
      console.error('Error completing quest:', error);
      showToast("Error completing quest. Please try again.", "error");
    },
  });

  // Update quest mutation
  const updateQuestMutation = useMutation({
    mutationFn: async ({ questId, data }: { questId: number; data: Partial<Quest> }) => {
      if (!questId || questId === undefined || isNaN(questId)) {
        throw new Error('Invalid quest ID');
      }

      console.log('Attempting to update quest with ID:', questId, 'Data:', data);
      const response = await questAPI.update(questId, data);
      console.log('Quest update response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      showToast("Quest updated successfully!", "success");
    },
    onError: (error) => {
      console.error('Error updating quest:', error);
      showToast("Error updating quest. Please try again.", "error");
    },
  });

  // Helper function to show toast notifications
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`;

    const icon = type === 'success'
      ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
      : '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>';

    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          ${icon}
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // Helper function to get quest ID
  const getQuestId = (quest: any): number => {
    const questId = quest.quest_id || quest.id || quest.questId || quest.questID;
    return questId;
  };

  // Filter quests
  const filteredQuests = allQuests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || quest.type === filterType;
    const matchesStatus = filterStatus === "all" || quest.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Separate quests by status
  const activeQuests = filteredQuests.filter(q => q.status === 'active');
  const completedQuests = filteredQuests.filter(q => q.status === 'completed');
  const pausedQuests = filteredQuests.filter(q => q.status === 'paused');

  const completeQuest = (questId: number) => {
    if (!questId || questId === undefined || isNaN(questId)) {
      console.error('Invalid quest ID:', questId);
      showToast("Error: Invalid quest ID", "error");
      return;
    }

    console.log('Completing quest with ID:', questId);
    completeQuestMutation.mutate(questId);
  };

  const pauseQuest = (questId: number) => {
    if (!questId || questId === undefined || isNaN(questId)) {
      console.error('Invalid quest ID:', questId);
      showToast("Error: Invalid quest ID", "error");
      return;
    }

    updateQuestMutation.mutate({ questId, data: { status: 'paused' } });
  };

  const resumeQuest = (questId: number) => {
    if (!questId || questId === undefined || isNaN(questId)) {
      console.error('Invalid quest ID:', questId);
      showToast("Error: Invalid quest ID", "error");
      return;
    }

    updateQuestMutation.mutate({ questId, data: { status: 'active' } });
  };

  const createQuest = () => {
    const questData = {
      title: newQuest.title,
      description: newQuest.description,
      type: newQuest.type,
      xp_reward: newQuest.xp_reward,
      due_date: newQuest.due_date || new Date().toISOString(),
    };

    createQuestMutation.mutate(questData);
  };

  // Calculate stats
  const totalQuests = allQuests.length;
  const completedCount = allQuests.filter(q => q.status === 'completed').length;
  const activeCount = allQuests.filter(q => q.status === 'active').length;
  const totalXpEarned = allQuests
    .filter(q => q.status === 'completed')
    .reduce((sum, quest) => sum + Object.values(quest.xp_reward).reduce((a, b) => a + b, 0), 0);


  useEffect(() => {
      if (!isAuthenticated) return;

      const interval = setInterval(async () => {
        if (aiGenerateInProgress.current) return;
        aiGenerateInProgress.current = true;

        try {
          // Avoid spamming multiple times in the same minute
          const now = new Date();
          const oneMinuteAgo = new Date(now.getTime() - 30 * 1000);

          if (!lastAiGeneratedAt || lastAiGeneratedAt < oneMinuteAgo) {
            const response = await questAPI.generateAIQuest(); // ⬅️ Custom endpoint
            // console.log("AI Quest Generated:", response.data);
            showToast("AI Quest Generated!", "success");
            setLastAiGeneratedAt(new Date());
            queryClient.invalidateQueries({ queryKey: ['quests'] });
          }
        } catch (error) {
          console.error("AI quest generation error:", error);
          showToast("Failed to generate AI quest", "error");
        } finally {
          aiGenerateInProgress.current = false;
        }
      }, 30 * 1000); // 1 min

      return () => clearInterval(interval);
    }, [isAuthenticated, lastAiGeneratedAt]);

  const QuestCard = ({ quest }: { quest: Quest }) => {
    const Icon = questTypeIcons[quest.type];
    const typeColor = questTypeColors[quest.type];
    const isCompleted = quest.status === 'completed';
    const isPaused = quest.status === 'paused';
    const totalXpReward = Object.values(quest.xp_reward).reduce((sum: number, xp: any) => sum + (typeof xp === 'number' ? xp : 0), 0);

    // Get quest ID using helper function
    const questId = getQuestId(quest);
    const hasValidId = questId && !isNaN(questId) && questId !== undefined && questId !== null;


    

    return (
      <Card className={`hover:shadow-md transition-all duration-200 ${isCompleted ? 'bg-green-50 border-green-200 opacity-90' :
          isPaused ? 'bg-gray-50 border-gray-200 opacity-75' :
            'bg-white border-slate-200'
        }`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2 rounded-lg ${typeColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className={`font-semibold text-lg ${isCompleted ? 'text-green-800' : 'text-slate-900'}`}>
                      {quest.title}
                    </h3>
                    {!hasValidId && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Invalid ID
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                    {quest.description}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={!hasValidId}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isCompleted && !isPaused && hasValidId && (
                    <>
                      <DropdownMenuItem onClick={() => completeQuest(questId)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => pauseQuest(questId)}>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Quest
                      </DropdownMenuItem>
                    </>
                  )}
                  {isPaused && hasValidId && (
                    <DropdownMenuItem onClick={() => resumeQuest(questId)}>
                      <Play className="w-4 h-4 mr-2" />
                      Resume Quest
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges and Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`text-xs ${typeColor}`}>
                  {quest.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(quest.due_date).toLocaleDateString()}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{totalXpReward} XP</span>
                </div>
              </div>
            </div>

            {/* XP Breakdown */}
            <div className="flex items-center space-x-2">
              {Object.entries(quest.xp_reward).map(([stat, xp]) => (
                <Badge key={stat} variant="secondary" className="text-xs">
                  {stat} +{typeof xp === 'number' ? xp : 0}
                </Badge>
              ))}
            </div>

            {/* Action Button */}
            {!isCompleted && !isPaused && hasValidId && (
              <Button
                onClick={() => completeQuest(questId)}
                className="w-full"
                size="sm"
                disabled={completeQuestMutation.isPending}
              >
                {completeQuestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Complete Quest
                  </>
                )}
              </Button>
            )}

            {!hasValidId && (
              <div className="text-xs text-red-600 text-center">
                Quest ID missing - cannot perform actions
              </div>
            )}

            {isCompleted && quest.completed_at && (
              <div className="text-xs text-green-600 text-center">
                Completed: {new Date(quest.completed_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your quests.</p>
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
          <h1 className="text-4xl font-bold text-slate-900">Quest Board</h1>
          <p className="text-lg text-slate-600">Embark on epic challenges and level up your life</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-900">
                {isLoading ? '...' : activeCount}
              </div>
              <div className="text-sm text-blue-700">Active Quests</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-900">
                {isLoading ? '...' : completedCount}
              </div>
              <div className="text-sm text-green-700">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-900">
                {isLoading ? '...' : totalQuests}
              </div>
              <div className="text-sm text-purple-700">Total Quests</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-900">
                {isLoading ? '...' : totalXpEarned}
              </div>
              <div className="text-sm text-yellow-700">XP Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Quest
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Quest</DialogTitle>
                    <DialogDescription>
                      Design a custom challenge to level up your skills
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Quest Title</Label>
                      <Input
                        id="title"
                        value={newQuest.title}
                        onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                        placeholder="Enter quest title..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newQuest.description}
                        onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                        placeholder="Describe your quest..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Quest Type</Label>
                      <Select value={newQuest.type} onValueChange={(value: Quest['type']) => setNewQuest({ ...newQuest, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fitness">🏋️ Fitness</SelectItem>
                          <SelectItem value="nutrition">🍎 Nutrition</SelectItem>
                          <SelectItem value="learning">📚 Learning</SelectItem>
                          <SelectItem value="social">👥 Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date (Optional)</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newQuest.due_date ? newQuest.due_date.split('T')[0] : ''}
                        onChange={(e) => setNewQuest({ ...newQuest, due_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={createQuest}
                        className="flex-1"
                        disabled={!newQuest.title || !newQuest.description || createQuestMutation.isPending}
                      >
                        {createQuestMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Quest'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Quest Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Active ({activeQuests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Completed ({completedQuests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="paused" className="flex items-center space-x-2">
              <Pause className="w-4 h-4" />
              <span>Paused ({pausedQuests.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading quests...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading quests</h3>
                <p className="text-slate-600 mb-4">
                  There was an error loading your quests. Please check your backend connection.
                </p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['quests'] })}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeQuests.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No active quests</h3>
                    <p className="text-slate-600 mb-4">Create your first quest to start your journey!</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quest
                    </Button>
                  </div>
                ) : (
                  activeQuests.map(quest => <QuestCard key={getQuestId(quest)} quest={quest} />)
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedQuests.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No completed quests</h3>
                  <p className="text-slate-600">Complete some quests to see them here!</p>
                </div>
              ) : (
                completedQuests.map(quest => <QuestCard key={getQuestId(quest)} quest={quest} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="paused">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pausedQuests.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Pause className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No paused quests</h3>
                  <p className="text-slate-600">Paused quests will appear here.</p>
                </div>
              ) : (
                pausedQuests.map(quest => <QuestCard key={getQuestId(quest)} quest={quest} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}