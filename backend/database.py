from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database URL - use environment variable or default to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./project_ascend.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Profile Information
    storage_preference = Column(String, default="cloud")  # 'cloud' or 'local'
    primary_goal = Column(String, default="general_fitness")
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)  # 'male', 'female', 'other'
    activity_level = Column(String, default="moderately_active")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workouts = relationship("Workout", back_populates="user")
    quests = relationship("Quest", back_populates="user")
    food_logs = relationship("FoodLog", back_populates="user")
    daily_nutrition_summaries = relationship("DailyNutritionSummary", back_populates="user")
    meal_templates = relationship("MealTemplate", back_populates="user")
    water_logs = relationship("WaterLog", back_populates="user")

# Exercise Model
class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    instructions = Column(Text)
    common_mistakes = Column(Text)
    video_url = Column(String, nullable=True)
    
    # JSON field for tags (muscle groups, equipment, etc.)
    tags = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Workout Model
class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    date_logged = Column(DateTime, default=datetime.utcnow)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    
    # XP earned from this workout (JSON field)
    xp_earned = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="workouts")
    exercises = relationship("WorkoutExercise", back_populates="workout")

# Workout Exercise Junction Table
class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    
    # Exercise details
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    distance_meters = Column(Float, nullable=True)
    rest_seconds = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    order_in_workout = Column(Integer, default=0)
    
    # Relationships
    workout = relationship("Workout", back_populates="exercises")
    exercise = relationship("Exercise")

# Quest Model (RPG System)
class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    type = Column(String, nullable=False)  # 'fitness', 'nutrition', 'learning', 'social'
    status = Column(String, default="active")  # 'active', 'completed', 'failed', 'paused'
    
    # XP reward (JSON field)
    xp_reward = Column(JSON, default={})
    
    # Dates
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="quests")

# Food Log Model (Nutrition Tracking)
class FoodLog(Base):
    __tablename__ = "food_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Food Information
    food_name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    serving_size = Column(String, nullable=False)
    
    # Nutrition per serving
    calories_per_serving = Column(Float, nullable=False)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, nullable=True)
    sugar_g = Column(Float, nullable=True)
    sodium_mg = Column(Float, nullable=True)
    
    # Consumption details
    servings_consumed = Column(Float, default=1.0)
    meal_type = Column(String, nullable=False)  # 'breakfast', 'lunch', 'dinner', 'snack'
    logged_at = Column(DateTime, default=datetime.utcnow)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="food_logs")

# Daily Nutrition Summary
class DailyNutritionSummary(Base):
    __tablename__ = "daily_nutrition_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD format
    
    # Daily totals
    total_calories = Column(Float, default=0)
    total_protein_g = Column(Float, default=0)
    total_carbs_g = Column(Float, default=0)
    total_fat_g = Column(Float, default=0)
    total_fiber_g = Column(Float, nullable=True)
    total_sugar_g = Column(Float, nullable=True)
    total_sodium_mg = Column(Float, nullable=True)
    
    # XP earned from nutrition goals
    xp_earned = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

# Food Database Model (Master food list for search)
class FoodDatabase(Base):
    __tablename__ = "food_database"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    serving_size = Column(String, default="1 serving")
    
    # Nutrition information per serving
    calories = Column(Float, nullable=False)
    protein = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    fiber = Column(Float, nullable=True)
    sugar = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)
    
    # Categorization
    category = Column(String, nullable=True, index=True)  # meat, vegetables, fruits, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Meal Template Model (Pre-built meal combinations)
class MealTemplate(Base):
    __tablename__ = "meal_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL for public templates
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    meal_type = Column(String, nullable=True)  # 'breakfast', 'lunch', 'dinner', 'snack'
    
    # Total nutrition for the entire meal
    calories = Column(Float, nullable=False)
    protein = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    fiber = Column(Float, nullable=True)
    
    # Foods in this template (JSON array)
    foods = Column(JSON, default=[])  # [{"name": "Chicken", "amount": "100g", "calories": 165}, ...]
    
    # Tags for filtering (JSON array)
    tags = Column(JSON, default=[])  # ["high-protein", "quick", "vegetarian"]
    
    # Visibility
    is_public = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="meal_templates")

# Water Log Model (Hydration tracking)
class WaterLog(Base):
    __tablename__ = "water_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_ml = Column(Integer, nullable=False)  # Amount in milliliters
    logged_at = Column(DateTime, default=datetime.utcnow)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="water_logs")

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Initialize database
if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!")