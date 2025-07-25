import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Settings,
  Loader2,
} from "lucide-react";

interface MealPlanConfig {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  mealsPerDay: number;
  startOfWeek: 'monday' | 'sunday';
  defaultMealTypes: string[];
}

interface MealPlanConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: MealPlanConfig;
  onSave: (config: MealPlanConfig) => void;
  isLoading?: boolean;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

export function MealPlanConfigDialog({ 
  isOpen, 
  onClose, 
  config, 
  onSave, 
  isLoading = false 
}: MealPlanConfigDialogProps) {
  const [formConfig, setFormConfig] = useState<MealPlanConfig>(config);

  const handleSave = () => {
    onSave(formConfig);
  };

  const updateConfig = (key: keyof MealPlanConfig, value: any) => {
    setFormConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleMealType = (mealType: string) => {
    const currentTypes = formConfig.defaultMealTypes;
    if (currentTypes.includes(mealType)) {
      updateConfig('defaultMealTypes', currentTypes.filter(mt => mt !== mealType));
    } else {
      updateConfig('defaultMealTypes', [...currentTypes, mealType]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Meal Plan Configuration</span>
          </DialogTitle>
          <DialogDescription>
            Customize your meal planning preferences and nutrition targets
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Nutrition Targets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Daily Nutrition Targets</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Daily Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formConfig.calorieTarget}
                  onChange={(e) => updateConfig('calorieTarget', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={formConfig.proteinTarget}
                  onChange={(e) => updateConfig('proteinTarget', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={formConfig.carbsTarget}
                  onChange={(e) => updateConfig('carbsTarget', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  value={formConfig.fatTarget}
                  onChange={(e) => updateConfig('fatTarget', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Meal Planning Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Planning Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meals-per-day">Meals per Day</Label>
                <Select 
                  value={formConfig.mealsPerDay.toString()} 
                  onValueChange={(value) => updateConfig('mealsPerDay', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meals</SelectItem>
                    <SelectItem value="4">4 meals</SelectItem>
                    <SelectItem value="5">5 meals</SelectItem>
                    <SelectItem value="6">6 meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-of-week">Start of Week</Label>
                <Select 
                  value={formConfig.startOfWeek} 
                  onValueChange={(value: 'monday' | 'sunday') => updateConfig('startOfWeek', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Default Meal Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Default Meal Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map((mealType) => (
                <label key={mealType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formConfig.defaultMealTypes.includes(mealType)}
                    onChange={() => toggleMealType(mealType)}
                    className="rounded border-slate-300"
                  />
                  <span className="capitalize">{mealType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Macro Distribution Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Macro Distribution</h3>
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-red-900">
                  {Math.round((formConfig.proteinTarget * 4 / formConfig.calorieTarget) * 100)}%
                </div>
                <div className="text-xs text-red-700">Protein</div>
                <div className="text-xs text-slate-600">{formConfig.proteinTarget}g</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-900">
                  {Math.round((formConfig.carbsTarget * 4 / formConfig.calorieTarget) * 100)}%
                </div>
                <div className="text-xs text-yellow-700">Carbs</div>
                <div className="text-xs text-slate-600">{formConfig.carbsTarget}g</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">
                  {Math.round((formConfig.fatTarget * 9 / formConfig.calorieTarget) * 100)}%
                </div>
                <div className="text-xs text-green-700">Fat</div>
                <div className="text-xs text-slate-600">{formConfig.fatTarget}g</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}