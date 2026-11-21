import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToranjaMotionProvider } from "@/components/MotionPrimitives";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1E1208",
  colorScheme: "dark",
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Toranja Overlay — Seu chat sobre o jogo em 1 monitor",
  description:
    "Acompanhe o chat do Social Stream Ninja diretamente sobre o jogo em 1 monitor no Windows 10/11. Overlay transparente com efeito espelho, click-through, atalhos globais e 100% local.",
  applicationName: SITE.name,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Toranja Overlay — Seu chat sobre o jogo em 1 monitor",
    description:
      "Overlay transparente com efeito espelho e click-through para streamers no Windows que jogam em 1 único monitor usando o Social Stream Ninja.",
    locale: "pt_BR",
    type: "website",
    siteName: SITE.name,
    images: [
      {
        url: "/icon.png",
        width: 128,
        height: 128,
        alt: "Logotipo do Toranja Overlay",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Toranja Overlay — Seu chat sobre o jogo em 1 monitor",
    description:
      "Overlay transparente com click-through para ler o chat do Social Stream Ninja sobre o jogo em 1 monitor no Windows.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn(inter.variable, jetbrainsMono.variable)}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-[#1E1208] text-[#EEDFD0] antialiased selection:bg-[#F38A0F] selection:text-[#1E1208]">
        <ToranjaMotionProvider>{children}</ToranjaMotionProvider>
      </body>
    </html>
  );
}
