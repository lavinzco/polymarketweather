---
name: singapore-weather-agent
description: Hermes skill for collecting Singapore NEA AWS weather observations, validating with CheckWX METAR, normalizing fields, scoring consensus temperature, and storing history.
---

# Singapore Weather Agent

Use this Hermes skill when a task needs Singapore weather observations for market resolution, trading context, or data-quality checks.

## Runtime flow

1. Collect primary AWS readings from `collectors/singapore_gov.py`.
2. Optionally collect validation METAR data from `collectors/checkwx.py`.
3. Normalize source payloads with `normalizer.py`.
4. Validate freshness, plausible ranges, and source divergence with `validator.py`.
5. Compute best temperature and quality score with `consensus.py`.
6. Persist history through `database.py` when `persist: true`.
7. Call `main.py::handler(event, context)` as the Hermes entry point.

## Event shape

```json
{
  "station_id": "S24",
  "icao": "WSSS",
  "include_checkwx": true,
  "persist": false,
  "db_path": "weather_history.sqlite3"
}
```

`CHECKWX_API_KEY` must be set when `include_checkwx` is true. Leave `station_id` empty to use all Singapore AWS stations returned by data.gov.sg.
