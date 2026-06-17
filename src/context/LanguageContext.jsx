import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext();

function makeReadableKey(key) {
  if (!key) return "";

  return key
    .replace(/Desc$/, " description")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("sahayak_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("sahayak_language", language);
    document.documentElement.lang = language;
  }, [language]);

  function t(key) {
    return translations[language]?.[key] || translations.en?.[key] || makeReadableKey(key);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}