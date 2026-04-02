import { useState } from "react";
import { translations } from "@/i18n/translations";
import { LanguageContext } from "@/context/LanguageContext";

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("fr");
  const [flag, setFlag] = useState("FR");

  const changeLanguage = (lang, reactFlag = null) => {
    if (translations[lang]) {
      setLanguage(lang);
      if (reactFlag) setFlag(reactFlag);
    }
  };

  const t = (key, default_value = "") => {
    const value = default_value.trim() === "" ? key : default_value;
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
