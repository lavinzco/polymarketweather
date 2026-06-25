"""Singapore data.gov.sg collector for NEA AWS air-temperature readings."""
from __future__ import annotations

from datetime import datetime
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json

from hermes.weather_agent.models import RawObservation

BASE_URL = "https://api-open.data.gov.sg/v2/real-time/api/air-temperature"


def fetch(date_time: str | None = None, station_id: str | None = None, timeout: float = 10) -> RawObservation:
    """Fetch latest Singapore government AWS air-temperature observations.

    Args:
        date_time: Optional SGT timestamp formatted as YYYY-MM-DDTHH:mm:ss.
        station_id: Optional station id to select from the response (for example S24).
        timeout: Request timeout in seconds.
    """
    query = urlencode({"date_time": date_time} if date_time else {})
    url = f"{BASE_URL}?{query}" if query else BASE_URL
    request = Request(url, headers={"accept": "application/json", "user-agent": "polymarketweather-hermes-skill/0.1"})
    with urlopen(request, timeout=timeout) as response:  # nosec B310 - fixed public API endpoint
        payload = json.loads(response.read().decode("utf-8"))

    if station_id:
        payload = _filter_station(payload, station_id)
    return RawObservation(source="singapore_gov", payload=payload)


def _filter_station(payload: dict[str, Any], station_id: str) -> dict[str, Any]:
    data = dict(payload)
    readings = data.get("data", {}).get("readings", [])
    stations = data.get("data", {}).get("stations", [])
    station_id_upper = station_id.upper()
    data.setdefault("data", {})["readings"] = [
        reading for reading in readings if any(item.get("stationId") == station_id_upper for item in reading.get("data", []))
    ]
    data["data"]["stations"] = [station for station in stations if station.get("id") == station_id_upper]
    return data


def parse_timestamp(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
