const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";
const HAS_BACKEND = BASE.trim().length > 0;

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

const today = new Date().toISOString();

const mockCommodities: Commodity[] = [
  {
    id: "jahe",
    name: "Jahe",
    category: "Rempah",
    unit: "kg",
    current_price: 32000,
    previous_price: 30000,
    change_pct: 6.67,
    trend: "up",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80",
    description: "Jahe segar untuk kebutuhan pasar, industri minuman, dan bumbu dapur.",
    last_updated: today,
  },
  {
    id: "kencur",
    name: "Kencur",
    category: "Rimpang",
    unit: "kg",
    current_price: 21000,
    previous_price: 22000,
    change_pct: -4.55,
    trend: "down",
    image: "https://images.unsplash.com/photo-1600423115367-87ea7661688f?w=800&q=80",
    description: "Kencur lokal untuk bahan jamu, bumbu, dan kebutuhan herbal.",
    last_updated: today,
  },
  {
    id: "kunyit",
    name: "Kunyit",
    category: "Rimpang",
    unit: "kg",
    current_price: 14500,
    previous_price: 14500,
    change_pct: 0,
    trend: "flat",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
    description: "Kunyit segar untuk rempah, pewarna alami, dan industri herbal.",
    last_updated: today,
  },
  {
    id: "lada",
    name: "Lada",
    category: "Rempah",
    unit: "kg",
    current_price: 74000,
    previous_price: 70000,
    change_pct: 5.71,
    trend: "up",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80",
    description: "Lada kering untuk perdagangan rempah dan kebutuhan distributor.",
    last_updated: today,
  },
  {
    id: "jagung",
    name: "Jagung Pakan",
    category: "Pangan",
    unit: "kg",
    current_price: 5800,
    previous_price: 6000,
    change_pct: -3.33,
    trend: "down",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80",
    description: "Jagung pakan untuk kebutuhan peternak dan distributor pakan.",
    last_updated: today,
  },
  {
    id: "singkong",
    name: "Singkong",
    category: "Umbi",
    unit: "kg",
    current_price: 3500,
    previous_price: 3400,
    change_pct: 2.94,
    trend: "up",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
    description: "Singkong segar untuk industri tepung, makanan, dan olahan lokal.",
    last_updated: today,
  },
];

const mockBuyers: Buyer[] = [
  {
    id: "buyer-1",
    name: "CV Rempah Jaya Nusantara",
    company_type: "Distributor",
    location: "Bandung",
    province: "Jawa Barat",
    phone: "+6281234567890",
    email: "pembelian@rempahjaya.co.id",
    commodities: ["jahe", "kencur", "kunyit"],
    price_offer: 32500,
    target_commodity: "jahe",
    min_quantity_kg: 500,
    verified: true,
    notes: "Mencari pasokan rimpang segar rutin dengan kualitas bersih dan siap kirim.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  },
  {
    id: "buyer-2",
    name: "PT Agro Pangan Sejahtera",
    company_type: "Pabrik Pakan",
    location: "Cirebon",
    province: "Jawa Barat",
    phone: "+6289876543210",
    email: "supply@agropangan.id",
    commodities: ["jagung", "singkong"],
    price_offer: 6000,
    target_commodity: "jagung",
    min_quantity_kg: 2000,
    verified: true,
    notes: "Butuh jagung pakan kering untuk kontrak mingguan.",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
  },
  {
    id: "buyer-3",
    name: "UD Herbal Makmur",
    company_type: "Pengolah Herbal",
    location: "Garut",
    province: "Jawa Barat",
    phone: "+6281122233344",
    email: "order@herbalmakmur.id",
    commodities: ["kencur", "kunyit", "jahe"],
    price_offer: 21500,
    target_commodity: "kencur",
    min_quantity_kg: 300,
    verified: false,
    notes: "Mencari kencur dan kunyit untuk bahan jamu tradisional.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
  },
];

const buildHistory = (base: number): PricePoint[] => {
  const offsets = [-0.05, -0.02, 0.01, -0.01, 0.03, 0.02, 0];
  return offsets.map((offset, index) => ({
    date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    price: Math.round(base * (1 + offset)),
  }));
};

const withDetail = (commodity: Commodity): CommodityDetail => {
  const history = buildHistory(commodity.current_price);
  const prices = history.map((point) => point.price);
  return {
    ...commodity,
    history,
    high_7d: Math.max(...prices),
    low_7d: Math.min(...prices),
    avg_7d: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
  };
};

const marketOverviewMock = (): MarketOverview => {
  const gainers = mockCommodities.filter((commodity) => commodity.change_pct > 0);
  const losers = mockCommodities.filter((commodity) => commodity.change_pct < 0);
  const top_gainer = [...mockCommodities].sort((a, b) => b.change_pct - a.change_pct)[0];
  const top_loser = [...mockCommodities].sort((a, b) => a.change_pct - b.change_pct)[0];
  const index_change_pct = mockCommodities.reduce((sum, commodity) => sum + commodity.change_pct, 0) / mockCommodities.length;

  return {
    index_value: 1284.75,
    index_change_pct,
    total_commodities: mockCommodities.length,
    gainers: gainers.length,
    losers: losers.length,
    top_gainer,
    top_loser,
    last_updated: today,
  };
};

async function request<T>(path: string, fallback: T): Promise<T> {
  if (!HAS_BACKEND) {
    return fallback;
  }

  const url = `${BASE.replace(/\/$/, "")}/api${path}`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await res.text();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} on ${url}`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Response bukan JSON dari ${url}`);
    }
  } catch {
    return fallback;
  }
}

const filterBuyers = (params?: { commodity?: string; location?: string; verified_only?: boolean; search?: string }) => {
  const search = params?.search?.trim().toLowerCase();

  return mockBuyers.filter((buyer) => {
    const matchCommodity = params?.commodity ? buyer.commodities.includes(params.commodity) : true;
    const matchLocation = params?.location ? buyer.location === params.location : true;
    const matchVerified = params?.verified_only ? buyer.verified : true;
    const matchSearch = search
      ? [buyer.name, buyer.company_type, buyer.location, buyer.province, buyer.notes]
          .join(" ")
          .toLowerCase()
          .includes(search)
      : true;

    return matchCommodity && matchLocation && matchVerified && matchSearch;
  });
};

export const api = {
  commodities: () => request<Commodity[]>("/commodities", mockCommodities),
  commodityDetail: (id: string) => {
    const commodity = mockCommodities.find((item) => item.id === id) ?? mockCommodities[0];
    return request<CommodityDetail>(`/commodities/${id}`, withDetail(commodity));
  },
  marketOverview: () => request<MarketOverview>("/market/overview", marketOverviewMock()),
  buyers: (params?: { commodity?: string; location?: string; verified_only?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.commodity) q.set("commodity", params.commodity);
    if (params?.location) q.set("location", params.location);
    if (params?.verified_only) q.set("verified_only", "true");
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return request<Buyer[]>(`/buyers${qs ? "?" + qs : ""}`, filterBuyers(params));
  },
  buyerDetail: (id: string) => {
    const buyer = mockBuyers.find((item) => item.id === id) ?? mockBuyers[0];
    return request<Buyer>(`/buyers/${id}`, buyer);
  },
  locations: () => request<{ locations: string[] }>("/locations", { locations: [...new Set(mockBuyers.map((buyer) => buyer.location))] }),
};