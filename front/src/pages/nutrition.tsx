import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NutritionDashboard from "./nutrition-dashboard";
import LogFood from "./log-food";
import NutritionHistory from "./nutrition-history";
import MealPlanner from "./meal-planner";
import {
  Apple,
  Plus,
  History,
  BarChart3,
  Calendar,
  Target,
  Zap,
} from "lucide-react";

export default function Nutrition() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Nutrition Center</h1>
              <p className="text-slate-600">Track your nutrition and fuel your ascent</p>
            </div>
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="log-food" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Log Food</span>
              </TabsTrigger>
              <TabsTrigger value="meal-planner" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Meal Planner</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <NutritionDashboard />
          </TabsContent>

          {/* Log Food Tab */}
          <TabsContent value="log-food">
            <LogFood />
          </TabsContent>

          {/* Meal Planner Tab */}
          <TabsContent value="meal-planner">
            <MealPlanner />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <NutritionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}