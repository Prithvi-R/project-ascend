import csv
import json
from datetime import datetime
from database import SessionLocal, User, Exercise, Workout, WorkoutExercise, Quest, FoodLog, DailyNutritionSummary, FoodDatabase, MealTemplate, WaterLog
import bcrypt

def safe_int(value, default=None):
    """Safely convert a value to int, return default if conversion fails."""
    if not value or value.strip() == '':
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def safe_float(value, default=None):
    """Safely convert a value to float, return default if conversion fails."""
    if not value or value.strip() == '':
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_json(value, default=None):
    """Safely parse JSON, return default if parsing fails."""
    if not value or value.strip() == '':
        return default or {}
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default or {}

def safe_datetime(value, default=None):
    """Safely parse datetime, return default if parsing fails."""
    if not value or value.strip() == '':
        return default
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        return default

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def format_exercise_tags(row):
    """Format exercise tags from CSV row into JSON object."""
    tags_object = {}
    
    # Parse comma-separated lists for each tag type
    tag_fields = ['primary_muscles', 'secondary_muscles', 'equipment', 'discipline', 'difficulty', 'force_type', 'movement_pattern']
    
    for field in tag_fields:
        if field in row and row[field]:
            if field == 'difficulty':  # Single value, not a list
                tags_object[field] = row[field].strip()
            else:  # List values
                tags_object[field] = [tag.strip() for tag in row[field].split(',') if tag.strip()]
    
    return tags_object

def import_users():
    """Import users from CSV."""
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Users table is not empty. Skipping import.")
            return
        
        with open('../users.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                user = User(
                    id=safe_int(row['id']),
                    email=row['email'],
                    username=row['username'],
                    hashed_password=row['hashed_password'],  # Already hashed in CSV
                    storage_preference=row.get('storage_preference', 'cloud'),
                    primary_goal=row.get('primary_goal', 'general_fitness'),
                    height_cm=safe_int(row.get('height_cm')),
                    weight_kg=safe_float(row.get('weight_kg')),
                    age=safe_int(row.get('age')),
                    gender=row.get('gender'),
                    activity_level=row.get('activity_level', 'moderately_active'),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow()),
                    updated_at=safe_datetime(row.get('updated_at'), datetime.utcnow())
                )
                db.add(user)
        
        db.commit()
        print(f"Successfully imported {db.query(User).count()} users.")
    
    except Exception as e:
        print(f"Error importing users: {e}")
        db.rollback()
    finally:
        db.close()

def import_exercises():
    """Import exercises from CSV."""
    db = SessionLocal()
    try:
        if db.query(Exercise).count() > 0:
            print("Exercises table is not empty. Skipping import.")
            return
        
        with open('../exercises.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                exercise = Exercise(
                    id=safe_int(row['id']),
                    name=row['name'],
                    description=row.get('description', ''),
                    instructions=row.get('instructions', ''),
                    common_mistakes=row.get('common_mistakes', ''),
                    video_url=row.get('video_url'),
                    tags=safe_json(row.get('tags'), {}),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow()),
                    updated_at=safe_datetime(row.get('updated_at'), datetime.utcnow())
                )
                db.add(exercise)
        
        db.commit()
        print(f"Successfully imported {db.query(Exercise).count()} exercises.")
    
    except Exception as e:
        print(f"Error importing exercises: {e}")
        db.rollback()
    finally:
        db.close()

def import_workouts():
    """Import workouts from CSV."""
    db = SessionLocal()
    try:
        if db.query(Workout).count() > 0:
            print("Workouts table is not empty. Skipping import.")
            return
        
        with open('../workouts.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                workout = Workout(
                    id=safe_int(row['id']),
                    user_id=safe_int(row['user_id']),
                    name=row['name'],
                    date_logged=safe_datetime(row.get('date_logged'), datetime.utcnow()),
                    duration_minutes=safe_int(row.get('duration_minutes')),
                    notes=row.get('notes'),
                    xp_earned=safe_json(row.get('xp_earned'), {}),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow())
                )
                db.add(workout)
        
        db.commit()
        print(f"Successfully imported {db.query(Workout).count()} workouts.")
    
    except Exception as e:
        print(f"Error importing workouts: {e}")
        db.rollback()
    finally:
        db.close()

def import_workout_exercises():
    """Import workout exercises from CSV."""
    db = SessionLocal()
    try:
        if db.query(WorkoutExercise).count() > 0:
            print("Workout exercises table is not empty. Skipping import.")
            return
        
        with open('../workout_exercises.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                workout_exercise = WorkoutExercise(
                    id=safe_int(row['id']),
                    workout_id=safe_int(row['workout_id']),
                    exercise_id=safe_int(row['exercise_id']),
                    sets=safe_int(row['sets'], 1),  # Default to 1 if missing
                    reps=safe_int(row.get('reps')),
                    weight_kg=safe_float(row.get('weight_kg')),
                    duration_seconds=safe_int(row.get('duration_seconds')),
                    distance_meters=safe_float(row.get('distance_meters')),
                    rest_seconds=safe_int(row.get('rest_seconds')),  # This will handle "No rest" gracefully
                    notes=row.get('notes'),
                    order_in_workout=safe_int(row.get('order_in_workout'), 1)
                )
                db.add(workout_exercise)
        
        db.commit()
        print(f"Successfully imported {db.query(WorkoutExercise).count()} workout exercises.")
    
    except Exception as e:
        print(f"Error importing workout exercises: {e}")
        db.rollback()
    finally:
        db.close()

def import_quests():
    """Import quests from CSV."""
    db = SessionLocal()
    try:
        if db.query(Quest).count() > 0:
            print("Quests table is not empty. Skipping import.")
            return
        
        with open('../quests.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                quest = Quest(
                    id=safe_int(row['id']),
                    user_id=safe_int(row['user_id']),
                    title=row['title'],
                    description=row.get('description', ''),
                    type=row['type'],
                    status=row.get('status', 'active'),
                    xp_reward=safe_json(row.get('xp_reward'), {}),
                    due_date=safe_datetime(row.get('due_date')),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow()),
                    completed_at=safe_datetime(row.get('completed_at'))
                )
                db.add(quest)
        
        db.commit()
        print(f"Successfully imported {db.query(Quest).count()} quests.")
    
    except Exception as e:
        print(f"Error importing quests: {e}")
        db.rollback()
    finally:
        db.close()

def import_food_logs():
    """Import food logs from CSV."""
    db = SessionLocal()
    try:
        if db.query(FoodLog).count() > 0:
            print("Food logs table is not empty. Skipping import.")
            return
        
        with open('../food_logs.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                food_log = FoodLog(
                    id=safe_int(row['id']),
                    user_id=safe_int(row['user_id']),
                    food_name=row['food_name'],
                    brand=row.get('brand'),
                    serving_size=row['serving_size'],
                    calories_per_serving=safe_float(row['calories_per_serving'], 0),
                    protein_g=safe_float(row.get('protein_g'), 0),
                    carbs_g=safe_float(row.get('carbs_g'), 0),
                    fat_g=safe_float(row.get('fat_g'), 0),
                    fiber_g=safe_float(row.get('fiber_g')),
                    sugar_g=safe_float(row.get('sugar_g')),
                    sodium_mg=safe_float(row.get('sodium_mg')),
                    servings_consumed=safe_float(row.get('servings_consumed'), 1.0),
                    meal_type=row['meal_type'],
                    logged_at=safe_datetime(row.get('logged_at'), datetime.utcnow()),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow())
                )
                db.add(food_log)
        
        db.commit()
        print(f"Successfully imported {db.query(FoodLog).count()} food logs.")
    
    except Exception as e:
        print(f"Error importing food logs: {e}")
        db.rollback()
    finally:
        db.close()

def import_daily_nutrition_summaries():
    """Import daily nutrition summaries from CSV."""
    db = SessionLocal()
    try:
        if db.query(DailyNutritionSummary).count() > 0:
            print("Daily nutrition summaries table is not empty. Skipping import.")
            return
        
        with open('../daily_nutrition_summaries.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                summary = DailyNutritionSummary(
                    id=safe_int(row['id']),
                    user_id=safe_int(row['user_id']),
                    date=row['date'],
                    total_calories=safe_float(row.get('total_calories'), 0),
                    total_protein_g=safe_float(row.get('total_protein_g'), 0),
                    total_carbs_g=safe_float(row.get('total_carbs_g'), 0),
                    total_fat_g=safe_float(row.get('total_fat_g'), 0),
                    total_fiber_g=safe_float(row.get('total_fiber_g')),
                    total_sugar_g=safe_float(row.get('total_sugar_g')),
                    total_sodium_mg=safe_float(row.get('total_sodium_mg')),
                    xp_earned=safe_json(row.get('xp_earned'), {}),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow()),
                    updated_at=safe_datetime(row.get('updated_at'), datetime.utcnow())
                )
                db.add(summary)
        
        db.commit()
        print(f"Successfully imported {db.query(DailyNutritionSummary).count()} daily nutrition summaries.")
    
    except Exception as e:
        print(f"Error importing daily nutrition summaries: {e}")
        db.rollback()
    finally:
        db.close()

def import_food_database():
    """Import food database from CSV."""
    db = SessionLocal()
    try:
        if db.query(FoodDatabase).count() > 0:
            print("Food database table is not empty. Skipping import.")
            return
        
        with open('../food_database.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                food_item = FoodDatabase(
                    id=safe_int(row['id']),
                    name=row['name'],
                    brand=row.get('brand'),
                    serving_size=row['serving_size'],
                    calories=safe_float(row['calories'], 0),
                    protein=safe_float(row['protein'], 0),
                    carbs=safe_float(row['carbs'], 0),
                    fat=safe_float(row['fat'], 0),
                    fiber=safe_float(row.get('fiber')),
                    sugar=safe_float(row.get('sugar')),
                    sodium=safe_float(row.get('sodium')),
                    category=row.get('category'),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow()),
                    updated_at=safe_datetime(row.get('updated_at'), datetime.utcnow())
                )
                db.add(food_item)
        
        db.commit()
        print(f"Successfully imported {db.query(FoodDatabase).count()} food database items.")
    
    except Exception as e:
        print(f"Error importing food database: {e}")
        db.rollback()
    finally:
        db.close()

def import_meal_templates():
    """Import meal templates from CSV."""
    db = SessionLocal()
    try:
        if db.query(MealTemplate).count() > 0:
            print("Meal templates table is not empty. Skipping import.")
            return
        
        with open('../meal_template.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                meal_template = MealTemplate(
                    id=safe_int(row['id']),
                    name=row['name'],
                    description=row.get('description'),
                    meal_type=row.get('meal_type'),
                    calories=safe_float(row['calories'], 0),
                    protein=safe_float(row['protein'], 0),
                    carbs=safe_float(row['carbs'], 0),
                    fat=safe_float(row['fat'], 0),
                    fiber=safe_float(row.get('fiber')),
                    foods=safe_json(row.get('foods'), []),
                    tags=safe_json(row.get('tags'), []),
                    is_public=row.get('is_public', 'true').lower() == 'true',
                    user_id=safe_int(row.get('user_id')),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow()),
                    updated_at=safe_datetime(row.get('updated_at'), datetime.utcnow())
                )
                db.add(meal_template)
        
        db.commit()
        print(f"Successfully imported {db.query(MealTemplate).count()} meal templates.")
    
    except Exception as e:
        print(f"Error importing meal templates: {e}")
        db.rollback()
    finally:
        db.close()

def import_water_logs():
    """Import water logs from CSV."""
    db = SessionLocal()
    try:
        if db.query(WaterLog).count() > 0:
            print("Water logs table is not empty. Skipping import.")
            return
        
        with open('../water_logs.csv', 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                water_log = WaterLog(
                    id=safe_int(row['id']),
                    user_id=safe_int(row['user_id']),
                    amount_ml=safe_int(row['amount_ml'], 0),
                    logged_at=safe_datetime(row.get('logged_at'), datetime.utcnow()),
                    created_at=safe_datetime(row.get('created_at'), datetime.utcnow())
                )
                db.add(water_log)
        
        db.commit()
        print(f"Successfully imported {db.query(WaterLog).count()} water logs.")
    
    except Exception as e:
        print(f"Error importing water logs: {e}")
        db.rollback()
    finally:
        db.close()

def populate_all_data():
    """Import all data in the correct order (respecting foreign key dependencies)."""
    print("Starting Project Ascend database population...")
    
    # Import in dependency order
    print("\n1. Importing users...")
    import_users()
    
    print("\n2. Importing exercises...")
    import_exercises()
    
    print("\n3. Importing workouts...")
    import_workouts()
    
    print("\n4. Importing workout exercises...")
    import_workout_exercises()
    
    print("\n5. Importing quests...")
    import_quests()
    
    print("\n6. Importing food logs...")
    import_food_logs()
    
    print("\n7. Importing daily nutrition summaries...")
    import_daily_nutrition_summaries()
    
    print("\n8. Importing food database...")
    import_food_database()
    
    print("\n9. Importing meal templates...")
    import_meal_templates()
    
    print("\n10. Importing water logs...")
    import_water_logs()
    
    print("\n--> Database population complete!")
    
    print("\n📊 Database Summary:")
    db = SessionLocal()
    try:
        print(f"   👥 Users: {db.query(User).count()}")
        print(f"   🏋️ Exercises: {db.query(Exercise).count()}")
        print(f"   💪 Workouts: {db.query(Workout).count()}")
        print(f"   🎯 Workout Exercises: {db.query(WorkoutExercise).count()}")
        print(f"   🎮 Quests: {db.query(Quest).count()}")
        print(f"   🍎 Food Logs: {db.query(FoodLog).count()}")
        print(f"   📊 Daily Nutrition Summaries: {db.query(DailyNutritionSummary).count()}")
        print(f"   🥗 Food Database Items: {db.query(FoodDatabase).count()}")
        print(f"   🍽️ Meal Templates: {db.query(MealTemplate).count()}")
        print(f"   💧 Water Logs: {db.query(WaterLog).count()}")
    except Exception as e:
        print(f"   Error getting counts: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    populate_all_data()