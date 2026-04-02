import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { persistor, store } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { CurrencyProvider } from "@/context/CurrencyContext";
import AppProvider from "@/context/AppProvider";
import Head from "next/head";
import StoreProvider from "@/context/storeProvider";
import ScrollToTop from "@/components/custom/ScrollToTop";
import UnauthorizedDialog from "@/components/dialog/UnauthorizedDialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LivrerNourriture - Livraison de repas à domicile",
  description: "Commandez et faites-vous livrer rapidement des repas délicieux chez vous grâce à LivrerNourriture.",
  keywords: "livraison, repas, nourriture, commande, restaurant, domicile, fast food, livraison de repas, Cameroun, livrernourriture",
  openGraph: {
    title: "LivrerNourriture - Livraison de repas à domicile",
    description: "Découvrez la plateforme de référence pour commander et recevoir vos plats préférés partout au Cameroun.",
    url: "https://livrernourriture-fibem.com/",
    type: "website",
    images: ["https://livrernourriture-fibem.com/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LivrerNourriture - Livraison de repas à domicile",
    description: "Commandez vos repas favoris et faites-vous livrer rapidement chez vous avec LivrerNourriture.",
    images: ["https://livrernourriture-fibem.com/og-image.jpg"],
  },
  authors: [{ name: "LivrerNourriture" }],
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Head>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:image" content={metadata.openGraph.images[0]} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content={metadata.title} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content={metadata.twitter.card} />
      </Head>
      <body className="flex flex-col min-h-full">
        <LanguageProvider>
          <CurrencyProvider>
            <AppProvider>
              <TooltipProvider>
                <StoreProvider>
                  <ScrollToTop />
                  <UnauthorizedDialog />
                  {children}
                </StoreProvider>
              </TooltipProvider>
            </AppProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
