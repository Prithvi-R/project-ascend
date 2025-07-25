import axios, { AxiosResponse } from 'axios';
import {
  User,
  Exercise,
  Workout,
  UserCreate,
  AuthResponse,
  Quest,
  WorkoutExercise,
  FoodLog,
  DailyNutritionSummary,
  PlayerStats
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  // Login with email and password
  login: (email: string, password: string): Promise<AxiosResponse<AuthResponse>> =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  // Register new user
  register: (userData: UserCreate): Promise<AxiosResponse<AuthResponse>> =>
    api.post<AuthResponse>('/auth/register', userData),

  // Get current user info
  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    api.get<User>('/auth/me'),

  // Logout (clear token)
  logout: () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  }
};

// ===== USER API =====
export const userAPI = {
  // Update user profile
  updateProfile: (userData: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put<User>('/users/me', userData),

  // Get user's player stats (RPG progression)
  getPlayerStats: (): Promise<AxiosResponse<PlayerStats>> =>
    api.get<PlayerStats>('/users/me/stats'),
};

// ===== EXERCISE API =====
export const exerciseAPI = {
  // Get all exercises with optional filters
  getAll: (filters: {
    muscle_group?: string;
    discipline?: string;
    equipment?: string;
    difficulty?: string;
    search?: string;
  } = {}): Promise<AxiosResponse<Exercise[]>> =>
    api.get<Exercise[]>('/exercises', { params: filters }),

  // Get exercise by ID
  getById: (id: number): Promise<AxiosResponse<Exercise>> =>
    api.get<Exercise>(`/exercises/${id}`),
};

// ===== WORKOUT API =====
export const workoutAPI = {
  // Create new workout
  create: (workoutData: {
    name: string;
    date_logged: string;
    duration_minutes?: number;
    notes?: string;
  }): Promise<AxiosResponse<Workout>> =>
    api.post<Workout>('/workouts', workoutData),

  // Get user's workouts
  getUserWorkouts: (limit?: number): Promise<AxiosResponse<Workout[]>> =>
    api.get<Workout[]>('/workouts', { params: limit ? { limit } : {} }),

  // Get workout by ID
  getById: (id: number): Promise<AxiosResponse<Workout>> =>
    api.get<Workout>(`/workouts/${id}`),

  // Get exercises for a specific workout
  getWorkoutExercises: (workoutId: number): Promise<AxiosResponse<WorkoutExercise[]>> =>
    api.get<WorkoutExercise[]>(`/workouts/${workoutId}/exercises`),

  // Add exercise to workout
  addExercise: (workoutId: number, exerciseData: {
    exercise_id: number;
    sets: number;
    reps?: number;
    weight_kg?: number;
    duration_seconds?: number;
    distance_meters?: number;
    rest_seconds?: number;
    notes?: string;
    order_in_workout: number;
  }): Promise<AxiosResponse<WorkoutExercise>> =>
    api.post<WorkoutExercise>(`/workouts/${workoutId}/exercises`, exerciseData),
};

// ===== WORKOUT ANALYTICS API =====
export const workoutAnalyticsAPI = {
  // Get muscle group training analytics
  getMuscleGroupAnalytics: (days: number = 30): Promise<AxiosResponse<any>> =>
    api.get('/api/workouts/analytics/muscle-groups', { params: { days } }),

  // Get weekly workout activity
  getWeeklyActivity: (weeks: number = 4): Promise<AxiosResponse<any>> =>
    api.get('/api/workouts/analytics/weekly', { params: { weeks } }),

  // Get workout frequency by day
  getWorkoutFrequency: (): Promise<AxiosResponse<any>> =>
    api.get('/api/workouts/analytics/frequency'),

  // Get personal records
  getPersonalRecords: (): Promise<AxiosResponse<any>> =>
    api.get('/api/workouts/analytics/records'),
};

// ===== QUEST API =====
export const questAPI = {
  // Get user's quests
  getAll: (status?: 'active' | 'completed' | 'failed' | 'paused'): Promise<AxiosResponse<Quest[]>> =>
    api.get<Quest[]>('/quests', { params: status ? { status } : {} }),

  // Create new quest
  create: (questData: {
    title: string;
    description: string;
    type: 'fitness' | 'nutrition' | 'learning' | 'social';
    xp_reward: Record<string, number>;
    due_date: string;
  }): Promise<AxiosResponse<Quest>> =>
    api.post<Quest>('/quests', questData),

  // Update quest
  update: (questId: number, questData: Partial<Quest>): Promise<AxiosResponse<Quest>> =>
    api.put<Quest>(`/quests/${questId}`, questData),

  generateAIQuest: async () => {
    api.post("/generate-quest", {
      user_id: 10, // Replace with dynamic user ID if needed
      recent_workouts: [],
      goals: "build strength and endurance"
    });
  },

  // Complete quest
  complete: (questId: number): Promise<AxiosResponse<Quest>> =>
    api.post<Quest>(`/quests/${questId}/complete`),
};

// ===== NUTRITION API =====
export const nutritionAPI = {
  // Get food logs
  getFoodLogs: (date?: string): Promise<AxiosResponse<FoodLog[]>> =>
    api.get<FoodLog[]>('/nutrition/logs', { params: date ? { date } : {} }),

  // Log food
  logFood: (foodData: {
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
    // logged_at: string;
  }): Promise<AxiosResponse<FoodLog>> =>
    api.post<FoodLog>('/nutrition/logs', foodData),

  // Get daily nutrition summary
  getDailySummary: (date: string): Promise<AxiosResponse<DailyNutritionSummary>> =>
    api.get<DailyNutritionSummary>(`/nutrition/daily-summary`, { params: { date } }),

  // Search food database
  searchFood: (query: string): Promise<AxiosResponse<any[]>> =>
    api.get<any[]>('/nutrition/search', { params: { q: query } }),
};

// ===== FOOD DATABASE API =====
export const foodDatabaseAPI = {
  // Search food database
  search: (query: string, limit: number = 20): Promise<AxiosResponse<any>> =>
    api.get('/api/food-database/search', { params: { q: query, limit } }),

  // Get popular foods
  getPopular: (): Promise<AxiosResponse<any>> =>
    api.get('/api/food-database/popular'),

  // Get food categories
  getCategories: (): Promise<AxiosResponse<any>> =>
    api.get('/api/food-database/categories'),

  // Get food by ID
  getById: (id: number): Promise<AxiosResponse<any>> =>
    api.get(`/api/food-database/${id}`),

  // Add new food to database
  addFood: (foodData: {
    name: string;
    brand?: string;
    serving_size: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    category?: string;
  }): Promise<AxiosResponse<any>> =>
    api.post('/api/food-database/add', foodData),
};

// ===== MEAL TEMPLATES API =====
export const mealTemplatesAPI = {
  // Get all meal templates
  getAll: (filters: {
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    category?: string;
    limit?: number;
    user_only?: boolean;
  } = {}): Promise<AxiosResponse<any>> =>
    api.get('/api/meal-templates', { params: filters }),

  // Get meal template by ID
  getById: (id: number): Promise<AxiosResponse<any>> =>
    api.get(`/api/meal-templates/${id}`),

  // Create new meal template
  create: (templateData: {
    name: string;
    description?: string;
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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
  }): Promise<AxiosResponse<any>> =>
    api.post('/api/meal-templates', templateData),

  // Update meal template
  update: (id: number, templateData: any): Promise<AxiosResponse<any>> =>
    api.put(`/api/meal-templates/${id}`, templateData),

  // Delete meal template
  delete: (id: number): Promise<AxiosResponse<any>> =>
    api.delete(`/api/meal-templates/${id}`),

  // Get popular meal templates
  getPopular: (): Promise<AxiosResponse<any>> =>
    api.get('/api/meal-templates/popular'),

  // Get meal template categories
  getCategories: (): Promise<AxiosResponse<any>> =>
    api.get('/api/meal-templates/categories'),
};

// ===== NUTRITION ANALYTICS API =====
export const nutritionAnalyticsAPI = {
  // Get nutrition history
  getNutritionHistory: (limit: number = 30, offset: number = 0): Promise<AxiosResponse<any>> =>
    api.get('/api/nutrition/analytics/history', { params: { limit, offset } }),

  // Get weekly nutrition analytics
  getWeeklyNutrition: (weeks: number = 4): Promise<AxiosResponse<any>> =>
    api.get('/api/nutrition/analytics/weekly', { params: { weeks } }),

  // Get water intake data
  getWaterIntake: (): Promise<AxiosResponse<any>> =>
    api.get('/api/nutrition/analytics/water'),

  // Log water intake
  logWater: (amount_ml: number): Promise<AxiosResponse<any>> =>
    api.post('/api/nutrition/analytics/water', { amount_ml }),
};

// ===== UTILITY FUNCTIONS =====

// Set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Export the axios instance for custom requests
export { api };

// Default export with all APIs
export default {
  auth: authAPI,
  user: userAPI,
  exercise: exerciseAPI,
  workout: workoutAPI,
  workoutAnalytics: workoutAnalyticsAPI,
  quest: questAPI,
  nutrition: nutritionAPI,
  nutritionAnalytics: nutritionAnalyticsAPI,
  foodDatabase: foodDatabaseAPI,
  mealTemplates: mealTemplatesAPI,
};