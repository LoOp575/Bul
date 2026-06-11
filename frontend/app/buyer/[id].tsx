import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Colors, Spacing, Radius, Fonts, formatIDR } from "@/src/theme";
import { api, Buyer, Commodity } from "@/src/api";

export default function BuyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [b, coms] = await Promise.all([api.buyerDetail(id), api.commodities()]);
        setBuyer(b);
        setCommodities(coms);
      } catch (e: any) {
        setError(e.message || "Gagal memuat detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const callBuyer = () => {
    if (!buyer) return;
    const num = buyer.phone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${num}`).catch(() => {});
  };

  const emailBuyer = () => {
    if (!buyer) return;
    Linking.openURL(`mailto:${buyer.email}`).catch(() => {});
  };

  const whatsappBuyer = () => {
    if (!buyer) return;
    const num = buyer.phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    Linking.openURL(`https://wa.me/${num}`).catch(() => {});
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={Colors.brand} />
      </SafeAreaView>
    );
  }

  if (error || !buyer) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.muted} />
        <Text style={styles.errorText}>{error || "Pembeli tidak ditemukan"}</Text>
        <Pressable onPress={() => router.back()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Kembali</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const target = commodities.find((c) => c.id === buyer.target_commodity);

  return (
    <View style={styles.root}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.cover} testID="buyer-cover">
          <Image
            source={{ uri: buyer.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(26,43,34,0.20)", "rgba(26,43,34,0.95)"]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={["top"]} style={styles.coverHeader}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-button">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
          </SafeAreaView>
          <View style={styles.coverContent}>
            <View style={styles.coverNameRow}>
              <Text style={styles.coverName}>{buyer.name}</Text>
              {buyer.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.brand} />
                  <Text style={styles.verifiedText}>Terverifikasi</Text>
                </View>
              )}
            </View>
            <View style={styles.coverMetaRow}>
              <Ionicons name="business-outline" size={14} color="#fff" />
              <Text style={styles.coverMetaText}>{buyer.company_type}</Text>
              <Text style={styles.dotSep}>·</Text>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text style={styles.coverMetaText}>{buyer.location}, {buyer.province}</Text>
            </View>
          </View>
        </View>

        {/* Key info */}
        <View style={styles.section}>
          <View style={styles.keyRow}>
            <View style={styles.keyBox}>
              <Text style={styles.keyLabel}>KOMODITAS UTAMA</Text>
              <Text style={styles.keyValue}>{target?.name ?? buyer.target_commodity}</Text>
            </View>
            <View style={styles.keyBox}>
              <Text style={styles.keyLabel}>PENAWARAN</Text>
              <Text style={[styles.keyValue, { color: Colors.success }]}>{formatIDR(buyer.price_offer)}/kg</Text>
            </View>
          </View>
          <View style={styles.keyRow}>
            <View style={styles.keyBox}>
              <Text style={styles.keyLabel}>MIN. ORDER</Text>
              <Text style={styles.keyValue}>{buyer.min_quantity_kg} kg</Text>
            </View>
            <View style={styles.keyBox}>
              <Text style={styles.keyLabel}>STATUS</Text>
              <Text style={[styles.keyValue, { color: buyer.verified ? Colors.success : Colors.muted }]}>
                {buyer.verified ? "Terverifikasi" : "Belum Verifikasi"}
              </Text>
            </View>
          </View>
        </View>

        {/* Commodity tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kebutuhan Komoditas</Text>
          <View style={styles.tagsWrap} testID="buyer-commodities">
            {buyer.commodities.map((cid) => {
              const c = commodities.find((x) => x.id === cid);
              return (
                <View key={cid} style={styles.tag}>
                  <Text style={styles.tagText}>{c?.name ?? cid}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Catatan Pembeli</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>{buyer.notes}</Text>
          </View>
        </View>

        {/* Contact info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Informasi Kontak</Text>
          <Pressable style={styles.contactItem} onPress={callBuyer} testID="phone-link">
            <Ionicons name="call-outline" size={20} color={Colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Telepon</Text>
              <Text style={styles.contactValue}>{buyer.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </Pressable>
          <Pressable style={styles.contactItem} onPress={emailBuyer} testID="email-link">
            <Ionicons name="mail-outline" size={20} color={Colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{buyer.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.stickyBar}>
        <Pressable style={styles.whatsappBtn} onPress={whatsappBuyer} testID="contact-whatsapp">
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.whatsappBtnText}>Hubungi Pembeli</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingBottom: Spacing.xl },
  center: { flex: 1, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", gap: Spacing.md },
  errorText: { color: Colors.error, fontFamily: Fonts.textMedium, fontSize: 14, textAlign: "center", paddingHorizontal: Spacing.xl },
  retryBtn: { backgroundColor: Colors.brand, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radius.pill },
  retryBtnText: { color: Colors.onBrandPrimary, fontFamily: Fonts.textSemiBold, fontSize: 14 },
  cover: { height: 260, overflow: "hidden", justifyContent: "flex-end" },
  coverHeader: { position: "absolute", top: 0, left: 0, right: 0, padding: Spacing.md },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  coverContent: { padding: Spacing.xl, gap: 8 },
  coverNameRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flexWrap: "wrap" },
  coverName: { color: "#fff", fontFamily: Fonts.display, fontSize: 26, flexShrink: 1 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.brandTertiary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  verifiedText: { color: Colors.brand, fontFamily: Fonts.textBold, fontSize: 10, letterSpacing: 0.5 },
  coverMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  coverMetaText: { color: "rgba(255,255,255,0.9)", fontFamily: Fonts.text, fontSize: 13 },
  dotSep: { color: "rgba(255,255,255,0.6)", marginHorizontal: 4 },
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  sectionLabel: { color: Colors.muted, fontFamily: Fonts.textBold, fontSize: 11, letterSpacing: 1, marginBottom: Spacing.md, textTransform: "uppercase" },
  keyRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.md },
  keyBox: { flex: 1, backgroundColor: Colors.surfaceSecondary, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border },
  keyLabel: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 10, letterSpacing: 1 },
  keyValue: { color: Colors.onSurface, fontFamily: Fonts.textBold, fontSize: 15, marginTop: 4 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  tag: { backgroundColor: Colors.brandTertiary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  tagText: { color: Colors.brand, fontFamily: Fonts.textSemiBold, fontSize: 12 },
  notesBox: { backgroundColor: Colors.surfaceSecondary, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border },
  notesText: { color: Colors.onSurface, fontFamily: Fonts.text, fontSize: 14, lineHeight: 22 },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  contactLabel: { color: Colors.muted, fontFamily: Fonts.textSemiBold, fontSize: 11, letterSpacing: 1 },
  contactValue: { color: Colors.onSurface, fontFamily: Fonts.textSemiBold, fontSize: 14, marginTop: 2 },
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#25D366",
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
  },
  whatsappBtnText: { color: "#fff", fontFamily: Fonts.textBold, fontSize: 15 },
});
