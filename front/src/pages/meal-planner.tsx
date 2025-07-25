import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Calendar,
  Plus,
  Settings,
  Copy,
  Save,
  Loader2,
  AlertCircle,
  ChefHat,
  Star,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { mealTemplatesAPI } from "@/services/api";

// Import the new components
import { MealTemplateDialog } from "@/components/meal-planner/meal-template-dialog";
import { MealTemplateCard } from "@/components/meal-planner/meal-template-card";
import { WeeklyMealGrid } from "@/components/meal-planner/weekly-meal-grid";
import { MealPlanConfigDialog } from "@/components/meal-planner/meal-plan-config-dialog";

interface PlannedMeal {
  id: number;
  date: string;
  meal_type: string;
  template?: any;
  custom_name?: string;
  notes?: string;
}

interface MealPlanConfig {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  mealsPerDay: number;
  startOfWeek: 'monday' | 'sunday';
  defaultMealTypes: string[];
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
  foods: Array<{
    name: string;
    amount: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>;
  tags?: string[];
  is_public?: boolean;
}

export default function MealPlanner() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customMealName, setCustomMealName] = useState('');
  const [mealNotes, setMealNotes] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<MealTemplate | null>(null);
  const [templateFilter, setTemplateFilter] = useState('all');

  // Meal plan configuration state
  const [config, setConfig] = useState<MealPlanConfig>({
    calorieTarget: 2200,
    proteinTarget: 150,
    carbsTarget: 220,
    fatTarget: 75,
    mealsPerDay: 4,
    startOfWeek: 'monday',
    defaultMealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
  });

  // Fetch meal templates from the real backend API
  const { data: mealTemplates = [], isLoading: templatesLoading, refetch: refetchTemplates } = useQuery({
    queryKey: ['meal-templates', templateFilter],
    queryFn: async () => {
      const filters: any = { limit: 50 };
      if (templateFilter !== 'all') {
        filters.meal_type = templateFilter;
      }
      const response = await mealTemplatesAPI.getAll(filters);
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  // Fetch popular templates
  // const { data: popularTemplates = [] } = useQuery({
  //   queryKey: ['meal-templates-popular'],
  //   queryFn: async () => {
  //     const response = await mealTemplatesAPI.getPopular();
  //     return response.data.data;
  //   },
  //   enabled: isAuthenticated,
  // });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: MealTemplate) => {
      const response = await mealTemplatesAPI.create(templateData);
      return response.data;
    },
    onSuccess: () => {
      refetchTemplates();
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      showToast("Template created successfully!", "success");
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      showToast("Error creating template. Please try again.", "error");
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MealTemplate }) => {
      const response = await mealTemplatesAPI.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      refetchTemplates();
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      showToast("Template updated successfully!", "success");
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      showToast("Error updating template. Please try again.", "error");
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await mealTemplatesAPI.delete(templateId);
      return response.data;
    },
    onSuccess: () => {
      refetchTemplates();
      showToast("Template deleted successfully!", "success");
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      showToast("Error deleting template. Please try again.", "error");
    },
  });

  // Save meal plan mutation
  const saveMealPlanMutation = useMutation({
    mutationFn: async (mealPlan: PlannedMeal[]) => {
      // In a real app, this would save the entire meal plan to your backend
      console.log('Saving meal plan:', mealPlan);
      return { success: true };
    },
    onSuccess: () => {
      showToast("Meal plan saved successfully!", "success");
    },
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: MealPlanConfig) => {
      // In a real app, this would save the configuration to your backend
      console.log('Saving meal plan configuration:', newConfig);
      setConfig(newConfig);
      return { success: true };
    },
    onSuccess: () => {
      setIsConfigDialogOpen(false);
      showToast("Configuration saved successfully!", "success");
    },
  });

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

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setIsTemplateDialogOpen(true);
  };

  const openEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const duplicateTemplate = (template: any) => {
    setEditingTemplate(null);
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      is_public: false, // Always make copies private by default
    };
    setEditingTemplate(duplicatedTemplate);
    setIsTemplateDialogOpen(true);
  };

  const saveTemplate = (templateData: MealTemplate) => {
    if (editingTemplate && editingTemplate.id) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateData });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  const deleteTemplate = (templateId: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const start = new Date(startDate);
    const startDay = config.startOfWeek === 'monday' ? 1 : 0;
    start.setDate(start.getDate() - start.getDay() + startDay);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);

  const openMealDialog = (day: string, mealType: string) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setSelectedTemplate(null);
    setCustomMealName('');
    setMealNotes('');
    setIsDialogOpen(true);
  };

  const addMeal = () => {
    const newMeal: PlannedMeal = {
      id: Date.now(),
      date: selectedDay,
      meal_type: selectedMealType,
      template: selectedTemplate || undefined,
      custom_name: customMealName || undefined,
      notes: mealNotes || undefined,
    };
    
    setPlannedMeals([...plannedMeals, newMeal]);
    setIsDialogOpen(false);
  };

  const removeMeal = (mealId: number) => {
    setPlannedMeals(plannedMeals.filter(meal => meal.id !== mealId));
  };

  const copyWeek = () => {
    const nextWeekMeals = plannedMeals.map(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setDate(mealDate.getDate() + 7);
      return {
        ...meal,
        id: Date.now() + Math.random(),
        date: mealDate.toISOString().split('T')[0],
      };
    });
    
    setPlannedMeals([...plannedMeals, ...nextWeekMeals]);
    
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
    
    showToast("Week copied to next week!");
  };

  const saveWeek = () => {
    saveMealPlanMutation.mutate(plannedMeals);
  };

  const saveConfiguration = () => {
    saveConfigMutation.mutate(config);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to plan meals.</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Meal Planner</h1>
          <p className="text-slate-600">Plan your nutrition for optimal performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsConfigDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" onClick={copyWeek}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Week
          </Button>
          <Button 
            onClick={saveWeek}
            disabled={saveMealPlanMutation.isPending}
          >
            {saveMealPlanMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{config.calorieTarget}</div>
                <div className="text-xs text-blue-700">Daily Calories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-900">{config.proteinTarget}g</div>
                <div className="text-xs text-purple-700">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-900">{config.carbsTarget}g</div>
                <div className="text-xs text-green-700">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-900">{config.fatTarget}g</div>
                <div className="text-xs text-orange-700">Fat</div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {config.mealsPerDay} meals/day
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Meal Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5" />
              <span>Meal Templates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={openCreateTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Popular Templates Section */}
          {/* {popularTemplates.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Popular Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {popularTemplates.slice(0, 3).map((template) => (
                  <MealTemplateCard
                    key={template.id}
                    template={template}
                    onDuplicate={duplicateTemplate}
                    isPopular={true}
                    showActions={false}
                  />
                ))}
              </div>
            </div>
          )} */}

          {/* All Templates */}
          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading templates...</span>
            </div>
          ) : mealTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mealTemplates.map((template) => (
                <MealTemplateCard
                  key={template.id}
                  template={template}
                  onEdit={openEditTemplate}
                  onDuplicate={duplicateTemplate}
                  onDelete={deleteTemplate}
                  isDeleting={deleteTemplateMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No meal templates available</h3>
              <p className="text-slate-600 mb-4">Create your first meal template to get started.</p>
              <Button onClick={openCreateTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                const newDate = new Date(selectedWeek);
                newDate.setDate(newDate.getDate() - 7);
                setSelectedWeek(newDate);
              }}
            >
              ← Previous Week
            </Button>
            <div className="text-center">
              <div className="font-semibold text-slate-900">
                Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
              </div>
              <div className="text-sm text-slate-600">
                {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                const newDate = new Date(selectedWeek);
                newDate.setDate(newDate.getDate() + 7);
                setSelectedWeek(newDate);
              }}
            >
              Next Week →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Meal Grid */}
      <WeeklyMealGrid
        weekDates={weekDates}
        plannedMeals={plannedMeals}
        config={config}
        onAddMeal={openMealDialog}
        onRemoveMeal={removeMeal}
      />

      {/* Dialogs */}
      <MealTemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        template={editingTemplate}
        onSave={saveTemplate}
        isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
      />

      <MealPlanConfigDialog
        isOpen={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
        config={config}
        onSave={saveConfiguration}
        isLoading={saveConfigMutation.isPending}
      />

      {/* Add Meal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Meal</DialogTitle>
            <DialogDescription>
              Add a meal to {selectedDay} {selectedMealType}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-3">
              <Label>Choose a Template (Optional)</Label>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {mealTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{template.name}</div>
                        <div className="text-sm text-slate-600">{template.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">{template.calories} kcal</div>
                        <div className="text-xs text-slate-600">
                          P: {template.protein}g • C: {template.carbs}g • F: {template.fat}g
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Meal Name */}
            <div className="space-y-2">
              <Label htmlFor="custom-name">Custom Meal Name</Label>
              <Input
                id="custom-name"
                value={customMealName}
                onChange={(e) => setCustomMealName(e.target.value)}
                placeholder="Enter custom meal name..."
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                placeholder="Add any notes about this meal..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={addMeal} 
                className="flex-1"
                disabled={!selectedTemplate && !customMealName}
              >
                Add Meal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}