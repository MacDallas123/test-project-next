import { useEffect, useState } from "react";
import {
  Receipt, Download, Eye, Trash2, Clock, Send,
  Calendar, Search, AlertCircle, CheckCircle2,
  XCircle, MoreHorizontal, RefreshCw, CreditCard,
  DollarSign, Copy, ChevronLeft, ChevronRight,
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
  deleteInvoice,
  fetchUserInvoices,
  selectInvoices,
  selectInvoicesFilter,
  selectInvoicesPagination,
  setCurrentInvoice,
  setInvoicesFilter,
} from "@/redux/slices/invoiceSlice";
import { UPLOADED_FILES_URL } from "@/api/axios";
import { thunkSucceed } from "@/lib/tools";
import { useDialog } from "@/hooks/useDialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Lit le nom du client depuis la structure API imbriquée.
 * L'API renvoie clientInfo.name et clientInfo.company.
 */
function invoiceClientName(invoice) {
  return (invoice.clientInfo ?? invoice).name ?? null;
}

function invoiceClientCompany(invoice) {
  return (invoice.clientInfo ?? invoice).company ?? null;
}

function invoiceDueDate(invoice) {
  // La date d'échéance est dans invoiceInfo.dueDate côté API
  return (invoice.invoiceInfo ?? invoice).dueDate ?? null;
}

// ── Méta statut ───────────────────────────────────────────────────────────────

const INVOICE_STATUS_META = {
  genere:    { label: "Générée",   Icon: CheckCircle2, pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  envoye:    { label: "Envoyée",   Icon: Send,         pill: "bg-sky-50     text-sky-700     border border-sky-200"     },
  paye:      { label: "Payée",     Icon: CreditCard,   pill: "bg-violet-50  text-violet-700  border border-violet-200"  },
  en_retard: { label: "En retard", Icon: XCircle,      pill: "bg-red-50     text-red-700     border border-red-200"     },
  brouillon: { label: "Brouillon", Icon: RefreshCw,    pill: "bg-gray-50    text-gray-600    border border-gray-200"    },
};

function InvoiceStatusBadge({ status }) {
  // l'API renvoie invoiceStatus
  const meta = INVOICE_STATUS_META[status] ?? INVOICE_STATUS_META.brouillon;
  const { Icon, label, pill } = meta;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${pill}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Ligne facture ─────────────────────────────────────────────────────────────

function InvoiceRow({ invoice, onPreview, onDownload, onDelete, onDuplicate, index, symbol = "FCFA" }) {
  const clientName    = invoiceClientName(invoice);
  const clientCompany = invoiceClientCompany(invoice);
  const dueDate       = invoiceDueDate(invoice);
  const status        = invoice.invoiceStatus ?? "brouillon";
  const created       = formatDate(invoice.createdAt);
  const updated       = formatDate(invoice.updatedAt !== invoice.createdAt ? invoice.updatedAt : null);
  const hasFile       = !!invoice.file;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-all duration-150 bg-white border border-gray-100 group rounded-xl hover:border-primary/20 hover:shadow-sm"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Icône */}
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-12 border rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-primary/10">
        <Receipt className="w-5 h-5 text-primary/60" />
      </div>

      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-sm font-semibold text-gray-800 truncate">
            {invoice.invoiceNumber ?? `#${invoice.id}`}
          </span>
          {invoice.quoteNumber && (
            <span className="text-[11px] text-gray-400 font-mono">ref. {invoice.quoteNumber}</span>
          )}
          <InvoiceStatusBadge status={status} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11px] text-gray-400">
          {clientName && (
            <span className="font-medium text-gray-600 truncate max-w-[150px]">
              {clientCompany ? `${clientName} — ${clientCompany}` : clientName}
            </span>
          )}
          {invoice.total !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-primary">
              <DollarSign className="w-3 h-3" />
              {Number(invoice.total).toLocaleString("fr-FR")} {symbol}
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
          {dueDate && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> échéance {formatDate(dueDate)}
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
          onClick={() => onPreview(invoice)}
          title="Aperçu / Réutiliser"
        >
          <Eye className="w-4 h-4" />
        </Button>
        {hasFile && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={() => onDownload(invoice)}
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
            <DropdownMenuItem onClick={() => onPreview(invoice)} className="gap-2 text-sm">
              <Eye className="w-4 h-4" /> Aperçu / Réutiliser
            </DropdownMenuItem>
            {hasFile && (
              <DropdownMenuItem onClick={() => onDownload(invoice)} className="gap-2 text-sm">
                <Download className="w-4 h-4" /> Télécharger le PDF
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(invoice)} className="gap-2 text-sm">
              <Copy className="w-4 h-4" /> Dupliquer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(invoice)}
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
          onClick={() => onPreview(invoice)}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-red-400"
          onClick={() => onDelete(invoice)}
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
              ${page === p ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
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
  { val: "ALL",       label: "Tous"       },
  { val: "genere",    label: "Générées"   },
  { val: "envoye",    label: "Envoyées"   },
  { val: "paye",      label: "Payées"     },
  { val: "en_retard", label: "En retard"  },
  { val: "brouillon", label: "Brouillons" },
];

// ── Composant principal ───────────────────────────────────────────────────────

const InvoiceHistoryDialog = ({
  isOpen,
  onClose,
  selectedUser,
  onDuplicateInvoice,
  isLoading = false,
  symbol = "FCFA",
}) => {
  const dispatch                 = useDispatch();
  const invoicesFS               = useSelector(selectInvoices);
  const invoicesFilterFS         = useSelector(selectInvoicesFilter);
  const invoicesPaginationFS     = useSelector(selectInvoicesPagination);

  const [search,         setSearch]         = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("ALL");

  const { showConfirm, DialogComponent } = useDialog();

  // Debounce recherche
  useEffect(() => {
    const handler = setTimeout(() => setDebounceSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Synchronisation filtre Redux
  useEffect(() => {
    dispatch(
      setInvoicesFilter({
        ...invoicesFilterFS,
        search: debounceSearch,
        status: filterStatus === "ALL" ? undefined : filterStatus,
        page: 1,
      })
    );
  }, [debounceSearch, filterStatus]);

  const loadInvoices = () => {
    dispatch(fetchUserInvoices(invoicesFilterFS));
  };

  // Fetch à chaque changement de filtre ou ouverture
  useEffect(() => {
    if (isOpen) loadInvoices();
  }, [invoicesFilterFS, isOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onPreviewInvoice = (invoice) => {
    dispatch(setCurrentInvoice(invoice));
    onClose();
  };

  const onDownloadInvoice = (invoice) => {
    if (!invoice?.file) {
      console.error("Aucun fichier PDF pour cette facture");
      return;
    }
    let base = UPLOADED_FILES_URL;
    if (base && !base.endsWith("/")) base += "/";
    const filePath = invoice.file.startsWith("/") ? invoice.file.substring(1) : invoice.file;
    window.open(`${base}${filePath}`, "_blank", "noopener,noreferrer");
  };

  const handleDeleteInvoice = (invoice) => {
    showConfirm({
      title: "Supprimer la facture",
      message: "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette facture ?",
      variant: "danger",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      icon: Trash2,
      onConfirm: () => deleteAction(invoice.id),
      isLoading: false,
    });
  };

  const deleteAction = async (id) => {
    if (!id) return;
    try {
      const res = await dispatch(deleteInvoice(id));
      if (thunkSucceed(res)) await loadInvoices();
    } catch (err) {
      console.error("Erreur suppression facture :", err);
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setInvoicesFilter({ ...invoicesFilterFS, page: newPage }));
  };

  // ── Données ───────────────────────────────────────────────────────────────

  const { total, page, totalPages } = invoicesPaginationFS ?? {};
  const invoiceList = Array.isArray(invoicesFS) ? invoicesFS : [];

  const payees   = invoiceList.filter(i => i.invoiceStatus === "paye").length;
  const envoyees = invoiceList.filter(i => i.invoiceStatus === "envoye").length;
  const retard   = invoiceList.filter(i => i.invoiceStatus === "en_retard").length;
  const totalTTC = invoiceList.reduce((s, i) => s + (Number(i.total) || 0), 0);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[820px] max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">

        {/* ── En-tête ──────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 bg-white border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              Historique des factures
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
          {invoiceList.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 pt-3 mt-3 border-t border-gray-100">
              <Stat value={payees}   label="payée"     Icon={CreditCard}   color="text-violet-400" bold="text-violet-700" />
              <Sep />
              <Stat value={envoyees} label="envoyée"   Icon={Send}         color="text-sky-400"    bold="text-sky-700"    />
              {retard > 0 && (
                <>
                  <Sep />
                  <Stat value={retard} label="en retard" Icon={XCircle} color="text-red-400" bold="text-red-600" plural={false} />
                </>
              )}
              <Sep />
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-bold text-gray-800">{totalTTC.toLocaleString("fr-FR")}</span>
                <span className="text-gray-400">{symbol}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Filtres ───────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b bg-gray-50">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              className="h-8 pl-8 pr-3 text-xs bg-white border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/30"
              placeholder="N° facture, client…"
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
                    ? "bg-gray-900 text-white shadow-sm"
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
          ) : invoiceList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucune facture trouvée</p>
              {(search || filterStatus !== "ALL") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            invoiceList.map((invoice, i) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                index={i}
                symbol={symbol}
                onPreview={onPreviewInvoice}
                onDownload={onDownloadInvoice}
                onDelete={handleDeleteInvoice}
                onDuplicate={onDuplicateInvoice}
              />
            ))
          )}
        </div>

        {/* ── Pied ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-t">
          <p className="text-xs text-gray-400 shrink-0">
            {total != null ? (
              <>
                <span className="font-semibold text-gray-700">{total}</span> facture{total !== 1 ? "s" : ""}
                {totalPages > 1 && ` · page ${page} / ${totalPages}`}
              </>
            ) : (
              `${invoiceList.length} résultat${invoiceList.length !== 1 ? "s" : ""}`
            )}
          </p>

          <Pagination pagination={invoicesPaginationFS} onPageChange={handlePageChange} />

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

export default InvoiceHistoryDialog;