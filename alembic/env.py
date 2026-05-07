import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import our models and base
from app.db.session import Base
from app.models.models import Student, Embedding, Attendance, Admin

target_metadata = Base.metadata

# CRITICAL FIX: Prioritize Environment Variable, fallback to Docker service name
db_url = os.getenv("DATABASE_URL")
if not db_url:
    # Fallback for inside Docker container if env var is missing
    db_url = "postgresql+asyncpg://postgres:password@db:5432/attendance_db"

config.set_main_option("sqlalchemy.url", db_url)

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # run_sync passes the connection as the first argument to the function
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def do_run_migrations(connection):
    """This is the sync function that Alembic uses to run migrations.
    The 'connection' argument is passed automatically by run_sync.
    """
    context.configure(
        connection=connection,
        target_metadata=target_metadata
    )

    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    try:
        asyncio.run(run_migrations_online())
    except RuntimeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(run_migrations_online())
