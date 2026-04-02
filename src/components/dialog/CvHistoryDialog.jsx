import { useEffect, useState } from "react";
import {
  FileText, Download, Eye, Trash2, Clock,
  Sparkles, LayoutTemplate, Calendar, Search,
  AlertCircle, MoreHorizontal, RefreshCw,
  Upload, ChevronLeft, ChevronRight,
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
  deleteCV,
  downloadCv,
  fetchCVsByUser,
  selectCVs,
  selectCVsFilter,
  selectCVsPagination,
  setCurrentCV,
  setCVsFilter,
} from "@/redux/slices/cvSlice";
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

/** Construit un titre lisible depuis les champs du CV */
function cvDisplayName(cv) {
  if (cv.firstName || cv.lastName) {
    return `${cv.firstName ?? ""} ${cv.lastName ?? ""}`.trim();
  }
  if (cv.title) return cv.title;
  if (cv.type === "IMPORTED") return "CV importé";
  return `CV #${cv.id}`;
}

// ── Méta par type ─────────────────────────────────────────────────────────────

const TYPE_META = {
  FIBEM: {
    label: "FIBEM",
    Icon: Sparkles,
    pill: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-500",
  },
  CLASSIC: {
    label: "Classic",
    Icon: LayoutTemplate,
    pill: "bg-sky-50 text-sky-700 border border-sky-200",
    dot: "bg-sky-500",
  },
  IMPORTED: {
    label: "Importé",
    Icon: Upload,
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
};

function TypeBadge({ type }) {
  const meta = TYPE_META[type] ?? TYPE_META.CLASSIC;
  const { Icon, label, pill } = meta;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${pill}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Ligne CV ──────────────────────────────────────────────────────────────────

function CvRow({ cv, onPreview, onDownload, onDelete, onDuplicate, index }) {
  const name     = cvDisplayName(cv);
  const created  = formatDate(cv.createdAt);
  const updated  = formatDate(cv.updatedAt !== cv.createdAt ? cv.updatedAt : null);
  const template = cv.settings?.template;
  const isImported = cv.type === "IMPORTED";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-all duration-150 bg-white border border-gray-100 group rounded-xl hover:border-gray-300 hover:shadow-sm"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Icône */}
      <div className="flex items-center justify-center flex-shrink-0 border border-gray-100 rounded-lg w-9 h-11 bg-gray-50">
        <FileText className="w-4 h-4 text-gray-400" />
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
          <TypeBadge type={cv.type} />
          {cv.isMain && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
              Principal
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11px] text-gray-400">
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
          {template && !isImported && (
            <span className="text-gray-300">·</span>
          )}
          {template && !isImported && (
            <span className="capitalize">{template}</span>
          )}
        </div>
      </div>

      {/* Actions desktop (hover) */}
      <div className="items-center hidden gap-1 transition-opacity opacity-0 sm:flex group-hover:opacity-100">
        {!isImported && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-400 hover:text-primary hover:bg-primary/10"
              onClick={() => onPreview(cv)}
              title="Aperçu"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => onDownload(cv)}
              title="Télécharger"
            >
              <Download className="w-4 h-4" />
            </Button>
          </>
        )}
        {isImported && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={() => onDownload(cv)}
            title="Télécharger le fichier"
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
          <DropdownMenuContent align="end" className="z-[2010]">
            {!isImported && (
              <>
                <DropdownMenuItem onClick={() => onPreview(cv)} className="gap-2 text-sm">
                  <Eye className="w-4 h-4" /> Aperçu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(cv)} className="gap-2 text-sm">
                  <Download className="w-4 h-4" /> Télécharger
                </DropdownMenuItem>
              </>
            )}
            {isImported && (
              <DropdownMenuItem onClick={() => onDownload(cv)} className="gap-2 text-sm">
                <Download className="w-4 h-4" /> Télécharger le fichier
              </DropdownMenuItem>
            )}
            {!isImported && (
              <DropdownMenuItem onClick={() => onDuplicate(cv)} className="gap-2 text-sm">
                <RefreshCw className="w-4 h-4" /> Dupliquer
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(cv)}
              className="gap-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions mobile (toujours visibles) */}
      <div className="flex items-center gap-1 sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400"
          onClick={() => onDownload(cv)}
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-red-400"
          onClick={() => onDelete(cv)}
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

  // Génère les numéros de pages à afficher (window de 5)
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
    if (range[0] > 1) {
      range.unshift("...");
      range.unshift(1);
    }
    if (range[range.length - 1] < totalPages) {
      range.push("...");
      range.push(totalPages);
    }
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
          <span key={`dots-${i}`} className="text-xs text-center text-gray-400 w-7">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-medium transition-colors
              ${page === p
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
              }`}
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

// ── Composant principal ───────────────────────────────────────────────────────

const TYPE_FILTERS = [
  { val: "ALL",      label: "Tous" },
  { val: "FIBEM",    label: "FIBEM" },
  { val: "CLASSIC",  label: "Classic" },
  { val: "IMPORTED", label: "Importé" },
];

const CVHistoryDialog = ({
  isOpen,
  onClose,
  selectedUser,
  onDuplicateCV,
  isLoading = false,
}) => {
  const dispatch              = useDispatch();
  const selectCVsFS           = useSelector(selectCVs);
  const selectCVsFiltersFS    = useSelector(selectCVsFilter);
  const selectCVsPaginationFS = useSelector(selectCVsPagination);

  const [search,         setSearch]         = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [filterType,     setFilterType]     = useState("ALL");

  const { showConfirm, showMessage, DialogComponent } = useDialog();

  // Debounce recherche
  useEffect(() => {
    const handler = setTimeout(() => setDebounceSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Mise à jour des filtres → déclenche le fetch via l'autre useEffect
  useEffect(() => {
    dispatch(
      setCVsFilter({
        ...selectCVsFiltersFS,
        search: debounceSearch,
        type: filterType === "ALL" ? undefined : filterType,
        page: 1, // reset page lors d'un changement de filtre
      })
    );
  }, [debounceSearch, filterType]);

  // Function for load userCV
  const loadCV = async () => {
    dispatch(fetchCVsByUser(selectCVsFiltersFS));
  }

  // Fetch à chaque changement de filtre (inclus changement de page)
  useEffect(() => {
    if (isOpen) {
      loadCV();
    }
  }, [selectCVsFiltersFS, isOpen]);

  const onPreviewCV = (cv) => {
    const response = dispatch(setCurrentCV(cv));

    onClose();
  }

  const onDownloadCV = (cv) => {
    // Ici UPLOADED_FILES_URL doit être défini dans l'env ou quelque part de façon accessible globalement
    if (!cv?.file) {
      console.error("Aucun fichier à télécharger pour ce CV");
      return;
    }
    // S'assurer que UPLOADED_FILES_URL finit par un /, sinon ajoutez-le
    let base = UPLOADED_FILES_URL;
    if (base && !base.endsWith("/")) base += "/";
    // Supprime le premier / du path si présent (pour éviter double //)
    const filePath = cv.file.startsWith("/") ? cv.file.substring(1) : cv.file;
    const url = `${base}${filePath}`;

    /*
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.pdf";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    */
    // Ouvre le PDF dans un nouvel onglet du navigateur
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const handleDeleteCV = (cv) => {
    showConfirm({
      title: "Supprimer le CV",
      message: "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce cv ?",
      variant: "danger",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      icon: Trash2,
      onConfirm: () => deleteAction(cv.id),
      isLoading: false
    })
  };

  const deleteAction = async (id) => {
    if (!id) {
      console.error("Erreur donnees de CV");
      return;
    }

    try {
      const deletionResponse = await dispatch(deleteCV(id));
      if(thunkSucceed(deletionResponse)) {
          await loadCV();
      }
    } catch (err) {
        console.log("ERREUR LORS DE LA SUPPRESSION :", err);
    }
  }

  const handlePageChange = (newPage) => {
    dispatch(
      setCVsFilter({
        ...selectCVsFiltersFS,
        page: newPage,
      })
    );
  };

  const { total, page, totalPages } = selectCVsPaginationFS ?? {};
  const cvList = Array.isArray(selectCVsFS) ? selectCVsFS : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">

        {/* ── En-tête ──────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 bg-white border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              Historique des CVs
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
        </div>

        {/* ── Filtres ───────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b bg-gray-50">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              className="h-8 pl-8 pr-3 text-xs bg-white border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/30"
              placeholder="Rechercher un CV…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtre type */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5">
            {TYPE_FILTERS.map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setFilterType(opt.val)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all
                  ${filterType === opt.val
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
          ) : cvList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Aucun CV trouvé
              </p>
              {(search || filterType !== "ALL") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setFilterType("ALL"); }}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            cvList.map((cv, i) => (
              <CvRow
                key={cv.id}
                cv={cv}
                index={i}
                onPreview={() => onPreviewCV(cv)}
                onDownload={() => onDownloadCV(cv)}
                onDelete={handleDeleteCV}
                onDuplicate={onDuplicateCV}
              />
            ))
          )}
        </div>

        {/* ── Pied ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-t">
          {/* Compteur */}
          <p className="text-xs text-gray-400 shrink-0">
            {total != null ? (
              <>
                <span className="font-semibold text-gray-700">{total}</span> CV{total !== 1 ? "s" : ""}
                {totalPages > 1 && ` · page ${page} / ${totalPages}`}
              </>
            ) : (
              `${cvList.length} résultat${cvList.length !== 1 ? "s" : ""}`
            )}
          </p>

          {/* Pagination */}
          <Pagination
            pagination={selectCVsPaginationFS}
            onPageChange={handlePageChange}
          />

          <Button variant="outline" size="sm" className="text-xs rounded-lg shrink-0" onClick={onClose}>
            Fermer
          </Button>
        </div>
        
        <DialogComponent />
      </DialogContent>
    </Dialog>
  );
};

export default CVHistoryDialog;