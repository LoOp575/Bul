// Theme tokens derived from /app/design_guidelines.json
export const Colors = {
  surface: "#FAFAF8",
  onSurface: "#1A2B22",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#1A2B22",
  surfaceTertiary: "#F1F1EB",
  onSurfaceTertiary: "#2E5A36",
  surfaceInverse: "#1A2B22",
  onSurfaceInverse: "#FAFAF8",
  brand: "#2E5A36",
  brandPrimary: "#2E5A36",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#D87F55",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#E7F0E8",
  onBrandTertiary: "#2E5A36",
  success: "#267A43",
  onSuccess: "#FFFFFF",
  warning: "#E8A33A",
  onWarning: "#FFFFFF",
  error: "#BA3B3B",
  onError: "#FFFFFF",
  info: "#4A6E55",
  onInfo: "#FFFFFF",
  border: "#E5E5DF",
  borderStrong: "#C8C8C0",
  divider: "#E5E5DF",
  muted: "#7A857F",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const Fonts = {
  display: "Lora_600SemiBold",
  displayRegular: "Lora_400Regular",
  text: "PlusJakartaSans_400Regular",
  textMedium: "PlusJakartaSans_500Medium",
  textSemiBold: "PlusJakartaSans_600SemiBold",
  textBold: "PlusJakartaSans_700Bold",
};

export const formatIDR = (value: number) => {
  return "Rp " + value.toLocaleString("id-ID");
};

export const formatPct = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};
