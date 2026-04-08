import { useEffect, useState } from "react";
import {
  FileText, Download, Eye, Trash2, Clock, Send,
  Calendar, Search, AlertCircle, CheckCircle2,
  MoreHorizontal, RefreshCw, ThumbsUp,
  ThumbsDown, Timer, Briefcase, DollarSign, Copy,
  ChevronLeft, ChevronRight, FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteQuote,
  fetchUserQuotes,
  selectQuotes,
  selectQuotesFilter,
  selectQuotesPagination,
  setCurrentQuote,
  setQuotesFilter,
} from "@/redux/slices/quoteSlice";
import { UPLOADED_FILES_URL } from "@/api/axios";
import { thunkSucceed } from "@/lib/tools";
import { useDialog } from "@/hooks/useDialog";
import { useLanguage } from "@/context/LanguageContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formate une date ISO en "12 mars 2026" */
function formatDate(isoString, t) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function quoteClientName(quote) {
  const ci = quote.clientInfo ?? quote;
  const firstName = ci.firstName ?? "";
  const lastName  = ci.lastName  ?? "";
  const full = `${firstName} ${lastName}`.trim();
  return full || ci.company || `Devis #${quote.id}`;
}

function quoteClientCompany(quote) {
  return (quote.clientInfo ?? quote).company ?? null;
}

function quoteProjectName(quote) {
  return (quote.projectInfo ?? quote).projectName ?? null;
}

/**
 * Résout l'URL complète d'un fichier depuis son chemin relatif.
 * Gère les chemins commençant par "/" ou non.
 */
function resolveFileUrl(filePath) {
  if (!filePath) return null;
  let base = UPLOADED_FILES_URL ?? "";
  if (base && !base.endsWith("/")) base += "/";
  const clean = filePath.startsWith("/") ? filePath.substring(1) : filePath;
  return `${base}${clean}`;
}

/**
 * Ouvre un fichier dans un nouvel onglet.
 */
function openFile(filePath) {
  const url = resolveFileUrl(filePath);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

// ── Méta statut ──────────────────────────────────────────────────────────────

const QUOTE_STATUS_META = {
  draft:    { Icon: RefreshCw,  pill: "bg-gray-50    text-gray-600    border border-gray-200"    },
  sent:     { Icon: Send,        pill: "bg-sky-50     text-sky-700     border border-sky-200"     },
  accepted: { Icon: ThumbsUp,    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected: { Icon: ThumbsDown,  pill: "bg-red-50     text-red-700     border border-red-200"     },
  expired:  { Icon: Timer,       pill: "bg-orange-50  text-orange-700  border border-orange-200"  },
};

function QuoteStatusBadge({ status, t }) {
  const meta = QUOTE_STATUS_META[status] ?? QUOTE_STATUS_META.draft;
  const { Icon, pill } = meta;
  const labelKey = `quote.status.${status}`;
  const label = t(labelKey, status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${pill}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Ligne devis ───────────────────────────────────────────────────────────────

function QuoteRow({ quote, onPreview, onDownloadPdf, onDownloadXlsx, onDelete, onDuplicate, index, symbol = "FCFA", t }) {
  const clientName    = quoteClientName(quote);
  const clientCompany = quoteClientCompany(quote);
  const projectName   = quoteProjectName(quote);
  const status        = quote.quoteStatus ?? "draft";
  const created       = formatDate(quote.createdAt, t);
  const updated       = formatDate(quote.updatedAt !== quote.createdAt ? quote.updatedAt : null, t);

  // quote.files est un objet JSON : { pdf: "...", xlsx: "..." }
  const files    = quote.files ?? {};
  const hasPdf   = !!files.pdf;
  const hasXlsx  = !!files.xlsx;
  const hasFiles = hasPdf || hasXlsx;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-all duration-150 bg-white border border-gray-100 group rounded-xl hover:border-emerald-200 hover:shadow-sm"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Icône */}
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-12 border rounded-lg bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
        <FileText className="w-5 h-5 text-emerald-400" />
      </div>

      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-sm font-semibold text-gray-800 truncate">
            {quote.quoteNumber ?? `#${quote.id}`}
          </span>
          {quote.bisNumber && (
            <span className="text-[11px] text-gray-400 font-mono">bis {quote.bisNumber}</span>
          )}
          <QuoteStatusBadge status={status} t={t} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11px] text-gray-400">
          {clientName && (
            <span className="font-medium text-gray-600 truncate max-w-[150px]">
              {clientCompany ? `${clientName} — ${clientCompany}` : clientName}
            </span>
          )}
          {projectName && (
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              <Briefcase className="flex-shrink-0 w-3 h-3" />
              {projectName}
            </span>
          )}
          {quote.total !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <DollarSign className="w-3 h-3" />
              {Number(quote.total).toLocaleString("fr-FR")} {symbol}
            </span>
          )}
          {created && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {created}
            </span>
          )}
          {updated && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {t("quote.history.modified", "modifié")} {updated}
            </span>
          )}
        </div>
      </div>

      {/* ── Actions desktop (visible au hover) ─────────────────────────────── */}
      <div className="items-center hidden gap-1 transition-opacity opacity-0 sm:flex group-hover:opacity-100">

        {/* Aperçu */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-primary hover:bg-primary/10"
          onClick={() => onPreview(quote)}
          title={t("quote.history.preview", "Aperçu / Réutiliser")}
        >
          <Eye className="w-4 h-4" />
        </Button>

        {/* Télécharger PDF */}
        {hasPdf && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => onDownloadPdf(quote)}
            title={t("quote.history.download_pdf", "Télécharger le PDF")}
          >
            <Download className="w-4 h-4" />
          </Button>
        )}

        {/* Télécharger XLSX */}
        {hasXlsx && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={() => onDownloadXlsx(quote)}
            title={t("quote.history.download_excel", "Télécharger le fichier Excel")}
          >
            <FileSpreadsheet className="w-4 h-4" />
          </Button>
        )}

        {/* Menu 3 points desktop (dupliquer + supprimer) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-[2010]">
            <DropdownMenuItem onClick={() => onPreview(quote)} className="gap-2 text-sm">
              <Eye className="w-4 h-4" /> {t("quote.history.preview", "Aperçu / Réutiliser")}
            </DropdownMenuItem>
            {hasPdf && (
              <DropdownMenuItem onClick={() => onDownloadPdf(quote)} className="gap-2 text-sm">
                <Download className="w-4 h-4 text-rose-500" /> {t("quote.history.download_pdf", "Télécharger PDF")}
              </DropdownMenuItem>
            )}
            {hasXlsx && (
              <DropdownMenuItem onClick={() => onDownloadXlsx(quote)} className="gap-2 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> {t("quote.history.download_excel", "Télécharger Excel")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(quote)} className="gap-2 text-sm">
              <Copy className="w-4 h-4" /> {t("quote.history.duplicate", "Dupliquer")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(quote)}
              className="gap-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> {t("quote.history.delete", "Supprimer")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Menu 3 points mobile (toutes les actions) ──────────────────────── */}
      <div className="flex items-center sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 w-9 h-9 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 z-[2010]">

            {/* Aperçu */}
            <DropdownMenuItem onClick={() => onPreview(quote)} className="gap-2.5 text-sm py-2.5">
              <Eye className="w-4 h-4 text-gray-500" />
              <span>{t("quote.history.preview", "Aperçu / Réutiliser")}</span>
            </DropdownMenuItem>

            {/* PDF */}
            {hasPdf && (
              <DropdownMenuItem onClick={() => onDownloadPdf(quote)} className="gap-2.5 text-sm py-2.5">
                <Download className="w-4 h-4 text-rose-500" />
                <span>{t("quote.history.download_pdf", "Télécharger PDF")}</span>
              </DropdownMenuItem>
            )}

            {/* Excel */}
            {hasXlsx && (
              <DropdownMenuItem onClick={() => onDownloadXlsx(quote)} className="gap-2.5 text-sm py-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>{t("quote.history.download_excel", "Télécharger Excel")}</span>
              </DropdownMenuItem>
            )}

            {/* Dupliquer */}
            <DropdownMenuItem onClick={() => onDuplicate(quote)} className="gap-2.5 text-sm py-2.5">
              <Copy className="w-4 h-4 text-gray-500" />
              <span>{t("quote.history.duplicate", "Dupliquer")}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Supprimer */}
            <DropdownMenuItem
              onClick={() => onDelete(quote)}
              className="gap-2.5 text-sm py-2.5 text-red-500 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t("quote.history.delete", "Supprimer")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ pagination, onPageChange, t }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNext, hasPrev } = pagination;

  const getPages = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      range.push(i);
    }
    if (range[0] > 1) { range.unshift("..."); range.unshift(1); }
    if (range[range.length - 1] < totalPages) { range.push("..."); range.push(totalPages); }
    return range;
  };

  return (
    <div className="flex items-center gap-1">
      {hasPrev && (
        <button
          onClick={() => onPageChange(page - 1)}
          className="flex items-center justify-center text-gray-500 transition-colors rounded-lg w-7 h-7 hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="text-xs text-center text-gray-400 w-7">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-medium transition-colors
              ${page === p ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {p}
          </button>
        )
      )}
      {hasNext && (
        <button
          onClick={() => onPageChange(page + 1)}
          className="flex items-center justify-center text-gray-500 transition-colors rounded-lg w-7 h-7 hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ── Filtres statut ────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { val: "ALL",      labelKey: "quote.history.filters.all"       },
  { val: "draft",    labelKey: "quote.history.filters.draft"     },
  { val: "sent",     labelKey: "quote.history.filters.sent"      },
  { val: "accepted", labelKey: "quote.history.filters.accepted"  },
  { val: "rejected", labelKey: "quote.history.filters.rejected"  },
  { val: "expired",  labelKey: "quote.history.filters.expired"   },
];

// ── Composant principal ───────────────────────────────────────────────────────

const QuoteHistoryDialog = ({
  isOpen,
  onClose,
  selectedUser,
  onDuplicateQuote,
  isLoading = false,
  symbol = "FCFA",
}) => {
  const dispatch               = useDispatch();
  const quotesFS               = useSelector(selectQuotes);
  const quotesFilterFS         = useSelector(selectQuotesFilter);
  const quotesPaginationFS     = useSelector(selectQuotesPagination);
  const { t } = useLanguage();

  const [search,         setSearch]         = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("ALL");

  const { showConfirm, DialogComponent } = useDialog();

  // Debounce recherche
  useEffect(() => {
    const handler = setTimeout(() => setDebounceSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    console.log("QUOTE FS :", quotesFS);
  }, [quotesFS]);

  // Mise à jour filtre Redux → déclenche le fetch
  useEffect(() => {
    dispatch(
      setQuotesFilter({
        ...quotesFilterFS,
        search: debounceSearch,
        status: filterStatus === "ALL" ? undefined : filterStatus,
        page: 1,
      })
    );
  }, [debounceSearch, filterStatus]);

  const loadQuotes = () => {
    dispatch(fetchUserQuotes(quotesFilterFS));
  };

  // Fetch à chaque changement de filtre ou ouverture
  useEffect(() => {
    if (isOpen) loadQuotes();
  }, [quotesFilterFS, isOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onPreviewQuote = (quote) => {
    dispatch(setCurrentQuote(quote));

    setTimeout(() => {
      onClose();
    }, 100);
  };

  /** Télécharge le PDF depuis quote.files.pdf */
  const onDownloadPdfQuote = (quote) => {
    const filePath = quote?.files?.pdf;
    if (!filePath) {
      console.error("Aucun fichier PDF pour ce devis :", quote?.id);
      return;
    }
    openFile(filePath);
  };

  /** Télécharge le XLSX depuis quote.files.xlsx */
  const onDownloadXlsxQuote = (quote) => {
    const filePath = quote?.files?.xlsx;
    if (!filePath) {
      console.error("Aucun fichier Excel pour ce devis :", quote?.id);
      return;
    }
    openFile(filePath);
  };

  const handleDeleteQuote = (quote) => {
    showConfirm({
      title: t("quote.history.delete_confirm_title", "Supprimer le devis"),
      message: t("quote.history.delete_confirm_message", "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce devis ?"),
      variant: "danger",
      confirmText: t("quote.history.delete_confirm_button", "Supprimer"),
      cancelText: t("quote.history.cancel", "Annuler"),
      icon: Trash2,
      onConfirm: () => deleteAction(quote.id),
      isLoading: false,
    });
  };

  const deleteAction = async (id) => {
    if (!id) return;
    try {
      const res = await dispatch(deleteQuote(id));
      if (thunkSucceed(res)) await loadQuotes();
    } catch (err) {
      console.error("Erreur suppression devis :", err);
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setQuotesFilter({ ...quotesFilterFS, page: newPage }));
  };

  // ── Données ───────────────────────────────────────────────────────────────

  const { total, page, totalPages } = quotesPaginationFS ?? {};
  const quoteList = Array.isArray(quotesFS) ? quotesFS : [];

  const accepted       = quoteList.filter(q => q.quoteStatus === "accepted").length;
  const sent           = quoteList.filter(q => q.quoteStatus === "sent").length;
  const rejected       = quoteList.filter(q => q.quoteStatus === "rejected").length;
  const expired        = quoteList.filter(q => q.quoteStatus === "expired").length;
  const totalTTC       = quoteList.reduce((s, q) => s + (Number(q.total) || 0), 0);
  const acceptanceRate = quoteList.length > 0
    ? Math.round((accepted / quoteList.length) * 100)
    : 0;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[860px] max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">

        {/* ── En-tête ──────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 bg-white border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              {t("quote.history.title", "Historique des devis")}
            </DialogTitle>
            {selectedUser && (
              <DialogDescription className="flex items-center gap-2 mt-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-[9px] bg-gray-200">
                    {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500">
                  {selectedUser.prenom} {selectedUser.nom}
                  {selectedUser.email && ` · ${selectedUser.email}`}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Statistiques rapides */}
          {quoteList.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 pt-3 mt-3 border-t border-gray-100">
              <Stat value={accepted} label={t("quote.history.stats.accepted", "accepté")} Icon={ThumbsUp}  color="text-emerald-500" bold="text-emerald-700" />
              <Sep />
              <Stat value={sent}     label={t("quote.history.stats.sent", "envoyé")}  Icon={Send}       color="text-sky-500"    bold="text-sky-700"     />
              {rejected > 0 && <><Sep /><Stat value={rejected} label={t("quote.history.stats.rejected", "refusé")}  Icon={ThumbsDown} color="text-red-400"    bold="text-red-600"     /></>}
              {expired  > 0 && <><Sep /><Stat value={expired}  label={t("quote.history.stats.expired", "expiré")}  Icon={Timer}      color="text-orange-400" bold="text-orange-600"   /></>}
              <Sep />
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-bold text-gray-800">{totalTTC.toLocaleString("fr-FR")}</span>
                <span className="text-gray-400">{symbol}</span>
              </div>
              {quoteList.length > 0 && (
                <>
                  <Sep />
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-bold text-emerald-600">{acceptanceRate}%</span>
                    <span className="text-gray-400">{t("quote.history.stats.acceptance_rate", "acceptation")}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Filtres ───────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b bg-gray-50">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              className="h-8 pl-8 pr-3 text-xs bg-white border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-emerald-300"
              placeholder={t("quote.history.search_placeholder", "N° devis, client, projet…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtre statut */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 flex-wrap">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setFilterStatus(opt.val)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all
                  ${filterStatus === opt.val
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                {t(opt.labelKey, opt.val)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Liste ─────────────────────────────────── */}
        <div className="flex-1 px-5 py-4 space-y-2 overflow-y-auto bg-gray-50/60">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[60px] rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : quoteList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t("quote.history.no_quotes", "Aucun devis trouvé")}</p>
              {(search || filterStatus !== "ALL") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
                  className="mt-2 text-xs text-emerald-600 hover:underline"
                >
                  {t("quote.history.reset_filters", "Réinitialiser les filtres")}
                </button>
              )}
            </div>
          ) : (
            quoteList.map((quote, i) => (
              <QuoteRow
                key={quote.id}
                quote={quote}
                index={i}
                symbol={symbol}
                t={t}
                onPreview={onPreviewQuote}
                onDownloadPdf={onDownloadPdfQuote}
                onDownloadXlsx={onDownloadXlsxQuote}
                onDelete={handleDeleteQuote}
                onDuplicate={onDuplicateQuote}
              />
            ))
          )}
        </div>

        {/* ── Pied ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-t">
          <p className="text-xs text-gray-400 shrink-0">
            {total != null ? (
              <>
                <span className="font-semibold text-gray-700">{total}</span> {t("quote.history.quotes", "devis")}
                {totalPages > 1 && ` · ${t("quote.history.page", "page")} ${page} / ${totalPages}`}
              </>
            ) : (
              `${quoteList.length} ${t("quote.history.result", "résultat")}${quoteList.length !== 1 ? "s" : ""}`
            )}
          </p>

          <Pagination pagination={quotesPaginationFS} onPageChange={handlePageChange} t={t} />

          <Button variant="outline" size="sm" className="text-xs rounded-lg shrink-0" onClick={onClose}>
            {t("quote.history.close", "Fermer")}
          </Button>
        </div>

        <DialogComponent />
      </DialogContent>
    </Dialog>
  );
};

// ── Micro-composants stats ────────────────────────────────────────────────────

function Sep() {
  return <div className="w-px h-4 bg-gray-200 shrink-0" />;
}

function Stat({ value, label, Icon, color, bold }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={`font-bold ${bold}`}>{value}</span>
      <span className="text-gray-400">{label}{value !== 1 ? "s" : ""}</span>
    </div>
  );
}

export default QuoteHistoryDialog;