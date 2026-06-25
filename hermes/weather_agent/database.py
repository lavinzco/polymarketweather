"""SQLite persistence for Hermes weather-agent history."""
from __future__ import annotations

import json
import sqlite3
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Any

from hermes.weather_agent.models import ConsensusWeather, NormalizedObservation, ValidationIssue

DEFAULT_DB_PATH = Path("weather_history.sqlite3")


def init_db(path: str | Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS weather_consensus (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            computed_at TEXT NOT NULL,
            temp_c REAL,
            quality_score REAL NOT NULL,
            observations_json TEXT NOT NULL,
            issues_json TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def save_consensus(consensus: ConsensusWeather, path: str | Path = DEFAULT_DB_PATH) -> int:
    conn = init_db(path)
    try:
        cursor = conn.execute(
            """
            INSERT INTO weather_consensus (computed_at, temp_c, quality_score, observations_json, issues_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                consensus.computed_at.isoformat(),
                consensus.temp_c,
                consensus.quality_score,
                json.dumps([_json_ready(asdict(obs)) for obs in consensus.observations], ensure_ascii=False),
                json.dumps([_json_ready(asdict(issue)) for issue in consensus.issues], ensure_ascii=False),
            ),
        )
        conn.commit()
        return int(cursor.lastrowid)
    finally:
        conn.close()


def _json_ready(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: _json_ready(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_ready(item) for item in value]
    return value
