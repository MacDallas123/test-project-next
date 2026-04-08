"use client";

import { availableCurrencies } from "@/components/custom/CurrencySelector";
import React, { createContext, useContext, useState, useEffect } from "react";
import currencyRates from "@/assets/currency.json";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("EUR");

  useEffect(() => {
    // Récupérer la devise depuis localStorage au démarrage
    const savedCurrency = localStorage.getItem("preferredCurrency");
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    // Optionnel: Détecter la devise géographique
    // const userLocale = navigator.language;
    // if (userLocale.includes('en-US') || userLocale.includes('en-CA')) {
    //   setCurrency('USD');
    // } else if (userLocale.includes('en-GB')) {
    //   setCurrency('GBP');
    // }
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem("preferredCurrency", newCurrency);

    // Optionnel: Émettre un événement pour notifier d'autres composants
    window.dispatchEvent(new Event("currencyChanged"));
  };

  /**
   * Convertit un prix donné (supposé en EUR) dans la devise courante.
   * @param {number} price - Le montant à convertir (par défaut EUR).
   * @param {string} fromCurrency - La devise source (défaut 'EUR').
   * @param {string} toCurrency - La devise cible (défaut: currency courant dans le contexte).
   * @returns {number} - Le montant converti.
   */
  const convertPrice = (price, fromCurrency = "EUR", toCurrency = currency) => {
    if (fromCurrency === toCurrency) return price;

    // On s'appuie sur le fichier JSON des taux.
    const rate = currencyRates.rates[fromCurrency]?.[toCurrency];
    if (!rate) return price; // si on ne trouve pas le taux, on retourne le prix d'origine

    return price * rate;
  };

  /**
   * Affiche un prix converti dans la devise sélectionnée, avec une mise en forme locale et le symbole correct.
   * Par défaut, le prix est supposé en EUR et converti automatiquement vers la devise sélectionnée.
   */
  const formatPrice = (price, options = {}) => {
    const toCurrency = currency;
    const currentCurrency = availableCurrencies.find(c => c.code === toCurrency);

    // Conversion auto EUR -> devise sélectionnée
    const convertedPrice = convertPrice(price, "EUR", toCurrency);

    if (!currentCurrency) return `${convertedPrice} ${toCurrency}`;

    const formatter = new Intl.NumberFormat(currentCurrency.locale, {
      style: "currency",
      currency: toCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    });

    return formatter.format(convertedPrice);
  };

  /**
   * Formatte un prix déjà dans la devise cible donnée, utile si besoin spécifique
   */
  const formatPriceFrom = (price, fromCurrency = "EUR", options = {}) => {
    const toCurrency = currency;
    const currentCurrency = availableCurrencies.find(c => c.code === toCurrency);

    const convertedPrice = convertPrice(price, fromCurrency, toCurrency);

    if (!currentCurrency) return `${convertedPrice} ${toCurrency}`;

    const formatter = new Intl.NumberFormat(currentCurrency.locale, {
      style: "currency",
      currency: toCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    });

    return formatter.format(convertedPrice);
  };

  /**
   * Formatte un prix converti dans la devise sélectionnée, sans ajouter le symbole/unité.
   * Le prix est supposé en EUR, converti vers la devise sélectionnée, et formaté avec les fractions décimales locales.
   */
  const formatNumberPrice = (price, fromCurrency = "EUR", options = {}) => {
    const toCurrency = currency;
    const currentCurrency = availableCurrencies.find(c => c.code === toCurrency);

    const convertedPrice = convertPrice(price, fromCurrency, toCurrency);

    if (!currentCurrency) return convertedPrice;

    const formatter = new Intl.NumberFormat(currentCurrency.locale, {
      style: undefined, // Pas d'unité, pas de symbole
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    });

    const result = formatter.format(convertedPrice);
    // On retire tous les symboles/unités éventuels en ne passant pas style: 'currency'
    return result;
  };

  /**
   * Prend un montant numérique et retourne une chaîne où le montant est précédé/suivi du symbole de la devise courante.
   * Ex: 123.45 -> "123,45 €" ou "$123.45" selon la devise courante et son positionnement.
   */
  const amountWithSymbol = (amount) => {
    const currentCurrency = availableCurrencies.find(c => c.code === currency);
    if (!currentCurrency) return `${amount} ${currency}`;
    // Utilise le locale pour positionner correctement le symbole
    const formatter = new Intl.NumberFormat(currentCurrency.locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const value = {
    currency,
    changeCurrency,
    formatPrice,           // price supp. en EUR → converti et affiché dans la devise courante
    convertPrice,          // pour faire des conversions spécifiques manuelles si besoin
    formatPriceFrom,  
    formatNumberPrice,     // pour formater à partir d'une autre devise de base
    amountWithSymbol,
    symbol: availableCurrencies.find(c => c.code === currency)?.symbol || "€",
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
