"""Normalize source-specific weather payloads into one schema."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from hermes.weather_agent.models import NormalizedObservation, RawObservation
from hermes.weather_agent.collectors.singapore_gov import parse_timestamp


def normalize(raw: RawObservation) -> list[NormalizedObservation]:
    if raw.source == "singapore_gov":
        return _normalize_singapore_gov(raw)
    if raw.source == "checkwx":
        return _normalize_checkwx(raw)
    raise ValueError(f"Unsupported weather source: {raw.source}")


def _normalize_singapore_gov(raw: RawObservation) -> list[NormalizedObservation]:
    data = raw.payload.get("data", {})
    station_lookup = {station.get("id"): station for station in data.get("stations", [])}
    observations: list[NormalizedObservation] = []
    for reading in data.get("readings", []):
        observed_at = parse_timestamp(reading.get("timestamp"))
        for item in reading.get("data", []):
            station_id = item.get("stationId")
            observations.append(
                NormalizedObservation(
                    source=raw.source,
                    station_id=station_id,
                    observed_at=observed_at,
                    fetched_at=raw.fetched_at,
                    temp_c=_float_or_none(item.get("value")),
                    metadata={"station": station_lookup.get(station_id, {})},
                )
            )
    return observations


def _normalize_checkwx(raw: RawObservation) -> list[NormalizedObservation]:
    normalized: list[NormalizedObservation] = []
    for item in raw.payload.get("data", []):
        observed_at = _parse_checkwx_time(item)
        normalized.append(
            NormalizedObservation(
                source=raw.source,
                station_id=item.get("icao"),
                observed_at=observed_at,
                fetched_at=raw.fetched_at,
                temp_c=_float_or_none(item.get("temperature", {}).get("celsius")),
                dewpoint_c=_float_or_none(item.get("dewpoint", {}).get("celsius")),
                relative_humidity_pct=_float_or_none(item.get("humidity", {}).get("percent")),
                wind_speed_kts=_float_or_none(item.get("wind", {}).get("speed_kts")),
                wind_direction_deg=_float_or_none(item.get("wind", {}).get("degrees")),
                pressure_hpa=_float_or_none(item.get("barometer", {}).get("hpa")),
                raw_text=item.get("raw_text"),
                metadata={"flight_category": item.get("flight_category")},
            )
        )
    return normalized


def _parse_checkwx_time(item: dict[str, Any]) -> datetime | None:
    observed = item.get("observed")
    if isinstance(observed, str):
        return datetime.fromisoformat(observed.replace("Z", "+00:00"))
    return None


def _float_or_none(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
