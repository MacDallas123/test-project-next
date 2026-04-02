import { useEffect, useState } from "react";
import {
  FileText, Download, Eye, Trash2, Clock, Send,
  Calendar, Search, AlertCircle, CheckCircle2,
  XCircle, MoreHorizontal, RefreshCw, ThumbsUp,
  ThumbsDown, Timer, Briefcase, DollarSign, Copy,
  ChevronLeft, ChevronRight,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formate une date ISO en "12 mars 2026" */
function formatDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Construit le nom d'affichage du client depuis la structure API.
 * La réponse API imbrique les données dans clientInfo / projectInfo.
 */
function quoteClientName(quote) {
  const ci = quote.clientInfo ?? quote; // compatibilité réponse plate ou imbriquée
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

// ── Méta statut ──────────────────────────────────────────────────────────────

const QUOTE_STATUS_META = {
  draft:    { label: "Brouillon", Icon: RefreshCw,  pill: "bg-gray-50    text-gray-600    border border-gray-200"    },
  sent:     { label: "Envoyé",   Icon: Send,        pill: "bg-sky-50     text-sky-700     border border-sky-200"     },
  accepted: { label: "Accepté",  Icon: ThumbsUp,    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected: { label: "Refusé",   Icon: ThumbsDown,  pill: "bg-red-50     text-red-700     border border-red-200"     },
  expired:  { label: "Expiré",   Icon: Timer,       pill: "bg-orange-50  text-orange-700  border border-orange-200"  },
};

function QuoteStatusBadge({ status }) {
  // l'API renvoie quoteStatus
  const meta = QUOTE_STATUS_META[status] ?? QUOTE_STATUS_META.draft;
  const { Icon, label, pill } = meta;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${pill}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Ligne devis ───────────────────────────────────────────────────────────────

function QuoteRow({ quote, onPreview, onDownload, onDelete, onDuplicate, index, symbol = "FCFA" }) {
  const clientName    = quoteClientName(quote);
  const clientCompany = quoteClientCompany(quote);
  const projectName   = quoteProjectName(quote);
  const status        = quote.quoteStatus ?? "draft";
  const created       = formatDate(quote.createdAt);
  const updated       = formatDate(quote.updatedAt !== quote.createdAt ? quote.updatedAt : null);

  // Prévisualisation disponible pour tous les statuts sauf brouillon sans fichier
  const hasFile = !!quote.file;

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
          <QuoteStatusBadge status={status} />
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
              <Clock className="w-3 h-3" /> modifié {updated}
            </span>
          )}
        </div>
      </div>

      {/* Actions desktop (hover) */}
      <div className="items-center hidden gap-1 transition-opacity opacity-0 sm:flex group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-primary hover:bg-primary/10"
          onClick={() => onPreview(quote)}
          title="Aperçu / Réutiliser"
        >
          <Eye className="w-4 h-4" />
        </Button>
        {hasFile && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={() => onDownload(quote)}
            title="Télécharger le PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 z-[2010]">
            <DropdownMenuItem onClick={() => onPreview(quote)} className="gap-2 text-sm">
              <Eye className="w-4 h-4" /> Aperçu / Réutiliser
            </DropdownMenuItem>
            {hasFile && (
              <DropdownMenuItem onClick={() => onDownload(quote)} className="gap-2 text-sm">
                <Download className="w-4 h-4" /> Télécharger le PDF
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(quote)} className="gap-2 text-sm">
              <Copy className="w-4 h-4" /> Dupliquer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(quote)}
              className="gap-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions mobiles */}
      <div className="flex items-center gap-1 sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400"
          onClick={() => onPreview(quote)}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-red-400"
          onClick={() => onDelete(quote)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ pagination, onPageChange }) {
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
  { val: "ALL",      label: "Tous"       },
  { val: "draft",    label: "Brouillons" },
  { val: "sent",     label: "Envoyés"    },
  { val: "accepted", label: "Acceptés"   },
  { val: "rejected", label: "Refusés"    },
  { val: "expired",  label: "Expirés"    },
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
    onClose();
  };

  const onDownloadQuote = (quote) => {
    if (!quote?.file) {
      console.error("Aucun fichier PDF pour ce devis");
      return;
    }
    let base = UPLOADED_FILES_URL;
    if (base && !base.endsWith("/")) base += "/";
    const filePath = quote.file.startsWith("/") ? quote.file.substring(1) : quote.file;
    window.open(`${base}${filePath}`, "_blank", "noopener,noreferrer");
  };

  const handleDeleteQuote = (quote) => {
    showConfirm({
      title: "Supprimer le devis",
      message: "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce devis ?",
      variant: "danger",
      confirmText: "Supprimer",
      cancelText: "Annuler",
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

  // Compteurs (calculés sur les données de la page courante uniquement —
  // pour des totaux globaux, le backend doit les renvoyer dans la pagination)
  const accepted      = quoteList.filter(q => q.quoteStatus === "accepted").length;
  const sent          = quoteList.filter(q => q.quoteStatus === "sent").length;
  const rejected      = quoteList.filter(q => q.quoteStatus === "rejected").length;
  const expired       = quoteList.filter(q => q.quoteStatus === "expired").length;
  const totalTTC      = quoteList.reduce((s, q) => s + (Number(q.total) || 0), 0);
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
              Historique des devis
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
              <Stat value={accepted} label="accepté" Icon={ThumbsUp}  color="text-emerald-500" bold="text-emerald-700" />
              <Sep />
              <Stat value={sent}     label="envoyé"  Icon={Send}       color="text-sky-500"    bold="text-sky-700"     />
              {rejected > 0 && <><Sep /><Stat value={rejected} label="refusé"  Icon={ThumbsDown} color="text-red-400"    bold="text-red-600"     /></>}
              {expired  > 0 && <><Sep /><Stat value={expired}  label="expiré"  Icon={Timer}      color="text-orange-400" bold="text-orange-600"   /></>}
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
                    <span className="text-gray-400">acceptation</span>
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
              placeholder="N° devis, client, projet…"
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
                {opt.label}
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
              <p className="text-sm font-medium text-gray-500">Aucun devis trouvé</p>
              {(search || filterStatus !== "ALL") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
                  className="mt-2 text-xs text-emerald-600 hover:underline"
                >
                  Réinitialiser les filtres
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
                onPreview={onPreviewQuote}
                onDownload={onDownloadQuote}
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
                <span className="font-semibold text-gray-700">{total}</span> devis
                {totalPages > 1 && ` · page ${page} / ${totalPages}`}
              </>
            ) : (
              `${quoteList.length} résultat${quoteList.length !== 1 ? "s" : ""}`
            )}
          </p>

          <Pagination pagination={quotesPaginationFS} onPageChange={handlePageChange} />

          <Button variant="outline" size="sm" className="text-xs rounded-lg shrink-0" onClick={onClose}>
            Fermer
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