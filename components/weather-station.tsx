"use client";

import { useQuery } from "@tanstack/react-query";
import { CloudFog, Gauge, Search, Thermometer, Wind } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type WeatherResponse = {
  icao: string;
  temp_c: number | null;
  dewpoint_c: number | null;
  wind_speed_kts: number | null;
  altimeter_hpa: number | null;
  raw_text: string;
  fetched_at: string;
};

const DEFAULT_ICAO = "WSSS";

async function fetchWeather(icao: string): Promise<WeatherResponse> {
  const response = await fetch(`/api/weather?icao=${icao}`);
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Unable to fetch weather data");
  }
  return response.json() as Promise<WeatherResponse>;
}

function Metric({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-teal-400">{value ?? "--"}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </div>
  );
}

export function WeatherStation() {
  const [icaoInput, setIcaoInput] = useState(DEFAULT_ICAO);
  const [icao, setIcao] = useState(DEFAULT_ICAO);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["weather", icao],
    queryFn: () => fetchWeather(icao),
    refetchInterval: 300_000,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Weather Station</CardTitle>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Input
              value={icaoInput}
              onChange={(event) => setIcaoInput(event.target.value.toUpperCase())}
              className="h-8 w-full font-mono tracking-widest sm:w-28"
              maxLength={4}
              placeholder="ICAO"
            />
            <Button
              type="button"
              className="h-8 w-auto gap-2 px-3"
              onClick={() => setIcao(icaoInput)}
              disabled={icaoInput.length !== 4}
            >
              <Search className="size-3.5" />
              Load
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md border border-teal-500/35 bg-black/30 p-3 font-mono text-xs leading-relaxed text-teal-300">
          {isLoading ? "Loading METAR..." : data?.raw_text ?? "No METAR available."}
        </div>

        {error ? (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">{error.message}</div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Metric icon={<Thermometer className="size-4 text-teal-400" />} label="Temp" value={data?.temp_c ?? null} unit="°C" />
          <Metric icon={<CloudFog className="size-4 text-teal-400" />} label="Dewpoint" value={data?.dewpoint_c ?? null} unit="°C" />
          <Metric icon={<Wind className="size-4 text-teal-400" />} label="Wind" value={data?.wind_speed_kts ?? null} unit="kts" />
          <Metric icon={<Gauge className="size-4 text-teal-400" />} label="Pressure" value={data?.altimeter_hpa ?? null} unit="hPa" />
        </div>

        <div className="rounded-lg border border-border bg-muted/60 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Temperature</p>
          <p className="mt-2 text-5xl font-semibold text-teal-400">{data?.temp_c ?? "--"}°C</p>
          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Dew Point</p>
          <p className="mt-2 text-3xl font-semibold">{data?.dewpoint_c ?? "--"}°C</p>
          <p className="mt-3 text-xs text-muted-foreground">{isFetching ? "Refreshing..." : "Auto-refresh every 5 minutes"}</p>
        </div>

        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-teal-500/40 bg-muted/40 text-center text-sm text-muted-foreground">
          METAR Historical Trend Chart (400px)
        </div>
      </CardContent>
    </Card>
  );
}
