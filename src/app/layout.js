import { Onest } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
