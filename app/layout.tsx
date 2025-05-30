import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIcon",
  description: "created by Target/Global",
  icons: {
    icon: '/icons8-ai-48.png', 
  },
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
