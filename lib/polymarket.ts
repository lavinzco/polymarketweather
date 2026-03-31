import type { Address } from "viem";

export type LimitOrderInput = {
  tokenId: string;
  side: "BUY" | "SELL";
  size: number;
  price: number;
  maker: Address;
};

export type HedgingInput = {
  tokenId: string;
  positionSize: number;
  maker: Address;
};

export async function createPolymarketLimitOrder(input: LimitOrderInput) {
  const { ClobClient } = await import("@polymarket/clob-client");
  const host = process.env.NEXT_PUBLIC_POLYMARKET_CLOB_URL ?? "https://clob.polymarket.com";
  const chainId = Number(process.env.NEXT_PUBLIC_POLYMARKET_CHAIN_ID ?? 137);

  const client = new ClobClient(host, chainId);

  return client.createOrder({
    tokenID: input.tokenId,
    side: input.side,
    size: input.size,
    price: input.price,
    user: input.maker,
    orderType: "GTC",
  });
}

export async function createSellMaxOrder(input: HedgingInput) {
  return createPolymarketLimitOrder({
    tokenId: input.tokenId,
    side: "SELL",
    size: input.positionSize,
    price: 0.01,
    maker: input.maker,
  });
}
