import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";

import { Colors, Spacing, Radius, Fonts, formatIDR, formatPct } from "@/src/theme";
import { api, Commodity, MarketOverview } from "@/src/api";

export default function HomeScreen() {
  const router = useRouter();
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [ov, list] = await Promise.all([api.marketOverview(), api.commodities()]);
      setOverview(ov);
      setCommodities(list);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]} testID="home-loading">
        <ActivityIndicator size="large" color={Colors.brand} />
        <Text style={styles.muted}>Memuat data pasar…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]} testID="home-error">
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable testID="home-retry-button" onPress={load} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Coba Lagi</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const ovGain = (overview?.index_change_pct ?? 0) >= 0;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safeHeader}>
        <View style={styles.header} testID="home-header">
          <View>
            <Text style={styles.brandSmall}>NUSATANI</Text>
            <Text style={styles.title}>Pasar Hari Ini</Text>
          </View>
          <View style={styles.headerBadge}>
            <View style={styles.dot} />
            <Text style={styles.headerBadgeText}>LIVE</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />}
        testID="home-scroll"
      >
        {/* Hero Card - Index */}
        <View style={styles.hero} testID="market-index-card">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80" }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(26,43,34,0.30)", "rgba(26,43,34,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>INDEKS HARGA REMPAH</Text>
            <Text style={styles.heroValue}>{overview?.index_value.toFixed(2)}</Text>
            <View style={styles.heroRow}>
              <View
                style={[
                  styles.changePill,
                  { backgroundColor: ovGain ? "rgba(38,122,67,0.85)" : "rgba(186,59,59,0.85)" },
                ]}
              >
                <Ionicons name={ovGain ? "trending-up" : "trending-down"} size={14} color="#fff" />
                <Text style={styles.changePillText}>{formatPct(overview?.index_change_pct ?? 0)}</Text>
              </View>
              <Text style={styles.heroMeta}>
                {overview?.gainers} naik · {overview?.losers} turun
              </Text>
            </View>
          </View>
        </View>

        {/* Top mover cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pergerakan Tertinggi</Text>
          <View style={styles.moverRow}>
            <MoverCard label="Top Gainer" commodity={overview!.top_gainer} positive />
            <MoverCard label="Top Loser" commodity={overview!.top_loser} positive={false} />
          </View>
        </View>

        {/* Komoditas horizontal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Komoditas Populer</Text>
            <Pressable onPress={() => router.push("/harga")} testID="see-all-prices">
              <Text style={styles.linkText}>Lihat semua</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {commodities.slice(0, 6).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/commodity/${c.id}` as any)}
                style={styles.commodityCard}
                testID={`commodity-card-${c.id}`}
              >
                <Image source={{ uri: c.image }} style={styles.commodityImage} contentFit="cover" />
                <Text style={styles.commodityName}>{c.name}</Text>
                <Text style={styles.commodityPrice}>{formatIDR(c.current_price)}</Text>
                <View style={styles.commodityTrend}>
                  <Ionicons
                    name={c.trend === "up" ? "arrow-up" : c.trend === "down" ? "arrow-down" : "remove"}
                    size={12}
                    color={c.trend === "up" ? Colors.success : c.trend === "down" ? Colors.error : Colors.muted}
                  />
                  <Text
                    style={[
                      styles.trendText,
                      { color: c.trend === "up" ? Colors.success : c.trend === "down" ? Colors.error : Colors.muted },
                    ]}
                  >
                    {formatPct(c.change_pct)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tren Terkini Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tren Terkini</Text>
          <View style={styles.table} testID="trend-table">
            <View style={styles.tableHead}>
              <Text style={[styles.thText, { flex: 2 }]}>Komoditas</Text>
              <Text style={[styles.thText, { flex: 1.4, textAlign: "right" }]}>Harga</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: "right" }]}>Δ %</Text>
            </View>
            {commodities.map((c, idx) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/commodity/${c.id}` as any)}
                style={[styles.tableRow, idx === commodities.length - 1 && { borderBottomWidth: 0 }]}
                testID={`trend-row-${c.id}`}
              >
                <View style={[{ flex: 2 }, styles.cellName]}>
                  <View
                    style={[
                      styles.trendDot,
                      {
                        backgroundColor:
                          c.trend === "up" ? Colors.success : c.trend === "down" ? Colors.error : Colors.muted,
                      },
                    ]}
                  />
                  <Text style={styles.cellNameText}>{c.name}</Text>
                </View>
                <Text style={[styles.cellPrice, { flex: 1.4 }]}>{formatIDR(c.current_price)}</Text>
                <Text
                  style={[
                    styles.cellChange,
                    { flex: 1 },
                    {
                      color: c.trend === "up" ? Colors.success : c.trend === "down" ? Colors.error : Colors.muted,
                    },
                  ]}
                >
                  {formatPct(c.change_pct)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          Diperbarui · {new Date(overview!.last_updated).toLocaleTimeString("id-ID")}
        </Text>
      </ScrollView>
    </View>
  );
}

function MoverCard({ label, commodity, positive }: { label: string; commodity: Commodity; positive: boolean }) {
  return (
    <View
      style={[
        styles.moverCard,
        { borderLeftColor: positive ? Colors.success : Colors.error },
      ]}
      testID={`mover-${positive ? "gainer" : "loser"}`}
    >
      <Text style={styles.moverLabel}>{label}</Text>
      <Text style={styles.moverName} numberOfLines={1}>
        {commodity.name}
      </Text>
      <Text style={[styles.moverChange, { color: positive ? Colors.success : Colors.error }]}>
        {formatPct(commodity.change_pct)}
      </Text>
      <Text style={styles.moverPrice}>{formatIDR(commodity.current_price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  safeHeader: { backgroundColor: Colors.surface },
  center: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  muted: { color: Colors.muted, fontFamily: Fonts.text, fontSize: 14 },
  errorText: { color: Colors.error, fontFamily: Fonts.textMedium, fontSize: 14, textAlign: "center", paddingHorizontal: Spacing.xl },
  retryBtn: {
    backgroundColor: Colors.brand,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    marginTop: Spacing.sm,
  },
  retryBtnText: { color: Colors.onBrandPrimary, fontFamily: Fonts.textSemiBold, fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  brandSmall: {
    color: Colors.muted,
    fontFamily: Fonts.textBold,
    fontSize: 11,
    letterSpacing: 2,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Fonts.display,
    fontSize: 24,
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.brandTertiary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  headerBadgeText: { color: Colors.brand, fontFamily: Fonts.textBold, fontSize: 10, letterSpacing: 1 },
  scroll: { paddingBottom: Spacing.xxxl },
  hero: {
    marginHorizontal: Spacing.xl,
    height: 180,
    borderRadius: Radius.lg,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroContent: { padding: Spacing.xl },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontFamily: Fonts.textSemiBold, fontSize: 11, letterSpacing: 2 },
  heroValue: { color: "#fff", fontFamily: Fonts.display, fontSize: 44, marginTop: 4 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: 6 },
  changePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.pill },
  changePillText: { color: "#fff", fontFamily: Fonts.textBold, fontSize: 12 },
  heroMeta: { color: "rgba(255,255,255,0.85)", fontFamily: Fonts.text, fontSize: 12 },
  section: { marginTop: Spacing.xl, paddingHorizontal: Spacing.xl },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  sectionTitle: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 18, marginBottom: Spacing.md },
  linkText: { color: Colors.brand, fontFamily: Fonts.textSemiBold, fontSize: 13, marginBottom: Spacing.md },
  moverRow: { flexDirection: "row", gap: Spacing.md },
  moverCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  moverLabel: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 10, letterSpacing: 1 },
  moverName: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 14, marginTop: 4 },
  moverChange: { fontFamily: Fonts.textBold, fontSize: 18, marginTop: 6 },
  moverPrice: { color: Colors.muted, fontFamily: Fonts.text, fontSize: 12, marginTop: 2 },
  hScroll: { paddingRight: Spacing.xl, gap: Spacing.md },
  commodityCard: {
    width: 140,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  commodityImage: { width: "100%", height: 70, borderRadius: Radius.sm, marginBottom: Spacing.sm, backgroundColor: Colors.surfaceTertiary },
  commodityName: { color: Colors.onSurface, fontFamily: Fonts.textSemiBold, fontSize: 13 },
  commodityPrice: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 14, marginTop: 2 },
  commodityTrend: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  trendText: { fontFamily: Fonts.textSemiBold, fontSize: 11 },
  table: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceTertiary,
  },
  thText: { color: Colors.muted, fontFamily: Fonts.textBold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  cellName: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  trendDot: { width: 6, height: 6, borderRadius: 3 },
  cellNameText: { color: Colors.onSurface, fontFamily: Fonts.textMedium, fontSize: 14 },
  cellPrice: { color: Colors.onSurface, fontFamily: Fonts.textSemiBold, fontSize: 14, textAlign: "right" },
  cellChange: { fontFamily: Fonts.textBold, fontSize: 13, textAlign: "right" },
  footer: { textAlign: "center", color: Colors.muted, fontFamily: Fonts.text, fontSize: 11, marginTop: Spacing.xl },
});
