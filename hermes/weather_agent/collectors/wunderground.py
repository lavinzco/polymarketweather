"""Placeholder collector for a future Weather Underground integration."""
from __future__ import annotations

from hermes.weather_agent.models import RawObservation


def fetch(*args, **kwargs) -> RawObservation:
    raise NotImplementedError("Weather Underground collector is planned but not implemented yet")
