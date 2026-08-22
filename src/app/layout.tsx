import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dayflow — Employee Management System",
  description:
    "Modern HR management platform with profile, salary, and attendance management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col paper-bg">{children}</body>
    </html>
  );
}
