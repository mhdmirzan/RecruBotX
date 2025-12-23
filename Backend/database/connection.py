"""
Database Configuration and Connection
======================================

MongoDB connection management for RecruBotX.
"""

import os
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.uri_parser import parse_uri

load_dotenv()


class DatabaseManager:
    """
    MongoDB connection manager using Motor (async driver).
    
    Attributes:
        client: MongoDB async client
        db: Database instance
    """
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self):
        """Connect to MongoDB Atlas database."""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

        # Prefer explicit env var, otherwise try to infer DB name from URI.
        db_name = os.getenv("MONGODB_DB_NAME")
        if not db_name:
            try:
                parsed = parse_uri(mongodb_url)
                db_name = parsed.get("database")
            except Exception:
                db_name = None
        db_name = db_name or "recrubotx"
        
        try:
            # MongoDB Atlas optimized settings
            # Using SRV connection with automatic retry and proper timeouts
            client_options = {
                "serverSelectionTimeoutMS": 10000,  # 10 seconds for Atlas
                "connectTimeoutMS": 10000,
                "socketTimeoutMS": 45000,
                "maxPoolSize": 50,  # Atlas connection pooling
                "minPoolSize": 10,
                "maxIdleTimeMS": 45000,
            }
            
            # Add retryWrites for Atlas (recommended for production)
            if "mongodb+srv://" in mongodb_url or "retryWrites" not in mongodb_url:
                client_options["retryWrites"] = True
            
            self.client = AsyncIOMotorClient(mongodb_url, **client_options)
            self.db = self.client[db_name]
            
            # Test connection
            await self.client.admin.command('ping')
            print(f"✓ Connected to MongoDB: {db_name}")
            
            # Create indexes
            await self._create_indexes()
            
        except Exception as e:
            print(f"✗ Failed to connect to MongoDB Atlas: {e}")
            error_msg = str(e).upper()
            if "mongodb+srv://" in mongodb_url:
                if "DNS" in error_msg or "RESOLUTION" in error_msg:
                    print(
                        "\n🔴 DNS RESOLUTION ERROR:\n"
                        "Atlas SRV connection requires working DNS resolver.\n\n"
                        "Quick fixes:\n"
                        "1. Copy the 'Standard connection string' from Atlas (not SRV)\n"
                        "2. Change your DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)\n"
                        "3. Check if VPN/firewall is blocking DNS queries\n"
                    )
                elif "AUTHENTICATION" in error_msg or "AUTH" in error_msg:
                    print(
                        "\n🔴 AUTHENTICATION ERROR:\n"
                        "Check your MongoDB Atlas credentials:\n"
                        "1. Username and password are correct\n"
                        "2. Database user has read/write permissions\n"
                        "3. IP whitelist includes your current IP (or use 0.0.0.0/0 for testing)\n"
                    )
            raise
    
    async def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            print("✓ Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create database indexes optimized for MongoDB Atlas."""
        try:
            # Job descriptions indexes with background creation for Atlas
            await self.db.job_descriptions.create_index(
                "created_at", background=True
            )
            await self.db.job_descriptions.create_index(
                "is_active", background=True
            )
            # Compound index for active JD queries
            await self.db.job_descriptions.create_index(
                [("is_active", -1), ("created_at", -1)], background=True
            )
            
            # CVs indexes
            await self.db.cvs.create_index("uploaded_at", background=True)
            await self.db.cvs.create_index("file_name", background=True)
            
            # Screening results indexes with compound indexes for Atlas performance
            await self.db.screening_results.create_index(
                "job_description_id", background=True
            )
            await self.db.screening_results.create_index("cv_id", background=True)
            await self.db.screening_results.create_index(
                [("overall_score", -1)], background=True
            )
            await self.db.screening_results.create_index(
                "created_at", background=True
            )
            # Compound index for top candidates queries (most common)
            await self.db.screening_results.create_index(
                [("job_description_id", 1), ("overall_score", -1)],
                background=True
            )
            
            print("✓ Database indexes created successfully")
        except Exception as e:
            print(f"⚠ Warning: Could not create some indexes: {e}")
            # Don't raise - indexes might already exist
    
    def get_collection(self, name: str):
        """Get a collection from the database."""
        return self.db[name]


# Global database instance
db_manager = DatabaseManager()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return db_manager.db
