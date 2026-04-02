import { useState } from "react";
import {
  FileX, Download, Eye, Trash2, Clock, Send,
  Calendar, Search, AlertCircle, CheckCircle2,
  XCircle, MoreHorizontal, RefreshCw, RotateCcw,
  DollarSign, Copy, Package, AlertTriangle, Check,
  FileText,
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

// ─────────────────────────────────────────────
// MÉTADONNÉES STATUT
// ─────────────────────────────────────────────
const CREDIT_NOTE_STATUS_META = {
  draft:     { label: "Brouillon", icon: RefreshCw,    bg: "bg-gray-50     text-gray-600     border-gray-200"     },
  issued:    { label: "Émis",      icon: Send,          bg: "bg-orange-50   text-orange-700   border-orange-200"   },
  processed: { label: "Traité",    icon: Check,         bg: "bg-emerald-50  text-emerald-700  border-emerald-200"  },
  cancelled: { label: "Annulé",    icon: XCircle,       bg: "bg-red-50      text-red-700      border-red-200"      },
};

// ─────────────────────────────────────────────
// RAISONS LISIBLES
// ─────────────────────────────────────────────
const CREDIT_REASON_LABELS = {
  product_return:    "Retour de marchandise",
  defective_product: "Produit défectueux",
  billing_error:     "Erreur de facturation",
  discount:          "Remise commerciale",
  price_adjustment:  "Ajustement de prix",
  cancelled_order:   "Annulation de commande",
  goodwill:          "Geste commercial",
  other:             "Autre",
};

// ─────────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────────
function CreditNoteStatusBadge({ statut }) {
  const meta = CREDIT_NOTE_STATUS_META[statut] || CREDIT_NOTE_STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${meta.bg}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// LIGNE AVOIR
// ─────────────────────────────────────────────
function CreditNoteRow({ creditNote, onPreview, onDownload, onDelete, onDuplicate, index, symbol = "FCFA" }) {
  const canAct = ["issued", "processed"].includes(creditNote.statut);
  const reasonLabel = CREDIT_REASON_LABELS[creditNote.creditReason] || creditNote.creditReason || "—";

  return (
    <div
      className="flex items-center gap-4 p-4 transition-all duration-200 bg-white border border-gray-100 group rounded-xl hover:border-orange-300/50 hover:bg-orange-50/20"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Icône document */}
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-12 border border-orange-100 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50">
        <RotateCcw className="w-5 h-5 text-orange-500" />
      </div>

      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-800 truncate">
            {creditNote.creditNoteNumber}
          </span>
          <CreditNoteStatusBadge statut={creditNote.statut} />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
          {creditNote.clientName && (
            <span className="font-medium text-gray-600 truncate max-w-[140px]">
              {creditNote.clientName}
            </span>
          )}
          {creditNote.originalInvoiceNumber && (
            <span className="flex items-center gap-1 text-gray-500">
              <FileText className="flex-shrink-0 w-3 h-3" />
              Réf. {creditNote.originalInvoiceNumber}
            </span>
          )}
          {creditNote.creditReason && (
            <span className="flex items-center gap-1 text-gray-500 truncate max-w-[160px]">
              <AlertTriangle className="flex-shrink-0 w-3 h-3" />
              {reasonLabel}
            </span>
          )}
          {creditNote.total !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-orange-600">
              <DollarSign className="w-3 h-3" />
              {creditNote.total.toLocaleString()} {symbol}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {creditNote.dateCreation}
          </span>
        </div>
      </div>

      {/* Actions hover (desktop) */}
      <div className="flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100">
        {canAct && (
          <>
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              onClick={() => onPreview(creditNote)} title="Aperçu"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              onClick={() => onDownload(creditNote)} title="Télécharger"
            >
              <Download className="w-4 h-4" />
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 z-2010">
            {canAct && (
              <>
                <DropdownMenuItem onClick={() => onPreview(creditNote)} className="gap-2 text-sm">
                  <Eye className="w-4 h-4" /> Aperçu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(creditNote)} className="gap-2 text-sm">
                  <Download className="w-4 h-4" /> Télécharger
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onDuplicate(creditNote)} className="gap-2 text-sm">
              <Copy className="w-4 h-4" /> Dupliquer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(creditNote)}
              className="gap-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions mobiles */}
      <div className="flex items-center gap-1 sm:hidden">
        {canAct && (
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onDownload(creditNote)}>
            <Download className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400" onClick={() => onDelete(creditNote)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
const CreditNoteHistoryDialog = ({
  isOpen,
  onClose,
  selectedUser,
  creditNoteHistory = [],
  onPreviewCreditNote,
  onDownloadCreditNote,
  onDeleteCreditNote,
  onDuplicateCreditNote,
  isLoading = false,
  symbol = "FCFA",
}) => {
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [filterReason, setFilterReason] = useState("tous");

  // Filtrage
  const filtered = creditNoteHistory.filter(cn => {
    const term        = search.toLowerCase();
    const matchSearch = (
      cn.creditNoteNumber?.toLowerCase().includes(term)      ||
      cn.clientName?.toLowerCase().includes(term)            ||
      cn.originalInvoiceNumber?.toLowerCase().includes(term)
    );
    const matchStatus = filterStatus === "tous" || cn.statut === filterStatus;
    const matchReason = filterReason === "tous" || cn.creditReason === filterReason;
    return matchSearch && matchStatus && matchReason;
  });

  // Compteurs
  const total     = creditNoteHistory.length;
  const issued    = creditNoteHistory.filter(cn => cn.statut === "issued").length;
  const processed = creditNoteHistory.filter(cn => cn.statut === "processed").length;
  const cancelled = creditNoteHistory.filter(cn => cn.statut === "cancelled").length;
  const totalTTC  = creditNoteHistory
    .filter(cn => cn.total !== undefined && cn.statut !== "cancelled")
    .reduce((s, cn) => s + cn.total, 0);

  // Raisons présentes dans l'historique (pour le filtre dynamique)
  const presentReasons = [...new Set(creditNoteHistory.map(cn => cn.creditReason).filter(Boolean))];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[860px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── En-tête ───────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-orange-50 to-transparent">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              Historique des avoirs
            </DialogTitle>
            {selectedUser && (
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-[9px]">
                    {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedUser.prenom} {selectedUser.nom} — {selectedUser.email}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Résumé chiffré */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-gray-800">{total}</span>
              <span className="text-muted-foreground">avoir{total !== 1 ? "s" : ""} au total</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-sm">
              <Send className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-bold text-gray-800">{issued}</span>
              <span className="text-muted-foreground">émis</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold text-gray-800">{processed}</span>
              <span className="text-muted-foreground">traité{processed !== 1 ? "s" : ""}</span>
            </div>
            {cancelled > 0 && (
              <>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-1.5 text-sm">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-bold text-red-600">{cancelled}</span>
                  <span className="text-muted-foreground">annulé{cancelled !== 1 ? "s" : ""}</span>
                </div>
              </>
            )}
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-bold text-gray-800">{totalTTC.toLocaleString()}</span>
              <span className="text-muted-foreground">{symbol} remboursé{totalTTC !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* ── Filtres ───────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-white border-b">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-sm"
              placeholder="N° avoir, client, facture…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtre statut */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {[
              { val: "tous",      label: "Tous"       },
              { val: "draft",     label: "Brouillons" },
              { val: "issued",    label: "Émis"       },
              { val: "processed", label: "Traités"    },
              { val: "cancelled", label: "Annulés"    },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setFilterStatus(opt.val)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all
                  ${filterStatus === opt.val
                    ? "bg-white shadow-sm text-orange-600"
                    : "text-gray-500 hover:text-gray-700"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Filtre raison (dynamique selon l'historique) */}
          {presentReasons.length > 1 && (
            <select
              value={filterReason}
              onChange={e => setFilterReason(e.target.value)}
              className="h-8 px-2 text-xs text-gray-600 bg-white border rounded-md"
            >
              <option value="tous">Toutes raisons</option>
              {presentReasons.map(r => (
                <option key={r} value={r}>{CREDIT_REASON_LABELS[r] || r}</option>
              ))}
            </select>
          )}
        </div>

        {/* ── Liste ─────────────────────────────── */}
        <div className="flex-1 px-6 py-4 space-y-2 overflow-y-auto bg-gray-50/50">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[72px] rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center mb-3 bg-gray-100 rounded-full w-14 h-14">
                <AlertCircle className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {creditNoteHistory.length === 0
                  ? "Aucun avoir généré pour le moment"
                  : "Aucun résultat pour ces filtres"}
              </p>
              {creditNoteHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setFilterStatus("tous"); setFilterReason("tous"); }}
                  className="mt-2 text-xs text-orange-600 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            filtered.map((cn, i) => (
              <CreditNoteRow
                key={cn.id}
                creditNote={cn}
                index={i}
                symbol={symbol}
                onPreview={onPreviewCreditNote}
                onDownload={onDownloadCreditNote}
                onDelete={onDeleteCreditNote}
                onDuplicate={onDuplicateCreditNote}
              />
            ))
          )}
        </div>

        {/* ── Pied ──────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 bg-white border-t">
          <p className="text-xs text-muted-foreground">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== total && ` sur ${total}`}
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default CreditNoteHistoryDialog;

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLE D'UTILISATION :
//
// <CreditNoteHistoryDialog
//   isOpen={isCreditNoteHistoryOpen}
//   onClose={() => setIsCreditNoteHistoryOpen(false)}
//   symbol="FCFA"
//   creditNoteHistory={[
//     {
//       id: "1",
//       creditNoteNumber:      "AV-202603-0003",
//       clientName:            "Client SA",
//       originalInvoiceNumber: "INV-202602-0042",
//       total:                 75000,
//       statut:                "processed", // "draft"|"issued"|"processed"|"cancelled"
//       creditReason:          "billing_error",
//       dateCreation:          "13/03/2026",
//       url:                   "https://...",
//     },
//   ]}
//   onPreviewCreditNote={(cn)   => window.open(cn.url, "_blank")}
//   onDownloadCreditNote={(cn)  => { /* download logic */ }}
//   onDeleteCreditNote={(cn)    => { /* delete logic  */ }}
//   onDuplicateCreditNote={(cn) => { /* duplicate logic */ }}
// />
// ─────────────────────────────────────────────────────────────────────────────