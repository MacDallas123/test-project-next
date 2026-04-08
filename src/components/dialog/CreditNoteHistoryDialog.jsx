import { useEffect, useState } from "react";
import {
  Download, Eye, Trash2, Send,
  Calendar, Search, AlertCircle, CheckCircle2,
  XCircle, MoreHorizontal, RefreshCw, RotateCcw,
  DollarSign, Copy, AlertTriangle, Check,
  FileText, FileSpreadsheet, ChevronLeft, ChevronRight,
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
  deleteCreditNote,
  fetchUserCreditNotes,
  selectCreditNotes,
  selectCreditNoteFilters,
  selectCreditNotePagination,
  setCurrentCreditNote,
  setCreditNotesFilters,
} from "@/redux/slices/creditNoteSlice";
import { UPLOADED_FILES_URL } from "@/api/axios";
import { thunkSucceed } from "@/lib/tools";
import { useDialog } from "@/hooks/useDialog";
import { useLanguage } from "@/context/LanguageContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoString, t) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolveFileUrl(filePath) {
  if (!filePath) return null;
  let base = UPLOADED_FILES_URL ?? "";
  if (base && !base.endsWith("/")) base += "/";
  const clean = filePath.startsWith("/") ? filePath.substring(1) : filePath;
  return `${base}${clean}`;
}

function openFile(filePath) {
  const url = resolveFileUrl(filePath);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

// Supporte réponse imbriquée (creditNoteInfo.*) ou plate
function cnClientName(cn)    { return cn.clientInfo?.name     ?? cn.clientName    ?? null; }
function cnClientCompany(cn) { return cn.clientInfo?.company  ?? cn.clientCompany ?? null; }
function cnOrigInvoice(cn)   { return cn.creditNoteInfo?.originalInvoiceNumber ?? cn.originalInvoiceNumber ?? null; }
function cnReason(cn)        { return cn.creditNoteInfo?.creditReason           ?? cn.creditReason          ?? null; }
function cnStatus(cn)        { return cn.creditNoteStatus ?? cn.statut ?? "draft"; }

// ── Métadonnées statut (avec clés de traduction) ──────────────────────────────

const CREDIT_NOTE_STATUS_META = {
  draft:     { Icon: RefreshCw, pill: "bg-gray-50    text-gray-600    border border-gray-200"    },
  issued:    { Icon: Send,       pill: "bg-orange-50  text-orange-700  border border-orange-200"  },
  processed: { Icon: Check,      pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled: { Icon: XCircle,    pill: "bg-red-50     text-red-700     border border-red-200"     },
};

// ── Badge statut ──────────────────────────────────────────────────────────────

function CreditNoteStatusBadge({ status, t }) {
  const meta = CREDIT_NOTE_STATUS_META[status] ?? CREDIT_NOTE_STATUS_META.draft;
  const { Icon, pill } = meta;
  const labelKey = `credit_note.status.${status}`;
  const label = t(labelKey, status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${pill}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Filtres statut (avec clés de traduction) ──────────────────────────────────

const STATUS_FILTERS = [
  { val: "ALL",       labelKey: "credit_note.history.filters.all"       },
  { val: "draft",     labelKey: "credit_note.history.filters.draft"     },
  { val: "issued",    labelKey: "credit_note.history.filters.issued"    },
  { val: "processed", labelKey: "credit_note.history.filters.processed" },
  { val: "cancelled", labelKey: "credit_note.history.filters.cancelled" },
];

// ── Ligne avoir ───────────────────────────────────────────────────────────────

function CreditNoteRow({
  creditNote, onPreview, onDownloadPdf, onDownloadXlsx,
  onDelete, onDuplicate, index, symbol = "FCFA", t,
}) {
  const clientName  = cnClientName(creditNote);
  const company     = cnClientCompany(creditNote);
  const origInvoice = cnOrigInvoice(creditNote);
  const reason      = cnReason(creditNote);
  const status      = cnStatus(creditNote);
  const created     = formatDate(creditNote.createdAt, t);
  const updated     = formatDate(creditNote.updatedAt !== creditNote.createdAt ? creditNote.updatedAt : null, t);
  
  const reasonLabelKey = reason ? `credit_note.credit_reasons.${reason}` : null;
  const reasonLabel = reasonLabelKey ? t(reasonLabelKey, reason) : (reason || "—");

  const files   = creditNote.files ?? {};
  const hasPdf  = !!files.pdf;
  const hasXlsx = !!files.xlsx;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-all duration-150 bg-white border border-gray-100 group rounded-xl hover:border-orange-200 hover:shadow-sm"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Icône */}
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-12 border border-orange-100 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50">
        <RotateCcw className="w-5 h-5 text-orange-400" />
      </div>

      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-sm font-semibold text-gray-800 truncate">
            {creditNote.creditNoteNumber ?? `#${creditNote.id}`}
          </span>
          {creditNote.bisNumber && (
            <span className="text-[11px] text-gray-400 font-mono">bis {creditNote.bisNumber}</span>
          )}
          <CreditNoteStatusBadge status={status} t={t} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11px] text-gray-400">
          {clientName && (
            <span className="font-medium text-gray-600 truncate max-w-[150px]">
              {company ? `${clientName} — ${company}` : clientName}
            </span>
          )}
          {origInvoice && (
            <span className="flex items-center gap-1">
              <FileText className="flex-shrink-0 w-3 h-3" />
              {t("credit_note.history.ref_invoice", "Réf.")} {origInvoice}
            </span>
          )}
          {reason && (
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              <AlertTriangle className="flex-shrink-0 w-3 h-3" />
              {reasonLabel}
            </span>
          )}
          {creditNote.total !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-orange-600">
              <DollarSign className="w-3 h-3" />
              {Number(creditNote.total).toLocaleString("fr-FR")} {symbol}
            </span>
          )}
          {created && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {created}
            </span>
          )}
          {updated && (
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> {t("credit_note.history.modified", "modifié")} {updated}
            </span>
          )}
        </div>
      </div>

      {/* ── Actions desktop (visible au hover) ─────────────────────────────── */}
      <div className="items-center hidden gap-1 transition-opacity opacity-0 sm:flex group-hover:opacity-100">
        <Button
          variant="ghost" size="icon"
          className="w-8 h-8 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
          onClick={() => onPreview(creditNote)}
          title={t("credit_note.history.preview", "Aperçu / Réutiliser")}
        >
          <Eye className="w-4 h-4" />
        </Button>
        {hasPdf && (
          <Button
            variant="ghost" size="icon"
            className="w-8 h-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => onDownloadPdf(creditNote)}
            title={t("credit_note.history.download_pdf", "Télécharger le PDF")}
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
        {hasXlsx && (
          <Button
            variant="ghost" size="icon"
            className="w-8 h-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={() => onDownloadXlsx(creditNote)}
            title={t("credit_note.history.download_excel", "Télécharger le fichier Excel")}
          >
            <FileSpreadsheet className="w-4 h-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-[2010]">
            <DropdownMenuItem onClick={() => onPreview(creditNote)} className="gap-2 text-sm">
              <Eye className="w-4 h-4" /> {t("credit_note.history.preview", "Aperçu / Réutiliser")}
            </DropdownMenuItem>
            {hasPdf && (
              <DropdownMenuItem onClick={() => onDownloadPdf(creditNote)} className="gap-2 text-sm">
                <Download className="w-4 h-4 text-rose-500" /> {t("credit_note.history.download_pdf", "Télécharger PDF")}
              </DropdownMenuItem>
            )}
            {hasXlsx && (
              <DropdownMenuItem onClick={() => onDownloadXlsx(creditNote)} className="gap-2 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> {t("credit_note.history.download_excel", "Télécharger Excel")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(creditNote)} className="gap-2 text-sm">
              <Copy className="w-4 h-4" /> {t("credit_note.history.duplicate", "Dupliquer")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(creditNote)}
              className="gap-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> {t("credit_note.history.delete", "Supprimer")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Menu 3 points mobile ───────────────────────────────────────────── */}
      <div className="flex items-center sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost" size="icon"
              className="text-gray-400 w-9 h-9 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 z-[2010]">
            <DropdownMenuItem onClick={() => onPreview(creditNote)} className="gap-2.5 text-sm py-2.5">
              <Eye className="w-4 h-4 text-gray-500" /><span>{t("credit_note.history.preview", "Aperçu / Réutiliser")}</span>
            </DropdownMenuItem>
            {hasPdf && (
              <DropdownMenuItem onClick={() => onDownloadPdf(creditNote)} className="gap-2.5 text-sm py-2.5">
                <Download className="w-4 h-4 text-rose-500" /><span>{t("credit_note.history.download_pdf", "Télécharger PDF")}</span>
              </DropdownMenuItem>
            )}
            {hasXlsx && (
              <DropdownMenuItem onClick={() => onDownloadXlsx(creditNote)} className="gap-2.5 text-sm py-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /><span>{t("credit_note.history.download_excel", "Télécharger Excel")}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(creditNote)} className="gap-2.5 text-sm py-2.5">
              <Copy className="w-4 h-4 text-gray-500" /><span>{t("credit_note.history.duplicate", "Dupliquer")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(creditNote)}
              className="gap-2.5 text-sm py-2.5 text-red-500 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /><span>{t("credit_note.history.delete", "Supprimer")}</span>
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
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    if (range[0] > 1)                             { range.unshift("..."); range.unshift(1); }
    if (range[range.length - 1] < totalPages)     { range.push("...");   range.push(totalPages); }
    return range;
  };

  return (
    <div className="flex items-center gap-1">
      {hasPrev && (
        <button onClick={() => onPageChange(page - 1)} className="flex items-center justify-center text-gray-500 rounded-lg w-7 h-7 hover:bg-gray-100">
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
              ${page === p ? "bg-orange-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {p}
          </button>
        )
      )}
      {hasNext && (
        <button onClick={() => onPageChange(page + 1)} className="flex items-center justify-center text-gray-500 rounded-lg w-7 h-7 hover:bg-gray-100">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ── Micro-composants ──────────────────────────────────────────────────────────

function Sep() {
  return <div className="w-px h-4 bg-gray-200 shrink-0" />;
}

function Stat({ value, label, Icon, color, bold, plural = true }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={`font-bold ${bold}`}>{value}</span>
      <span className="text-gray-400">
        {plural ? `${label}${value !== 1 ? "s" : ""}` : label}
      </span>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

const CreditNoteHistoryDialog = ({
  isOpen,
  onClose,
  selectedUser,
  onDuplicateCreditNote,
  isLoading = false,
  symbol = "FCFA",
}) => {
  const dispatch                = useDispatch();
  const creditNotesFS           = useSelector(selectCreditNotes);
  const creditNotesFilterFS     = useSelector(selectCreditNoteFilters);
  const creditNotesPaginationFS = useSelector(selectCreditNotePagination);
  const { t } = useLanguage();

  const [search,         setSearch]         = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("ALL");
  const [filterReason,   setFilterReason]   = useState("tous");

  const { showConfirm, DialogComponent } = useDialog();

  // Debounce recherche
  useEffect(() => {
    const handler = setTimeout(() => setDebounceSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Synchronisation filtre → Redux → refetch
  useEffect(() => {
    dispatch(
      setCreditNotesFilters({
        ...creditNotesFilterFS,
        search: debounceSearch,
        status: filterStatus === "ALL"  ? undefined : filterStatus,
        reason: filterReason === "tous" ? undefined : filterReason,
        page: 1,
      })
    );
  }, [debounceSearch, filterStatus, filterReason]);

  const loadCreditNotes = () => {
    dispatch(fetchUserCreditNotes(creditNotesFilterFS));
  };

  useEffect(() => {
    if (isOpen) loadCreditNotes();
  }, [creditNotesFilterFS, isOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onPreviewCreditNote = (cn) => {
    dispatch(setCurrentCreditNote(cn));
    onClose();
  };

  const onDownloadPdfCreditNote = (cn) => {
    const filePath = cn?.files?.pdf;
    if (!filePath) { console.error("Aucun fichier PDF pour cet avoir :", cn?.id); return; }
    openFile(filePath);
  };

  const onDownloadXlsxCreditNote = (cn) => {
    const filePath = cn?.files?.xlsx;
    if (!filePath) { console.error("Aucun fichier Excel pour cet avoir :", cn?.id); return; }
    openFile(filePath);
  };

  const handleDeleteCreditNote = (cn) => {
    showConfirm({
      title:       t("credit_note.history.delete_confirm_title", "Supprimer l'avoir"),
      message:     t("credit_note.history.delete_confirm_message", "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet avoir ?"),
      variant:     "danger",
      confirmText: t("credit_note.history.delete_confirm_button", "Supprimer"),
      cancelText:  t("credit_note.history.cancel", "Annuler"),
      icon:        Trash2,
      onConfirm:   () => deleteAction(cn.id),
      isLoading:   false,
    });
  };

  const deleteAction = async (id) => {
    if (!id) return;
    try {
      const res = await dispatch(deleteCreditNote(id));
      if (thunkSucceed(res)) await loadCreditNotes();
    } catch (err) {
      console.error("Erreur suppression avoir :", err);
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setCreditNotesFilters({ ...creditNotesFilterFS, page: newPage }));
  };

  // ── Données ───────────────────────────────────────────────────────────────

  const { total, page, totalPages } = creditNotesPaginationFS ?? {};
  const creditNoteList = Array.isArray(creditNotesFS) ? creditNotesFS : [];

  const issued    = creditNoteList.filter(cn => cnStatus(cn) === "issued").length;
  const processed = creditNoteList.filter(cn => cnStatus(cn) === "processed").length;
  const cancelled = creditNoteList.filter(cn => cnStatus(cn) === "cancelled").length;
  const totalTTC  = creditNoteList
    .filter(cn => cnStatus(cn) !== "cancelled")
    .reduce((s, cn) => s + (Number(cn.total) || 0), 0);

  const presentReasons = [...new Set(creditNoteList.map(cn => cnReason(cn)).filter(Boolean))];

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[860px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">

        {/* ── En-tête ──────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 bg-white border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                <RotateCcw className="w-4 h-4 text-orange-600" />
              </div>
              {t("credit_note.history.title", "Historique des avoirs")}
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

          {/* Stats */}
          {creditNoteList.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 pt-3 mt-3 border-t border-gray-100">
              <Stat 
                value={issued}    
                label={t("credit_note.history.stats.issued", "émis")}    
                Icon={Send}        
                color="text-orange-500"  
                bold="text-orange-700"  
                plural={false} 
              />
              <Sep />
              <Stat 
                value={processed} 
                label={t("credit_note.history.stats.processed", "traité")}  
                Icon={CheckCircle2} 
                color="text-emerald-500" 
                bold="text-emerald-700" 
              />
              {cancelled > 0 && (
                <>
                  <Sep />
                  <Stat 
                    value={cancelled} 
                    label={t("credit_note.history.stats.cancelled", "annulé")} 
                    Icon={XCircle} 
                    color="text-red-400" 
                    bold="text-red-600" 
                  />
                </>
              )}
              <Sep />
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-bold text-gray-800">{totalTTC.toLocaleString("fr-FR")}</span>
                <span className="text-gray-400">{symbol}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Filtres ───────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b bg-gray-50">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              className="h-8 pl-8 pr-3 text-xs bg-white border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-orange-300"
              placeholder={t("credit_note.history.search_placeholder", "N° avoir, client, facture…")}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 flex-wrap">
            {STATUS_FILTERS.map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setFilterStatus(opt.val)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all
                  ${filterStatus === opt.val
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"}`}
              >
                {t(opt.labelKey, opt.val)}
              </button>
            ))}
          </div>

          {presentReasons.length > 1 && (
            <select
              value={filterReason}
              onChange={e => setFilterReason(e.target.value)}
              className="h-8 px-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg"
            >
              <option value="tous">{t("credit_note.history.all_reasons", "Toutes raisons")}</option>
              {presentReasons.map(r => {
                const reasonLabelKey = `credit_note.credit_reasons.${r}`;
                const reasonLabel = t(reasonLabelKey, r);
                return (
                  <option key={r} value={r}>{reasonLabel}</option>
                );
              })}
            </select>
          )}
        </div>

        {/* ── Liste ─────────────────────────────────── */}
        <div className="flex-1 px-5 py-4 space-y-2 overflow-y-auto bg-gray-50/60">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[64px] rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : creditNoteList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t("credit_note.history.no_credit_notes", "Aucun avoir trouvé")}</p>
              {(search || filterStatus !== "ALL" || filterReason !== "tous") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setFilterStatus("ALL"); setFilterReason("tous"); }}
                  className="mt-2 text-xs text-orange-600 hover:underline"
                >
                  {t("credit_note.history.reset_filters", "Réinitialiser les filtres")}
                </button>
              )}
            </div>
          ) : (
            creditNoteList.map((cn, i) => (
              <CreditNoteRow
                key={cn.id}
                creditNote={cn}
                index={i}
                symbol={symbol}
                t={t}
                onPreview={onPreviewCreditNote}
                onDownloadPdf={onDownloadPdfCreditNote}
                onDownloadXlsx={onDownloadXlsxCreditNote}
                onDelete={handleDeleteCreditNote}
                onDuplicate={onDuplicateCreditNote}
              />
            ))
          )}
        </div>

        {/* ── Pied ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-t">
          <p className="text-xs text-gray-400 shrink-0">
            {total != null ? (
              <>
                <span className="font-semibold text-gray-700">{total}</span> {t("credit_note.history.credit_notes", "avoir")}{total !== 1 ? "s" : ""}
                {totalPages > 1 && ` · ${t("credit_note.history.page", "page")} ${page} / ${totalPages}`}
              </>
            ) : (
              `${creditNoteList.length} ${t("credit_note.history.result", "résultat")}${creditNoteList.length !== 1 ? "s" : ""}`
            )}
          </p>

          <Pagination pagination={creditNotesPaginationFS} onPageChange={handlePageChange} t={t} />

          <Button variant="outline" size="sm" className="text-xs rounded-lg shrink-0" onClick={onClose}>
            {t("credit_note.history.close", "Fermer")}
          </Button>
        </div>

        <DialogComponent />
      </DialogContent>
    </Dialog>
  );
};

export default CreditNoteHistoryDialog;