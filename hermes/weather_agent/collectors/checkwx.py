"""CheckWX METAR collector used as a validation source."""
from __future__ import annotations

import json
import os
from urllib.request import Request, urlopen

from hermes.weather_agent.models import RawObservation

BASE_URL = "https://api.checkwx.com/metar"


def fetch(icao: str = "WSSS", api_key: str | None = None, timeout: float = 10) -> RawObservation:
    """Fetch decoded METAR from CheckWX for an ICAO airport code."""
    key = api_key or os.getenv("CHECKWX_API_KEY")
    if not key:
        raise RuntimeError("CHECKWX_API_KEY is required for CheckWX METAR validation")
    icao = icao.upper()
    request = Request(
        f"{BASE_URL}/{icao}/decoded",
        headers={"X-API-Key": key, "accept": "application/json", "user-agent": "polymarketweather-hermes-skill/0.1"},
    )
    with urlopen(request, timeout=timeout) as response:  # nosec B310 - fixed public API endpoint
        payload = json.loads(response.read().decode("utf-8"))
    return RawObservation(source="checkwx", payload=payload)
