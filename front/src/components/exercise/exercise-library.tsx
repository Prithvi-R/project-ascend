import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MuscleMapper } from "@/components/exercise/muscle-mapper";
import { ExerciseDetailDialog } from "@/components/exercise/exercise-detail-dialog";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { exerciseAPI } from "@/services/api";
import {
  Search,
  Dumbbell,
  Filter,
  Target,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ExerciseLibrary() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Fetch exercises from API
  const { data: exercises = [], isLoading, error } = useQuery({
    queryKey: ['exercises', { 
      search: searchTerm, 
      muscle_group: selectedMuscles[0], 
      equipment: selectedEquipment, 
      difficulty: selectedDifficulty 
    }],
    queryFn: () => exerciseAPI.getAll({
      search: searchTerm || undefined,
      muscle_group: selectedMuscles[0] || undefined,
      equipment: selectedEquipment || undefined,
      difficulty: selectedDifficulty || undefined,
    }),
    enabled: isAuthenticated,
    select: (response) => response.data,
  });

  // Filter exercises based on search, muscle selection, equipment, and difficulty
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMuscles([]);
    setSelectedEquipment("");
    setSelectedDifficulty("");
  };

  const getUniqueEquipment = () => {
    const equipment = new Set<string>();
    exercises.forEach(ex => {
      ex.tags.equipment?.forEach(eq => equipment.add(eq));
    });
    return Array.from(equipment);
  };

  const getUniqueDifficulties = () => {
    const difficulties = new Set<string>();
    exercises.forEach(ex => {
      if (ex.tags.difficulty) difficulties.add(ex.tags.difficulty);
    });
    return Array.from(difficulties);
  };

  const openExerciseDetail = (exercise: any) => {
    setSelectedExercise(exercise);
    setIsDetailDialogOpen(true);
  };

  const addToWorkout = (exercise: any) => {
    // TODO: Implement add to workout functionality
    console.log("Adding to workout:", exercise.name);
    // This could open a dialog to select which workout to add to
    // or add to a "current workout" session
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Muscle Mapper */}
        <div className="lg:col-span-1">
          <MuscleMapper
            selectedMuscles={selectedMuscles}
            onMuscleSelect={setSelectedMuscles}
          />
        </div>

        {/* Exercise Library */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find Your Perfect Exercise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search exercises by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                      {getUniqueEquipment().map(equipment => (
                        <SelectItem key={equipment} value={equipment}>
                          {equipment.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {getUniqueDifficulties().map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(selectedMuscles.length > 0 || (selectedEquipment && selectedEquipment !== "all") || (selectedDifficulty && selectedDifficulty !== "all") || searchTerm) && (
                    <Button variant="outline" onClick={clearFilters}>
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Active Filters Display */}
                {(selectedMuscles.length > 0 || (selectedEquipment && selectedEquipment !== "all") || (selectedDifficulty && selectedDifficulty !== "all")) && (
                  <div className="flex flex-wrap gap-2">
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
                  </div>
                )}

                <div className="text-sm text-slate-600">
                  {isLoading ? 'Loading exercises...' : `Showing ${filteredExercises.length} of ${exercises.length} exercises`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading exercises...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading exercises</h3>
                <p className="text-slate-600 mb-4">
                  There was an error loading the exercise data. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight flex items-center justify-between">
                      <span>{exercise.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openExerciseDetail(exercise)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        {exercise.description}
                      </p>

                      {/* Primary Muscles */}
                      <div className="flex flex-wrap gap-1">
                        {exercise.tags.primary_muscles?.slice(0, 3).map(muscle => (
                          <Badge key={muscle} variant="secondary" className="text-xs bg-red-100 text-red-700">
                            {muscle}
                          </Badge>
                        ))}
                      </div>

                      {/* Equipment and Difficulty */}
                      <div className="flex items-center justify-between">
                        {exercise.tags.difficulty && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.tags.difficulty}
                          </Badge>
                        )}
                        {exercise.tags.equipment?.[0] && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.tags.equipment[0].replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => addToWorkout(exercise)}
                        >
                          <Dumbbell className="h-4 w-4 mr-2" />
                          Add to Workout
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openExerciseDetail(exercise)}
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && filteredExercises.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No exercises found</h3>
                <p className="text-slate-600 mb-4">
                  Try adjusting your search terms or muscle selection to find what you're looking for.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Exercise Detail Dialog */}
      <ExerciseDetailDialog
        exercise={selectedExercise}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onAddToWorkout={addToWorkout}
      />
    </div>
  );
}