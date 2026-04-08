import { useState, useRef, useEffect } from "react";
import {
  DollarSign,
  Euro,
  PoundSterling,
  JapaneseYenIcon,
  ChevronDown,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import ReactCountryFlag from "react-country-flag";

export const availableCurrencies = [
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    countryCode: "FR",
    icon: <Euro className="w-4 h-4" />,
    locale: "fr-FR",
  },
  {
    code: "USD",
    name: "Dollar US",
    symbol: "$",
    countryCode: "US",
    icon: <DollarSign className="w-4 h-4" />,
    locale: "en-US",
  },
  {
    code: "GBP",
    name: "Livre Sterling",
    symbol: "£",
    countryCode: "GB",
    icon: <PoundSterling className="w-4 h-4" />,
    locale: "en-GB",
  },
  {
    code: "CAD",
    name: "Dollar Canadien",
    symbol: "$",
    countryCode: "CA",
    icon: <DollarSign className="w-4 h-4" />,
    locale: "en-CA",
  },
  {
    code: "XOF",
    name: "Franc CFA",
    symbol: "CFA",
    countryCode: "SN",
    icon: <span className="cs-icon-text">F</span>,
    locale: "fr-SN",
  },
  {
    code: "JPY",
    name: "Yen Japonais",
    symbol: "¥",
    countryCode: "JP",
    icon: <JapaneseYenIcon className="w-4 h-4" />,
    locale: "ja-JP",
  },
  {
    code: "CHF",
    name: "Franc Suisse",
    symbol: "CHF",
    countryCode: "CH",
    icon: <span className="cs-icon-text">Fr</span>,
    locale: "fr-CH",
  },
  {
    code: "AUD",
    name: "Dollar Australien",
    symbol: "$",
    countryCode: "AU",
    icon: <DollarSign className="w-4 h-4" />,
    locale: "en-AU",
  },
  {
    code: "CNY",
    name: "Yuan Chinois",
    symbol: "¥",
    countryCode: "CN",
    icon: <span className="cs-icon-text">¥</span>,
    locale: "zh-CN",
  },
  {
    code: "INR",
    name: "Roupie Indienne",
    symbol: "₹",
    countryCode: "IN",
    icon: <span className="cs-icon-text">₹</span>,
    locale: "en-IN",
  },
  {
    code: "BRL",
    name: "Réal Brésilien",
    symbol: "R$",
    countryCode: "BR",
    icon: <span className="cs-icon-text">R$</span>,
    locale: "pt-BR",
  },
];

const CurrencySelector = () => {
  const { currency, changeCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentCurrency =
    availableCurrencies.find((c) => c.code === currency) ||
    availableCurrencies[0];

  const handleCurrencyChange = (code) => {
    changeCurrency(code);
    localStorage.setItem("preferredCurrency", code);
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
        .cs-wrapper {
          position: relative;
          display: inline-block;
          font-family: inherit;
        }

        .cs-trigger {
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
        .cs-trigger:hover {
          background: rgba(255,255,255,0.08);
        }

        .cs-trigger-inner {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cs-code {
          display: none;
          font-size: 0.75rem;
          font-weight: 500;
        }
        @media (min-width: 768px) {
          .cs-code { display: block; }
        }
        @media (min-width: 1024px) {
          .cs-code { font-size: 0.875rem; }
        }

        .cs-chevron {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .cs-chevron.open {
          transform: rotate(180deg);
        }

        .cs-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 224px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 1600;
          overflow: hidden;
          animation: cs-fadeIn 0.15s ease;
        }

        @keyframes cs-fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cs-label {
          padding: 10px 12px 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
        }

        .cs-separator {
          height: 1px;
          background: #f3f4f6;
          margin: 2px 0;
        }

        .cs-list {
          max-height: 280px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }

        .cs-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          cursor: pointer;
          transition: background 0.12s ease;
        }
        .cs-item:hover {
          background: #f9fafb;
        }
        .cs-item.active {
          background: #f0f4ff;
        }

        .cs-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cs-item-names {
          display: flex;
          flex-direction: column;
        }

        .cs-item-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: #111827;
          line-height: 1.2;
        }

        .cs-item-meta {
          font-size: 0.7rem;
          color: #9ca3af;
          margin-top: 1px;
        }

        .cs-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4f46e5;
          flex-shrink: 0;
        }

        .cs-icon-text {
          font-size: 0.65rem;
          font-weight: 700;
        }
      `}</style>

      <div className="cs-wrapper" ref={ref}>
        <button
          className="cs-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <div className="text-white cs-trigger-inner">
            {currentCurrency.icon}
            <span className="cs-code">{currentCurrency.code}</span>
          </div>
          <ChevronDown className={`cs-chevron${open ? " open" : ""}`} />
        </button>

        {open && (
          <div className="cs-dropdown" role="listbox">
            <div className="cs-label">Sélectionnez une devise</div>
            <div className="cs-separator" />
            <div className="cs-list">
              {availableCurrencies.map((c) => (
                <div
                  key={c.code}
                  role="option"
                  aria-selected={c.code === currency}
                  className={`cs-item${c.code === currency ? " active" : ""}`}
                  onClick={() => handleCurrencyChange(c.code)}
                >
                  <div className="cs-item-left">
                    <ReactCountryFlag svg countryCode={c.countryCode} style={{ width: 18, height: 18, borderRadius: 2 }} />
                    <div className="cs-item-names">
                      <span className="cs-item-name">{c.name}</span>
                      <span className="cs-item-meta">{c.code} · {c.symbol}</span>
                    </div>
                  </div>
                  {c.code === currency && <div className="cs-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CurrencySelector;