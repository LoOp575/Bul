import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Colors, Spacing, Radius, Fonts, formatIDR, formatPct } from "@/src/theme";
import { api, CommodityDetail } from "@/src/api";
import PriceChart from "@/src/components/PriceChart";

export default function CommodityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [detail, setDetail] = useState<CommodityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await api.commodityDetail(id);
        setDetail(d);
      } catch (e: any) {
        setError(e.message || "Gagal memuat detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={Colors.brand} />
      </SafeAreaView>
    );
  }

  if (error || !detail) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.muted} />
        <Text style={styles.errorText}>{error || "Tidak ditemukan"}</Text>
        <Pressable onPress={() => router.back()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Kembali</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isUp = detail.change_pct >= 0;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          <Image source={{ uri: detail.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={["rgba(26,43,34,0.2)", "rgba(26,43,34,0.92)"]} style={StyleSheet.absoluteFill} />
          <SafeAreaView edges={["top"]} style={styles.coverHeader}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-button">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
          </SafeAreaView>
          <View style={styles.coverContent}>
            <Text style={styles.coverCat}>{detail.category.toUpperCase()}</Text>
            <Text style={styles.coverName}>{detail.name}</Text>
            <Text style={styles.coverPrice}>{formatIDR(detail.current_price)} / {detail.unit}</Text>
            <View style={[styles.changePill, { backgroundColor: isUp ? "rgba(38,122,67,0.85)" : "rgba(186,59,59,0.85)" }]}>
              <Ionicons name={isUp ? "trending-up" : "trending-down"} size={14} color="#fff" />
              <Text style={styles.changePillText}>{formatPct(detail.change_pct)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deskripsi</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>{detail.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tren 7 Hari Terakhir</Text>
          <View style={styles.chartCard}>
            <PriceChart data={detail.history} width={width - Spacing.xl * 2 - Spacing.lg * 2} height={180} />
          </View>
        </View>

        <View style={[styles.section, { flexDirection: "row", gap: Spacing.sm }]}>
          <Stat label="Tertinggi" value={formatIDR(detail.high_7d)} />
          <Stat label="Rata-rata" value={formatIDR(detail.avg_7d)} />
          <Stat label="Terendah" value={formatIDR(detail.low_7d)} />
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.cta}
            onPress={() => router.push({ pathname: "/pembeli", params: { commodity: detail.id } } as any)}
            testID="commodity-find-buyers"
          >
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.ctaText}>Cari Pembeli untuk {detail.name}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingBottom: Spacing.xxxl },
  center: { flex: 1, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", gap: Spacing.md },
  errorText: { color: Colors.error, fontFamily: Fonts.textMedium, fontSize: 14 },
  retryBtn: { backgroundColor: Colors.brand, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radius.pill },
  retryBtnText: { color: Colors.onBrandPrimary, fontFamily: Fonts.textSemiBold, fontSize: 14 },
  cover: { height: 280, overflow: "hidden", justifyContent: "flex-end" },
  coverHeader: { position: "absolute", top: 0, left: 0, right: 0, padding: Spacing.md },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  coverContent: { padding: Spacing.xl, gap: 4 },
  coverCat: { color: "rgba(255,255,255,0.7)", fontFamily: Fonts.textBold, fontSize: 11, letterSpacing: 2 },
  coverName: { color: "#fff", fontFamily: Fonts.display, fontSize: 32 },
  coverPrice: { color: "#fff", fontFamily: Fonts.textBold, fontSize: 18, marginTop: 4 },
  changePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.pill, alignSelf: "flex-start", marginTop: 8 },
  changePillText: { color: "#fff", fontFamily: Fonts.textBold, fontSize: 12 },
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionLabel: { color: Colors.muted, fontFamily: Fonts.textBold, fontSize: 11, letterSpacing: 1, marginBottom: Spacing.md, textTransform: "uppercase" },
  notesBox: { backgroundColor: Colors.surfaceSecondary, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border },
  notesText: { color: Colors.onSurface, fontFamily: Fonts.text, fontSize: 14, lineHeight: 22 },
  chartCard: { backgroundColor: Colors.surfaceSecondary, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border },
  statBox: { flex: 1, backgroundColor: Colors.surfaceSecondary, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, alignItems: "center" },
  statLabel: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
  statValue: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 13, marginTop: 4, textAlign: "center" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, backgroundColor: Colors.brandSecondary, paddingVertical: Spacing.lg, borderRadius: Radius.pill },
  ctaText: { color: Colors.onBrandSecondary, fontFamily: Fonts.textBold, fontSize: 14 },
});
