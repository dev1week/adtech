import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Adtech Test Server",
  description: "Coupon test API and dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
