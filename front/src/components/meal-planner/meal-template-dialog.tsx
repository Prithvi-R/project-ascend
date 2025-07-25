import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Save,
  Plus,
  X,
  Calculator,
  Loader2,
} from "lucide-react";

interface FoodItem {
  name: string;
  amount: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealTemplate {
  id?: number;
  name: string;
  description?: string;
  meal_type?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  foods: FoodItem[];
  tags?: string[];
  is_public?: boolean;
}

interface MealTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template?: MealTemplate | null;
  onSave: (template: MealTemplate) => void;
  isLoading?: boolean;
}

const getInitialFormData = (template?: MealTemplate | null): MealTemplate => ({
  name: template?.name || "",
  description: template?.description || "",
  meal_type: template?.meal_type || "breakfast",
  calories: template?.calories || 0,
  protein: template?.protein || 0,
  carbs: template?.carbs || 0,
  fat: template?.fat || 0,
  fiber: template?.fiber || 0,
  foods: template?.foods || [{ name: "", amount: "", calories: 0, protein: 0, carbs: 0, fat: 0 }],
  tags: template?.tags || [],
  is_public: template?.is_public || false,
});

export function MealTemplateDialog({ 
  isOpen, 
  onClose, 
  template, 
  onSave, 
  isLoading = false 
}: MealTemplateDialogProps) {
  const [formData, setFormData] = useState<MealTemplate>(() => getInitialFormData(template));

  // Update form data when template prop changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(template));
    }
  }, [template, isOpen]);

  const addFood = () => {
    setFormData({
      ...formData,
      foods: [...formData.foods, { name: "", amount: "", calories: 0, protein: 0, carbs: 0, fat: 0 }]
    });
  };

  const removeFood = (index: number) => {
    const updatedFoods = formData.foods.filter((_, i) => i !== index);
    setFormData({ ...formData, foods: updatedFoods });
  };

  const updateFood = (index: number, field: keyof FoodItem, value: string | number) => {
    const updatedFoods = [...formData.foods];
    updatedFoods[index] = { ...updatedFoods[index], [field]: value };
    setFormData({ ...formData, foods: updatedFoods });
  };

  const calculateNutrition = () => {
    const totals = formData.foods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setFormData({
      ...formData,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    });
  };

  const handleSave = () => {
    if (!formData.name || formData.foods.length === 0) {
      return;
    }

    const hasNutritionData = formData.foods.some(food => 
      food.name && food.amount && (food.calories || food.protein || food.carbs || food.fat)
    );

    if (!hasNutritionData) {
      return;
    }

    onSave(formData);
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData(getInitialFormData(null));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Meal Template' : 'Create New Meal Template'}
          </DialogTitle>
          <DialogDescription>
            {template ? 'Update your meal template' : 'Create a reusable meal template with nutrition information'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., High Protein Breakfast"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-meal-type">Meal Type</Label>
              <Select 
                value={formData.meal_type} 
                onValueChange={(value) => setFormData({...formData, meal_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe this meal template..."
              rows={2}
            />
          </div>

          {/* Foods Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Foods *</Label>
              <div className="flex space-x-2">
                <Button type="button" onClick={calculateNutrition} size="sm" variant="outline">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Nutrition
                </Button>
                <Button type="button" onClick={addFood} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Food
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {formData.foods.map((food, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 bg-slate-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs">Food Name *</Label>
                    <Input
                      value={food.name}
                      onChange={(e) => updateFood(index, 'name', e.target.value)}
                      placeholder="Food name"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount *</Label>
                    <Input
                      value={food.amount}
                      onChange={(e) => updateFood(index, 'amount', e.target.value)}
                      placeholder="1 cup"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Calories</Label>
                    <Input
                      type="number"
                      value={food.calories || ''}
                      onChange={(e) => updateFood(index, 'calories', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Protein (g)</Label>
                    <Input
                      type="number"
                      value={food.protein || ''}
                      onChange={(e) => updateFood(index, 'protein', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Carbs (g)</Label>
                    <Input
                      type="number"
                      value={food.carbs || ''}
                      onChange={(e) => updateFood(index, 'carbs', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFood(index)}
                    disabled={formData.foods.length === 1}
                    className="h-8"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Summary */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-900">{Math.round(formData.calories)}</div>
              <div className="text-xs text-blue-700">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-900">{Math.round(formData.protein)}g</div>
              <div className="text-xs text-red-700">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-900">{Math.round(formData.carbs)}g</div>
              <div className="text-xs text-yellow-700">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-900">{Math.round(formData.fat)}g</div>
              <div className="text-xs text-green-700">Fat</div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="template-tags">Tags (comma-separated)</Label>
            <Input
              id="template-tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="high-protein, quick, healthy"
            />
          </div>

          {/* Public Template Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-public"
              checked={formData.is_public}
              onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
              className="rounded border-slate-300"
            />
            <Label htmlFor="is-public">Make this template public (visible to other users)</Label>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
            >
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
                  {template ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {template ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}