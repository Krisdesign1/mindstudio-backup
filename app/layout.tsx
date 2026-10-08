import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "MindStudio Video — Votre prochain grand récit",
  description:
    "Studio de création vidéo assistée par IA. Phase 1, démonstration locale.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
