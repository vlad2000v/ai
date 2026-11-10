import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeniusPorn — Creative AI Studio",
  description: "AI art studio for fictional adult characters and visual novels."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
