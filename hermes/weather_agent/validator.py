"""Weather observation quality and consistency checks."""
from __future__ import annotations

from datetime import datetime, timezone
from statistics import mean

from hermes.weather_agent.models import NormalizedObservation, ValidationIssue


def validate(observations: list[NormalizedObservation], max_age_minutes: int = 30, max_temp_spread_c: float = 3.0) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    now = datetime.now(timezone.utc)
    temps = [obs.temp_c for obs in observations if obs.temp_c is not None]

    if not observations:
        return [ValidationIssue(severity="error", message="No observations were collected")]

    for obs in observations:
        if obs.temp_c is None:
            issues.append(ValidationIssue(severity="warning", message="Missing temperature", source=obs.source))
        elif not (-30 <= obs.temp_c <= 55):
            issues.append(ValidationIssue(severity="error", message=f"Temperature {obs.temp_c}°C is outside plausible bounds", source=obs.source))
        if obs.observed_at:
            age_minutes = (now - obs.observed_at.astimezone(timezone.utc)).total_seconds() / 60
            if age_minutes > max_age_minutes:
                issues.append(ValidationIssue(severity="warning", message=f"Observation is stale ({age_minutes:.0f} minutes old)", source=obs.source))

    if len(temps) >= 2 and max(temps) - min(temps) > max_temp_spread_c:
        issues.append(
            ValidationIssue(
                severity="warning",
                message=f"Temperature sources diverge by {max(temps) - min(temps):.1f}°C around mean {mean(temps):.1f}°C",
            )
        )
    return issues
