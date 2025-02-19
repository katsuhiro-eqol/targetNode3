import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Target App",
  description: "created by Target/Global",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
