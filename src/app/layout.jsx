import { Onest } from "next/font/google";
import { Header } from "@/components/layouts/Header";

import "../assets/styles/main.scss";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

export const metadata = {
  title: "KG Map",
  description: "Каталог географических названий Кыргызской Республики",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${onest.variable} container`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
