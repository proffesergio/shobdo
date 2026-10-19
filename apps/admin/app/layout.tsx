import type { ReactNode } from "react";
export const metadata = { title: "Shobdo Admin", robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body style={{ margin: 0, background: "#f6f3e9", color: "#153c34", fontFamily: "system-ui", lineHeight: 1.7 }}>{children}</body></html>;
}
