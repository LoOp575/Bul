"""Nusatani backend API tests"""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://nusatani-app.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- Commodities ----------
def test_commodities_list(session):
    r = session.get(f"{API}/commodities")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 10
    required = {"id", "name", "category", "unit", "current_price",
                "previous_price", "change_pct", "trend", "image",
                "description", "last_updated"}
    for c in data:
        assert required.issubset(c.keys()), f"Missing fields in {c}"
        assert c["trend"] in ("up", "down", "flat")
        assert isinstance(c["current_price"], int)
    ids = {c["id"] for c in data}
    for expected in ["jahe", "lada", "kunyit", "kencur", "lengkuas"]:
        assert expected in ids


def test_commodity_detail(session):
    r = session.get(f"{API}/commodities/jahe")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "jahe"
    assert "history" in data
    assert len(data["history"]) == 8  # range(7,-1,-1) => 8 entries
    assert "high_7d" in data and "low_7d" in data and "avg_7d" in data
    assert data["high_7d"] >= data["avg_7d"] >= data["low_7d"]
    for h in data["history"]:
        assert "date" in h and "price" in h


def test_commodity_detail_404(session):
    r = session.get(f"{API}/commodities/does-not-exist")
    assert r.status_code == 404


# ---------- Market Overview ----------
def test_market_overview(session):
    r = session.get(f"{API}/market/overview")
    assert r.status_code == 200
    data = r.json()
    for k in ["index_value", "index_change_pct", "total_commodities",
              "gainers", "losers", "top_gainer", "top_loser", "last_updated"]:
        assert k in data
    assert data["total_commodities"] == 10
    assert isinstance(data["top_gainer"], dict)
    assert "id" in data["top_gainer"]
    assert "id" in data["top_loser"]


# ---------- Buyers ----------
def test_buyers_all(session):
    r = session.get(f"{API}/buyers")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    required = {"id", "name", "company_type", "location", "province",
                "phone", "email", "commodities", "price_offer",
                "target_commodity", "min_quantity_kg", "verified", "notes", "image"}
    for b in data:
        assert required.issubset(b.keys())


def test_buyers_filter_commodity(session):
    r = session.get(f"{API}/buyers", params={"commodity": "jahe"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    for b in data:
        assert "jahe" in b["commodities"]


def test_buyers_filter_location(session):
    r = session.get(f"{API}/buyers", params={"location": "Jakarta"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    for b in data:
        assert "jakarta" in b["location"].lower() or "jakarta" in b["province"].lower()


def test_buyers_verified_only(session):
    r = session.get(f"{API}/buyers", params={"verified_only": "true"})
    assert r.status_code == 200
    data = r.json()
    for b in data:
        assert b["verified"] is True


def test_buyers_search(session):
    r = session.get(f"{API}/buyers", params={"search": "PT"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    for b in data:
        assert "pt" in b["name"].lower() or "pt" in b["location"].lower() or "pt" in b["company_type"].lower()


def test_buyer_detail(session):
    r = session.get(f"{API}/buyers")
    buyers = r.json()
    bid = buyers[0]["id"]
    r2 = session.get(f"{API}/buyers/{bid}")
    assert r2.status_code == 200
    assert r2.json()["id"] == bid


def test_buyer_detail_404(session):
    r = session.get(f"{API}/buyers/nonexistent-id")
    assert r.status_code == 404


# ---------- Locations ----------
def test_locations(session):
    r = session.get(f"{API}/locations")
    assert r.status_code == 200
    data = r.json()
    assert "locations" in data
    assert isinstance(data["locations"], list)
    assert len(data["locations"]) >= 3
    assert "DKI Jakarta" in data["locations"]
