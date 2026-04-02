import { useState } from "react";
import {
  FileText, Copy, Check, Calendar, Hash, RefreshCw,
  Search, AlertCircle, ChevronRight, FilePlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─────────────────────────────────────────────
// BADGE VERSION (BIS)
// ─────────────────────────────────────────────
function VersionBadge({ version, isSelected }) {
  if (!version || version === 1) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={`
        ml-2 text-xs font-mono
        ${isSelected 
          ? 'border-primary/30 bg-primary/5 text-primary' 
          : 'border-amber-200 bg-amber-50 text-amber-700'}
      `}
    >
      <Copy className="w-3 h-3 mr-1" />
      v{version}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// LIGNE DEVIS
// ─────────────────────────────────────────────
function QuoteRow({ 
  quote, 
  isSelected, 
  onSelect, 
  onViewVersions,
  showVersions = false,
  index 
}) {
  return (
    <div
      className={`
        group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
        ${isSelected 
          ? 'border-primary bg-primary/[0.02] shadow-sm' 
          : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'}
      `}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Indicateur de sélection */}
      <div className={`
        flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all
        ${isSelected 
          ? 'border-primary bg-primary text-white' 
          : 'border-gray-300 group-hover:border-gray-400'}
      `}>
        {isSelected && <Check className="w-3 h-3" />}
      </div>

      {/* Icône document */}
      <div className={`
        flex items-center justify-center flex-shrink-0 w-10 h-12 rounded-lg border
        ${isSelected 
          ? 'bg-primary/10 border-primary/20' 
          : 'bg-amber-50/50 border-amber-200/30'}
      `}>
        <FileText className={`
          w-5 h-5 
          ${isSelected ? 'text-primary' : 'text-amber-600/60'}
        `} />
      </div>

      {/* Infos principales */}
      <div className="flex-1 min-w-0" onClick={() => onSelect(quote)}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`
            font-mono font-semibold truncate
            ${isSelected ? 'text-primary' : 'text-gray-800'}
          `}>
            {quote.numero}
          </span>
          <VersionBadge version={quote.bis} isSelected={isSelected} />
          {quote.estTransforme && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">
              <FilePlus className="w-3 h-3 mr-1" />
              Transformé
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {quote.date}
          </span>
          {quote.clientName && (
            <span className="font-medium text-gray-600 truncate max-w-[200px]">
              {quote.clientName}
            </span>
          )}
          {quote.montant && (
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              {quote.montant.toLocaleString()} FCFA
            </span>
          )}
        </div>
      </div>

      {/* Bouton voir versions si plusieurs existent */}
      {showVersions && quote.versions && quote.versions.length > 1 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewVersions(quote);
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voir les {quote.versions.length} versions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Flèche de sélection (indicative) */}
      <ChevronRight className={`
        w-4 h-4 transition-all
        ${isSelected 
          ? 'text-primary opacity-100' 
          : 'text-gray-300 opacity-0 group-hover:opacity-50'}
      `} />
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
const QuoteSelectionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  quotes = [],
  title = "Sélectionner un devis",
  description = "Choisissez le devis à transformer en facture",
  allowVersionSelection = true,
  selectedQuoteId: externalSelectedId,
  onQuoteSelect,
  isLoading = false,
}) => {
  const [search, setSearch] = useState("");
  const [internalSelectedId, setInternalSelectedId] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});

  // Gestion du mode contrôlé/non-contrôlé
  const selectedId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;
  const setSelectedId = onQuoteSelect || setInternalSelectedId;

  // Filtrage
  const filteredQuotes = quotes.filter(quote => {
    const term = search.toLowerCase();
    return (
      quote.numero?.toLowerCase().includes(term) ||
      quote.clientName?.toLowerCase().includes(term) ||
      (quote.bis && `v${quote.bis}`.includes(term))
    );
  });

  // Grouper les devis par numéro pour afficher les versions
  const groupedQuotes = filteredQuotes.reduce((acc, quote) => {
    const key = quote.numero.split('-v')[0]; // Supposons un format "NUM-vX"
    if (!acc[key]) acc[key] = [];
    acc[key].push(quote);
    return acc;
  }, {});

  // Trier les groupes par date (plus récent d'abord)
  const sortedGroups = Object.entries(groupedQuotes)
    .map(([numero, versions]) => ({
      numero,
      versions: versions.sort((a, b) => (b.bis || 1) - (a.bis || 1)),
      latestVersion: versions[0],
    }))
    .sort((a, b) => new Date(b.latestVersion.date) - new Date(a.latestVersion.date));

  const handleConfirm = () => {
    if (selectedId) {
      const selectedQuote = quotes.find(q => q.id === selectedId);
      onConfirm?.(selectedQuote);
      onClose();
    }
  };

  const handleSelectQuote = (quote) => {
    setSelectedId(quote.id);
  };

  const toggleVersions = (quote) => {
    setExpandedVersions(prev => ({
      ...prev,
      [quote.numero]: !prev[quote.numero]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        
        {/* En-tête */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-amber-50/50 to-transparent">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-800">
              <FileText className="w-5 h-5 text-amber-600" />
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Barre de recherche */}
          <div className="relative mt-4">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher par numéro, client, version..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Liste des devis */}
        <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto bg-gray-50/30">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[72px] rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center mb-3 bg-gray-100 rounded-full w-14 h-14">
                <AlertCircle className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {quotes.length === 0
                  ? "Aucun devis disponible"
                  : "Aucun résultat pour cette recherche"}
              </p>
              {quotes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs text-amber-600 hover:underline"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          ) : allowVersionSelection ? (
            // Affichage groupé avec versions
            sortedGroups.map((group) => (
              <div key={group.numero} className="space-y-1">
                {/* Version principale (la plus récente) */}
                <QuoteRow
                  quote={group.latestVersion}
                  isSelected={selectedId === group.latestVersion.id}
                  onSelect={handleSelectQuote}
                  onViewVersions={toggleVersions}
                  showVersions={group.versions.length > 1}
                  index={0}
                />
                
                {/* Versions antérieures (expandées) */}
                {expandedVersions[group.numero] && group.versions.slice(1).map((version, idx) => (
                  <div key={version.id} className="pl-4 ml-8 border-l-2 border-amber-200">
                    <QuoteRow
                      quote={version}
                      isSelected={selectedId === version.id}
                      onSelect={handleSelectQuote}
                      index={idx + 1}
                    />
                  </div>
                ))}
              </div>
            ))
          ) : (
            // Affichage simple (sans grouping)
            filteredQuotes.map((quote, i) => (
              <QuoteRow
                key={quote.id}
                quote={quote}
                isSelected={selectedId === quote.id}
                onSelect={handleSelectQuote}
                index={i}
              />
            ))
          )}
        </div>

        {/* Pied avec actions */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 bg-white border-t">
          <p className="text-xs text-muted-foreground">
            {filteredQuotes.length} devis trouvé{filteredQuotes.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              size="sm" 
              onClick={handleConfirm}
              disabled={!selectedId}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Confirmer la sélection
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default QuoteSelectionDialog;