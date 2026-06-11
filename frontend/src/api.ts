const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const url = `${BASE}/api${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${url}`);
  }
  return res.json() as Promise<T>;
}

export type Commodity = {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_price: number;
  previous_price: number;
  change_pct: number;
  trend: "up" | "down" | "flat";
  image: string;
  description: string;
  last_updated: string;
};

export type PricePoint = { date: string; price: number };

export type CommodityDetail = Commodity & {
  history: PricePoint[];
  high_7d: number;
  low_7d: number;
  avg_7d: number;
};

export type MarketOverview = {
  index_value: number;
  index_change_pct: number;
  total_commodities: number;
  gainers: number;
  losers: number;
  top_gainer: Commodity;
  top_loser: Commodity;
  last_updated: string;
};

export type Buyer = {
  id: string;
  name: string;
  company_type: string;
  location: string;
  province: string;
  phone: string;
  email: string;
  commodities: string[];
  price_offer: number;
  target_commodity: string;
  min_quantity_kg: number;
  verified: boolean;
  notes: string;
  image: string;
};

export const api = {
  commodities: () => request<Commodity[]>("/commodities"),
  commodityDetail: (id: string) => request<CommodityDetail>(`/commodities/${id}`),
  marketOverview: () => request<MarketOverview>("/market/overview"),
  buyers: (params?: { commodity?: string; location?: string; verified_only?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.commodity) q.set("commodity", params.commodity);
    if (params?.location) q.set("location", params.location);
    if (params?.verified_only) q.set("verified_only", "true");
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return request<Buyer[]>(`/buyers${qs ? "?" + qs : ""}`);
  },
  buyerDetail: (id: string) => request<Buyer>(`/buyers/${id}`),
  locations: () => request<{ locations: string[] }>("/locations"),
};
