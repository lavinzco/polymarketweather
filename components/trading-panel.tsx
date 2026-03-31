"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import type { Hex } from "viem";
import { createPolymarketLimitOrder, createSellMaxOrder } from "@/lib/polymarket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Position = {
  market: string;
  side: "YES" | "NO";
  size: number;
  pnl: string;
};

type TradingPanelProps = {
  selectedMarketName: string;
  selectedTokenId: string;
  latestTempC: number | null;
  positions: Position[];
};

export function TradingPanel({ selectedMarketName, selectedTokenId, latestTempC, positions }: TradingPanelProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  const [amount, setAmount] = useState("100");
  const [limitPrice, setLimitPrice] = useState("0.60");

  const selectedPosition = useMemo(
    () => positions.find((item) => item.market === selectedMarketName && item.side === "YES"),
    [positions, selectedMarketName]
  );

  async function signOrderDebug(tokenId: string, side: "BUY" | "SELL", price: number, size: number) {
    if (!walletClient || !address) {
      throw new Error("Wallet not connected.");
    }

    const domain = {
      name: "Polymarket CTF Exchange",
      version: "1",
      chainId: 137,
      verifyingContract: (process.env.NEXT_PUBLIC_POLYMARKET_EXCHANGE_ADDRESS ?? "0x4bFb41d5B3570d14Bf1A0d4f0Fb2bfC5F6f51995") as `0x${string}`,
    };

    const types = {
      Order: [
        { name: "maker", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "side", type: "string" },
        { name: "price", type: "string" },
        { name: "size", type: "string" },
      ],
    } as const;

    const message = {
      maker: address,
      tokenId,
      side,
      price: price.toString(),
      size: size.toString(),
    };

    console.group("[EIP-712] Polymarket Limit Order Signature");
    console.log("domain", domain);
    console.log("types", types);
    console.log("primaryType", "Order");
    console.log("message", message);

    const signature = (await walletClient.signTypedData({
      account: address,
      domain,
      types,
      primaryType: "Order",
      message,
    })) as Hex;

    console.log("signature", signature);
    console.groupEnd();

    return signature;
  }

  async function createOrder() {
    if (!isConnected || !address) {
      throw new Error("Please connect wallet first.");
    }

    const size = Number(amount);
    const price = Number(limitPrice);

    const signature = await signOrderDebug(selectedTokenId, "BUY", price, size);
    console.log("[createOrder] EIP-712 signature ready:", signature);

    const orderResult = await createPolymarketLimitOrder({
      tokenId: selectedTokenId,
      side: "BUY",
      size,
      price,
      maker: address,
    });

    console.log("[createOrder] Polymarket order response", orderResult);
  }

  async function handleSellMaxHedge() {
    if (!isConnected || !address) {
      throw new Error("Please connect wallet first.");
    }

    if (latestTempC === null || latestTempC > 18) {
      console.warn("[hedge] Current temperature does not hit impossible-zone criteria, hedge skipped.");
      return;
    }

    const maxSize = selectedPosition?.size ?? Number(amount);
    const signature = await signOrderDebug(selectedTokenId, "SELL", 0.01, maxSize);
    console.log("[hedge] Sell Max signature", signature);

    const hedgeResult = await createSellMaxOrder({
      tokenId: selectedTokenId,
      positionSize: maxSize,
      maker: address,
    });

    console.log("[hedge] Sell Max response", hedgeResult);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-teal-500/35 bg-teal-500/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium text-teal-400">
            <Wallet className="size-4" /> Wallet Status
          </p>
          {isConnected ? (
            <div className="mt-2 space-y-2">
              <p className="text-muted-foreground">Connected · {address}</p>
              <Button type="button" className="h-8 w-auto px-3" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="mt-2 h-8 w-auto px-3"
              disabled={isPending || !connectors[0]}
              onClick={() => connect({ connector: connectors[0] })}
            >
              Connect Polygon Wallet
            </Button>
          )}
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void createOrder();
          }}
        >
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">Selected YES Token ID</label>
            <Input value={selectedTokenId} readOnly className="font-mono text-xs" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">Order Size (USDC)</label>
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="100.00" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">Limit Price</label>
            <Input value={limitPrice} onChange={(event) => setLimitPrice(event.target.value)} placeholder="0.60" />
          </div>
          <Button type="submit">Create Limit Order</Button>
        </form>

        <Button type="button" className="gap-2 bg-rose-500 text-white hover:bg-rose-400" onClick={() => void handleSellMaxHedge()}>
          <ShieldAlert className="size-4" /> 一键套利/风险规避（Sell Max）
        </Button>

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
  );
}
