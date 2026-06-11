import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Colors, Spacing, Radius, Fonts, formatIDR } from "@/src/theme";
import { api, Buyer, Commodity } from "@/src/api";

export default function PembeliScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ commodity?: string }>();

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [commodityFilter, setCommodityFilter] = useState<string | undefined>(params.commodity);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const list = await api.buyers({
        search: search || undefined,
        commodity: commodityFilter,
        location: locationFilter,
        verified_only: verifiedOnly,
      });
      setBuyers(list);
    } catch (e: any) {
      setError(e.message || "Gagal memuat pembeli");
    } finally {
      setLoading(false);
    }
  }, [search, commodityFilter, locationFilter, verifiedOnly]);

  useEffect(() => {
    (async () => {
      try {
        const [coms, locs] = await Promise.all([api.commodities(), api.locations()]);
        setCommodities(coms);
        setLocations(locs.locations);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetFilters = () => {
    setCommodityFilter(undefined);
    setLocationFilter(undefined);
    setVerifiedOnly(false);
    setSearch("");
  };

  const activeFilterCount =
    (commodityFilter ? 1 : 0) + (locationFilter ? 1 : 0) + (verifiedOnly ? 1 : 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.root}>
        <SafeAreaView edges={["top"]} style={styles.safeHeader}>
          <View style={styles.header}>
            <Text style={styles.brandSmall}>CARI PEMBELI</Text>
            <Text style={styles.title}>Temukan Pembeli</Text>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={Colors.muted} />
            <TextInput
              testID="search-input"
              value={search}
              onChangeText={setSearch}
              placeholder="Cari nama perusahaan, kota…"
              placeholderTextColor={Colors.muted}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} testID="search-clear">
                <Ionicons name="close-circle" size={18} color={Colors.muted} />
              </Pressable>
            )}
          </View>

          {/* Commodity chip row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
            testID="commodity-filter-row"
          >
            <Pressable
              onPress={() => setCommodityFilter(undefined)}
              style={[styles.chip, !commodityFilter && styles.chipActive]}
              testID="chip-commodity-all"
            >
              <Text style={[styles.chipText, !commodityFilter && styles.chipTextActive]}>Semua</Text>
            </Pressable>
            {commodities.map((c) => {
              const active = commodityFilter === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCommodityFilter(active ? undefined : c.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  testID={`chip-commodity-${c.id}`}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Secondary filters row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
            testID="location-filter-row"
          >
            <Pressable
              onPress={() => setVerifiedOnly((v) => !v)}
              style={[styles.chipSm, verifiedOnly && styles.chipSmActive]}
              testID="chip-verified"
            >
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={verifiedOnly ? Colors.onBrandPrimary : Colors.brand}
              />
              <Text style={[styles.chipSmText, verifiedOnly && styles.chipSmTextActive]}>Terverifikasi</Text>
            </Pressable>
            {locations.map((loc) => {
              const active = locationFilter === loc;
              return (
                <Pressable
                  key={loc}
                  onPress={() => setLocationFilter(active ? undefined : loc)}
                  style={[styles.chipSm, active && styles.chipSmActive]}
                  testID={`chip-location-${loc}`}
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={active ? Colors.onBrandPrimary : Colors.muted}
                  />
                  <Text style={[styles.chipSmText, active && styles.chipSmTextActive]}>{loc}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {activeFilterCount > 0 && (
            <View style={styles.activeFilterBar}>
              <Text style={styles.activeFilterText}>{activeFilterCount} filter aktif</Text>
              <Pressable onPress={resetFilters} testID="reset-filters">
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            </View>
          )}
        </SafeAreaView>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.brand} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.muted} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : buyers.length === 0 ? (
          <View style={styles.center} testID="buyers-empty">
            <Ionicons name="search-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Tidak ada pembeli ditemukan</Text>
            <Text style={styles.emptySubtitle}>Coba ubah filter atau kata kunci pencarian.</Text>
          </View>
        ) : (
          <FlatList
            data={buyers}
            keyExtractor={(b) => b.id}
            contentContainerStyle={styles.listContent}
            testID="buyers-list"
            renderItem={({ item }) => {
              const target = commodities.find((c) => c.id === item.target_commodity);
              return (
                <Pressable
                  style={styles.buyerCard}
                  onPress={() => router.push(`/buyer/${item.id}` as any)}
                  testID={`buyer-card-${item.id}`}
                >
                  <View style={styles.buyerHead}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.buyerNameRow}>
                        <Text style={styles.buyerName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.verified && (
                          <Ionicons name="checkmark-circle" size={14} color={Colors.brand} />
                        )}
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="business-outline" size={12} color={Colors.muted} />
                        <Text style={styles.metaText}>{item.company_type}</Text>
                        <Text style={styles.dotSep}>·</Text>
                        <Ionicons name="location-outline" size={12} color={Colors.muted} />
                        <Text style={styles.metaText}>{item.location}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.buyerBody}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bodyLabel}>Mencari</Text>
                      <Text style={styles.bodyValue}>{target?.name ?? item.target_commodity}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bodyLabel}>Penawaran</Text>
                      <Text style={[styles.bodyValue, { color: Colors.success }]}>{formatIDR(item.price_offer)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bodyLabel}>Min. Order</Text>
                      <Text style={styles.bodyValue}>{item.min_quantity_kg} kg</Text>
                    </View>
                  </View>

                  <View style={styles.commodityTags}>
                    {item.commodities.slice(0, 3).map((cid) => {
                      const c = commodities.find((x) => x.id === cid);
                      return (
                        <View key={cid} style={styles.commodityTag}>
                          <Text style={styles.commodityTagText}>{c?.name ?? cid}</Text>
                        </View>
                      );
                    })}
                    {item.commodities.length > 3 && (
                      <Text style={styles.moreTagText}>+{item.commodities.length - 3}</Text>
                    )}
                  </View>

                  <Pressable
                    style={styles.contactBtn}
                    onPress={() => router.push(`/buyer/${item.id}` as any)}
                    testID={`contact-buyer-${item.id}`}
                  >
                    <Ionicons name="call-outline" size={16} color={Colors.onBrandSecondary} />
                    <Text style={styles.contactBtnText}>Hubungi</Text>
                  </Pressable>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  safeHeader: { backgroundColor: Colors.surface, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  brandSmall: { color: Colors.muted, fontFamily: Fonts.textBold, fontSize: 11, letterSpacing: 2 },
  title: { color: Colors.onSurface, fontFamily: Fonts.display, fontSize: 24, marginTop: 2 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.onSurface, fontFamily: Fonts.text, fontSize: 14, paddingVertical: 0 },
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
  chipSm: {
    flexShrink: 0,
    height: 32,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipSmActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  chipSmText: { color: Colors.onSurface, fontFamily: Fonts.textMedium, fontSize: 12 },
  chipSmTextActive: { color: Colors.onBrandPrimary, fontFamily: Fonts.textSemiBold },
  activeFilterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.brandTertiary,
  },
  activeFilterText: { color: Colors.brand, fontFamily: Fonts.textSemiBold, fontSize: 12 },
  resetText: { color: Colors.brand, fontFamily: Fonts.textBold, fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  errorText: { color: Colors.error, fontFamily: Fonts.textMedium, fontSize: 14, textAlign: "center" },
  emptyTitle: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 16, marginTop: Spacing.sm },
  emptySubtitle: { color: Colors.muted, fontFamily: Fonts.text, fontSize: 13, textAlign: "center" },
  retryBtn: { backgroundColor: Colors.brand, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radius.pill },
  retryBtnText: { color: Colors.onBrandPrimary, fontFamily: Fonts.textSemiBold, fontSize: 14 },
  listContent: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  buyerCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  buyerHead: { flexDirection: "row", alignItems: "center" },
  buyerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  buyerName: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 16, flexShrink: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: { color: Colors.muted, fontFamily: Fonts.text, fontSize: 12 },
  dotSep: { color: Colors.muted, marginHorizontal: 2 },
  divider: { height: 0.5, backgroundColor: Colors.divider },
  buyerBody: { flexDirection: "row", gap: Spacing.md },
  bodyLabel: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
  bodyValue: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 13, marginTop: 2 },
  commodityTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  commodityTag: { backgroundColor: Colors.brandTertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  commodityTagText: { color: Colors.brand, fontFamily: Fonts.textSemiBold, fontSize: 11 },
  moreTagText: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 11 },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.brandSecondary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
  },
  contactBtnText: { color: Colors.onBrandSecondary, fontFamily: Fonts.textBold, fontSize: 14 },
});
