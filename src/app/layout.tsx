import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartBlood — MVP симулятор",
  description:
    "Портативный анализатор крови SmartBlood: пользовательский путь от измерения до ИИ-рекомендаций. Прототип для инвесторов и врачей.",
};

export const viewport: Viewport = {
  themeColor: "#0A2540",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
