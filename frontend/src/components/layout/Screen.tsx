import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

export default function Screen({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, center && styles.center]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.screenPad },
  center: { justifyContent: "center" },
});