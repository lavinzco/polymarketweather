"""Hermes Skill entry point for the Singapore-focused Weather Agent."""
from __future__ import annotations

from dataclasses import asdict
from typing import Any

from hermes.weather_agent.collectors import checkwx, singapore_gov
from hermes.weather_agent.consensus import compute_consensus
from hermes.weather_agent.database import save_consensus
from hermes.weather_agent.models import RawObservation, ValidationIssue
from hermes.weather_agent.normalizer import normalize
from hermes.weather_agent.validator import validate


def run(event: dict[str, Any] | None = None) -> dict[str, Any]:
    """Run collectors, normalize, validate, compute consensus, and optionally persist.

    Event keys:
        station_id: Singapore AWS station id such as S24.
        icao: METAR ICAO code, default WSSS.
        include_checkwx: bool, default True.
        persist: bool, default False.
        db_path: optional SQLite path when persist is true.
    """
    event = event or {}
    raw_observations: list[RawObservation] = []
    collection_issues: list[ValidationIssue] = []

    try:
        raw_observations.append(singapore_gov.fetch(station_id=event.get("station_id")))
    except Exception as exc:  # collector boundary: preserve partial results for Hermes callers
        collection_issues.append(ValidationIssue(severity="error", message=f"singapore_gov collection failed: {exc}", source="singapore_gov"))

    if event.get("include_checkwx", True):
        try:
            raw_observations.append(checkwx.fetch(icao=event.get("icao", "WSSS")))
        except Exception as exc:  # CheckWX is a secondary validation source
            collection_issues.append(ValidationIssue(severity="warning", message=f"checkwx collection skipped: {exc}", source="checkwx"))

    observations = [obs for raw in raw_observations for obs in normalize(raw)]
    issues = [*collection_issues, *validate(observations)]
    consensus = compute_consensus(observations, issues)

    record_id = None
    if event.get("persist"):
        record_id = save_consensus(consensus, path=event.get("db_path", "weather_history.sqlite3"))

    return {
        "temp_c": consensus.temp_c,
        "quality_score": consensus.quality_score,
        "computed_at": consensus.computed_at.isoformat(),
        "record_id": record_id,
        "issues": [asdict(issue) for issue in consensus.issues],
        "observations": [_serialize_observation(obs) for obs in consensus.observations],
    }


def handler(event: dict[str, Any] | None = None, context: Any | None = None) -> dict[str, Any]:
    """Hermes-compatible handler alias."""
    return run(event)


def _serialize_observation(obs):
    payload = asdict(obs)
    if obs.observed_at:
        payload["observed_at"] = obs.observed_at.isoformat()
    payload["fetched_at"] = obs.fetched_at.isoformat()
    return payload


if __name__ == "__main__":
    import json

    print(json.dumps(run({"include_checkwx": False}), ensure_ascii=False, indent=2))
