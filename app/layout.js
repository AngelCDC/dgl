import SessionProvider from "./SessionProvider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const dynamic = "force-dynamic";

export const metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "https://www.grupodubois.com"
  ),
  title: "DUBOIS — Global Trade Intelligence",
  description:
    "Inteligencia de comercio internacional para empresas latinoamericanas",
  openGraph: {
    title: "DUBOIS — Global Trade Intelligence",
    description:
      "Inteligencia de comercio internacional para empresas latinoamericanas",
    siteName: "DUBOIS — Global Trade Intelligence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DUBOIS — Global Trade Intelligence",
    description:
      "Inteligencia de comercio internacional para empresas latinoamericanas",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
