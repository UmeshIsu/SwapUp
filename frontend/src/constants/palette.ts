// ─────────────────────────────────────────────────────────────────────────────
// palette.ts — THE single source of truth for SwapUp brand colors.
//
// Every other colour system derives from this:
//   • constants/theme.ts  (Colors[light|dark])  imports `palette`
//   • constants/colors.ts (useColors)           imports `palette`
//   • screens/components   import `palette` directly instead of hardcoding hex
//
// Change the brand colour here and it updates everywhere.
// ─────────────────────────────────────────────────────────────────────────────

export const palette = {
    /** Brand blue — used for primary buttons, links, active states. */
    primary: '#2563EB',
    /** Brand blue for dark mode. */
    primaryDarkScheme: '#4A9EE5',
};

/** Convenience alias for the most-used token. */
export const PRIMARY = palette.primary;
