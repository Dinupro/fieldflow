import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldFlow - Modern Field Service Management & Technician Dispatch Platform",
  description:
    "Deploy certified, background-checked field service technicians on demand. Streamline dispatching, real-time GPS tracking, automated billing, and work order management.",
  keywords: [
    "Field Service Management",
    "Field Technicians",
    "On-Demand Technicians",
    "Work Order Dispatch",
    "SaaS FSM",
    "Field Service Automation",
  ],
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
