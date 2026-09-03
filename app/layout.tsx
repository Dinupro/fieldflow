import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://fieldflow.vercel.app"),
  title: {
    default: "FieldFlow | Enterprise Field Service Management & Technician Dispatch Platform",
    template: "%s | FieldFlow",
  },
  description:
    "Deploy certified field service technicians on demand. Streamline dispatching, real-time SLA tracking, automated billing, customer management, and work order scheduling.",
  keywords: [
    "Field Service Management",
    "Workforce Dispatch",
    "Field Technicians",
    "SLA Tracking",
    "Work Order Management",
    "SaaS FSM",
    "Next.js SaaS",
    "Prisma ORM",
    "Neon PostgreSQL",
  ],
  authors: [{ name: "FieldFlow Engineering" }],
  creator: "FieldFlow Platform",
  publisher: "FieldFlow Inc.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fieldflow.vercel.app",
    siteName: "FieldFlow",
    title: "FieldFlow | Enterprise Field Service Management & Dispatch Platform",
    description:
      "Modern field service dispatch platform with real-time workforce capacity, automated SLA tracking, and audit-ready StatusLog timelines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FieldFlow | Enterprise Field Service Management",
    description:
      "Deploy certified field service technicians on demand with sub-second dispatching and real-time SLA monitoring.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
