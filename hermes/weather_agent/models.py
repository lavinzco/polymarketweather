"""Typed weather-agent data models."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(slots=True)
class RawObservation:
    """Collector-specific payload plus source metadata."""

    source: str
    payload: dict[str, Any]
    fetched_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(slots=True)
class NormalizedObservation:
    """Common schema consumed by validation and consensus."""

    source: str
    station_id: str | None
    observed_at: datetime | None
    fetched_at: datetime
    temp_c: float | None = None
    dewpoint_c: float | None = None
    relative_humidity_pct: float | None = None
    wind_speed_kts: float | None = None
    wind_direction_deg: float | None = None
    pressure_hpa: float | None = None
    raw_text: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class ValidationIssue:
    severity: str
    message: str
    source: str | None = None


@dataclass(slots=True)
class ConsensusWeather:
    temp_c: float | None
    quality_score: float
    observations: list[NormalizedObservation]
    issues: list[ValidationIssue]
    computed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
