from fastapi import APIRouter, FastAPI, HTTPException, Depends, status
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()
# from quest_ai_router import router as quest_ai_router

# ===== CONFIGURATION =====
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

if not isinstance(SECRET_KEY, str) or len(SECRET_KEY) < 10:
    SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

# Database URL - use environment variable or SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./project_ascend.db")

# ===== DATABASE SETUP =====
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# === Load Gemini ===
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set!")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)


# ===== DATABASE MODELS =====
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    storage_preference = Column(String, default="cloud")
    primary_goal = Column(String, default="general_fitness")
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    activity_level = Column(String, default="moderately_active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    instructions = Column(Text)
    common_mistakes = Column(Text)
    video_url = Column(String, nullable=True)
    tags = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    date_logged = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    xp_earned = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, nullable=False)
    exercise_id = Column(Integer, nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    distance_meters = Column(Float, nullable=True)
    rest_seconds = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    order_in_workout = Column(Integer, nullable=False)

class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    type = Column(String, nullable=False)  # fitness, nutrition, learning, social
    status = Column(String, default="active")  # active, completed, failed, paused
    xp_reward = Column(JSON)
    due_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class FoodLog(Base):
    __tablename__ = "food_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    food_name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    serving_size = Column(String, nullable=False)
    calories_per_serving = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    fiber_g = Column(Float, nullable=True)
    sugar_g = Column(Float, nullable=True)
    sodium_mg = Column(Float, nullable=True)
    servings_consumed = Column(Float, nullable=False)
    meal_type = Column(String, nullable=False)  # breakfast, lunch, dinner, snack
    logged_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyNutritionSummary(Base):
    __tablename__ = "daily_nutrition_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD format
    total_calories = Column(Float, nullable=False)
    total_protein_g = Column(Float, nullable=False)
    total_carbs_g = Column(Float, nullable=False)
    total_fat_g = Column(Float, nullable=False)
    total_fiber_g = Column(Float, nullable=True)
    total_sugar_g = Column(Float, nullable=True)
    total_sodium_mg = Column(Float, nullable=True)
    xp_earned = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FoodDatabase(Base):
    __tablename__ = "food_database"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    serving_size = Column(String, nullable=False)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)
    fiber = Column(Float, nullable=True)
    sugar = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)
    category = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MealTemplate(Base):
    __tablename__ = "meal_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    meal_type = Column(String, nullable=True)  # breakfast, lunch, dinner, snack
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)
    fiber = Column(Float, nullable=True)
    foods = Column(JSON, nullable=False)  # List of foods with amounts
    tags = Column(JSON, nullable=True)  # List of tags like ["high-protein", "quick"]
    is_public = Column(Boolean, default=True)
    user_id = Column(Integer, nullable=True)  # NULL for public templates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WaterLog(Base):
    __tablename__ = "water_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    amount_ml = Column(Float, nullable=False)
    logged_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuestAIRequest(BaseModel):
    focus: Optional[str] = "fitness"
    recent_activity_summary: Optional[str] = ""
    preferred_challenge_level: str = "normal"  # normal | hard | hardcore

# Create tables
Base.metadata.create_all(bind=engine)

# ===== PYDANTIC MODELS =====
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    storage_preference: str = "cloud"
    primary_goal: str = "general_fitness"
    height_cm: Optional[int] = None
    weight_kg: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: str = "moderately_active"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    storage_preference: str
    primary_goal: str
    height_cm: Optional[int]
    weight_kg: Optional[float]
    age: Optional[int]
    gender: Optional[str]
    activity_level: str
    created_at: datetime
    updated_at: datetime
    player_stats: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class PlayerStatsResponse(BaseModel):
    level: int
    total_xp: int
    xp_to_next_level: int
    attributes: Dict[str, Dict[str, int]]

class ExerciseResponse(BaseModel):
    id: int
    name: str
    description: str
    instructions: str
    common_mistakes: str
    video_url: Optional[str]
    tags: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkoutCreate(BaseModel):
    name: str
    date_logged: datetime
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None

class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    name: str
    date_logged: datetime
    duration_minutes: Optional[int]
    notes: Optional[str]
    xp_earned: Dict[str, int]
    created_at: datetime

    class Config:
        from_attributes = True

class QuestCreate(BaseModel):
    title: str
    description: str
    type: str
    xp_reward: Dict[str, int]
    due_date: datetime

class QuestResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    type: str
    status: str
    xp_reward: Dict[str, int]
    due_date: datetime
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class FoodDatabaseResponse(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    serving_size: str
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: Optional[float]
    sugar: Optional[float]
    sodium: Optional[float]
    category: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MealTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    meal_type: Optional[str] = None
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: Optional[float] = None
    foods: List[Dict[str, Any]]
    tags: Optional[List[str]] = None
    is_public: bool = True

class MealTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    meal_type: Optional[str] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    foods: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None

class MealTemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    meal_type: Optional[str]
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: Optional[float]
    foods: List[Dict[str, Any]]
    tags: Optional[List[str]]
    is_public: bool
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WaterLogResponse(BaseModel):
    id: int
    user_id: int
    amount_ml: float
    logged_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# ===== FASTAPI APP =====
app = FastAPI(title="Project Ascend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173","https://project-ascend.vercel.app","https://project-ascend-8r0fpvmn2-prithvi-rs-projects.vercel.app", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# ===== UTILITY FUNCTIONS =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    # Ensure SECRET_KEY is a string
    secret_key = str(SECRET_KEY)
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, str(SECRET_KEY), algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def calculate_player_stats(user: User, db: Session) -> PlayerStatsResponse:
    """Calculate RPG-style player stats based on user activities"""
    # Get user's workouts and quests for XP calculation
    workouts = db.query(Workout).filter(Workout.user_id == user.id).all()
    completed_quests = db.query(Quest).filter(Quest.user_id == user.id, Quest.status == "completed").all()
    
    # Calculate total XP from workouts and quests
    total_xp = 0
    attributes = {
        "STR": {"value": 1, "xp": 0},
        "AGI": {"value": 1, "xp": 0},
        "END": {"value": 1, "xp": 0},
        "INT": {"value": 1, "xp": 0},
        "CHA": {"value": 1, "xp": 0},
    }
    
    # Add XP from workouts
    for workout in workouts:
        if workout.xp_earned:
            for stat, xp in workout.xp_earned.items():
                if stat in attributes:
                    attributes[stat]["xp"] += xp
                    total_xp += xp
    
    # Add XP from completed quests
    for quest in completed_quests:
        if quest.xp_reward:
            for stat, xp in quest.xp_reward.items():
                if stat in attributes:
                    attributes[stat]["xp"] += xp
                    total_xp += xp
    
    # Calculate attribute values (every 100 XP = 1 attribute point)
    for stat in attributes:
        attributes[stat]["value"] = 1 + (attributes[stat]["xp"] // 100)
    
    # Calculate level (every 1000 XP = 1 level)
    level = 1 + (total_xp // 1000)
    xp_to_next_level = 1000 - (total_xp % 1000)
    
    return PlayerStatsResponse(
        level=level,
        total_xp=total_xp,
        xp_to_next_level=xp_to_next_level,
        attributes=attributes
    )

# ===== AUTHENTICATION ENDPOINTS =====
@app.post("/auth/register", response_model=AuthResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        storage_preference=user_data.storage_preference,
        primary_goal=user_data.primary_goal,
        height_cm=user_data.height_cm,
        weight_kg=user_data.weight_kg,
        age=user_data.age,
        gender=user_data.gender,
        activity_level=user_data.activity_level
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    # Calculate player stats
    player_stats = calculate_player_stats(db_user, db)
    
    user_response = UserResponse.from_orm(db_user)
    user_response.player_stats = player_stats.dict()
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@app.post("/auth/login", response_model=AuthResponse)
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Calculate player stats
    player_stats = calculate_player_stats(user, db)
    
    user_response = UserResponse.from_orm(user)
    user_response.player_stats = player_stats.dict()
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@app.get("/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user information"""
    player_stats = calculate_player_stats(current_user, db)
    user_response = UserResponse.from_orm(current_user)
    user_response.player_stats = player_stats.dict()
    return user_response

# ===== USER ENDPOINTS =====
@app.put("/users/me", response_model=UserResponse)
def update_user_profile(user_update: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user profile"""
    for field, value in user_update.items():
        if hasattr(current_user, field) and field != "id":
            setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    player_stats = calculate_player_stats(current_user, db)
    user_response = UserResponse.from_orm(current_user)
    user_response.player_stats = player_stats.dict()
    return user_response

@app.get("/users/me/stats", response_model=PlayerStatsResponse)
def get_player_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's RPG player stats"""
    return calculate_player_stats(current_user, db)

# ===== EXERCISE ENDPOINTS =====
@app.get("/exercises", response_model=List[ExerciseResponse])
def get_exercises(
    muscle_group: Optional[str] = None,
    discipline: Optional[str] = None,
    equipment: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get exercises with optional filtering"""
    query = db.query(Exercise)
    
    if search:
        query = query.filter(Exercise.name.contains(search))
    
    # Note: For JSON filtering, you might need database-specific queries
    # This is a simplified version
    exercises = query.all()
    
    # Filter by tags (simplified client-side filtering)
    if muscle_group or discipline or equipment or difficulty:
        filtered_exercises = []
        for exercise in exercises:
            tags = exercise.tags or {}
            
            if muscle_group and muscle_group not in (tags.get("primary_muscles", []) + tags.get("secondary_muscles", [])):
                continue
            if discipline and discipline not in tags.get("discipline", []):
                continue
            if equipment and equipment not in tags.get("equipment", []):
                continue
            if difficulty and difficulty != tags.get("difficulty"):
                continue
            
            filtered_exercises.append(exercise)
        exercises = filtered_exercises
    
    return exercises

@app.get("/exercises/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    """Get specific exercise by ID"""
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

# ===== WORKOUT ENDPOINTS =====
@app.get("/workouts", response_model=List[WorkoutResponse])
def get_user_workouts(limit: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's workouts"""
    query = db.query(Workout).filter(Workout.user_id == current_user.id).order_by(Workout.date_logged.desc())
    
    if limit:
        query = query.limit(limit)
    
    return query.all()

@app.post("/workouts", response_model=WorkoutResponse)
def create_workout(workout: WorkoutCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new workout"""
    # Calculate XP based on workout duration and type
    base_xp = max(20, (workout.duration_minutes or 30) // 2)
    xp_earned = {
        "STR": base_xp,
        "END": base_xp // 2
    }
    
    db_workout = Workout(
        user_id=current_user.id,
        name=workout.name,
        date_logged=workout.date_logged,
        duration_minutes=workout.duration_minutes,
        notes=workout.notes,
        xp_earned=xp_earned
    )
    
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    
    return db_workout

# ===== QUEST ENDPOINTS =====
@app.post("/generate-quest", response_model=QuestResponse)
def generate_quest(
    data: QuestAIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    system_prompt = """
You are a Quest Master AI in a real-life gamified app. Your task is to create personalized daily quest for a user.

Also remember to use the user's focus area, recent activity, and preferred challenge level to tailor the quest.
The quest should be a mix of random from beginner to advance level
The quest title should be creative and engaging, and the description should be concise and explanatory.
The xp attributes are RPG-style attributes like STR, AGI, END, INT, CHA, etc.
The quest type can be one of: fitness, nutrition, learning, social.
The due date should be categorised as per the difficulty level of the quest.

You must format your response STRICTLY as follows, with no extra words, introductions, or explanations:
title: [A creative and engaging quest title under 25 letters]
description: [A concise and motivational description of the quest]
type: [One of: fitness, nutrition, learning, social]
xp: [A comma-separated list of attributes and XP, e.g., STR:100,END:50]
due: [The number of days from now the quest is due, e.g., 1]
    """

    # 2. Provide the user's specific data (HumanMessage)
    human_prompt = f"""
Here is the user's information:
- Focus Area: {data.focus}
- Recent Activity Summary: {data.recent_activity_summary}
- Preferred Challenge Level: {data.preferred_challenge_level}
    """

    try:
        # 3. Invoke the model with the structured prompt
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ])
        
        # The response text is now in the .content attribute
        response_text = response.content.strip()

        # 4. (IMPROVED) Robustly parse the response instead of relying on line numbers
        lines = response_text.splitlines()
        parsed = {}
        for line in lines:
            if ":" in line:
                key, value = line.split(":", 1)
                parsed[key.lower().strip()] = value.strip()

        # 5. Safely extract data with defaults to prevent errors
        title = parsed.get("title", "AI Generated Quest")
        description = parsed.get("description", "A new challenge awaits!")
        quest_type = parsed.get("type", "fitness")
        xp_str = parsed.get("xp", "INT:20")
        due_str = parsed.get("due", "1") 

        # 6. Safely parse the XP string
        xp_reward = {}
        try:
            for part in xp_str.split(','):
                attr, xp_val = part.strip().split(':')
                xp_reward[attr.strip().upper()] = int(xp_val.strip())
        except (ValueError, IndexError):
            xp_reward = {"INT": 20}
            print(f"Warning: Could not parse XP string '{xp_str}'. Using default reward.")

        # 7. Safely calculate the due date
        try:
            due_days = int(due_str)
        except ValueError:
            due_days = 1 # Default to 1 day
        due_date = datetime.utcnow() + timedelta(days=due_days)

        # 8. Save the quest to the database
        db_quest = Quest(
            user_id=current_user.id,
            title=title,
            description=description,
            type=quest_type,
            status="active",
            xp_reward=xp_reward,
            due_date=due_date
        )
        print(f"Generated quest: {db_quest.title} with XP: {db_quest.xp_reward} due in {due_days} days") 
        db.add(db_quest)
        db.commit()
        db.refresh(db_quest)
        
        return db_quest

    except Exception as e:
        # This will now catch API errors from LangChain or any other exceptions
        # For debugging, it's helpful to print the error to your server logs
        print(f"An error occurred in generate_quest: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quest. The AI may be experiencing issues. Please try again later.")


@app.post("/quests", response_model=QuestResponse)
def create_quest(quest: QuestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new quest"""
    db_quest = Quest(
        user_id=current_user.id,
        title=quest.title,
        description=quest.description,
        type=quest.type,
        xp_reward=quest.xp_reward,
        due_date=quest.due_date
    )
    
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    
    return db_quest

@app.put("/quests/{quest_id}", response_model=QuestResponse)
def update_quest(quest_id: int, quest_update: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update a quest"""
    quest = db.query(Quest).filter(Quest.id == quest_id, Quest.user_id == current_user.id).first()
    
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    for field, value in quest_update.items():
        if hasattr(quest, field):
            setattr(quest, field, value)
    
    db.commit()
    db.refresh(quest)
    
    return quest

@app.get("/quests", response_model=List[QuestResponse])
def get_user_quests(status: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's quests"""
    query = db.query(Quest).filter(Quest.user_id == current_user.id)
    
    if status:
        query = query.filter(Quest.status == status)
    
    return query.order_by(Quest.created_at.desc()).all()

@app.post("/quests/{quest_id}/complete", response_model=QuestResponse)
def complete_quest(quest_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark a quest as completed"""
    quest = db.query(Quest).filter(Quest.id == quest_id, Quest.user_id == current_user.id).first()
    
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    quest.status = "completed"
    quest.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(quest)
    
    return quest

# ===== NUTRITION ENDPOINTS =====
@app.get("/nutrition/logs")
def get_food_logs(date: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's food logs"""
    query = db.query(FoodLog).filter(FoodLog.user_id == current_user.id)
    
    if date:
        # Filter by date
        target_date = datetime.fromisoformat(date.replace('Z', '+00:00')).date()
        query = query.filter(FoodLog.logged_at >= target_date, FoodLog.logged_at < target_date + timedelta(days=1))
    
    return query.order_by(FoodLog.logged_at.desc()).all()

def calculate_nutrition_xp(total_calories: float, total_protein: float) -> dict:
    """Calculate XP earned based on nutrition intake"""
    xp_earned = {}
    
    # Base XP for logging food
    xp_earned["INT"] = 10
    
    # Bonus XP for hitting protein targets (assuming 1g per kg body weight minimum)
    if total_protein >= 80:  # Simplified target
        xp_earned["END"] = 15
    
    # Bonus XP for balanced calorie intake (not too low, not too high)
    if 1500 <= total_calories <= 2500:  # Simplified range
        xp_earned["CHA"] = 10
    
    return xp_earned
def update_daily_nutrition_summary(user_id: int, food_log: FoodLog, db: Session):
    """Update or create daily nutrition summary after logging food"""
    
    # Get the date from the food log
    log_date = food_log.logged_at.date()
    log_date_str = log_date.strftime('%Y-%m-%d')
    
    # Calculate nutrition values from this food log
    total_calories = food_log.calories_per_serving * food_log.servings_consumed
    total_protein = food_log.protein_g * food_log.servings_consumed
    total_carbs = food_log.carbs_g * food_log.servings_consumed
    total_fat = food_log.fat_g * food_log.servings_consumed
    total_fiber = (food_log.fiber_g or 0) * food_log.servings_consumed
    total_sugar = (food_log.sugar_g or 0) * food_log.servings_consumed
    total_sodium = (food_log.sodium_mg or 0) * food_log.servings_consumed
    
    # Find existing summary for this date
    existing_summary = db.query(DailyNutritionSummary).filter(
        DailyNutritionSummary.user_id == user_id,
        DailyNutritionSummary.date == log_date_str
    ).first()
    
    if existing_summary:
        # Update existing summary by adding new values
        existing_summary.total_calories += total_calories
        existing_summary.total_protein_g += total_protein
        existing_summary.total_carbs_g += total_carbs
        existing_summary.total_fat_g += total_fat
        existing_summary.total_fiber_g = (existing_summary.total_fiber_g or 0) + total_fiber
        existing_summary.total_sugar_g = (existing_summary.total_sugar_g or 0) + total_sugar
        existing_summary.total_sodium_mg = (existing_summary.total_sodium_mg or 0) + total_sodium
        existing_summary.updated_at = datetime.utcnow()
        
        # Recalculate XP based on new totals
        existing_summary.xp_earned = calculate_nutrition_xp(
            existing_summary.total_calories, 
            existing_summary.total_protein_g
        )
        
        print(f"Updated existing summary for {log_date_str}: {existing_summary.total_calories} calories, {existing_summary.total_protein_g}g protein")
        
    else:
        # Create new summary for this date
        new_summary = DailyNutritionSummary(
            user_id=user_id,
            date=log_date_str,
            total_calories=total_calories,
            total_protein_g=total_protein,
            total_carbs_g=total_carbs,
            total_fat_g=total_fat,
            total_fiber_g=total_fiber,
            total_sugar_g=total_sugar,
            total_sodium_mg=total_sodium,
            xp_earned=calculate_nutrition_xp(total_calories, total_protein)
        )
        
        db.add(new_summary)
        print(f"Created new summary for {log_date_str}: {total_calories} calories, {total_protein}g protein")
        
        existing_summary = new_summary
    
    # Commit the changes to the summary table
    db.commit()
    db.refresh(existing_summary)
    
    return existing_summary

@app.post("/nutrition/logs")
def create_food_log(food_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Log food intake"""
    db_food_log = FoodLog(
        user_id=current_user.id,
        logged_at=datetime.utcnow(),
        **food_data
    )
    
    db.add(db_food_log)
    db.commit()
    db.refresh(db_food_log)
    print(f"Successfully created food log: {db_food_log.food_name} - {db_food_log.calories_per_serving * db_food_log.servings_consumed} calories")
    # Step 2: Update daily nutrition summary
    try:
        daily_summary = update_daily_nutrition_summary(current_user.id, db_food_log, db)
        print(f"Successfully updated daily nutrition summary for {daily_summary.date}")
        
    except Exception as summary_error:
        print(f"Error updating daily nutrition summary: {summary_error}")
    return db_food_log

@app.get("/nutrition/daily-summary")
def get_daily_nutrition_summary(date: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get daily nutrition summary"""
    target_date = datetime.fromisoformat(date.replace('Z', '+00:00')).date()
    
    food_logs = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.logged_at >= target_date,
        FoodLog.logged_at < target_date + timedelta(days=1)
    ).all()
    
    # Calculate totals
    total_calories = sum(log.calories_per_serving * log.servings_consumed for log in food_logs)
    total_protein = sum(log.protein_g * log.servings_consumed for log in food_logs)
    total_carbs = sum(log.carbs_g * log.servings_consumed for log in food_logs)
    total_fat = sum(log.fat_g * log.servings_consumed for log in food_logs)
    
    # Calculate XP based on nutrition goals
    xp_earned = {
        "INT": min(50, int(total_protein // 5)),  # XP for protein intake
        "END": min(30, int(total_calories // 100))  # XP for meeting calorie goals
    }
    
    return {
        "id": 1,
        "user_id": current_user.id,
        "date": date,
        "total_calories": total_calories,
        "total_protein_g": total_protein,
        "total_carbs_g": total_carbs,
        "total_fat_g": total_fat,
        "xp_earned": xp_earned,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@app.get("/api/nutrition/analytics/history")
def get_nutrition_history(
    limit: int = 30, 
    offset: int = 0, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get nutrition history for the user"""
    
    # Get daily nutrition summaries from database
    summaries = db.query(DailyNutritionSummary).filter(
        DailyNutritionSummary.user_id == current_user.id
    ).order_by(DailyNutritionSummary.date.desc()).offset(offset).limit(limit).all()
    
    history_data = []
    for summary in summaries:
        # Count meals for this date
        meals_count = db.query(FoodLog).filter(
            FoodLog.user_id == current_user.id,
            FoodLog.logged_at >= datetime.fromisoformat(summary.date),
            FoodLog.logged_at < datetime.fromisoformat(summary.date) + timedelta(days=1)
        ).count()
        
        history_data.append({
            "id": summary.id,
            "date": summary.date,
            "total_calories": summary.total_calories,
            "total_protein_g": summary.total_protein_g,
            "total_carbs_g": summary.total_carbs_g,
            "total_fat_g": summary.total_fat_g,
            "total_fiber_g": summary.total_fiber_g or 0,
            "total_sugar_g": summary.total_sugar_g or 0,
            "total_sodium_mg": summary.total_sodium_mg or 0,
            "meals_logged": meals_count,
            "xp_earned": summary.xp_earned or {"INT": 0, "END": 0},
        })
    
    # Get total count for pagination
    total_count = db.query(DailyNutritionSummary).filter(
        DailyNutritionSummary.user_id == current_user.id
    ).count()
    
    return {
        "data": history_data,
        "total": total_count,
        "limit": limit,
        "offset": offset,
    }


@app.get("/api/nutrition/analytics/weekly")
def get_weekly_nutrition(
    weeks: int = 4, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get weekly nutrition analytics for the user"""
    
    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=weeks * 7)
    
    # Get daily nutrition summaries from database for the date range
    summaries = db.query(DailyNutritionSummary).filter(
        DailyNutritionSummary.user_id == current_user.id,
        DailyNutritionSummary.date >= start_date.isoformat(),
        DailyNutritionSummary.date <= end_date.isoformat()
    ).order_by(DailyNutritionSummary.date.asc()).all()
        
    # Convert database results to response format
    weekly_data = []
    for summary in summaries:
        date = datetime.fromisoformat(summary.date).date()
        day_name = date.strftime('%a')
        
        weekly_data.append({
            "date": summary.date,
            "day": day_name,
            "calories": summary.total_calories,
            "protein": summary.total_protein_g,
            "carbs": summary.total_carbs_g,
            "fat": summary.total_fat_g,
            "fiber": summary.total_fiber_g or 0,
        })
    
    return {
        "data": weekly_data,
        "weeks": weeks,
    }

@app.get("/nutrition/search")
def search_food(q: str):
    """Search food database (mock implementation)"""
    # This would typically connect to a real food database like USDA
    mock_foods = [
        {"name": "Chicken Breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6},
        {"name": "Brown Rice", "calories": 216, "protein": 5, "carbs": 45, "fat": 1.8},
        {"name": "Broccoli", "calories": 34, "protein": 3, "carbs": 7, "fat": 0.4},
        {"name": "Salmon", "calories": 208, "protein": 22, "carbs": 0, "fat": 12},
        {"name": "Sweet Potato", "calories": 112, "protein": 2, "carbs": 26, "fat": 0.1},
        {"name": "Greek Yogurt", "calories": 100, "protein": 15, "carbs": 6, "fat": 0},
        {"name": "Almonds", "calories": 164, "protein": 6, "carbs": 6, "fat": 14},
        {"name": "Banana", "calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4},
    ]
    
    # Filter foods based on search query
    filtered_foods = [food for food in mock_foods if q.lower() in food["name"].lower()]
    
    return filtered_foods

# ===== Food API ENDPOINTS =====

@app.get("/api/food-database/search")
def search_food_database(q: str, limit: int = 20, db: Session = Depends(get_db)):
    """Search food database"""
    query = db.query(FoodDatabase).filter(FoodDatabase.name.contains(q))
    foods = query.limit(limit).all()
    
    return {
        "data": foods,
        "query": q,
        "total": len(foods)
    }

@app.get("/api/food-database/categories")
def get_food_categories(db: Session = Depends(get_db)):
    """Get all food categories"""
    # Get unique categories from database
    categories = db.query(FoodDatabase.category).distinct().all()
    category_list = [cat[0] for cat in categories if cat[0]]
    
    return {
        "data": [{"name": cat, "count": db.query(FoodDatabase).filter(FoodDatabase.category == cat).count()} 
                for cat in category_list]
    }

@app.get("/api/food-database/popular")
def get_popular_foods(db: Session = Depends(get_db)):
    """Get popular foods"""
    foods = db.query(FoodDatabase).limit(10).all()
    return {"data": foods}

# ===== MEAL TEMPLATES ENDPOINTS =====
@app.get("/api/meal-templates/", response_model=Dict[str, Any])
def get_meal_templates(
    meal_type: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20,
    user_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get meal templates"""
    query = db.query(MealTemplate)
    
    if meal_type:
        query = query.filter(MealTemplate.meal_type == meal_type)
    
    if user_only:
        query = query.filter(MealTemplate.is_public == True)
    
    templates = query.limit(limit).all()
    
    # Convert SQLAlchemy objects to Pydantic models
    template_responses = [MealTemplateResponse.from_orm(template) for template in templates]
    
    return {
        "data": template_responses,
        "total": len(template_responses),
        "filters": {"meal_type": meal_type, "category": category, "user_only": user_only}
    }

@app.get("/api/meal-templates/{template_id}", response_model=Dict[str, Any])
def get_meal_template(template_id: int, db: Session = Depends(get_db)):
    """Get meal template by ID"""
    template = db.query(MealTemplate).filter(MealTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Meal template not found")
    
    # Convert SQLAlchemy object to Pydantic model
    template_response = MealTemplateResponse.from_orm(template)
    
    return {"data": template_response}

@app.post("/api/meal-templates/", response_model=Dict[str, Any])
def create_meal_template(
    template_data: MealTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new meal template"""
    db_template = MealTemplate(
        name=template_data.name,
        description=template_data.description,
        meal_type=template_data.meal_type,
        calories=template_data.calories,
        protein=template_data.protein,
        carbs=template_data.carbs,
        fat=template_data.fat,
        fiber=template_data.fiber,
        foods=template_data.foods,
        tags=template_data.tags,
        is_public=template_data.is_public,
        user_id=current_user.id if not template_data.is_public else None
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    template_response = MealTemplateResponse.from_orm(db_template)
    
    return {
        "data": template_response,
        "message": "Meal template created successfully"
    }

@app.put("/api/meal-templates/{template_id}", response_model=Dict[str, Any])
def update_meal_template(
    template_id: int,
    template_data: MealTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a meal template"""
    template = db.query(MealTemplate).filter(MealTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Meal template not found")
    
    # Check if user owns the template or if it's a public template
    if template.user_id and template.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this template")
    
    # Update fields
    update_data = template_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(template)
    
    template_response = MealTemplateResponse.from_orm(template)
    
    return {
        "data": template_response,
        "message": "Meal template updated successfully"
    }

@app.delete("/api/meal-templates/{template_id}", response_model=Dict[str, Any])
def delete_meal_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a meal template"""
    template = db.query(MealTemplate).filter(MealTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Meal template not found")
    
    # Check if user owns the template
    if template.user_id and template.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this template")
    
    db.delete(template)
    db.commit()
    
    return {
        "data": {"id": template_id},
        "message": "Meal template deleted successfully"
    }

@app.get("/api/meal-templates/popular", response_model=Dict[str, Any])
def get_popular_meal_templates(db: Session = Depends(get_db)):
    """Get popular meal templates"""
    templates = db.query(MealTemplate).filter(MealTemplate.is_public == True).limit(6).all()
    template_responses = [MealTemplateResponse.from_orm(template) for template in templates]
    
    return {"data": template_responses}

@app.get("/api/meal-templates/categories", response_model=Dict[str, Any])
def get_meal_template_categories(db: Session = Depends(get_db)):
    """Get meal template categories"""
    # Get all tags from templates
    templates = db.query(MealTemplate).all()
    all_tags = []
    for template in templates:
        if template.tags:
            all_tags.extend(template.tags)
    
    # Count tag occurrences
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    categories = [{"name": tag, "count": count} for tag, count in tag_counts.items()]
    
    return {"data": categories}

@app.get("/api/nutrition/analytics/water")
def get_water_intake(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get today's water intake"""
    today = datetime.now().date()
    
    water_logs = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.logged_at >= today,
        WaterLog.logged_at < today + timedelta(days=1)
    ).all()
    
    total_ml = sum(log.amount_ml for log in water_logs)
    target_ml = 3000  # 3L default target
    
    return {
        "data": {
            "date": today.isoformat(),
            "total_ml": total_ml,
            "target_ml": target_ml,
            "logs": [{"time": log.logged_at.strftime("%H:%M"), "amount_ml": log.amount_ml} for log in water_logs]
        }
    }

@app.post("/api/nutrition/analytics/water")
def log_water_intake(water_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Log water intake"""
    db_water_log = WaterLog(
        user_id=current_user.id,
        amount_ml=water_data["amount_ml"],
        logged_at=datetime.now()
    )
    
    db.add(db_water_log)
    db.commit()
    db.refresh(db_water_log)
    
    return {
        "data": db_water_log,
        "message": f"Logged {water_data['amount_ml']}ml of water"
    }

# ===== HEALTH CHECK =====
@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "Project Ascend API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)