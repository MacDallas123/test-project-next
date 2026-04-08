"use client";

import { useState, useEffect } from "react";
import { translations } from "@/i18n/translations";
import { LanguageContext } from "@/context/LanguageContext";

// Like CurrencyContext, persist and retrieve language from localStorage
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("fr");
  const [flag, setFlag] = useState("FR");

  useEffect(() => {
    const html = document.documentElement;
  
    if (language === "ar") {
      html.setAttribute("dir", "rtl");
      html.setAttribute("lang", "ar");
    } else {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", "fr");
    }
  }, [language]);
  
  // On mount, check localStorage for saved language/flag
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    const savedFlag = localStorage.getItem("preferredFlag");
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
    if (savedFlag) {
      setFlag(savedFlag);
    }
    // Optionally, could use browser language detection as fallback
    // const userLocale = navigator.language?.slice(0, 2);
    // if (!savedLanguage && translations[userLocale]) setLanguage(userLocale);
  }, []);

  // Make changeLanguage persist language/flag to localStorage
  const changeLanguage = (lang, reactFlag = null) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem("preferredLanguage", lang);
      if (reactFlag) {
        setFlag(reactFlag);
        localStorage.setItem("preferredFlag", reactFlag);
      }
    }
  };

  const t = (key, default_value = "", params = {}) => {
    // Check for array default_value
    let value;
    if (Array.isArray(default_value)) {
      value = default_value;
    } else if (typeof default_value === "string") {
      value = default_value?.trim() === "" ? key : default_value;
    } else {
      value = key;
    }

    const keys = key.split(".");
    let result = translations[language];
    for (let k of keys) {
      if (result && Object.prototype.hasOwnProperty.call(result, k)) {
        result = result[k];
      } else {
        return value;
      }
    }
    if (typeof result === "string" && result.trim() !== "") {
      return result;
    }
    // Also return if found result is an array
    if (Array.isArray(result) && result.length > 0) {
      return result;
    }
    return value;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        flag,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
