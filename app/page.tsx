"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { TradingPanel } from "@/components/trading-panel";
import { WeatherStation } from "@/components/weather-station";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const markets = [
  { name: "NYC High > 70°F Tomorrow", yes: 0.61, no: 0.39, change: 4.8, yesTokenId: "101001" },
  { name: "Chicago Snowfall > 1in This Week", yes: 0.32, no: 0.68, change: -2.3, yesTokenId: "101002" },
  { name: "Miami Rain > 0.5in Today", yes: 0.56, no: 0.44, change: 1.2, yesTokenId: "101003" },
  { name: "LA Heat Advisory Before Friday", yes: 0.21, no: 0.79, change: -0.9, yesTokenId: "101004" },
];

const positions = [
  { market: "NYC High > 70°F Tomorrow", side: "YES" as const, size: 420, pnl: "+$38" },
  { market: "Miami Rain > 0.5in Today", side: "NO" as const, size: 250, pnl: "-$12" },
];

function Trend({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${positive ? "text-teal-400" : "text-rose-400"}`}>
      {positive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default function HomePage() {
  const [selectedTokenId, setSelectedTokenId] = useState(markets[0].yesTokenId);
  const [selectedMarketName, setSelectedMarketName] = useState(markets[0].name);
  const [latestTempC, setLatestTempC] = useState<number | null>(null);

  const selected = useMemo(() => markets.find((item) => item.yesTokenId === selectedTokenId) ?? markets[0], [selectedTokenId]);

  return (
    <main className="mx-auto min-h-screen max-w-[1700px] p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1.6fr_1fr]">
        <section className="space-y-4 xl:order-1">
          <WeatherStation onWeatherUpdate={(payload) => setLatestTempC(payload.temp_c)} />
        </section>

        <section className="space-y-4 xl:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Market List</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {markets.map((market) => (
                <article key={market.name} className="rounded-lg border border-border bg-muted/50 p-4 transition hover:border-teal-500/40">
                  <h3 className="text-sm font-medium text-foreground">{market.name}</h3>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-4 text-sm">
                      <span className="rounded bg-teal-500/15 px-2 py-1 text-teal-400">Yes {Math.round(market.yes * 100)}¢</span>
                      <span className="rounded bg-slate-600/30 px-2 py-1 text-slate-200">No {Math.round(market.no * 100)}¢</span>
                    </div>
                    <Trend value={market.change} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      className="h-8"
                      onClick={() => {
                        setSelectedTokenId(market.yesTokenId);
                        setSelectedMarketName(market.name);
                      }}
                    >
                      BUY YES
                    </Button>
                    <p className="text-xs text-muted-foreground">Token ID: {market.yesTokenId}</p>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 xl:order-3">
          <TradingPanel
            selectedTokenId={selectedTokenId}
            selectedMarketName={selectedMarketName}
            latestTempC={latestTempC}
            positions={positions}
          />
          <p className="px-1 text-xs text-muted-foreground">Selected Market: {selected.name}</p>
        </section>
      </div>
    </main>
  );
}
