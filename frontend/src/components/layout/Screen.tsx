import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "../../constants/colors";

// Body wrapper for analysis screens. The page header (ScreenHeader, via
// HeaderSimple) is rendered as a full-width child and owns the top safe area,
// so this wrapper no longer adds padding or a (platform-limited) SafeAreaView.
export default function Screen({
  children,
  center,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  const c = useColors();
  return (
    <View style={[styles.safe, { backgroundColor: c.bg }, center && styles.center]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { justifyContent: "center" },
});
