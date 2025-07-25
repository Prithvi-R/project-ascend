// ===== PROJECT ASCEND API TYPES =====

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

// ===== API CLIENT CLASS =====

export class ProjectAscendAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== AUTH METHODS =====

  async register(userData: {
    username: string;
    email: string;
    password: string;
    storage_preference: 'cloud' | 'local';
    primary_goal: string;
    height_cm?: number;
    weight_kg?: number;
    age?: number;
    gender?: string;
    activity_level: string;
  }): Promise<{ access_token: string; token_type: string; user: User }> {
    const result = await this.request<{ access_token: string; token_type: string; user: User }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    
    this.setToken(result.access_token);
    return result;
  }

  async login(username: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const result = await this.request<{ access_token: string; token_type: string; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        headers: {},
        body: formData,
      }
    );
    
    this.setToken(result.access_token);
    return result;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // ===== USER METHODS =====

  async updateUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getPlayerStats(): Promise<PlayerStats> {
    return this.request<PlayerStats>('/users/me/stats');
  }

  // ===== QUEST METHODS =====

  async getQuests(status?: string): Promise<Quest[]> {
    const params = status ? `?status=${status}` : '';
    return this.request<Quest[]>(`/quests${params}`);
  }

  async createQuest(questData: Omit<Quest, 'quest_id' | 'user_id' | 'created_at' | 'completed_at'>): Promise<Quest> {
    return this.request<Quest>('/quests', {
      method: 'POST',
      body: JSON.stringify(questData),
    });
  }

  async updateQuest(questId: number, questData: Partial<Quest>): Promise<Quest> {
    return this.request<Quest>(`/quests/${questId}`, {
      method: 'PUT',
      body: JSON.stringify(questData),
    });
  }

  async completeQuest(questId: number): Promise<Quest> {
    return this.request<Quest>(`/quests/${questId}/complete`, {
      method: 'POST',
    });
  }

  // ===== EXERCISE METHODS =====

  async getExercises(filters?: {
    muscle_group?: string;
    equipment?: string;
    discipline?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const queryString = params.toString();
    return this.request<Exercise[]>(`/exercises${queryString ? `?${queryString}` : ''}`);
  }

  async getExercise(exerciseId: number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${exerciseId}`);
  }

  // ===== WORKOUT METHODS =====

  async getWorkouts(limit?: number): Promise<Workout[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<Workout[]>(`/workouts${params}`);
  }

  async createWorkout(workoutData: Omit<Workout, 'id' | 'user_id' | 'created_at'>): Promise<Workout> {
    return this.request<Workout>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  }

  async getWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]> {
    return this.request<WorkoutExercise[]>(`/workouts/${workoutId}/exercises`);
  }

  async addWorkoutExercise(workoutId: number, exerciseData: Omit<WorkoutExercise, 'id' | 'workout_id'>): Promise<WorkoutExercise> {
    return this.request<WorkoutExercise>(`/workouts/${workoutId}/exercises`, {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  }

  // ===== NUTRITION METHODS =====

  async getFoodLogs(date?: string): Promise<FoodLog[]> {
    const params = date ? `?date=${date}` : '';
    return this.request<FoodLog[]>(`/nutrition/logs${params}`);
  }

  async createFoodLog(foodData: Omit<FoodLog, 'id' | 'user_id' | 'created_at'>): Promise<FoodLog> {
    return this.request<FoodLog>('/nutrition/logs', {
      method: 'POST',
      body: JSON.stringify(foodData),
    });
  }

  async getDailyNutritionSummary(date: string): Promise<DailyNutritionSummary> {
    return this.request<DailyNutritionSummary>(`/nutrition/daily-summary?date=${date}`);
  }

  async searchFood(query: string): Promise<any[]> {
    return this.request<any[]>(`/nutrition/search?q=${encodeURIComponent(query)}`);
  }
}

// Export a default instance
export const apiClient = new ProjectAscendAPI("http://localhost:8000");