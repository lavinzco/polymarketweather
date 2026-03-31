import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { WeatherStation } from "@/components/weather-station";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const markets = [
  { name: "NYC High > 70°F Tomorrow", yes: 0.61, no: 0.39, change: 4.8 },
  { name: "Chicago Snowfall > 1in This Week", yes: 0.32, no: 0.68, change: -2.3 },
  { name: "Miami Rain > 0.5in Today", yes: 0.56, no: 0.44, change: 1.2 },
  { name: "LA Heat Advisory Before Friday", yes: 0.21, no: 0.79, change: -0.9 },
];

const positions = [
  { market: "NYC High > 70°F Tomorrow", side: "YES", size: "$420", pnl: "+$38" },
  { market: "Miami Rain > 0.5in Today", side: "NO", size: "$250", pnl: "-$12" },
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
  return (
    <main className="mx-auto min-h-screen max-w-[1700px] p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1.6fr_1fr]">
        <section className="space-y-4 xl:order-1">
          <WeatherStation />
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
                </article>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 xl:order-3">
          <Card>
            <CardHeader>
              <CardTitle>Trading Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-teal-500/35 bg-teal-500/10 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium text-teal-400">
                  <Wallet className="size-4" /> Wallet Status
                </p>
                <p className="mt-1 text-muted-foreground">Connected · 0x82D...4aF1</p>
              </div>

              <form className="space-y-3">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">Order Size (USDC)</label>
                  <Input placeholder="100.00" />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">Estimated Return</label>
                  <Input placeholder="143.50" />
                </div>
                <Button type="button">Place Order</Button>
              </form>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">Current Positions</p>
                <div className="space-y-2">
                  {positions.map((position) => (
                    <div key={position.market} className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                      <p className="font-medium">{position.market}</p>
                      <p className="mt-1 text-muted-foreground">
                        {position.side} · {position.size} · <span className={position.pnl.startsWith("+") ? "text-teal-400" : "text-rose-400"}>{position.pnl}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
