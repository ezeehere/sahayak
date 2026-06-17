import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const languages = [
  { code: "en", short: "EN", label: "English" },
  { code: "hi", short: "हिं", label: "हिंदी" },
  { code: "bn", short: "বাং", label: "বাংলা" },
  { code: "as", short: "অসম", label: "অসমীয়া" },
];

function LanguageToggle({ compact = false }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const currentLanguage =
    languages.find((item) => item.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function changeLanguage(code) {
    setLanguage(code);
    setOpen(false);
  }

  return (
    <div
      className={compact ? "language-switcher compact" : "language-switcher"}
      ref={menuRef}
    >
      <button
        type="button"
        className={open ? "language-toggle active" : "language-toggle"}
        onClick={() => setOpen(!open)}
      >
        <Globe2 size={18} strokeWidth={2.5} />

        <span>{compact ? currentLanguage.short : currentLanguage.label}</span>

        <ChevronDown
          size={16}
          strokeWidth={2.8}
          className={open ? "chevron-icon rotate" : "chevron-icon"}
        />
      </button>

      {open && (
        <div className="language-menu">
          {languages.map((item) => (
            <button
              type="button"
              key={item.code}
              className={
                item.code === language
                  ? "language-option selected"
                  : "language-option"
              }
              onClick={() => changeLanguage(item.code)}
            >
              <span className="language-short">{item.short}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageToggle;