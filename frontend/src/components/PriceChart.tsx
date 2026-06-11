import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline, Circle, Line, Defs, LinearGradient as SvgGradient, Stop, Polygon } from "react-native-svg";
import { Colors, Fonts } from "@/src/theme";

type Point = { date: string; price: number };

export default function PriceChart({ data, height = 180, width }: { data: Point[]; height?: number; width: number }) {
  if (!data.length) return null;
  const padding = { top: 16, right: 16, bottom: 24, left: 8 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * w;
    const y = padding.top + (1 - (d.price - min) / range) * h;
    return { x, y, ...d };
  });

  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaStr =
    `${padding.left},${padding.top + h} ` +
    pointsStr +
    ` ${points[points.length - 1].x},${padding.top + h}`;

  // Y-axis grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => padding.top + t * h);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.brand} stopOpacity="0.25" />
            <Stop offset="1" stopColor={Colors.brand} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        {gridLines.map((y, i) => (
          <Line
            key={i}
            x1={padding.left}
            x2={padding.left + w}
            y1={y}
            y2={y}
            stroke={Colors.divider}
            strokeDasharray="3,4"
            strokeWidth={0.5}
          />
        ))}
        <Polygon points={areaStr} fill="url(#areaGrad)" />
        <Polyline points={pointsStr} fill="none" stroke={Colors.brand} strokeWidth={2.5} strokeLinejoin="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={Colors.surfaceSecondary} stroke={Colors.brand} strokeWidth={2} />
        ))}
      </Svg>
      <View style={styles.xLabels}>
        {points.map((p, i) => {
          // show every other label to avoid crowding
          if (i % 2 !== 0 && i !== points.length - 1) return <View key={i} style={{ flex: 1 }} />;
          const d = new Date(p.date);
          const label = `${d.getDate()}/${d.getMonth() + 1}`;
          return (
            <Text key={i} style={styles.xLabel}>
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  xLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, marginTop: -8 },
  xLabel: { flex: 1, textAlign: "center", color: Colors.muted, fontFamily: Fonts.text, fontSize: 10 },
});
