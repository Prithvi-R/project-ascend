import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";

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

interface WeeklyMealGridProps {
  weekDates: Date[];
  plannedMeals: PlannedMeal[];
  config: MealPlanConfig;
  onAddMeal: (date: string, mealType: string) => void;
  onRemoveMeal: (mealId: number) => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function WeeklyMealGrid({ 
  weekDates, 
  plannedMeals, 
  config, 
  onAddMeal, 
  onRemoveMeal 
}: WeeklyMealGridProps) {
  const getMealsForDay = (date: Date, mealType: string) => {
    const dateString = date.toISOString().split('T')[0];
    return plannedMeals.filter(meal => 
      meal.date === dateString && meal.meal_type === mealType
    );
  };

  const getDayTotals = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayMeals = plannedMeals.filter(meal => meal.date === dateString);
    
    return dayMeals.reduce((totals, meal) => {
      if (meal.template) {
        return {
          calories: totals.calories + meal.template.calories,
          protein: totals.protein + meal.template.protein,
          carbs: totals.carbs + meal.template.carbs,
          fat: totals.fat + meal.template.fat,
        };
      }
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {weekDates.map((date, dayIndex) => {
        const dayTotals = getDayTotals(date);
        const dateString = date.toISOString().split('T')[0];
        const calorieProgress = (dayTotals.calories / config.calorieTarget) * 100;
        
        return (
          <Card key={dayIndex} className="min-h-[600px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-center">
                <div className="font-bold text-slate-900">{daysOfWeek[dayIndex]}</div>
                <div className="text-sm text-slate-600">{date.getDate()}</div>
              </CardTitle>
              
              {/* Day Totals with Progress */}
              <div className="text-center p-3 bg-slate-50 rounded-lg space-y-2">
                <div className="text-lg font-bold text-slate-900">{dayTotals.calories} kcal</div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-600">
                  {Math.round(calorieProgress)}% of {config.calorieTarget} kcal
                </div>
                <div className="text-xs text-slate-600">
                  P: {dayTotals.protein}g • C: {dayTotals.carbs}g • F: {dayTotals.fat}g
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {config.defaultMealTypes.map((mealType) => {
                const meals = getMealsForDay(date, mealType);
                
                return (
                  <div key={mealType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-700 capitalize">
                        {mealType === 'breakfast' && '🌅'}
                        {mealType === 'lunch' && '☀️'}
                        {mealType === 'dinner' && '🌙'}
                        {mealType === 'snack' && '🍎'}
                        {' '}{mealType}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddMeal(dateString, mealType)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {meals.length === 0 ? (
                        <div 
                          className="p-3 border-2 border-dashed border-slate-200 rounded-lg text-center cursor-pointer hover:border-slate-300 transition-colors"
                          onClick={() => onAddMeal(dateString, mealType)}
                        >
                          <Plus className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                          <div className="text-xs text-slate-500">Add meal</div>
                        </div>
                      ) : (
                        meals.map((meal) => (
                          <div key={meal.id} className="p-2 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-slate-900">
                                  {meal.template?.name || meal.custom_name}
                                </div>
                                {meal.template && (
                                  <div className="text-xs text-slate-600">
                                    {meal.template.calories} kcal
                                  </div>
                                )}
                                {meal.notes && (
                                  <div className="text-xs text-slate-500 italic mt-1">
                                    {meal.notes}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveMeal(meal.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}