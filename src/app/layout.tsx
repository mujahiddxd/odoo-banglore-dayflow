import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DayFlow — Human Resource Management System",
  description: "Every workday, perfectly aligned. Digitize and streamline core HR operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen paper-bg">
        {children}
      </body>
    </html>
  );
}
