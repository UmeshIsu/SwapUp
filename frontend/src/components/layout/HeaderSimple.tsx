import React from "react";
import ScreenHeader from "@/src/components/ScreenHeader";

// Thin wrapper kept for backwards compatibility — delegates to the shared
// ScreenHeader so analysis sub-screens get the exact same header as the rest
// of the app (safe-area aware, centered bold title, visible blue back button).
export default function HeaderSimple({ title }: { title: string }) {
  return <ScreenHeader title={title} />;
}
