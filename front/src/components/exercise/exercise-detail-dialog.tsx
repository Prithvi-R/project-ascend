import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Dumbbell,
  Target,
  AlertTriangle,
  Play,
  BookOpen,
  Users,
  Clock,
  Zap,
} from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  description: string;
  instructions: string;
  common_mistakes: string;
  video_url?: string;
  tags: {
    primary_muscles?: string[];
    secondary_muscles?: string[];
    equipment?: string[];
    discipline?: string[];
    difficulty?: string;
    force_type?: string;
    movement_pattern?: string;
  };
}

interface ExerciseDetailDialogProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  advanced: "bg-red-100 text-red-700 border-red-200",
};

const disciplineIcons = {
  strength: Dumbbell,
  cardio: Zap,
  flexibility: Target,
  balance: Users,
  endurance: Clock,
};

export function ExerciseDetailDialog({
  exercise,
  isOpen,
  onClose,
  onAddToWorkout
}: ExerciseDetailDialogProps) {
  if (!exercise) return null;

  const handleAddToWorkout = () => {
    onAddToWorkout?.(exercise);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <span>{exercise.name}</span>
          </DialogTitle>
          <DialogDescription className="text-lg">
            {exercise.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exercise Tags */}
          <div className="flex flex-wrap gap-2">
            {/* Difficulty */}
            {exercise.tags.difficulty && (
              <Badge
                variant="outline"
                className={`${difficultyColors[exercise.tags.difficulty as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-700'}`}
              >
                {exercise.tags.difficulty.charAt(0).toUpperCase() + exercise.tags.difficulty.slice(1)}
              </Badge>
            )}

            {/* Equipment */}
            {exercise.tags.equipment?.map(equipment => (
              <Badge key={equipment} variant="outline" className="bg-blue-100 text-blue-700">
                {equipment.replace('_', ' ')}
              </Badge>
            ))}

            {/* Disciplines */}
            {exercise.tags.discipline?.map(discipline => {
              const Icon = disciplineIcons[discipline as keyof typeof disciplineIcons] || BookOpen;
              return (
                <Badge key={discipline} variant="outline" className="bg-purple-100 text-purple-700">
                  <Icon className="w-3 h-3 mr-1" />
                  {discipline}
                </Badge>
              );
            })}
          </div>

          {/* Muscle Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Muscles */}
            {exercise.tags.primary_muscles && exercise.tags.primary_muscles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-red-600" />
                  Primary Muscles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.tags.primary_muscles.map(muscle => (
                    <Badge key={muscle} className="bg-red-100 text-red-700 border-red-200">
                      {muscle.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Muscles */}
            {exercise.tags.secondary_muscles && exercise.tags.secondary_muscles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Secondary Muscles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.tags.secondary_muscles.map(muscle => (
                    <Badge key={muscle} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {muscle.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" />
              Instructions
            </h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {exercise.instructions}
              </p>
            </div>
          </div>

          {/* Common Mistakes */}
          {exercise.common_mistakes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Common Mistakes
              </h3>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {exercise.common_mistakes}
                </p>
              </div>
            </div>
          )}

          {/* Video Section */}
          {exercise.video_url && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Play className="w-5 h-5 mr-2 text-purple-600" />
                Video Demonstration
              </h3>

              <div className="aspect-video bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                {exercise.video_url.endsWith(".gif") || exercise.video_url.endsWith(".webp") ? (
                  <img
                    src={exercise.video_url}
                    alt="Exercise demonstration"
                    className="w-full h-full object-contain"
                  />
                ) : exercise.video_url.includes("youtube.com") || exercise.video_url.includes("youtu.be") ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${new URLSearchParams(new URL(exercise.video_url).search).get("v")}`}
                    title="YouTube Video"
                    className="w-full h-full object-contain"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Play className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-slate-600">Video demonstration available</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(exercise.video_url, "_blank")}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Video
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Exercise Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            {exercise.tags.force_type && (
              <div className="text-center">
                <div className="text-sm font-medium text-slate-900">Force Type</div>
                <div className="text-xs text-slate-600 capitalize">{exercise.tags.force_type.replace('_', ' ')}</div>
              </div>
            )}
            {exercise.tags.movement_pattern && (
              <div className="text-center">
                <div className="text-sm font-medium text-slate-900">Movement Pattern</div>
                <div className="text-xs text-slate-600 capitalize">{exercise.tags.movement_pattern.replace('_', ' ')}</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-sm font-medium text-slate-900">Exercise ID</div>
              <div className="text-xs text-slate-600">#{exercise.id}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddToWorkout} className="flex-1">
              <Dumbbell className="w-4 h-4 mr-2" />
              Add to Workout
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}