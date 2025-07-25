from database import engine, Base # Assuming your models file is named database.py

print("Connecting to the database to create tables...")

# This line tells SQLAlchemy to look at all the classes that inherit from Base
# and create the corresponding tables in the database.
Base.metadata.create_all(bind=engine)

print("Tables created successfully!")