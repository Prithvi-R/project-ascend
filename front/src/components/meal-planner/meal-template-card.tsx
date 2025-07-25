import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  Copy,
  Trash2,
  Star,
  Share,
  Eye,
} from "lucide-react";

interface MealTemplate {
  id: number;
  name: string;
  description?: string;
  meal_type?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  foods?: Array<{
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

interface MealTemplateCardProps {
  template: MealTemplate;
  onEdit?: (template: MealTemplate) => void;
  onDuplicate?: (template: MealTemplate) => void;
  onDelete?: (templateId: number) => void;
  onView?: (template: MealTemplate) => void;
  isDeleting?: boolean;
  showActions?: boolean;
  isPopular?: boolean;
}

export function MealTemplateCard({ 
  template, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onView,
  isDeleting = false,
  showActions = true,
  isPopular = false
}: MealTemplateCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${isPopular ? 'border-yellow-200 bg-yellow-50' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-slate-900">{template.name}</h4>
                {isPopular && <Star className="w-4 h-4 text-yellow-500" />}
                {template.is_public && (
                  <Badge variant="outline" className="text-xs">
                    <Share className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
              {template.description && (
                <p className="text-sm text-slate-600 mt-1">{template.description}</p>
              )}
            </div>
            
            {showActions && (
              <div className="flex space-x-1">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(template)}
                    title="View template"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(template)}
                    title="Edit template"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(template)}
                    title="Duplicate template"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(template.id)}
                    disabled={isDeleting}
                    title="Delete template"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="font-bold text-slate-900">{template.calories} kcal</div>
            <div className="text-xs text-slate-600">
              P: {template.protein}g • C: {template.carbs}g • F: {template.fat}g
            </div>
          </div>
          
          {template.foods && template.foods.length > 0 && (
            <div className="space-y-1">
              {template.foods.slice(0, 3).map((food, index) => (
                <div key={index} className="text-xs text-slate-600 flex justify-between">
                  <span>{food.name}</span>
                  <span>{food.amount}</span>
                </div>
              ))}
              {template.foods.length > 3 && (
                <div className="text-xs text-slate-500 text-center">
                  +{template.foods.length - 3} more items
                </div>
              )}
            </div>
          )}

          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`text-xs ${isPopular ? 'border-yellow-300 text-yellow-700' : ''}`}
                >
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}