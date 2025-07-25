import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  Plus,
  Minus,
  Clock,
  Dumbbell,
  Save,
  X,
  Timer,
  Target,
  StopCircle,
  Play,
  Pause,
  Search,
  Loader2,
  Filter,
  Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { exerciseAPI } from "@/services/api";
import { MuscleMapper } from "./muscle-mapper";
import { set } from "date-fns";

interface WorkoutExercise {
  exerciseId: number;
  exerciseName: string;
  sets: {
    reps?: number;
    weight?: number;
    duration?: number;
    rest?: number;
    completed?: boolean;
  }[];
}

interface WorkoutSessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workoutData: any) => void;
  initialExercise?: any;
}

// Predefined equipment options for better filtering
const EQUIPMENT_OPTIONS = [
  { value: "bodyweight", label: "💪 Bodyweight", icon: "💪" },
  { value: "dumbbells", label: "🏋️ Dumbbells", icon: "🏋️" },
  { value: "barbell", label: "🏋️‍♂️ Barbell", icon: "🏋️‍♂️" },
  { value: "kettlebell", label: "⚖️ Kettlebell", icon: "⚖️" },
  { value: "resistance_bands", label: "🎯 Resistance Bands", icon: "🎯" },
  { value: "cable_machine", label: "🔗 Cable Machine", icon: "🔗" },
  { value: "pull_up_bar", label: "🏗️ Pull-up Bar", icon: "🏗️" },
  { value: "bench", label: "🪑 Bench", icon: "🪑" },
  { value: "medicine_ball", label: "⚽ Medicine Ball", icon: "⚽" },
  { value: "foam_roller", label: "🎳 Foam Roller", icon: "🎳" },
  { value: "yoga_mat", label: "🧘 Yoga Mat", icon: "🧘" },
  { value: "stability_ball", label: "🏐 Stability Ball", icon: "🏐" },
];

export function WorkoutSessionManager({ 
  isOpen, 
  onClose, 
  onSave, 
  initialExercise 
}: WorkoutSessionManagerProps) {
  const { isAuthenticated } = useAuth();
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [midTime, setMidTime] = useState<Date | null>(null);
  const [midoTime, setMidoTime] = useState<Date | null>(null);
  const [currentDuration, setCurrentDuration] = useState("0:00");
  const [isResting, setIsResting] = useState(false);
  
  // Exercise selection state
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  // Fetch exercises for selection with filters
  const { data: availableExercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises', { 
      search: exerciseSearchTerm, 
      muscle_group: selectedMuscles[0], 
      equipment: selectedEquipment, 
      difficulty: selectedDifficulty 
    }],
    queryFn: () => exerciseAPI.getAll({
      search: exerciseSearchTerm || undefined,
      muscle_group: selectedMuscles[0] || undefined,
      equipment: selectedEquipment || undefined,
      difficulty: selectedDifficulty || undefined,
    }),
    enabled: isAuthenticated && isExerciseDialogOpen,
    select: (response) => response.data,
  });

  // Filter exercises based on all criteria
  const filteredExercises = availableExercises.filter(exercise => {
    const matchesSearch = !exerciseSearchTerm || 
      exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(exerciseSearchTerm.toLowerCase());
    
    const matchesMuscles = selectedMuscles.length === 0 || 
      selectedMuscles.some(muscle => 
        exercise.tags.primary_muscles?.includes(muscle) ||
        exercise.tags.secondary_muscles?.includes(muscle)
      );
    
    const matchesEquipment = !selectedEquipment || selectedEquipment === "all" ||
      exercise.tags.equipment?.includes(selectedEquipment);
    
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === "all" ||
      exercise.tags.difficulty === selectedDifficulty;

    return matchesSearch && matchesMuscles && matchesEquipment && matchesDifficulty;
  });

  // Get unique equipment options from API data
  const getUniqueEquipment = () => {
    const equipment = new Set<string>();
    availableExercises.forEach(ex => {
      ex.tags.equipment?.forEach(eq => equipment.add(eq));
    });
    return Array.from(equipment);
  };

  // Get unique difficulty options
  const getUniqueDifficulties = () => {
    const difficulties = new Set<string>();
    availableExercises.forEach(ex => {
      if (ex.tags.difficulty) difficulties.add(ex.tags.difficulty);
    });
    return Array.from(difficulties);
  };

  // Add initial exercise if provided
  useEffect(() => {
    if (initialExercise && isOpen) {
      const newExercise: WorkoutExercise = {
        exerciseId: initialExercise.id,
        exerciseName: initialExercise.name,
        sets: [{ reps: 0, weight: 0, rest: 60, completed: false }],
      };
      setExercises([newExercise]);
      setWorkoutName(`${initialExercise.name} Workout`);
    }
  }, [initialExercise, isOpen]);

  // Update duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime ) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = midTime? now.getTime() - startTime.getTime() + midoTime.getTime() - midTime.getTime() :now.getTime() - startTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        // console.log("Workout started at:", startTime.getTime(),now.getTime(),midTime?.getTime(),diff);
        setCurrentDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);



  const startWorkout = () => {
    if(isResting){
      setIsResting(false);
      setIsActive(true);
      setMidTime(new Date());
    }else{
      setStartTime(new Date());
      setMidTime(null);
      setIsActive(true);
      if (!workoutName) {
        setWorkoutName(`Workout - ${new Date().toLocaleDateString()}`);
      }
    }
  };

  const pauseWorkout = () => {
    setIsActive(false);
    setIsResting(true);
    setMidoTime(new Date());
  };


  const endWorkout = () => {
    setIsActive(false);
    setStartTime(null);
    // setCurrentDuration("0:00");
  };

  const openExerciseSelector = () => {
    setIsExerciseDialogOpen(true);
    setExerciseSearchTerm("");
    setSelectedMuscles([]);
    setSelectedEquipment("");
    setSelectedDifficulty("");
  };

  const selectExercise = (exercise: any) => {
    const newExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ reps: 0, weight: 0, rest: 60, completed: false }],
    };
    setExercises([...exercises, newExercise]);
    setIsExerciseDialogOpen(false);
    setExerciseSearchTerm("");
    setSelectedMuscles([]);
    setSelectedEquipment("");
    setSelectedDifficulty("");
  };

  const clearFilters = () => {
    setExerciseSearchTerm("");
    setSelectedMuscles([]);
    setSelectedEquipment("");
    setSelectedDifficulty("");
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({ 
      ...lastSet, 
      completed: false 
    });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExercises(updated);
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const set = updated[exerciseIndex].sets[setIndex];
    set.completed = !set.completed;
    const now = new Date();
    

    setExercises(updated);
  };


  const saveWorkout = () => {
    const workoutData = {
      name: workoutName,
      notes: workoutNotes,
      exercises: exercises,
      duration: currentDuration,
      startTime: startTime?.toISOString(),
      endTime: new Date().toISOString(),
    };
    
    onSave(workoutData);
    
    // Reset state
    setWorkoutName("");
    setWorkoutNotes("");
    setExercises([]);
    setIsActive(false);
    setStartTime(null);
    setCurrentDuration("0:00");
    setIsResting(false);
    
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6" />
              <span>Workout Session</span>
              {isActive && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Track your workout in real-time with set completion and rest timers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Workout Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Enter workout name..."
                  disabled={isActive}
                />
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Label>Duration</Label>
                  <div className="text-2xl font-mono font-bold text-slate-900">
                    {currentDuration}
                  </div>
                </div>
                <div className="space-x-2">
                  {!isActive ? (
                    <Button onClick={startWorkout}>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={pauseWorkout}>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button variant="outline" onClick={endWorkout}>
                        <StopCircle className="w-4 h-4 mr-2" />
                        End
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rest Timer */}
            {/* {isResting && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-900">Rest Time</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-mono font-bold text-orange-900">
                        {restTimer}
                      </div>
                      <Button size="sm" variant="outline" onClick={skipRest}>
                        Skip Rest
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )} */}

            {/* Exercises */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Exercises</h3>
                <Button onClick={openExerciseSelector} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {exercises.map((exercise, exerciseIndex) => (
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
                      <div className="grid grid-cols-6 gap-2 text-sm font-medium text-slate-600">
                        <div>Set</div>
                        <div>Reps</div>
                        <div>Weight (kg)</div>
                        <div>Rest (s)</div>
                        <div>Complete</div>
                        <div></div>
                      </div>

                      {/* Sets */}
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-6 gap-2 items-center">
                          <div className="text-sm text-slate-600">{setIndex + 1}</div>
                          <Input
                            type="number"
                            value={set.reps || ""}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="h-8"
                            disabled={set.completed}
                          />
                          <Input
                            type="number"
                            value={set.weight || ""}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            step="0.5"
                            className="h-8"
                            disabled={set.completed}
                          />
                          <Input
                            type="number"
                            value={set.rest || ""}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, "rest", parseInt(e.target.value) || 0)}
                            placeholder="60"
                            className="h-8"
                          />
                          <Button
                            size="sm"
                            variant={set.completed ? "default" : "outline"}
                            onClick={() => completeSet(exerciseIndex, setIndex)}
                            className={set.completed ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {set.completed ? "✓" : "○"}
                          </Button>
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

              {/* Empty State */}
              {exercises.length === 0 && (
                <Card className="border-dashed border-2 border-slate-300">
                  <CardContent className="p-8 text-center">
                    <Dumbbell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No exercises added</h3>
                    <p className="text-slate-600 mb-4">Add exercises from the database to start your workout</p>
                    <Button onClick={openExerciseSelector}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Exercise
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="workout-notes">Workout Notes</Label>
              <textarea
                id="workout-notes"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How did the workout feel? Any observations..."
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={saveWorkout} 
                className="flex-1"
                disabled={exercises.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Workout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Exercise Selection Dialog */}
      <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Exercise Grimoire</span>
            </DialogTitle>
            <DialogDescription>
              Use the muscle mapper and equipment filters to find the perfect exercises for your workout
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Tabs defaultValue="muscle-mapper" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="muscle-mapper" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Muscle Mapper</span>
                </TabsTrigger>
                <TabsTrigger value="equipment" className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4" />
                  <span>Equipment & Filters</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="muscle-mapper" className=" space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Muscle Mapper */}
                  <div className="lg:col-span-1">
                    <MuscleMapper
                      selectedMuscles={selectedMuscles}
                      onMuscleSelect={setSelectedMuscles}
                    />
                  </div>

                  {/* Exercise Results */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search exercises by name..."
                        value={exerciseSearchTerm}
                        onChange={(e) => setExerciseSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Active Filters */}
                    {(selectedMuscles.length > 0 || selectedEquipment || selectedDifficulty) && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-slate-600">Active filters:</span>
                        {selectedMuscles.map(muscle => (
                          <Badge key={muscle} variant="secondary" className="bg-blue-100 text-blue-700">
                            {muscle}
                          </Badge>
                        ))}
                        {selectedEquipment && selectedEquipment !== "all" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {selectedEquipment.replace('_', ' ')}
                          </Badge>
                        )}
                        {selectedDifficulty && selectedDifficulty !== "all" && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            {selectedDifficulty}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          <Filter className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    )}

                    {/* Exercise Grid */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {exercisesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">Loading exercises...</span>
                        </div>
                      ) : filteredExercises.length > 0 ? (
                        filteredExercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => selectExercise(exercise)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">{exercise.name}</div>
                                <div className="text-sm text-slate-600 mt-1">{exercise.description}</div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exercise.tags.primary_muscles?.slice(0, 3).map(muscle => (
                                    <Badge key={muscle} variant="secondary" className="text-xs bg-red-100 text-red-700">
                                      {muscle}
                                    </Badge>
                                  ))}
                                  {exercise.tags.difficulty && (
                                    <Badge variant="outline" className="text-xs">
                                      {exercise.tags.difficulty}
                                    </Badge>
                                  )}
                                  {exercise.tags.equipment?.[0] && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                      {exercise.tags.equipment[0].replace('_', ' ')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No exercises found</p>
                          <p className="text-sm">Try adjusting your muscle selection or search terms</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="equipment" className=" space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Equipment & Filters Selection */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Wrench className="h-5 w-5" />
                            <span>Equipments</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            <Filter className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent >
                        {/* Equipment Selection */}
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          <h3 className="text-lg font-semibold text-slate-900">Select Equipment</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div 
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-colors text-center ${
                                selectedEquipment === "all" || selectedEquipment === "" 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              onClick={() => setSelectedEquipment("all")}
                            >
                              <div className="text-xl mb-1">🏋️‍♀️</div>
                              <div className="text-xs font-medium">All Equipment</div>
                            </div>
                            
                            {EQUIPMENT_OPTIONS.map((equipment) => (
                              <div 
                                key={equipment.value}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-colors text-center ${
                                  selectedEquipment === equipment.value 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                                onClick={() => setSelectedEquipment(equipment.value)}
                              >
                                <div className="text-xl mb-1">{equipment.icon}</div>
                                <div className="text-xs font-medium">{equipment.label.replace(/^.+ /, '')}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Additional Filters */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-900">Additional Filters</h3>
                          
                          <div className="space-y-2">
                            <Label>Difficulty Level</Label>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                              <SelectTrigger>
                                <SelectValue placeholder="All Levels" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="beginner">🟢 Beginner</SelectItem>
                                <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                                <SelectItem value="advanced">🔴 Advanced</SelectItem>
                                {getUniqueDifficulties().map(difficulty => (
                                  <SelectItem key={difficulty} value={difficulty}>
                                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Selected Filters Display */}
                        {(selectedEquipment || selectedDifficulty) && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-slate-700">
                              Selected: {selectedEquipment && selectedEquipment !== "all" ? selectedEquipment.replace('_', ' ') : "All Equipment"}
                              {selectedDifficulty && selectedDifficulty !== "all" && `, ${selectedDifficulty}`}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {selectedEquipment && selectedEquipment !== "all" && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                  {selectedEquipment.replace('_', ' ')}
                                </Badge>
                              )}
                              {selectedDifficulty && selectedDifficulty !== "all" && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                  {selectedDifficulty}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Exercise Results */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search exercises by name..."
                        value={exerciseSearchTerm}
                        onChange={(e) => setExerciseSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Active Filters */}
                    {(selectedMuscles.length > 0 || selectedEquipment || selectedDifficulty) && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-slate-600">Active filters:</span>
                        {selectedMuscles.map(muscle => (
                          <Badge key={muscle} variant="secondary" className="bg-blue-100 text-blue-700">
                            {muscle}
                          </Badge>
                        ))}
                        {selectedEquipment && selectedEquipment !== "all" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {selectedEquipment.replace('_', ' ')}
                          </Badge>
                        )}
                        {selectedDifficulty && selectedDifficulty !== "all" && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            {selectedDifficulty}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          <Filter className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    )}

                    {/* Exercise Grid */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <div className="text-sm text-slate-600 mb-2">
                        Showing {filteredExercises.length} exercises
                      </div>
                      
                      {exercisesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">Loading exercises...</span>
                        </div>
                      ) : filteredExercises.length > 0 ? (
                        filteredExercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => selectExercise(exercise)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">{exercise.name}</div>
                                <div className="text-sm text-slate-600 mt-1">{exercise.description}</div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exercise.tags.primary_muscles?.slice(0, 2).map(muscle => (
                                    <Badge key={muscle} variant="secondary" className="text-xs bg-red-100 text-red-700">
                                      {muscle}
                                    </Badge>
                                  ))}
                                  {exercise.tags.difficulty && (
                                    <Badge variant="outline" className="text-xs">
                                      {exercise.tags.difficulty}
                                    </Badge>
                                  )}
                                  {exercise.tags.equipment?.[0] && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                      {exercise.tags.equipment[0].replace('_', ' ')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No exercises found</p>
                          <p className="text-sm">Try adjusting your filters or search terms</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Dialog Actions */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsExerciseDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}