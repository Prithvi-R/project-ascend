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
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  Search,
  Eye,
  MoreHorizontal,
  Target,
  Zap,
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
import { workoutAPI } from "@/services/api";

export default function WorkoutHistory() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");

  // Fetch workouts from API
  const { data: workouts = [], isLoading, error } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutAPI.getUserWorkouts(),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  // Filter and sort workouts
  const filteredWorkouts = workouts
    .filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === "all" || 
        (filterBy === "recent" && new Date(workout.date_logged) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterBy === "strength" && workout.duration_minutes && workout.duration_minutes > 45) ||
        (filterBy === "cardio" && workout.duration_minutes && workout.duration_minutes <= 45);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date_logged).getTime() - new Date(a.date_logged).getTime();
        case "duration":
          return (b.duration_minutes || 0) - (a.duration_minutes || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const totalXP = workouts.reduce((sum, w) => {
    return sum + Object.values(w.xp_earned || {}).reduce((xpSum: number, xp: any) => xpSum + (typeof xp === 'number' ? xp : 0), 0);
  }, 0);

  const viewWorkoutDetails = (workoutId: number) => {
    // Here you would navigate to a detailed workout view
    console.log("Viewing workout details for:", workoutId);
  };

  const duplicateWorkout = (workoutId: number) => {
    // Here you would duplicate the workout template
    console.log("Duplicating workout:", workoutId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view workout history.</p>
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
        <h1 className="text-3xl font-bold text-slate-900">Workout History</h1>
        <p className="text-slate-600">Review and analyze your training sessions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Workouts</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : totalWorkouts}
                </p>
              </div>
              <Dumbbell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Time</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : Math.round(totalDuration / 60)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
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
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Duration</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : avgDuration}m
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
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
                  placeholder="Search workouts..."
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
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workouts</SelectItem>
                <SelectItem value="recent">Recent (7 days)</SelectItem>
                <SelectItem value="strength">Strength (45+ min)</SelectItem>
                <SelectItem value="cardio">Cardio (less than 45 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workout List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading workout history...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading workouts</h3>
              <p className="text-slate-600 mb-4">
                There was an error loading your workout history. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No workouts found
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || filterBy !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start logging workouts to see your history here"
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
          filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {workout.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {new Date(workout.date_logged).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(workout.date_logged).toLocaleDateString()}</span>
                      </div>
                      {workout.duration_minutes && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{workout.duration_minutes} min</span>
                        </div>
                      )}
                    </div>

                    {/* XP Earned */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-slate-600">XP Earned:</span>
                      {Object.entries(workout.xp_earned || {}).map(([stat, xp]) => (
                        <Badge key={stat} variant="secondary" className="text-xs">
                          {stat} +{typeof xp === 'number' ? xp : 0}
                        </Badge>
                      ))}
                    </div>

                    {/* Notes */}
                    {workout.notes && (
                      <p className="text-sm text-slate-600 italic">
                        "{workout.notes}"
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewWorkoutDetails(workout.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateWorkout(workout.id)}>
                        <Dumbbell className="w-4 h-4 mr-2" />
                        Use as Template
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
      {filteredWorkouts.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Workouts
          </Button>
        </div>
      )}
    </div>
  );
}