from datetime import datetime, timezone

from hermes.weather_agent.consensus import compute_consensus
from hermes.weather_agent.models import NormalizedObservation
from hermes.weather_agent.normalizer import normalize
from hermes.weather_agent.validator import validate
from hermes.weather_agent.models import RawObservation


def test_normalize_singapore_gov_payload():
    raw = RawObservation(
        source="singapore_gov",
        payload={
            "data": {
                "stations": [{"id": "S24", "name": "Changi"}],
                "readings": [{"timestamp": "2026-06-25T10:00:00+08:00", "data": [{"stationId": "S24", "value": 29.4}]}],
            }
        },
    )

    observations = normalize(raw)

    assert len(observations) == 1
    assert observations[0].source == "singapore_gov"
    assert observations[0].station_id == "S24"
    assert observations[0].temp_c == 29.4
    assert observations[0].metadata["station"]["name"] == "Changi"


def test_consensus_prefers_weighted_primary_source():
    now = datetime.now(timezone.utc)
    observations = [
        NormalizedObservation(source="singapore_gov", station_id="S24", observed_at=now, fetched_at=now, temp_c=30.0),
        NormalizedObservation(source="checkwx", station_id="WSSS", observed_at=now, fetched_at=now, temp_c=28.0),
    ]

    issues = validate(observations)
    consensus = compute_consensus(observations, issues)

    assert consensus.temp_c == 30.0
    assert consensus.quality_score >= 90
