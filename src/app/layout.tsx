import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
<<<<<<< HEAD
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
=======
  title: "DayFlow — Human Resource Management System",
  description: "Every workday, perfectly aligned. Digitize and streamline core HR operations.",
};

export default function RootLayout({children}: {children: React.ReactNode }) {
  return (
      <html lang="en">
        <body className="min-h-screen paper-bg">
          {children}
        </body>
>>>>>>> origin/main
      </html>
      );
}
