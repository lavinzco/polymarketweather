"""Placeholder collector for a future Open-Meteo integration."""
from __future__ import annotations

from hermes.weather_agent.models import RawObservation


def fetch(*args, **kwargs) -> RawObservation:
    raise NotImplementedError("Open-Meteo collector is planned but not implemented yet")
