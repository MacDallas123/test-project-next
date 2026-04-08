import { useState, useMemo, useEffect } from "react";
import { FileText, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserQuotes,
  selectQuotes,
  selectQuotesFilter,
  selectQuotesPagination,
  setQuotesFilter,
} from "@/redux/slices/quoteSlice";

// ── Helpers (identiques à QuoteHistoryDialog) ─────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function quoteClientName(quote) {
  const ci = quote.clientInfo ?? quote;
  const full = `${ci.firstName ?? ""} ${ci.lastName ?? ""}`.trim();
  return full || ci.company || `Devis #${quote.quoteNumber}`;
}

function quoteClientCompany(quote) {
  return (quote.clientInfo ?? quote).company ?? null;
}

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_DOT = {
  draft:    "bg-gray-300",
  sent:     "bg-sky-400",
  accepted: "bg-emerald-400",
  rejected: "bg-red-400",
  expired:  "bg-orange-400",
};

const STATUS_LABEL = {
  draft:    "Brouillon",
  sent:     "Envoyé",
  accepted: "Accepté",
  rejected: "Refusé",
  expired:  "Expiré",
};

// ── Ligne devis ───────────────────────────────────────────────────────────────

function QuoteRow({ quote, isSelected, onToggle, symbol = "FCFA" }) {
  const clientName    = quoteClientName(quote);
  const clientCompany = quoteClientCompany(quote);
  const status        = quote.quoteStatus ?? "draft";
  const date          = formatDate(quote.createdAt);
  const label         = clientCompany ? `${clientName} — ${clientCompany}` : clientName;

  return (
    <button
      type="button"
      onClick={() => onToggle(quote.id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-150
        ${isSelected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60"
        }
      `}
    >
      {/* Checkbox */}
      <div
        className={`flex-shrink-0 flex items-center justify-center rounded border transition-all
          ${isSelected ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}
        style={{ width: 18, height: 18 }}
      >
        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>

      {/* Numéro */}
      <div className="flex items-center gap-2 flex-shrink-0 w-28">
        <span className="font-mono text-sm font-semibold text-gray-800 truncate">
          {quote.quoteNumber ?? `#${quote.id}`}
        </span>
        {quote.bisNumber && (
          <span className="text-[10px] text-gray-400 font-mono shrink-0">·{quote.bisNumber}</span>
        )}
      </div>

      {/* Client */}
      <span className="flex-1 text-xs text-gray-500 truncate min-w-0">
        {label}
      </span>

      {/* Montant */}
      {quote.total !== undefined && (
        <span className="text-xs font-semibold text-gray-700 shrink-0 tabular-nums">
          {Number(quote.total).toLocaleString("fr-FR")} {symbol}
        </span>
      )}

      {/* Date */}
      {date && (
        <span className="text-[11px] text-gray-400 shrink-0 hidden sm:block">
          {date}
        </span>
      )}

      {/* Status dot */}
      <div
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[status] ?? STATUS_DOT.draft}`}
        title={STATUS_LABEL[status]}
      />
    </button>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

const QuoteSelectionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Sélectionner un devis",
  symbol = "FCFA",
}) => {
  const dispatch           = useDispatch();
  const quotesFS           = useSelector(selectQuotes);
  const quotesFilterFS     = useSelector(selectQuotesFilter);
  const quotesPaginationFS = useSelector(selectQuotesPagination);

  const [search,         setSearch]         = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [selectedId,     setSelectedId]     = useState(null);

  // Debounce recherche (identique à QuoteHistoryDialog)
  useEffect(() => {
    const handler = setTimeout(() => setDebounceSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Synchronisation filtre → Redux → refetch
  useEffect(() => {
    dispatch(
      setQuotesFilter({
        ...quotesFilterFS,
        search: debounceSearch,
        page: 1,
      })
    );
  }, [debounceSearch]);

  // Fetch à l'ouverture et à chaque changement de filtre
  useEffect(() => {
    if (isOpen) dispatch(fetchUserQuotes(quotesFilterFS));
  }, [quotesFilterFS, isOpen]);

  const { total, page, totalPages } = quotesPaginationFS ?? {};
  const quoteList = Array.isArray(quotesFS) ? quotesFS : [];
  const isLoading = isOpen && !quotesFS;

  const handleToggle = (id) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    const quote = quoteList.find(q => q.id === selectedId);
    onConfirm?.(quote);
    onClose();
  };

  const handleClose = () => {
    setSelectedId(null);
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b">
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <Input
              className="h-8 pl-8 text-xs border-gray-200 rounded-md focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
              placeholder="Numéro, client…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5 bg-gray-50/40">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 rounded-lg bg-gray-100 animate-pulse" />
            ))
          ) : quoteList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <p className="text-xs text-gray-400">
                {search ? "Aucun résultat" : "Aucun devis disponible"}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-1.5 text-xs text-gray-500 hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          ) : (
            quoteList.map(quote => (
              <QuoteRow
                key={quote.id}
                quote={quote}
                isSelected={selectedId === quote.id}
                onToggle={handleToggle}
                symbol={symbol}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t bg-white">
          <span className="text-[11px] text-gray-400">
            {total != null ? (
              <>
                <span className="font-semibold text-gray-600">{total}</span> devis
                {totalPages > 1 && ` · page ${page}/${totalPages}`}
              </>
            ) : (
              `${quoteList.length} devis`
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-8 text-gray-500" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 bg-primary/90 hover:bg-primary text-white rounded-md px-4"
              disabled={!selectedId}
              onClick={handleConfirm}
            >
              Sélectionner
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default QuoteSelectionDialog;