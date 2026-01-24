from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,  # Test connections before using them
    echo=settings.DEBUG,  # Log SQL queries in debug mode
)

# Add connection pool event listeners for better debugging
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Called when a new connection is created"""
    if settings.DEBUG:
        logger.debug("Database connection established")

@event.listens_for(engine, "close")
def receive_close(dbapi_conn, connection_record):
    """Called when a connection is closed"""
    if settings.DEBUG:
        logger.debug("Database connection closed")

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Called when a connection is checked out from the pool"""
    if settings.DEBUG:
        logger.debug("Database connection checked out from pool")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Called when a connection is checked back into the pool"""
    if settings.DEBUG:
        logger.debug("Database connection checked back into pool")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency for getting database session with proper transaction handling"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        # Always close the session
        if db:
            db.close()
            if settings.DEBUG:
                logger.debug("Database session closed")

def get_db_with_transaction():
    """Context manager for database sessions with explicit transaction handling"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Transaction rolled back due to error: {e}")
        raise
    finally:
        db.close()