import type { Metadata, Viewport } from "next";
import { Special_Elite, Space_Mono } from "next/font/google";
import "./globals.css";

const chalk = Special_Elite({ variable: "--font-chalk", weight: "400", subsets: ["latin"] });
const mono = Space_Mono({ variable: "--font-mono", weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = { title: "Banca do Bairro", description: "Terminal de registro e apuração de pules." };
export const viewport: Viewport = { themeColor: "#102d25", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${chalk.variable} ${mono.variable}`}>{children}</body></html>;
}
