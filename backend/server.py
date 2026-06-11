from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============================================================
# Mock Seed Data - Komoditas (Commodities)
# ============================================================
COMMODITIES_SEED = [
    {"id": "jahe", "name": "Jahe", "category": "Rempah", "unit": "kg",
     "base_price": 32000, "image": "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=800&q=80",
     "description": "Jahe gajah segar kualitas ekspor dari petani Jawa Tengah."},
    {"id": "lada", "name": "Lada Hitam", "category": "Rempah", "unit": "kg",
     "base_price": 78000, "image": "https://images.unsplash.com/photo-1599909533730-3a3cb1fb6c75?w=800&q=80",
     "description": "Lada hitam Lampung pilihan, aroma kuat dan pedas."},
    {"id": "kunyit", "name": "Kunyit", "category": "Rempah", "unit": "kg",
     "base_price": 18500, "image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
     "description": "Kunyit kuning segar, cocok untuk industri jamu dan kuliner."},
    {"id": "kencur", "name": "Kencur", "category": "Rempah", "unit": "kg",
     "base_price": 42000, "image": "https://images.unsplash.com/photo-1599909533730-3a3cb1fb6c75?w=800&q=80",
     "description": "Kencur segar untuk industri jamu tradisional dan bumbu."},
    {"id": "lengkuas", "name": "Lengkuas", "category": "Rempah", "unit": "kg",
     "base_price": 22000, "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
     "description": "Lengkuas segar berkualitas, ukuran besar."},
    {"id": "kayu-manis", "name": "Kayu Manis", "category": "Rempah", "unit": "kg",
     "base_price": 65000, "image": "https://images.unsplash.com/photo-1599909533730-3a3cb1fb6c75?w=800&q=80",
     "description": "Kayu manis Cassiavera Kerinci, kualitas ekspor."},
    {"id": "cengkeh", "name": "Cengkeh", "category": "Rempah", "unit": "kg",
     "base_price": 95000, "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
     "description": "Cengkeh kering Maluku, aroma kuat."},
    {"id": "pala", "name": "Biji Pala", "category": "Rempah", "unit": "kg",
     "base_price": 110000, "image": "https://images.unsplash.com/photo-1599909533730-3a3cb1fb6c75?w=800&q=80",
     "description": "Biji pala utuh dari Banda, kering siap olah."},
    {"id": "kapulaga", "name": "Kapulaga", "category": "Rempah", "unit": "kg",
     "base_price": 130000, "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
     "description": "Kapulaga jawa hijau, kualitas premium."},
    {"id": "kemiri", "name": "Kemiri", "category": "Rempah", "unit": "kg",
     "base_price": 38000, "image": "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=800&q=80",
     "description": "Kemiri tanpa kulit, siap pakai untuk bumbu masakan."},
]

BUYERS_SEED = [
    {"id": str(uuid.uuid4()), "name": "PT Rempah Nusantara Jaya", "company_type": "Eksportir",
     "location": "Jakarta", "province": "DKI Jakarta", "phone": "+62 812-1111-2222",
     "email": "purchase@rempahnusantara.co.id",
     "commodities": ["jahe", "kunyit", "kencur"], "price_offer": 35000, "target_commodity": "jahe",
     "min_quantity_kg": 500, "verified": True,
     "notes": "Membutuhkan suplai rutin bulanan. Kontrak 6 bulan tersedia.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
    {"id": str(uuid.uuid4()), "name": "CV Bumi Spice Indonesia", "company_type": "Distributor",
     "location": "Surabaya", "province": "Jawa Timur", "phone": "+62 813-3333-4444",
     "email": "buyer@bumispice.id",
     "commodities": ["lada", "cengkeh", "pala"], "price_offer": 82000, "target_commodity": "lada",
     "min_quantity_kg": 200, "verified": True,
     "notes": "Pembayaran tempo 14 hari. Pickup gudang petani.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
    {"id": str(uuid.uuid4()), "name": "Toko Jamu Sehat Sentosa", "company_type": "Industri",
     "location": "Yogyakarta", "province": "DI Yogyakarta", "phone": "+62 814-5555-6666",
     "email": "produksi@jamusehat.com",
     "commodities": ["kunyit", "kencur", "jahe", "lengkuas"], "price_offer": 20000, "target_commodity": "kunyit",
     "min_quantity_kg": 100, "verified": True,
     "notes": "Pabrik jamu butuh suplai mingguan, kualitas segar.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
    {"id": str(uuid.uuid4()), "name": "PT Aroma Nusantara Ekspor", "company_type": "Eksportir",
     "location": "Medan", "province": "Sumatera Utara", "phone": "+62 815-7777-8888",
     "email": "trade@aromanusantara.com",
     "commodities": ["kayu-manis", "pala", "kapulaga"], "price_offer": 70000, "target_commodity": "kayu-manis",
     "min_quantity_kg": 1000, "verified": True,
     "notes": "Ekspor ke Eropa & Timur Tengah. Butuh sertifikasi organik.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
    {"id": str(uuid.uuid4()), "name": "UD Mitra Petani Sejahtera", "company_type": "Pengepul",
     "location": "Bandung", "province": "Jawa Barat", "phone": "+62 816-9999-0000",
     "email": "mitra@petanisejahtera.id",
     "commodities": ["jahe", "kunyit", "kencur", "lengkuas", "kemiri"], "price_offer": 40000, "target_commodity": "kencur",
     "min_quantity_kg": 50, "verified": False,
     "notes": "Pengepul lokal, pembayaran cash on delivery.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
    {"id": str(uuid.uuid4()), "name": "PT Rempah Global Trading", "company_type": "Eksportir",
     "location": "Semarang", "province": "Jawa Tengah", "phone": "+62 817-1212-3434",
     "email": "import@rempahglobal.com",
     "commodities": ["cengkeh", "pala", "kapulaga", "kayu-manis"], "price_offer": 100000, "target_commodity": "cengkeh",
     "min_quantity_kg": 500, "verified": True,
     "notes": "Buyer aktif untuk pasar India dan China.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
    {"id": str(uuid.uuid4()), "name": "CV Bumbu Asli Indonesia", "company_type": "Distributor",
     "location": "Makassar", "province": "Sulawesi Selatan", "phone": "+62 818-5656-7878",
     "email": "order@bumbuasli.co.id",
     "commodities": ["kemiri", "lengkuas", "jahe"], "price_offer": 41000, "target_commodity": "kemiri",
     "min_quantity_kg": 200, "verified": True,
     "notes": "Suplai resto & hotel di Indonesia Timur.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
    {"id": str(uuid.uuid4()), "name": "PT Herbal Indo Farma", "company_type": "Industri",
     "location": "Solo", "province": "Jawa Tengah", "phone": "+62 819-2323-4545",
     "email": "supply@herbalindo.id",
     "commodities": ["kunyit", "jahe", "kencur"], "price_offer": 19500, "target_commodity": "kunyit",
     "min_quantity_kg": 1000, "verified": True,
     "notes": "Industri farmasi herbal, butuh sertifikat mutu.",
     "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"},
]


# ============================================================
# Models
# ============================================================
class PriceTrend(BaseModel):
    date: str
    price: int


class Commodity(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    current_price: int
    previous_price: int
    change_pct: float
    trend: str  # 'up' | 'down' | 'flat'
    image: str
    description: str
    last_updated: str


class CommodityDetail(Commodity):
    history: List[PriceTrend]
    high_7d: int
    low_7d: int
    avg_7d: int


class MarketOverview(BaseModel):
    index_value: float
    index_change_pct: float
    total_commodities: int
    gainers: int
    losers: int
    top_gainer: Commodity
    top_loser: Commodity
    last_updated: str


class Buyer(BaseModel):
    id: str
    name: str
    company_type: str
    location: str
    province: str
    phone: str
    email: str
    commodities: List[str]
    price_offer: int
    target_commodity: str
    min_quantity_kg: int
    verified: bool
    notes: str
    image: str


# ============================================================
# Price calculation (mock real-time using seeded volatility)
# ============================================================
def get_commodity_state(commodity: dict) -> dict:
    """Generate pseudo-real-time price with stable per-minute volatility."""
    now = datetime.now(timezone.utc)
    # Bucket by minute so multiple calls in same minute return same value
    bucket = int(now.timestamp() // 60)
    rng = random.Random(f"{commodity['id']}-{bucket}")
    rng_prev = random.Random(f"{commodity['id']}-{bucket - 1}")

    volatility = 0.03  # +/- 3%
    base = commodity['base_price']
    current = int(base * (1 + rng.uniform(-volatility, volatility)))
    previous = int(base * (1 + rng_prev.uniform(-volatility, volatility)))
    # Round to 100
    current = round(current / 100) * 100
    previous = round(previous / 100) * 100

    change_pct = ((current - previous) / previous) * 100 if previous else 0
    if change_pct > 0.1:
        trend = 'up'
    elif change_pct < -0.1:
        trend = 'down'
    else:
        trend = 'flat'

    return {
        "current_price": current,
        "previous_price": previous,
        "change_pct": round(change_pct, 2),
        "trend": trend,
        "last_updated": now.isoformat(),
    }


def build_commodity(c: dict) -> Commodity:
    state = get_commodity_state(c)
    return Commodity(
        id=c['id'], name=c['name'], category=c['category'], unit=c['unit'],
        image=c['image'], description=c['description'], **state
    )


def build_history(commodity: dict, days: int = 7) -> List[PriceTrend]:
    history = []
    base = commodity['base_price']
    for i in range(days, -1, -1):
        d = (datetime.now(timezone.utc) - timedelta(days=i)).date()
        rng = random.Random(f"{commodity['id']}-{d.isoformat()}")
        p = int(base * (1 + rng.uniform(-0.06, 0.06)))
        p = round(p / 100) * 100
        history.append(PriceTrend(date=d.isoformat(), price=p))
    return history


# ============================================================
# Routes
# ============================================================
@api_router.get("/")
async def root():
    return {"app": "Nusatani API", "status": "ok", "version": "1.0"}


@api_router.get("/commodities", response_model=List[Commodity])
async def get_commodities():
    return [build_commodity(c) for c in COMMODITIES_SEED]


@api_router.get("/commodities/{commodity_id}", response_model=CommodityDetail)
async def get_commodity_detail(commodity_id: str):
    c = next((c for c in COMMODITIES_SEED if c['id'] == commodity_id), None)
    if not c:
        raise HTTPException(status_code=404, detail="Komoditas tidak ditemukan")
    base = build_commodity(c)
    history = build_history(c)
    prices = [h.price for h in history]
    return CommodityDetail(
        **base.dict(),
        history=history,
        high_7d=max(prices),
        low_7d=min(prices),
        avg_7d=int(sum(prices) / len(prices)),
    )


@api_router.get("/market/overview", response_model=MarketOverview)
async def market_overview():
    coms = [build_commodity(c) for c in COMMODITIES_SEED]
    gainers = [c for c in coms if c.trend == 'up']
    losers = [c for c in coms if c.trend == 'down']
    top_gainer = max(coms, key=lambda x: x.change_pct)
    top_loser = min(coms, key=lambda x: x.change_pct)
    avg_change = sum(c.change_pct for c in coms) / len(coms)
    # Index: 1000-based pseudo index
    index_value = round(1000 + sum(c.change_pct for c in coms) * 5, 2)
    return MarketOverview(
        index_value=index_value,
        index_change_pct=round(avg_change, 2),
        total_commodities=len(coms),
        gainers=len(gainers),
        losers=len(losers),
        top_gainer=top_gainer,
        top_loser=top_loser,
        last_updated=datetime.now(timezone.utc).isoformat(),
    )


@api_router.get("/buyers", response_model=List[Buyer])
async def get_buyers(
    commodity: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    verified_only: bool = Query(False),
    search: Optional[str] = Query(None),
):
    results = list(BUYERS_SEED)
    if commodity:
        results = [b for b in results if commodity in b['commodities']]
    if location:
        results = [b for b in results if location.lower() in b['location'].lower() or location.lower() in b['province'].lower()]
    if verified_only:
        results = [b for b in results if b['verified']]
    if search:
        q = search.lower()
        results = [b for b in results if q in b['name'].lower() or q in b['location'].lower() or q in b['company_type'].lower()]
    return [Buyer(**b) for b in results]


@api_router.get("/buyers/{buyer_id}", response_model=Buyer)
async def get_buyer(buyer_id: str):
    b = next((b for b in BUYERS_SEED if b['id'] == buyer_id), None)
    if not b:
        raise HTTPException(status_code=404, detail="Pembeli tidak ditemukan")
    return Buyer(**b)


@api_router.get("/locations")
async def get_locations():
    locs = sorted({b['province'] for b in BUYERS_SEED})
    return {"locations": locs}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
