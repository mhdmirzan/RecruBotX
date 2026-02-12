
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_indexes():
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "recrubotx")
    
    print(f"🔗 Connecting to MongoDB: {db_name}")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[db_name]
    
    try:
        collections = [
            "job_descriptions", 
            "cvs", 
            "screening_results", 
            "screening_batches", 
            "job_postings"
        ]
        
        for coll_name in collections:
            try:
                print(f"� Current indexes for '{coll_name}':")
                indexes = await db[coll_name].index_information()
                print(list(indexes.keys()))
                
                print(f"�🗑️ Dropping indexes for '{coll_name}'...")
                await db[coll_name].drop_indexes()
                print(f"✅ Indexes dropped for '{coll_name}'.")
            except Exception as e:
                print(f"⚠️ Error dropping indexes for '{coll_name}': {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(clear_indexes())
