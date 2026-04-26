import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

const APP_URL = "https://yunju-fridge-dtv0805-pixels-projects.vercel.app";

export const metadata: Metadata = {
  title: "윤주의 냉장고를 부탁해",
  description: "냉장고 속 재료로 만들 수 있는 요리를 추천해드려요",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "윤주의 냉장고를 부탁해",
    description: "냉장고 속 재료로 만들 수 있는 요리를 추천해드려요",
    url: APP_URL,
    siteName: "윤주의 냉장고를 부탁해",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "윤주의 냉장고를 부탁해",
    description: "냉장고 속 재료로 만들 수 있는 요리를 추천해드려요",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
