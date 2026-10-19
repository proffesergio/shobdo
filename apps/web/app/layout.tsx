import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "শব্দ — Shobdo", description: "বাংলা নির্মাতাদের জন্য Bhasha Labs-এর শব্দ।" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="bn"><body>{children}</body></html>;
}
