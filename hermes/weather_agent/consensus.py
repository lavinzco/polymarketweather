"""Compute best weather values and confidence score from normalized observations."""
from __future__ import annotations

from statistics import median

from hermes.weather_agent.models import ConsensusWeather, NormalizedObservation, ValidationIssue

SOURCE_WEIGHTS = {
    "singapore_gov": 1.0,
    "checkwx": 0.65,
}


def compute_consensus(observations: list[NormalizedObservation], issues: list[ValidationIssue]) -> ConsensusWeather:
    temp_c = _weighted_temperature(observations)
    quality_score = _quality_score(observations, issues)
    return ConsensusWeather(temp_c=temp_c, quality_score=quality_score, observations=observations, issues=issues)


def _weighted_temperature(observations: list[NormalizedObservation]) -> float | None:
    weighted_values: list[float] = []
    for obs in observations:
        if obs.temp_c is None:
            continue
        repetitions = max(1, round(SOURCE_WEIGHTS.get(obs.source, 0.5) * 10))
        weighted_values.extend([obs.temp_c] * repetitions)
    if not weighted_values:
        return None
    return round(float(median(weighted_values)), 2)


def _quality_score(observations: list[NormalizedObservation], issues: list[ValidationIssue]) -> float:
    if not observations:
        return 0.0
    score = 100.0
    score -= sum(25 for issue in issues if issue.severity == "error")
    score -= sum(8 for issue in issues if issue.severity == "warning")
    represented_sources = {obs.source for obs in observations if obs.temp_c is not None}
    if "singapore_gov" not in represented_sources:
        score -= 20
    if len(represented_sources) >= 2:
        score += 5
    return round(max(0.0, min(100.0, score)), 1)
