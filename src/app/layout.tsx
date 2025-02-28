import "./globals.css";
import { Cairo } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/theme-provider";
import CssClass from "@/components/my/css-class";

const cairo = Cairo({
  subsets: ['latin'], // Sous-ensembles pour les caractères spécifiques
  weight: ['400', '700'], // Ajouter les épaisseurs nécessaires (normal, bold)
});
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`
          ${cairo.className}
          antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <CssClass />
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <div><Toaster /></div>
      </body>
    </html>
  );
}
