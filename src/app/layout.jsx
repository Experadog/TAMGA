import { Onest } from "next/font/google";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";

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
      <body className={onest.variable}>
        <Header />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
