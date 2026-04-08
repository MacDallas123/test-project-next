import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { availableLanguages } from "@/i18n/translations";
import { useLanguage } from "@/context/LanguageContext";
import ReactCountryFlag from "react-country-flag";

const LanguageSelector = () => {
  const { language, flag, changeLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang =
    availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  const handleChange = (lang) => {
    changeLanguage(lang.code, lang.reactFlag);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .ls-wrapper {
          position: relative;
          display: inline-block;
          font-family: inherit;
        }

        .ls-trigger {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: inherit;
          transition: background 0.15s ease;
        }
        .ls-trigger:hover {
          background: rgba(255,255,255,0.08);
        }

        .ls-trigger-inner {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ls-code {
          display: none;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        @media (min-width: 768px) {
          .ls-code { display: block; }
        }
        @media (min-width: 1024px) {
          .ls-code { font-size: 0.875rem; }
        }

        .ls-chevron {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .ls-chevron.open {
          transform: rotate(180deg);
        }

        .ls-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 180px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 1600;
          overflow: hidden;
          animation: ls-fadeIn 0.15s ease;
        }

        @keyframes ls-fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ls-label {
          padding: 10px 12px 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
        }

        .ls-separator {
          height: 1px;
          background: #f3f4f6;
          margin: 2px 0;
        }

        .ls-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          color: #111827;
          transition: background 0.12s ease;
        }
        .ls-item:hover {
          background: #f9fafb;
        }
        .ls-item.active {
          background: #f0f4ff;
          color: #4f46e5;
        }

        .ls-item-name {
          flex: 1;
        }

        .ls-active-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4f46e5;
          flex-shrink: 0;
        }
      `}</style>

      <div className="ls-wrapper" ref={ref}>
        <button
          className="ls-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <div className="text-white ls-trigger-inner">
            <ReactCountryFlag
              svg
              countryCode={flag || currentLang?.reactFlag}
              style={{ width: 18, height: 18, borderRadius: 2 }}
            />
            <span className="ls-code">{language}</span>
          </div>
          <ChevronDown className={`ls-chevron${open ? " open" : ""}`} />
        </button>

        {open && (
          <div className="ls-dropdown" role="listbox">
            <div className="ls-label">
              {t("language_choice", "Choix du language")}
            </div>
            <div className="ls-separator" />
            {availableLanguages.map((lang, index) => (
              <div
                key={index}
                role="option"
                aria-selected={lang.code === language}
                className={`ls-item${lang.code === language ? " active" : ""}`}
                onClick={() => handleChange(lang)}
              >
                <ReactCountryFlag
                  svg
                  countryCode={lang.reactFlag}
                  style={{ width: 18, height: 18, borderRadius: 2 }}
                />
                <span className="ls-item-name">{lang.name}</span>
                {lang.code === language && <div className="ls-active-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LanguageSelector;