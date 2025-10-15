import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIコンシェルジュ",
  description: "日本語でデータ登録するだけで多言語対応可能な質問対応サービス。事業主自らが簡単にデータ追加や更新できる柔軟性が特徴。登録した情報だけでなくインターネット情報も参照可能。開発・運営は株式会社eQOL。",
  keywords:"AI,インバウンド,inbound,コンシェルジュ,低価格,簡単,ホテル,イベント,ショップ,公共施設,役所,案内,質問応答,STT,TTS,多言語",
  icons: {
    icon: '/icons8-ai-48.png', 
  },
  openGraph: {
    title: 'AIコンシェルジュ',
    description: '日本語のQAデータをCSVファイルで登録するだけで、多言語対応の高性能なAIコンシェルジュが構築できます',
    images: ['/icons8-ai-48.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maxminScale: 1,
  userScalable: 'no'
}

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
