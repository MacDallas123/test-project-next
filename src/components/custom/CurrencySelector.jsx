import {
  DollarSign,
  Euro,
  PoundSterling,
  Bitcoin,
  JapaneseYenIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/context/CurrencyContext"; // Vous devrez créer ce contexte
import ReactCountryFlag from "react-country-flag";

// Liste des devises disponibles
export const availableCurrencies = [
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    countryCode: "FR", // France (Eurozone)
    flag: "🇪🇺",
    icon: <Euro className="w-4 h-4" />,
    locale: "fr-FR",
  },
  {
    code: "USD",
    name: "Dollar US",
    symbol: "$",
    countryCode: "US",
    flag: "🇺🇸",
    icon: <DollarSign className="w-4 h-4" />,
    locale: "en-US",
  },
  {
    code: "GBP",
    name: "Livre Sterling",
    symbol: "£",
    countryCode: "GB",
    flag: "🇬🇧",
    icon: <PoundSterling className="w-4 h-4" />,
    locale: "en-GB",
  },
  {
    code: "CAD",
    name: "Dollar Canadien",
    symbol: "$",
    countryCode: "CA",
    flag: "🇨🇦",
    icon: <DollarSign className="w-4 h-4" />,
    locale: "en-CA",
  },
  {
    code: "XOF",
    name: "Franc CFA",
    symbol: "CFA",
    countryCode: "SN", // Senegal (WAEMU)
    flag: "🇨🇫",
    icon: <span className="text-xs font-bold">F</span>,
    locale: "fr-CF",
  },
  {
    code: "JPY",
    name: "Yen Japonais",
    symbol: "¥",
    countryCode: "JP",
    flag: "🇯🇵",
    icon: <JapaneseYenIcon className="w-4 h-4" />,
    locale: "ja-JP",
  },
  {
    code: "CHF",
    name: "Franc Suisse",
    symbol: "CHF",
    countryCode: "CH",
    flag: "🇨🇭",
    icon: <span className="text-xs font-bold">Fr</span>,
    locale: "fr-CH",
  },
  {
    code: "AUD",
    name: "Dollar Australien",
    symbol: "$",
    countryCode: "AU",
    flag: "🇦🇺",
    icon: <DollarSign className="w-4 h-4" />,
    locale: "en-AU",
  },
  {
    code: "CNY",
    name: "Yuan Chinois",
    symbol: "¥",
    countryCode: "CN",
    flag: "🇨🇳",
    icon: <span className="text-xs font-bold">¥</span>,
    locale: "zh-CN",
  },
  {
    code: "INR",
    name: "Roupie Indienne",
    symbol: "₹",
    countryCode: "IN",
    flag: "🇮🇳",
    icon: <span className="text-xs font-bold">₹</span>,
    locale: "en-IN",
  },
  {
    code: "BRL",
    name: "Réal Brésilien",
    symbol: "R$",
    countryCode: "BR",
    flag: "🇧🇷",
    icon: <span className="text-xs font-bold">R$</span>,
    locale: "pt-BR",
  }
];

const CurrencySelector = () => {
  const { currency, changeCurrency, formatPrice } = useCurrency(); // À créer

  // Si vous n'avez pas encore le contexte, voici un hook temporaire
  // const { currency, setCurrency } = useState("EUR");

  const currentCurrency =
    availableCurrencies.find((c) => c.code === currency) ||
    availableCurrencies[0];

  const handleCurrencyChange = (currencyCode) => {
    changeCurrency(currencyCode);
    // Optionnel: Sauvegarder dans localStorage
    localStorage.setItem("preferredCurrency", currencyCode);

    // Optionnel: Rafraîchir les prix si nécessaire
    // window.location.reload(); // Ou mieux: mettre à jour le contexte global
  };

  return (
    <DropdownMenu className="z-1600">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex flex-col gap-1 px-1 md:flex-row text-primary-foreground"
        >
          <div className="flex items-center gap-1">
            {currentCurrency.icon}
            <span className="hidden text-xs font-medium lg:text-sm md:block">
              {currentCurrency.code}
            </span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-1600">
        <DropdownMenuLabel>Sélectionnez une devise</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="">
          {availableCurrencies.map((currencyItem) => (
            <DropdownMenuItem
              key={currencyItem.code}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => handleCurrencyChange(currencyItem.code)}
            >
              <div className="flex items-center gap-3">
                {/* <div className="text-lg">{currencyItem.flag}</div> */}
                <ReactCountryFlag
                  svg
                  countryCode={currencyItem.countryCode}
                  className="w-4 h-4"
                />
                <div>
                  <div className="font-medium">{currencyItem.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {currencyItem.code} • {currencyItem.symbol}
                  </div>
                </div>
              </div>
              {currencyItem.code === currency && (
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              )}
            </DropdownMenuItem>
          ))}
        </div>

        {/* Exemple de prix formaté pour comparaison */}
        {/* <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Exemple: {formatPrice ? formatPrice(29.99) : `${currentCurrency.symbol}29.99`}
        </div> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
