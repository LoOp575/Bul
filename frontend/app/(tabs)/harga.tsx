import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";

import { Colors, Spacing, Radius, Fonts, formatIDR, formatPct } from "@/src/theme";
import { api, Commodity, CommodityDetail } from "@/src/api";
import PriceChart from "@/src/components/PriceChart";

export default function HargaScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selected, setSelected] = useState<string>("jahe");
  const [detail, setDetail] = useState<CommodityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    try {
      setError(null);
      const list = await api.commodities();
      setCommodities(list);
      if (!list.find((c) => c.id === selected)) setSelected(list[0]?.id ?? "jahe");
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selected]);

  const loadDetail = useCallback(async (id: string) => {
    try {
      setChartLoading(true);
      const d = await api.commodityDetail(id);
      setDetail(d);
    } catch {
      // ignore
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (selected) loadDetail(selected);
  }, [selected, loadDetail]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadList();
    if (selected) loadDetail(selected);
  }, [loadList, loadDetail, selected]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={loadList} style={styles.retryBtn} testID="harga-retry">
          <Text style={styles.retryBtnText}>Coba Lagi</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const sel = commodities.find((c) => c.id === selected);
  const isUp = (sel?.change_pct ?? 0) >= 0;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safeHeader}>
        <View style={styles.header}>
          <Text style={styles.brandSmall}>HARGA & GRAFIK</Text>
          <Text style={styles.title}>Pantau Pergerakan</Text>
        </View>

        {/* Chip row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
          testID="commodity-chip-row"
        >
          {commodities.map((c) => {
            const active = c.id === selected;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelected(c.id)}
                style={[styles.chip, active && styles.chipActive]}
                testID={`chip-${c.id}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />}
      >
        {sel && (
          <View style={styles.priceCard} testID="selected-price-card">
            <Text style={styles.priceLabel}>{sel.name} · per {sel.unit}</Text>
            <Text style={styles.priceValue}>{formatIDR(sel.current_price)}</Text>
            <View style={styles.priceChange}>
              <Ionicons
                name={isUp ? "trending-up" : "trending-down"}
                size={14}
                color={isUp ? Colors.success : Colors.error}
              />
              <Text style={[styles.priceChangeText, { color: isUp ? Colors.success : Colors.error }]}>
                {formatPct(sel.change_pct)} · {formatIDR(Math.abs(sel.current_price - sel.previous_price))}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.chartCard} testID="price-chart-card">
          <Text style={styles.cardTitle}>Tren 7 Hari Terakhir</Text>
          {chartLoading || !detail ? (
            <View style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={Colors.brand} />
            </View>
          ) : (
            <PriceChart data={detail.history} width={width - Spacing.xl * 2 - Spacing.lg * 2} height={180} />
          )}
        </View>

        {detail && (
          <View style={styles.statsRow}>
            <StatBox label="Tertinggi 7H" value={formatIDR(detail.high_7d)} />
            <StatBox label="Rata-rata" value={formatIDR(detail.avg_7d)} />
            <StatBox label="Terendah 7H" value={formatIDR(detail.low_7d)} />
          </View>
        )}

        {/* Full price table */}
        <Text style={styles.tableTitle}>Daftar Harga Komoditas</Text>
        <View style={styles.table} testID="price-table">
          <View style={styles.tableHead}>
            <Text style={[styles.thText, { flex: 2.2 }]}>Komoditas</Text>
            <Text style={[styles.thText, { flex: 1.5, textAlign: "right" }]}>Harga / kg</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: "right" }]}>Δ %</Text>
          </View>
          {commodities.map((c, idx) => (
            <Pressable
              key={c.id}
              onPress={() => setSelected(c.id)}
              style={[styles.tableRow, idx === commodities.length - 1 && { borderBottomWidth: 0 }, c.id === selected && styles.tableRowActive]}
              testID={`price-row-${c.id}`}
            >
              <View style={[{ flex: 2.2 }, styles.cellName]}>
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
              <Text style={[styles.cellPrice, { flex: 1.5 }]}>{formatIDR(c.current_price)}</Text>
              <Text
                style={[
                  styles.cellChange,
                  { flex: 1 },
                  { color: c.trend === "up" ? Colors.success : c.trend === "down" ? Colors.error : Colors.muted },
                ]}
              >
                {formatPct(c.change_pct)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.findBuyerCta}
          onPress={() => router.push({ pathname: "/pembeli", params: { commodity: selected } } as any)}
          testID="find-buyers-for-commodity"
        >
          <Ionicons name="people" size={18} color="#fff" />
          <Text style={styles.findBuyerCtaText}>Cari Pembeli untuk {sel?.name ?? ""}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  safeHeader: { backgroundColor: Colors.surface, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  center: { flex: 1, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", gap: Spacing.md },
  errorText: { color: Colors.error, fontFamily: Fonts.textMedium, fontSize: 14, textAlign: "center", paddingHorizontal: Spacing.xl },
  retryBtn: {
    backgroundColor: Colors.brand,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
  },
  retryBtnText: { color: Colors.onBrandPrimary, fontFamily: Fonts.textSemiBold, fontSize: 14 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  brandSmall: { color: Colors.muted, fontFamily: Fonts.textBold, fontSize: 11, letterSpacing: 2 },
  title: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 24, marginTop: 2 },
  chipRow: { height: 56 },
  chipRowContent: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, gap: Spacing.sm, alignItems: "center" },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipText: { color: Colors.onSurface, fontFamily: Fonts.textMedium, fontSize: 13 },
  chipTextActive: { color: Colors.onBrandPrimary, fontFamily: Fonts.textSemiBold },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xxxl },
  priceCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  priceLabel: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 12, letterSpacing: 1 },
  priceValue: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 36, marginTop: 4 },
  priceChange: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  priceChangeText: { fontFamily: Fonts.textSemiBold, fontSize: 13 },
  chartCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  cardTitle: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 14, marginBottom: Spacing.md },
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
  },
  statLabel: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
  statValue: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 14, marginTop: 4, textAlign: "center" },
  tableTitle: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 18, marginTop: Spacing.xl, marginBottom: Spacing.md },
  table: { backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, overflow: "hidden" },
  tableHead: { flexDirection: "row", paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, backgroundColor: Colors.surfaceTertiary },
  thText: { color: Colors.muted, fontFamily: Fonts.textBold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  tableRowActive: { backgroundColor: Colors.brandTertiary },
  cellName: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  trendDot: { width: 6, height: 6, borderRadius: 3 },
  cellNameText: { color: Colors.onSurface, fontFamily: Fonts.textMedium, fontSize: 14 },
  cellPrice: { color: Colors.onSurface, fontFamily: Fonts.textSemiBold, fontSize: 14, textAlign: "right" },
  cellChange: { fontFamily: Fonts.textBold, fontSize: 13, textAlign: "right" },
  findBuyerCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.brandSecondary,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
    marginTop: Spacing.xl,
  },
  findBuyerCtaText: { color: Colors.onBrandSecondary, fontFamily: Fonts.textBold, fontSize: 14 },
});
