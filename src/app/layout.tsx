import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Odoo — Human Resource Management System",
  description:
    "Every workday, perfectly aligned. Digitize and streamline core HR operations, profiles, attendance, and salary management.",
};

import GlobalLoader from "@/components/GlobalLoader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col paper-bg">
        <GlobalLoader />
        {children}
      </body>
    </html>
  );
}
