import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExerciseLibrary } from "@/components/exercise/exercise-library";
import { WorkoutSessionManager } from "@/components/exercise/workout-session-manager";
import ExerciseDashboard from "./exercise-dashboard";
import LogWorkout from "./log-workout";
import WorkoutHistory from "./workout-history";
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutAPI } from "@/services/api";
import {
  BookOpen,
  Plus,
  History,
  BarChart3,
  AlertCircle,
  Dumbbell,
} from "lucide-react";

export default function EnhancedExercises() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isWorkoutSessionOpen, setIsWorkoutSessionOpen] = useState(false);
  const [selectedExerciseForWorkout, setSelectedExerciseForWorkout] = useState<any>(null);
  const queryClient = useQueryClient();
  
  // Get the active tab from URL params or default to dashboard
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Handle tab changes by updating URL params
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData: any) => {
      // Calculate duration in minutes
      let durationMinutes = 0;
      if (workoutData.startTime && workoutData.endTime) {
        const start = new Date(workoutData.startTime);
        const end = new Date(workoutData.endTime);
        durationMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
      }

      // Create the workout first
      const workout = await workoutAPI.create({
        name: workoutData.name,
        date_logged: new Date().toISOString(),
        duration_minutes: durationMinutes,
        notes: workoutData.notes || undefined,
      });

      // If there are exercises, add them to the workout
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        for (let i = 0; i < workoutData.exercises.length; i++) {
          const exercise = workoutData.exercises[i];
          
          // Add each set as a separate workout exercise entry
          for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
            const set = exercise.sets[setIndex];
            
            if (set.completed) { // Only save completed sets
              await workoutAPI.addExercise(workout.data.id, {
                exercise_id: exercise.exerciseId,
                sets: 1, // Each entry represents one set
                reps: set.reps || undefined,
                weight_kg: set.weight || undefined,
                duration_seconds: set.duration || undefined,
                rest_seconds: set.rest || undefined,
                notes: undefined,
                order_in_workout: (i * 10) + setIndex, // Maintain order
              });
            }
          }
        }
      }

      return workout.data;
    },
    onSuccess: () => {
      // Refresh workout data
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['player-stats'] });
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>Workout saved successfully!</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    },
    onError: (error) => {
      console.error('Error saving workout:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>Error saving workout. Please try again.</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    },
  });

  const handleStartWorkoutWithExercise = (exercise: any) => {
    setSelectedExerciseForWorkout(exercise);
    setIsWorkoutSessionOpen(true);
  };

  const handleSaveWorkout = (workoutData: any) => {
    console.log("Saving workout:", workoutData);
    
    // Validate workout data
    if (!workoutData.name || !workoutData.name.trim()) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>Please enter a workout name</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      return;
    }

    // Save the workout to the database
    createWorkoutMutation.mutate(workoutData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view exercises.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Exercise Center</h1>
              <p className="text-slate-600">Your complete training companion</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setIsWorkoutSessionOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={createWorkoutMutation.isPending}
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Quick Workout
              </Button>
              <TabsList className="grid w-fit grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="grimoire" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Grimoire</span>
                </TabsTrigger>
                <TabsTrigger value="log-workout" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Log Workout</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <ExerciseDashboard />
          </TabsContent>

          {/* Exercise Grimoire Tab */}
          <TabsContent value="grimoire">
            <ExerciseLibrary />
          </TabsContent>

          {/* Log Workout Tab */}
          <TabsContent value="log-workout">
            <LogWorkout />
          </TabsContent>

          {/* Workout History Tab */}
          <TabsContent value="history">
            <WorkoutHistory />
          </TabsContent>
        </Tabs>

        {/* Workout Session Manager */}
        <WorkoutSessionManager
          isOpen={isWorkoutSessionOpen}
          onClose={() => {
            setIsWorkoutSessionOpen(false);
            setSelectedExerciseForWorkout(null);
          }}
          onSave={handleSaveWorkout}
          initialExercise={selectedExerciseForWorkout}
        />
      </div>
    </div>
  );
}