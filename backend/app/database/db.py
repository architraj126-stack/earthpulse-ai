import sqlite3
import json
import os
import tempfile
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

logger = logging.getLogger("earthpulse.db")

if os.getenv("VERCEL"):
    DB_PATH = os.path.join(tempfile.gettempdir(), "earthpulse.db")
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "earthpulse.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Analysis History Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            variable TEXT NOT NULL,
            variable_name TEXT NOT NULL,
            location_name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            temporal_resolution TEXT NOT NULL,
            linear_slope REAL,
            sen_slope REAL,
            p_value REAL,
            r_squared REAL,
            trend_direction TEXT,
            is_significant INTEGER,
            observation_count INTEGER,
            summary TEXT
        )
        """)
        
        # NASA API Cache Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS nasa_cache (
            cache_key TEXT PRIMARY KEY,
            url TEXT,
            data_json TEXT NOT NULL,
            cached_at TEXT NOT NULL
        )
        """)
        
        conn.commit()
        conn.close()
    except Exception as e:
        logger.exception("Failed to initialize database: %s", e)

def save_analysis(
    variable: str,
    variable_name: str,
    location_name: str,
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
    temporal_resolution: str,
    linear_slope: float,
    sen_slope: float,
    p_value: float,
    r_squared: float,
    trend_direction: str,
    is_significant: bool,
    observation_count: int,
    summary: str = ""
) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO analysis_history (
        created_at, variable, variable_name, location_name, latitude, longitude,
        start_date, end_date, temporal_resolution, linear_slope, sen_slope,
        p_value, r_squared, trend_direction, is_significant, observation_count, summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_str, variable, variable_name, location_name, latitude, longitude,
        start_date, end_date, temporal_resolution, linear_slope, sen_slope,
        p_value, r_squared, trend_direction, 1 if is_significant else 0, observation_count, summary
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_recent_analyses(limit: int = 15) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM analysis_history ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_cached_response(cache_key: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM nasa_cache WHERE cache_key = ?", (cache_key,))
    row = cursor.fetchone()
    conn.close()
    if row:
        try:
            return json.loads(row["data_json"])
        except Exception:
            return None
    return None

def set_cached_response(cache_key: str, url: str, data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO nasa_cache (cache_key, url, data_json, cached_at)
    VALUES (?, ?, ?, ?)
    """, (cache_key, url, json.dumps(data), now_str))
    conn.commit()
    conn.close()

# Auto-initialize database tables on module import
init_db()
