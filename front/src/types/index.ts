export interface User {
  id: number;
  username: string;
  email: string;
  storage_preference: 'cloud' | 'local';
  primary_goal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  created_at: string;
  updated_at: string;
  player_stats?: PlayerStats;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  storage_preference: 'cloud' | 'local';
  primary_goal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
}

export interface PlayerStats {
  level: number;
  total_xp: number;
  xp_to_next_level: number;
  attributes: {
    STR: { value: number; xp: number };
    AGI: { value: number; xp: number };
    END: { value: number; xp: number };
    INT: { value: number; xp: number };
    CHA: { value: number; xp: number };
  };
}

export interface Quest {
  quest_id: number;
  user_id: number;
  title: string;
  description: string;
  type: 'fitness' | 'nutrition' | 'learning' | 'social';
  status: 'active' | 'completed' | 'failed' | 'paused';
  xp_reward: Record<string, number>;
  due_date: string;
  created_at: string;
  completed_at?: string;
}

export interface Exercise {
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
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: number;
  user_id: number;
  name: string;
  date_logged: string;
  duration_minutes?: number;
  notes?: string;
  xp_earned: Record<string, number>;
  created_at: string;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  sets: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  rest_seconds?: number;
  notes?: string;
  order_in_workout: number;
}

export interface FoodLog {
  id: number;
  user_id: number;
  food_name: string;
  brand?: string;
  serving_size: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  servings_consumed: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
  created_at: string;
}

export interface DailyNutritionSummary {
  id: number;
  user_id: number;
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g?: number;
  total_sugar_g?: number;
  total_sodium_mg?: number;
  xp_earned: Record<string, number>;
  created_at: string;
  updated_at: string;
}

// Auth response types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}