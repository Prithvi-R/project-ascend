import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  Clock,
  Dumbbell,
  Save,
  X,
  Search,
  Timer,
  Target,
  StopCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { exerciseAPI, workoutAPI } from "@/services/api";

interface WorkoutExercise {
  exerciseId: number;
  exerciseName: string;
  sets: {
    reps?: number;
    weight?: number;
    duration?: number;
    rest?: number;
  }[];
}

export default function LogWorkout() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentDuration, setCurrentDuration] = useState("0:00");

  // Fetch exercises from API
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises', { search: searchTerm }],
    queryFn: () => exerciseAPI.getAll({ search: searchTerm || undefined }),
    enabled: isAuthenticated && searchTerm.length > 2,
    select: (response) => response.data,
  });

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: (workoutData: any) => workoutAPI.create(workoutData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['player-stats'] });
      // Reset form
      setWorkoutName("");
      setWorkoutNotes("");
      setWorkoutExercises([]);
      setIsWorkoutActive(false);
      setStartTime(null);
      setCurrentDuration("0:00");
      alert("Workout saved successfully!");
    },
  });

  // Update duration every second when workout is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCurrentDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, startTime]);

  const addExercise = (exercise: any) => {
    const newExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ reps: 0, weight: 0, rest: 60 }],
    };
    setWorkoutExercises([...workoutExercises, newExercise]);
    setSearchTerm("");
  };

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({ ...lastSet });
    setWorkoutExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setWorkoutExercises(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setWorkoutExercises(updated);
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setStartTime(new Date());
    if (!workoutName) {
      setWorkoutName(`Workout - ${new Date().toLocaleDateString()}`);
    }
  };

  const endWorkout = () => {
    setIsWorkoutActive(false);
    setStartTime(null);
    setCurrentDuration("0:00");
  };

  const saveWorkout = async () => {
    if (!workoutName || workoutExercises.length === 0) return;

    const durationMinutes = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 60000) : 0;
    
    const workoutData = {
      name: workoutName,
      date_logged: new Date().toISOString(),
      duration_minutes: durationMinutes,
      notes: workoutNotes || undefined,
    };

    createWorkoutMutation.mutate(workoutData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to log workouts.</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Log Workout</h1>
          <p className="text-slate-600">Track your training session</p>
        </div>
        {isWorkoutActive && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Timer className="w-4 h-4" />
              <span className="font-mono text-lg">{currentDuration}</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Workout Active
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workout Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="h-5 w-5" />
                <span>Workout Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Enter workout name..."
                  disabled={isWorkoutActive}
                />
              </div>
              <div>
                <Label htmlFor="workout-notes">Notes (Optional)</Label>
                <Textarea
                  id="workout-notes"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="How did the workout feel? Any observations..."
                  rows={3}
                />
              </div>
              
              {/* Workout Control Buttons */}
              <div className="flex gap-2">
                {!isWorkoutActive ? (
                  <Button onClick={startWorkout} className="flex-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={endWorkout} 
                      variant="outline" 
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      End Workout
                    </Button>
                    {workoutExercises.length > 0 && (
                      <Button 
                        onClick={saveWorkout} 
                        className="flex-1"
                        disabled={createWorkoutMutation.isPending}
                      >
                        {createWorkoutMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save & Complete
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exercises */}
          {workoutExercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exerciseIndex)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Sets Header */}
                  <div className="grid grid-cols-5 gap-2 text-sm font-medium text-slate-600">
                    <div>Set</div>
                    <div>Reps</div>
                    <div>Weight (kg)</div>
                    <div>Rest (s)</div>
                    <div></div>
                  </div>

                  {/* Sets */}
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-5 gap-2 items-center">
                      <div className="text-sm text-slate-600">{setIndex + 1}</div>
                      <Input
                        type="number"
                        value={set.reps || ""}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-8"
                      />
                      <Input
                        type="number"
                        value={set.weight || ""}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        step="0.5"
                        className="h-8"
                      />
                      <Input
                        type="number"
                        value={set.rest || ""}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, "rest", parseInt(e.target.value) || 0)}
                        placeholder="60"
                        className="h-8"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                        disabled={exercise.sets.length === 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSet(exerciseIndex)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Workout Complete Message */}
          {!isWorkoutActive && workoutExercises.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="text-green-700 font-medium">
                    Workout completed! Duration: {currentDuration || "Not tracked"}
                  </div>
                  <Button 
                    onClick={saveWorkout} 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={createWorkoutMutation.isPending}
                  >
                    {createWorkoutMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Workout
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Exercise Library */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Add Exercises</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchTerm.length > 2 && (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {exercisesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Searching...</span>
                      </div>
                    ) : exercises.length > 0 ? (
                      exercises.slice(0, 10).map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => addExercise(exercise)}
                        >
                          <div className="font-medium text-slate-900">{exercise.name}</div>
                          <div className="text-sm text-slate-600 mt-1">
                            {exercise.tags.primary_muscles?.slice(0, 2).map(muscle => (
                              <Badge key={muscle} variant="secondary" className="text-xs mr-1">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-4">
                        No exercises found
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

          {/* Workout Summary */}
          {workoutExercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Workout Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Exercises:</span>
                    <span className="font-medium">{workoutExercises.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Sets:</span>
                    <span className="font-medium">
                      {workoutExercises.reduce((total, ex) => total + ex.sets.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium font-mono">{currentDuration}</span>
                  </div>
                  <Separator />
                  <div className="text-xs text-slate-500">
                    Estimated XP: {workoutExercises.length * 25} STR, {workoutExercises.length * 15} END
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}