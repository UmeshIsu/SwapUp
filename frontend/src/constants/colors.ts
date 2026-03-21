import { useColorScheme } from "../hooks/use-color-scheme";

export const colors = {
    primary: "#1E66FF",
    white: "#FFFFFF",
    bg: "#F6F7FB",
    text: "#111827",
    muted: "#6B7280",
    border: "#E5E7EB",
    soft: "#EEF4FF",
    success: "#16A34A",
    danger: "#EF4444",
    warning: "#F59E0B",
    dark: "#111827",
    secondary: "#6B7280",
    black: "#000000",
    // Dark-specific extras (not used in light but needed for type compat)
    cardBg: "#FFFFFF",
    iconCircleBg: "#FEF3C7",
    iconCircleDangerBg: "#FEE2E2",
    segmentBg: "#E9ECEF",
    segmentActiveBg: "#FFFFFF",
};

export const darkColors: typeof colors = {
    primary: "#4A9EE5",
    white: "#1A1A1A",
    bg: "#121212",
    text: "#ECEDEE",
    muted: "#9BA1A6",
    border: "#2C2C2C",
    soft: "#1A2332",
    success: "#34D399",
    danger: "#F87171",
    warning: "#FBBF24",
    dark: "#ECEDEE",
    secondary: "#9BA1A6",
    black: "#000000",
    cardBg: "#1E1E1E",
    iconCircleBg: "#2A2520",
    iconCircleDangerBg: "#2A1A1A",
    segmentBg: "#2C2C2C",
    segmentActiveBg: "#3A3A3A",
};

export function useColors() {
    const scheme = useColorScheme();
    return scheme === "dark" ? darkColors : colors;
}