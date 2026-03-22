import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { useColors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

export default function Screen({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  const c = useColors();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <View style={[styles.container, center && styles.center]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: spacing.screenPad },
  center: { justifyContent: "center" },
});