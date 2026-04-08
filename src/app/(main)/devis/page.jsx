"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, User, Mail, Phone, Building2, MapPin,
  Calendar, Clock, Package, Plus, Minus, Trash2,
  Send, Download, CheckCircle, AlertCircle, Briefcase,
  CreditCard, FileCheck, Receipt, Hash, Edit2, Eye,
  Printer, Loader2, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, Copy, RefreshCw, DollarSign, Info, BookOpen,
  Percent, FileSpreadsheet,
} from "lucide-react";
import {
  selectCurrentQuote, selectQuoteLoading, selectQuoteError,
  createQuote, updateQuoteById,
  generateQuoteFiles, sendQuoteByEmail, clearQuote, clearError,
  fetchQuoteById,
} from "@/redux/slices/quoteSlice";
import { useCurrency } from "@/context/CurrencyContext";
import QuoteHistoryDialog from "@/components/dialog/QuoteHistoryDialog";
import { useAppMainContext } from "@/context/AppProvider";
import { useAuth } from "@/hooks/useAuth";
import { UPLOADED_FILES_URL } from "@/api/axios";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────
// ÉTAPES DU WIZARD
// ─────────────────────────────────────────────
const STEPS = [
  { id: "client",   icon: User       },
  { id: "emetteur", icon: Building2  },
  { id: "project",  icon: Briefcase  },
  { id: "items",    icon: Package    },
  { id: "payment",  icon: CreditCard },
  { id: "notes",    icon: FileCheck  },
  { id: "preview",  icon: Eye        },
];

// ─────────────────────────────────────────────
// NOTICE D'AIDE
// ─────────────────────────────────────────────
const HelpNotice = ({ tips, title = "Conseils", variant = "info" }) => {
  const [open, setOpen] = useState(false);
  const colors = {
    info:    { bg: "bg-blue-50 border-blue-200",   icon: "text-blue-500",  title: "text-blue-700"  },
    success: { bg: "bg-green-50 border-green-200", icon: "text-green-500", title: "text-green-700" },
    warning: { bg: "bg-amber-50 border-amber-200", icon: "text-amber-500", title: "text-amber-700" },
  };
  const c = colors[variant] || colors.info;
  return (
    <div className={`border rounded-lg ${c.bg} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full p-3 text-sm font-medium ${c.title}`}
      >
        <div className="flex items-center gap-2">
          <Info className={`w-4 h-4 ${c.icon}`} />
          {title}
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-3 space-y-1 overflow-hidden text-sm text-gray-700"
          >
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.icon.replace("text-", "bg-")}`} />
                {tip}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// BARRE DE PROGRESSION
// ─────────────────────────────────────────────
const ProgressBar = ({ steps, currentStep, onNavigate, t }) => {
  const pct = Math.round((currentStep / (steps.length - 1)) * 100);
  return (
    <div className="sticky space-y-3 top-20 md:top-24">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {t("quote.progress.step_label", "Étape")} {currentStep + 1} / {steps.length} — <span className="text-emerald-600">{t(`quote.steps.${steps[currentStep]?.id}`, steps[currentStep]?.id)}</span>
        </span>
        <span className="font-semibold text-emerald-600">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const done   = i < currentStep;
          const active = i === currentStep;
          const Icon   = step.icon;
          const label = t(`quote.steps.${step.id}`, step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onNavigate(i)}
              title={label}
              className={`flex flex-col items-center gap-1 transition-all ${
                active ? "text-emerald-600" : done ? "text-emerald-400" : "text-gray-300"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                active ? "border-emerald-500 bg-emerald-50" : done ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="hidden text-xs sm:block">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
const QuotePage = ({ params }) => {
  const router = useRouter();
  const quoteId = params?.id;
  const quoteRef = useRef(null);
  const dispatch = useDispatch();
  const { t } = useLanguage();

  // Redux
  const currentQuote = useSelector(selectCurrentQuote);
  const loading = useSelector(selectQuoteLoading);
  const error = useSelector(selectQuoteError);

  // États locaux
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isQuoteHistoryOpen, setIsQuoteHistoryOpen] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState("DRAFT");
  const [logoPreview, setLogoPreview] = useState("");

  const { symbol } = useCurrency();
  const { setIsViewLocked } = useAppMainContext();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn()) setIsViewLocked(true);
  }, [isLoggedIn, setIsViewLocked]);

  // ── Numéro de devis ─────────────────────────
  const generateQuoteNumber = () => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const rnd = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
    return `DEV-${yr}${mo}-${rnd}`;
  };

  // ── Formulaire ──────────────────────────────
  const [formData, setFormData] = useState({
    quoteNumber: generateQuoteNumber(),
    bisNumber: "",
    firstName: "Samuel",
    lastName: "Bikoko",
    company: "Bikoko Génie Civil SARL",
    email: "s.bikoko@bgc-cm.com",
    phone: "+237 6 71 23 45 67",
    address: "123 Rue Paul Biya",
    city: "Douala",
    postalCode: "CM-237",
    quoteType: "1",
    companyName: "Sté SEN FIBEM France",
    companyContact: "Mr GOMIS",
    companyAddress: "51 Rue du Grevarin",
    companyCity: "27200 Vernon",
    companyPhone: "",
    companyPort: "07.52.49.75.46",
    companyEmail: "senfibem.paris@outlook.com",
    companySiret: "445 374 937 00032",
    companyApe: "4120B Travaux Bâtiment & Industrie",
    companyTva: "FR17378128441",
    companyLogo: "",
    contactBE: "",
    projectName: "Construction Résidence Makepe",
    projectDescription: "Projet de construction d'une résidence moderne à Makepe, Douala.",
    startDate: new Date().toISOString().split("T")[0],
    deadline: "",
    budget: "9500000",
    category: "construction",
    taxRate: 19.25,
    discountRate: 0,
    deposit: 0,
    depositType: "percentage",
    validUntil: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0]; })(),
    additionalNotes: "- 30 % à verser 1 semaine après le démarrage du Technicien\n- 70 % à la fin du 1er mois",
    termsAndConditions: "Ce devis est valable 30 jours. Le paiement est exigible selon les conditions ci-dessus.",
    paymentMethod: "",
  });

  const [quoteItems, setQuoteItems] = useState([
    {
      id: 1,
      description: "Fourniture et pose de fondations en béton armé",
      quantity: 10,
      unitPrice: 75000,
      discount: 0,
      taxRate: 19.25,
      total: 750000,
      tpsMO: "1,0h",
      unite: "Ens",
    },
  ]);

  const categories = [
    { value: "development",  label: "quote.project_step.categories.development",  icon: "💻" },
    { value: "design",       label: "quote.project_step.categories.design",       icon: "🎨" },
    { value: "marketing",    label: "quote.project_step.categories.marketing",    icon: "📱" },
    { value: "consulting",   label: "quote.project_step.categories.consulting",   icon: "📊" },
    { value: "delivery",     label: "quote.project_step.categories.delivery",     icon: "🚚" },
    { value: "construction", label: "quote.project_step.categories.construction", icon: "🏗️" },
    { value: "renovation",   label: "quote.project_step.categories.renovation",   icon: "🔨" },
    { value: "other",        label: "quote.project_step.categories.other",        icon: "📦" },
  ];

  const quoteTypes = [
    { value: "0",  label: "quote.quote_types.0"  },
    { value: "1",  label: "quote.quote_types.1"  },
    { value: "2",  label: "quote.quote_types.2"  },
    { value: "3",  label: "quote.quote_types.3"  },
    { value: "4",  label: "quote.quote_types.4"  },
    { value: "5",  label: "quote.quote_types.5"  },
    { value: "6",  label: "quote.quote_types.6"  },
    { value: "7",  label: "quote.quote_types.7"  },
    { value: "8",  label: "quote.quote_types.8"  },
    { value: "9",  label: "quote.quote_types.9"  },
    { value: "10", label: "quote.quote_types.10" },
  ];

  const unites = ["Ens", "h", "j", "m²", "m³", "ml", "u", "kg", "t", "forfait"];
  const uniteLabels = {
    "Ens": "quote.items_step.units.ens",
    "h": "quote.items_step.units.h",
    "j": "quote.items_step.units.j",
    "m²": "quote.items_step.units.m2",
    "m³": "quote.items_step.units.m3",
    "ml": "quote.items_step.units.ml",
    "u": "quote.items_step.units.u",
    "kg": "quote.items_step.units.kg",
    "t": "quote.items_step.units.t",
    "forfait": "quote.items_step.units.forfait"
  };

  // ── Chargement édition ──────────────────────
  useEffect(() => {
    if (quoteId) dispatch(fetchQuoteById(quoteId));
  }, [quoteId, dispatch]);

  useEffect(() => {
    if (currentQuote) {
      setFormData({
        quoteNumber: currentQuote.quoteNumber || generateQuoteNumber(),
        bisNumber: currentQuote.bisNumber || "",
        firstName: currentQuote.firstName || "",
        lastName: currentQuote.lastName || "",
        company: currentQuote.company || "",
        email: currentQuote.email || "",
        phone: currentQuote.phone || "",
        address: currentQuote.address || "",
        city: currentQuote.city || "",
        postalCode: currentQuote.postalCode || "",
        quoteType: currentQuote.quoteType || "",
        companyName: currentQuote.companyName || "",
        companyContact: currentQuote.companyContact || "",
        companyAddress: currentQuote.companyAddress || "",
        companyCity: currentQuote.companyCity || "",
        companyPhone: currentQuote.companyPhone || "",
        companyPort: currentQuote.companyPort || "",
        companyEmail: currentQuote.companyEmail || "",
        companySiret: currentQuote.companySiret || "",
        companyApe: currentQuote.companyApe || "",
        companyTva: currentQuote.companyTva || "",
        companyLogo: currentQuote.companyLogo || "",
        contactBE: currentQuote.contactBE || "",
        projectName: currentQuote.projectName || "",
        projectDescription: currentQuote.projectDescription || "",
        startDate: currentQuote.startDate || "",
        deadline: currentQuote.deadline || "",
        budget: currentQuote.budget || "",
        category: currentQuote.category || "",
        taxRate: currentQuote.taxRate || 19.25,
        discountRate: currentQuote.discountRate || 0,
        deposit: currentQuote.deposit || 0,
        depositType: currentQuote.depositType || "percentage",
        validUntil: currentQuote.validUntil || "",
        additionalNotes: currentQuote.additionalNotes || "",
        termsAndConditions: currentQuote.termsAndConditions || "",
        paymentMethod: currentQuote.paymentMethod || "",
      });
      if (currentQuote.quoteItems) setQuoteItems(currentQuote.quoteItems);
      if (currentQuote.quoteStatus) setQuoteStatus(currentQuote.quoteStatus);
      if (currentQuote.companyLogo) {
        setLogoPreview(
          currentQuote.companyLogo.startsWith("http")
            ? currentQuote.companyLogo
            : `${window.location.origin}/${currentQuote.companyLogo.replace(/^\/+/, "")}`
        );
      }
    }
  }, [currentQuote]);

  useEffect(() => {
    if (error) {
      const tTimeout = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(tTimeout);
    }
  }, [error, dispatch]);

  // ── Formulaire handler ──────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Articles handlers ───────────────────────
  const addQuoteItem = () => {
    const newId = Math.max(...quoteItems.map(i => i.id), 0) + 1;
    setQuoteItems([...quoteItems, {
      id: newId,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 19.25,
      total: 0,
      tpsMO: "1,0h",
      unite: "Ens",
    }]);
  };

  const updateQuoteItem = (id, field, value) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id !== id) return item;
      const u = { ...item, [field]: value };
      const qty = parseFloat(field === "quantity" ? value : u.quantity) || 0;
      const price = parseFloat(field === "unitPrice" ? value : u.unitPrice) || 0;
      const disc = parseFloat(field === "discount" ? value : u.discount) || 0;
      const base = qty * price;
      u.total = base - base * (disc / 100);
      return u;
    }));
  };

  const removeQuoteItem = (id) => {
    if (quoteItems.length > 1) setQuoteItems(quoteItems.filter(i => i.id !== id));
  };

  const duplicateQuoteItem = (id) => {
    const item = quoteItems.find(i => i.id === id);
    if (!item) return;
    const newId = Math.max(...quoteItems.map(i => i.id), 0) + 1;
    setQuoteItems([...quoteItems, { ...item, id: newId }]);
  };

  const moveItem = (index, dir) => {
    const items = [...quoteItems];
    const newIndex = dir === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < items.length) {
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      setQuoteItems(items);
    }
  };

  // ── Calculs ─────────────────────────────────
  const subtotal = quoteItems.reduce((s, i) => s + i.total, 0);
  const discountAmount = subtotal * ((parseFloat(formData.discountRate) || 0) / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * ((parseFloat(formData.taxRate) || 0) / 100);
  const total = subtotalAfterDiscount + taxAmount;
  const depositAmount = formData.depositType === "percentage"
    ? total * ((parseFloat(formData.deposit) || 0) / 100)
    : parseFloat(formData.deposit) || 0;
  const remainingAmount = total - depositAmount;

  // ── Validation ──────────────────────────────
  const isFormValid = () => {
    const ok = ["firstName", "lastName", "email", "phone", "projectName", "companyName"]
      .every(f => formData[f]?.toString().trim() !== "");
    const itemsOk = quoteItems.every(i => i.description?.trim() && i.unitPrice > 0);
    return ok && itemsOk;
  };

  const canGoNext = () => {
    switch (STEPS[currentStep].id) {
      case "client": return formData.firstName && formData.lastName && formData.email && formData.phone;
      case "emetteur": return formData.companyName?.trim() !== "";
      case "project": return formData.projectName?.trim() !== "";
      case "items": return quoteItems.length > 0 && quoteItems.every(i => i.description?.trim() && i.unitPrice > 0);
      default: return true;
    }
  };

  // ── Navigation ──────────────────────────────
  const goNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1); };
  const goPrev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const goTo = (i) => setCurrentStep(i);

  // ── Actions ─────────────────────────────────
  const handleGenerateQuote = async (format = "pdf") => {
    setIsGenerating(true);
    try {
      const payload = {
        ...formData,
        quoteItems: quoteItems.map(({ id, ...i }) => i),
        quoteStatus,
        subtotal, taxAmount, discountAmount, total, depositAmount, remainingAmount,
      };
      let quoteIdResult;
      if (currentQuote?.id) {
        await dispatch(updateQuoteById({ id: currentQuote.id, data: payload })).unwrap();
        quoteIdResult = currentQuote.id;
      } else {
        const res = await dispatch(createQuote(payload)).unwrap();
        quoteIdResult = res.content.id;
      }
      if (!quoteIdResult) throw new Error("ID du devis introuvable");
      const genRes = await dispatch(generateQuoteFiles({ id: quoteIdResult, format: "all" })).unwrap();
      if(format == "pdf") {
          if (genRes.content?.pdf?.url) window.open(genRes.content.pdf.url, "_blank");
        } else {
          if (genRes.content?.xlsx?.url) window.open(genRes.content.xlsx.url, "_blank");
      }
      setCurrentStep(STEPS.length - 1);
    } catch (err) {
      console.error(err);
      alert(t("quote.alerts.error_generating", "Erreur lors de la génération du devis"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (currentQuote?.id) {
      setIsGenerating(true);
      try {
        const res  = await dispatch(fetchQuoteById(currentQuote.id)).unwrap();
        if(res.content?.files?.pdf) {
            const a = document.createElement("a");
            a.href = `${UPLOADED_FILES_URL}${res.content.files.pdf}`;
            a.download = `Devis_${res.content.quoteNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      await handleGenerateQuote();
    }
  };

  const handleDownloadXlsx = async () => {
    if (currentQuote?.id) {
      setIsGenerating(true);
      try {
        const res  = await dispatch(fetchQuoteById(currentQuote.id)).unwrap();
        if(res.content?.files?.xlsx) {
            const a = document.createElement("a");
            a.href = `${UPLOADED_FILES_URL}${res.content.files.xlsx}`;
            a.download = `Devis_${res.content.quoteNumber}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      await handleGenerateQuote("xlsx");
    }
  };

  const handleSendEmail = async () => {
    if (!currentQuote?.id) {
      alert(t("quote.alerts.generate_first", "Veuillez d'abord générer le devis"));
      return;
    }
    if (!formData.email) {
      alert(t("quote.alerts.email_required", "Veuillez renseigner l'email du client"));
      return;
    }
    setIsSending(true);
    try {
      await dispatch(sendQuoteByEmail({
        id: currentQuote.id,
        email: formData.email,
        message: `Veuillez trouver ci-joint le devis ${formData.quoteNumber}`,
      })).unwrap();
      alert(t("quote.alerts.email_sent", "Devis envoyé avec succès"));
      setQuoteStatus("sent");
    } catch {
      alert(t("quote.alerts.email_error", "Erreur lors de l'envoi du devis"));
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    dispatch(clearQuote());
    setFormData(prev => ({
      ...prev,
      quoteNumber: generateQuoteNumber(),
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      quoteType: "",
      projectName: "",
      projectDescription: "",
      startDate: new Date().toISOString().split("T")[0],
      deadline: "",
      budget: "",
      category: "",
      taxRate: 19.25,
      discountRate: 0,
      deposit: 0,
      depositType: "percentage",
      validUntil: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0]; })(),
      additionalNotes: "",
      termsAndConditions: "",
    }));
    setQuoteItems([{
      id: 1,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 19.25,
      total: 0,
      tpsMO: "1,0h",
      unite: "Ens",
    }]);
    setQuoteStatus("DRAFT");
    setCurrentStep(0);
  };

  // ── Badge statut ────────────────────────────
  const getStatusBadge = () => {
    const statusKey = {
      DRAFT: "quote.status.draft",
      SENT: "quote.status.sent",
      ACCEPTED: "quote.status.accepted",
      REJECTED: "quote.status.rejected",
      EXPIRED: "quote.status.expired",
    };
    const cfg = {
      DRAFT: { className: "bg-gray-100 text-gray-700" },
      SENT: { className: "bg-blue-100 text-blue-700" },
      ACCEPTED: { className: "bg-emerald-100 text-emerald-700" },
      REJECTED: { className: "bg-red-100 text-red-700" },
      EXPIRED: { className: "bg-orange-100 text-orange-700" },
    };
    const c = cfg[quoteStatus] || cfg.DRAFT;
    const label = t(statusKey[quoteStatus] || "quote.status.draft", quoteStatus);
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.className}`}>{label}</span>;
  };

  // ════════════════════════════════════════════
  // RENDU DES ÉTAPES
  // ════════════════════════════════════════════
  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "client":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("quote.client_step.title", "Informations client")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("quote.client_step.subtitle", "Renseignez les coordonnées du client destinataire du devis.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("quote.help_notice.info_title", "À savoir")} 
              tips={t("quote.client_step.tips", [
                "Le prénom, le nom, l'email et le téléphone sont obligatoires.",
                "L'entreprise est facultative mais recommandée pour les devis B2B.",
                "Le type de devis permet de catégoriser la nature des travaux.",
              ])} 
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("quote.client_step.first_name", "Prénom")} *</Label>
                <div className="relative">
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t("quote.client_step.first_name_placeholder", "Samuel")} required />
                  <User className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("quote.client_step.last_name", "Nom")} *</Label>
                <div className="relative">
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t("quote.client_step.last_name_placeholder", "Dupont")} required />
                  <User className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("quote.client_step.email", "Email")} *</Label>
                <div className="relative">
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder={t("quote.client_step.email_placeholder", "contact@email.com")} required />
                  <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("quote.client_step.phone", "Téléphone")} *</Label>
                <div className="relative">
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t("quote.client_step.phone_placeholder", "+237 6XX XX XX XX")} required />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company">{t("quote.client_step.company", "Entreprise cliente")}</Label>
                <div className="relative">
                  <Input id="company" name="company" value={formData.company} onChange={handleInputChange} placeholder={t("quote.client_step.company_placeholder", "Nom de l'entreprise cliente")} />
                  <Building2 className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="quoteType">{t("quote.client_step.quote_type", "Type de devis")}</Label>
                <select
                  id="quoteType"
                  name="quoteType"
                  value={formData.quoteType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  <option value="">{t("quote.client_step.select_quote_type", "Sélectionnez un type")}</option>
                  {quoteTypes.map(tType => <option key={tType.value} value={tType.value}>{t(`quote.quote_types.${tType.value}`, tType.value)}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t("quote.client_step.address", "Adresse")}</Label>
                <div className="relative">
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder={t("quote.client_step.address_placeholder", "123 Rue de la République")} />
                  <MapPin className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t("quote.client_step.city", "Ville")}</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder={t("quote.client_step.city_placeholder", "Douala")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t("quote.client_step.postal_code", "Code postal / BP")}</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder={t("quote.client_step.postal_code_placeholder", "BP 456")} />
              </div>
            </div>
          </div>
        );

      case "emetteur":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("quote.emitter_step.title", "Votre entreprise (émetteur)")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("quote.emitter_step.subtitle", "Ces informations apparaîtront dans le bloc prestataire du devis.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("quote.help_notice.tips_title", "Conseils")} 
              tips={t("quote.emitter_step.tips", [
                "Le nom de l'entreprise est obligatoire.",
                "Le logo sera affiché en haut à gauche du devis PDF.",
                "SIRET, APE et N° TVA apparaissent dans le bloc prestataire.",
              ])} 
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">{t("quote.emitter_step.company_name", "Nom de l'entreprise")} *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.company_name_placeholder", "Sté SEN FIBEM France")}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyContact">{t("quote.emitter_step.company_contact", "Contact / Interlocuteur")}</Label>
                <Input
                  id="companyContact"
                  name="companyContact"
                  value={formData.companyContact}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.company_contact_placeholder", "Mr GOMIS")}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyAddress">{t("quote.emitter_step.company_address", "Adresse")}</Label>
                <Input
                  id="companyAddress"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.company_address_placeholder", "51 Rue du Grevarin")}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyCity">{t("quote.emitter_step.company_city", "Ville (avec code postal)")}</Label>
                <Input
                  id="companyCity"
                  name="companyCity"
                  value={formData.companyCity}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.company_city_placeholder", "27200 Vernon")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">{t("quote.emitter_step.company_phone", "Téléphone fixe")}</Label>
                <div className="relative">
                  <Input
                    id="companyPhone"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleInputChange}
                    placeholder={t("quote.emitter_step.company_phone_placeholder", "+33 1 XX XX XX XX")}
                  />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPort">{t("quote.emitter_step.company_port", "Portable")}</Label>
                <div className="relative">
                  <Input
                    id="companyPort"
                    name="companyPort"
                    value={formData.companyPort}
                    onChange={handleInputChange}
                    placeholder={t("quote.emitter_step.company_port_placeholder", "07.52.49.75.46")}
                  />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyEmail">{t("quote.emitter_step.company_email", "Email")}</Label>
                <div className="relative">
                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    placeholder={t("quote.emitter_step.company_email_placeholder", "contact@votreentreprise.com")}
                  />
                  <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySiret">{t("quote.emitter_step.company_siret", "SIRET")}</Label>
                <Input
                  id="companySiret"
                  name="companySiret"
                  value={formData.companySiret}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.company_siret_placeholder", "445 374 937 00032")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyApe">{t("quote.emitter_step.company_ape", "Code APE")}</Label>
                <Input
                  id="companyApe"
                  name="companyApe"
                  value={formData.companyApe}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.company_ape_placeholder", "4120B Travaux Bâtiment & Industrie")}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyTva">{t("quote.emitter_step.company_tva", "N° TVA intracommunautaire")}</Label>
                <Input
                  id="companyTva"
                  name="companyTva"
                  value={formData.companyTva}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.company_tva_placeholder", "FR17378128441")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactBE">{t("quote.emitter_step.contact_be", "Contact B.E. (référence interne)")}</Label>
                <Input
                  id="contactBE"
                  name="contactBE"
                  value={formData.contactBE}
                  onChange={handleInputChange}
                  placeholder={t("quote.emitter_step.contact_be_placeholder", "Réf. bureau d'études")}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyLogo">{t("quote.emitter_step.company_logo", "Logo de l'entreprise")}</Label>
                <Input
                  id="companyLogo"
                  name="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setFormData(f => ({ ...f, companyLogo: file }));
                        setLogoPreview(ev.target?.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setFormData(f => ({ ...f, companyLogo: "" }));
                      setLogoPreview("");
                    }
                  }}
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt={t("quote.emitter_step.logo_preview", "Aperçu logo")}
                      className="border rounded max-h-16"
                      style={{ objectFit: "contain", background: "#f9f9f9", padding: 2 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "project":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("quote.project_step.title", "Détails du projet")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("quote.project_step.subtitle", "Décrivez le projet à réaliser pour ce devis.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("quote.help_notice.tips_title", "Conseils")} 
              tips={t("quote.project_step.tips", [
                "Le nom du projet est obligatoire.",
                "Une description claire rassure le client sur votre compréhension du besoin.",
                "La date de validité est automatiquement fixée à 30 jours mais peut être modifiée.",
              ])} 
            />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">{t("quote.project_step.project_name", "Nom du projet")} *</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder={t("quote.project_step.project_name_placeholder", "Ex : Construction Résidence Makepe")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("quote.project_step.category", "Catégorie")}</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  <option value="">{t("quote.project_step.select_category", "Sélectionnez une catégorie")}</option>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.icon} {t(c.label, c.value)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">{t("quote.project_step.project_description", "Description du projet")}</Label>
                <Textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t("quote.project_step.project_description_placeholder", "Décrivez le projet en détail...")}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("quote.project_step.start_date", "Date de début prévue")}</Label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                    <Calendar className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">{t("quote.project_step.deadline", "Date limite du projet")}</Label>
                  <div className="relative">
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleInputChange}
                    />
                    <Clock className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">{t("quote.project_step.budget", "Budget estimé")} ({symbol})</Label>
                  <div className="relative">
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="500000"
                    />
                    <DollarSign className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">{t("quote.project_step.valid_until", "Devis valable jusqu'au")}</Label>
                  <div className="relative">
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                    />
                    <Calendar className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "items":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t("quote.items_step.title", "Articles du devis")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("quote.items_step.subtitle", "Listez les prestations ou fournitures à chiffrer.")}</p>
              </div>
              <Badge variant="outline">{quoteItems.length} {t("quote.items_step.items_count", "article(s)")}</Badge>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("quote.help_notice.tips_title", "Conseils")} 
              tips={t("quote.items_step.tips", [
                "Chaque article doit avoir une description et un prix unitaire.",
                "Temps M.O. : durée main d'œuvre (ex: 1,0h). Unité : Ens, h, m², etc.",
                "La remise par ligne est en pourcentage.",
                "Utilisez les flèches ↑↓ pour réordonner les articles.",
              ])} 
            />
            <div className="space-y-4">
              {quoteItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 space-y-3 border rounded-xl bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{t("quote.items_step.article", "Article")} {index + 1}</Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-gray-400"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === quoteItems.length - 1}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-gray-400"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => duplicateQuoteItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
                        title={t("quote.items_step.duplicate", "Dupliquer")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {quoteItems.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeQuoteItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-red-500 hover:bg-red-50"
                          title={t("quote.items_step.delete", "Supprimer")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("quote.items_step.description", "Description")} *</Label>
                    <Input
                      value={item.description}
                      onChange={e => updateQuoteItem(item.id, "description", e.target.value)}
                      placeholder={t("quote.items_step.description_placeholder", "Ex : Fourniture et pose de carrelage")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-2">
                      <Label>{t("quote.items_step.time_mo", "Temps M.O.")}</Label>
                      <Input
                        value={item.tpsMO}
                        placeholder={t("quote.items_step.time_mo_placeholder", "1,0h")}
                        onChange={e => updateQuoteItem(item.id, "tpsMO", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("quote.items_step.unit", "Unité")}</Label>
                      <select
                        value={item.unite}
                        onChange={e => updateQuoteItem(item.id, "unite", e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm border rounded-md"
                      >
                        {unites.map(u => <option key={u} value={u}>{t(uniteLabels[u], u)}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("quote.items_step.quantity", "Quantité")}</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 w-8 h-8 p-0"
                          onClick={() => updateQuoteItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          min="1"
                          step="0.01"
                          className="px-1 text-center"
                          onChange={e => updateQuoteItem(item.id, "quantity", Math.max(1, parseFloat(e.target.value) || 1))}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 w-8 h-8 p-0"
                          onClick={() => updateQuoteItem(item.id, "quantity", item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("quote.items_step.unit_price", "Prix U.")} ({symbol})</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        min="0"
                        step="100"
                        onChange={e => updateQuoteItem(item.id, "unitPrice", Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>{t("quote.items_step.discount", "Remise %")}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={item.discount}
                          min="0"
                          max="100"
                          step="1"
                          onChange={e => updateQuoteItem(item.id, "discount", Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        />
                        <Percent className="absolute w-3 h-3 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("quote.items_step.tax", "TVA %")}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={item.taxRate}
                          min="0"
                          step="0.01"
                          onChange={e => updateQuoteItem(item.id, "taxRate", Math.max(0, parseFloat(e.target.value) || 0))}
                        />
                        <Percent className="absolute w-3 h-3 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("quote.items_step.total_ht", "Total HT")}</Label>
                      <div className="flex items-center h-10 px-3 py-2 text-sm font-semibold bg-white border rounded-lg text-emerald-600">
                        {item.total.toLocaleString()} {symbol}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button type="button" onClick={addQuoteItem} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" /> {t("quote.items_step.add_item", "Ajouter un article")}
            </Button>

            <div className="p-4 space-y-2 border rounded-xl bg-emerald-50/50">
              <h4 className="text-sm font-semibold text-emerald-700">{t("quote.items_step.summary", "Récapitulatif articles")}</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("quote.items_step.subtotal_ht", "Sous-total HT")}</span>
                <span>{subtotal.toLocaleString()} {symbol}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>{t("quote.items_step.total_before_discount", "Total avant remise globale")}</span>
                <span className="text-emerald-600">{subtotal.toLocaleString()} {symbol}</span>
              </div>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("quote.payment_step.title", "Paramètres de paiement")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("quote.payment_step.subtitle", "Configurez la TVA globale, la remise et l'acompte.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("quote.help_notice.tips_title", "Conseils")} 
              tips={t("quote.payment_step.tips", [
                "La TVA au Cameroun est de 19,25% (taux officiel). En France : 20%.",
                "La remise globale s'applique sur le sous-total de tous les articles.",
                "L'acompte peut être un montant fixe ou un pourcentage du total TTC.",
              ])} 
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxRate">{t("quote.payment_step.global_tax", "TVA globale (%)")}</Label>
                <div className="relative">
                  <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <Percent className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountRate">{t("quote.payment_step.global_discount", "Remise globale (%)")}</Label>
                <div className="relative">
                  <Input
                    id="discountRate"
                    name="discountRate"
                    type="number"
                    value={formData.discountRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                  />
                  <Percent className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">{t("quote.payment_step.deposit", "Acompte")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="deposit"
                    name="deposit"
                    type="number"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    min="0"
                    step={formData.depositType === "percentage" ? "1" : "1000"}
                    className="flex-1"
                  />
                  <select
                    name="depositType"
                    value={formData.depositType}
                    onChange={handleInputChange}
                    className="w-24 px-3 py-2 text-sm border rounded-md"
                  >
                    <option value="percentage">{t("quote.payment_step.percentage", "%")}</option>
                    <option value="fixed">{t("quote.payment_step.fixed", "Montant fixe")}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("quote.payment_step.financial_summary", "Récapitulatif financier")}</Label>
                <div className="p-3 space-y-1.5 rounded-lg bg-gray-50 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("quote.payment_step.subtotal_ht", "Sous-total HT")}</span>
                    <span className="font-medium">{subtotal.toLocaleString()} {symbol}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("quote.payment_step.discount", "Remise")} ({formData.discountRate}%)</span>
                      <span className="font-medium text-green-600">-{discountAmount.toLocaleString()} {symbol}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("quote.payment_step.total_ht", "Total HT")}</span>
                    <span className="font-medium">{subtotalAfterDiscount.toLocaleString()} {symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("quote.payment_step.tax_amount", "TVA")} ({formData.taxRate}%)</span>
                    <span className="font-medium">{taxAmount.toLocaleString()} {symbol}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>{t("quote.payment_step.total_ttc", "Total TTC")}</span>
                    <span>{total.toLocaleString()} {symbol}</span>
                  </div>
                  {depositAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("quote.payment_step.deposit_amount", "Acompte")}</span>
                        <span>{depositAmount.toLocaleString()} {symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("quote.payment_step.remaining", "Reste à payer")}</span>
                        <span>{remainingAmount.toLocaleString()} {symbol}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("quote.notes_step.title", "Notes et conditions")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("quote.notes_step.subtitle", "Ces textes apparaîtront dans la section \"Conditions de règlement\" du devis.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("quote.help_notice.tips_title", "Conseils")} 
              tips={t("quote.notes_step.tips", [
                "Les notes additionnelles sont affichées dans 'Conditions de règlement'.",
                "Indiquez les conditions d'acompte (ex : 30% au démarrage, 70% à la fin).",
              ])} 
            />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">{t("quote.notes_step.payment_conditions", "Conditions de règlement / Notes")}</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t("quote.notes_step.payment_conditions_placeholder", "- 30 % à verser 1 semaine après le démarrage\n- 70 % à la fin du 1er mois")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">{t("quote.notes_step.general_conditions", "Conditions générales")}</Label>
                <Textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t("quote.notes_step.general_conditions_placeholder", "Conditions de paiement, validité, pénalités de retard...")}
                />
              </div>
            </div>
          </div>
        );

      case "preview": {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{t("quote.preview_step.title", "Aperçu du devis")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("quote.preview_step.subtitle", "Vérifiez votre devis avant de le générer.")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep(0)} className="gap-2">
                  <Edit2 className="w-4 h-4" /> {t("quote.preview_step.modify", "Modifier")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadXlsx}
                  disabled={isGenerating}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  {t("quote.preview_step.download_excel", "Télécharger Excel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {t("quote.preview_step.download_pdf", "Télécharger PDF")}
                </Button>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-white">
        <div className="container px-4 py-10 mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-4 rounded-full w-14 h-14 bg-emerald-100">
              <FileText className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{ t("quote.title", "Générateur de Devis") }</h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="font-mono text-sm text-gray-500">{formData.quoteNumber}</span>
              {getStatusBadge()}
            </div>
            <p className="mt-1 text-sm text-gray-500"> { t("quote.subtitle", "Créez un devis professionnel en quelques étapes guidées") }</p>
          </motion.div>
        </div>
      </div>

      {error && (
        <div className="container max-w-5xl px-4 mx-auto mt-4">
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="flex-shrink-0 w-4 h-4" /> {error}
          </div>
        </div>
      )}

      <div className="container max-w-5xl px-4 py-8 mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 mb-8 bg-white border shadow-sm rounded-2xl">
          <ProgressBar steps={STEPS} currentStep={currentStep} onNavigate={goTo} t={t} />
        </motion.div>

        <div className="flex flex-row items-center justify-between gap-3 mb-6">
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" onClick={() => setIsQuoteHistoryOpen(true)} className="gap-2">
              <BookOpen className="w-4 h-4" /> {t("quote.buttons.history", "Historique des devis")}
            </Button>
            <Button type="button" variant="outline" onClick={goPrev} disabled={currentStep === 0} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> {t("quote.buttons.previous", "Précédent")}
            </Button>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            {currentStep + 1} / {STEPS.length}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => handleGenerateQuote("pdf")}
              disabled={isGenerating}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: isGenerating ? "#059669" : "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 18px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
                transition: "background 0.2s",
              }}
              onMouseOver={e => {
                if (!isGenerating) e.currentTarget.style.background = "#047857";
              }}
              onMouseOut={e => {
                if (!isGenerating) e.currentTarget.style.background = "#10b981";
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ width: 18, height: 18, marginRight: 6 }} />
                  {t("quote.buttons.generating", "Génération…")}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" style={{ width: 18, height: 18, marginRight: 6 }} />
                  {t("quote.buttons.generate_quote", "Générer le devis")}
                </>
              )}
            </Button>
            {currentStep < STEPS.length - 1 && (
              <Button type="button" variant="outline" onClick={goNext} disabled={!canGoNext()} className="gap-2">
                {t("quote.buttons.next", "Suivant")} <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-white border rounded-2xl shadow-sm p-6 md:p-8 min-h-[400px] mb-4"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-row items-center justify-between gap-3 mb-6">
          <Button type="button" variant="outline" onClick={goPrev} disabled={currentStep === 0} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {t("quote.buttons.previous", "Précédent")}
          </Button>
          <div className="hidden text-xs text-muted-foreground sm:block">
            {currentStep + 1} / {STEPS.length}
          </div>
          {currentStep < STEPS.length - 1 && (
            <Button type="button" variant="outline" onClick={goNext} disabled={!canGoNext()} className="gap-2">
              {t("quote.buttons.next", "Suivant")} <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {STEPS[currentStep]?.id !== "preview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-8 border rounded-xl bg-muted/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="mb-2 text-sm font-semibold">{t("quote.tips_section.title", "Conseils pour un devis efficace")}</h4>
                <ul className="grid grid-cols-1 gap-1 text-xs text-muted-foreground md:grid-cols-2">
                  {t("quote.tips_section.tips", [
                    "Détaillez précisément chaque poste pour éviter les litiges",
                    "Indiquez clairement la validité du devis (30 jours recommandé)",
                    "Mentionnez les délais de réalisation et conditions de livraison",
                    "Demandez un acompte à la signature pour sécuriser le projet",
                    "Relisez les montants avant d'envoyer au client",
                    "Conservez une copie signée de chaque devis accepté"
                  ]).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {STEPS[currentStep]?.id === "preview" && (
          <div className="flex justify-center mt-6">
            <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
              <RefreshCw className="w-4 h-4" /> {t("quote.buttons.new_quote", "Nouveau devis")}
            </Button>
          </div>
        )}
      </div>

      <QuoteHistoryDialog
        isOpen={isQuoteHistoryOpen}
        onClose={() => setIsQuoteHistoryOpen(false)}
        symbol={symbol}
        quoteHistory={[
          {
            id: "1",
            quoteNumber: "DEV-202603-0017",
            clientName: "Samuel Bikoko",
            clientCompany: "Bikoko Génie Civil SARL",
            projectName: "Construction Résidence Makepe",
            total: 2500000,
            statut: "accepted",
            dateCreation: "12/03/2026",
            validUntil: "11/04/2026",
            url: "https://...",
          },
        ]}
        onPreviewQuote={(q) => window.open(q.url, "_blank")}
        onDownloadQuote={(q) => { /* download logic */ }}
        onDeleteQuote={(q) => { /* delete logic */ }}
        onDuplicateQuote={(q) => { /* duplicate logic */ }}
      />
    </div>
  );
};

export default QuotePage;