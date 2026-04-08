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
  Calendar, Package, Plus, Minus, Trash2,
  Send, Download, CheckCircle, AlertCircle,
  CreditCard, FileCheck, Edit2, Eye,
  Printer, Loader2, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, Copy, RefreshCw, Info, BookOpen, Percent,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import {
  selectCurrentCreditNote, selectCreditNoteLoading, selectCreditNoteError,
  selectGeneratedCreditPDF,
  createCreditNote, updateCreditNoteById, generateCreditNoteFiles,
  sendCreditNoteByEmail, clearCreditNote, clearError, fetchCreditNoteById,
} from "@/redux/slices/creditNoteSlice";
import { useCurrency } from "@/context/CurrencyContext";
import { useAppMainContext } from "@/context/AppProvider";
import { useAuth } from "@/hooks/useAuth";
import { UPLOADED_FILES_URL } from "@/api/axios";
import CreditNoteHistoryDialog from "@/components/dialog/CreditNoteHistoryDialog";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────
// ÉTAPES DU WIZARD
// ─────────────────────────────────────────────
const STEPS = [
  { id: "identification", icon: FileText  },
  { id: "emetteur",       icon: Building2 },
  { id: "client",         icon: User      },
  { id: "items",          icon: Package   },
  { id: "notes",          icon: FileCheck },
  { id: "preview",        icon: Eye       },
];

// ─────────────────────────────────────────────
// OPTIONS (clés de traduction)
// ─────────────────────────────────────────────
const CREDIT_REASONS = [
  { value: "product_return",    labelKey: "credit_note.credit_reasons.product_return"    },
  { value: "defective_product", labelKey: "credit_note.credit_reasons.defective_product" },
  { value: "billing_error",     labelKey: "credit_note.credit_reasons.billing_error"     },
  { value: "discount",          labelKey: "credit_note.credit_reasons.discount"          },
  { value: "price_adjustment",  labelKey: "credit_note.credit_reasons.price_adjustment"  },
  { value: "cancelled_order",   labelKey: "credit_note.credit_reasons.cancelled_order"   },
  { value: "goodwill",          labelKey: "credit_note.credit_reasons.goodwill"          },
  { value: "other",             labelKey: "credit_note.credit_reasons.other"             },
];

const REFUND_METHODS = [
  { value: "bank_transfer",    labelKey: "credit_note.refund_methods.bank_transfer"    },
  { value: "original_payment", labelKey: "credit_note.refund_methods.original_payment" },
  { value: "store_credit",     labelKey: "credit_note.refund_methods.store_credit"     },
  { value: "cash",             labelKey: "credit_note.refund_methods.cash"             },
  { value: "check",            labelKey: "credit_note.refund_methods.check"            },
];

// ─────────────────────────────────────────────
// NOTICE D'AIDE
// ─────────────────────────────────────────────
const HelpNotice = ({ tips, title, variant = "info", t }) => {
  const [open, setOpen] = useState(false);
  const colors = {
    info:    { bg: "bg-orange-50 border-orange-200",  icon: "text-orange-500",  title: "text-orange-700"  },
    success: { bg: "bg-green-50 border-green-200",    icon: "text-green-500",   title: "text-green-700"   },
    warning: { bg: "bg-amber-50 border-amber-200",    icon: "text-amber-500",   title: "text-amber-700"   },
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
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {t("credit_note.progress.step", "Étape")} {currentStep + 1} / {steps.length} — <span className="text-orange-600">{t(`credit_note.steps.${steps[currentStep]?.id}`, steps[currentStep]?.id)}</span>
        </span>
        <span className="font-semibold text-orange-600">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
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
          const label = t(`credit_note.steps.${step.id}`, step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onNavigate(i)}
              title={label}
              className={`flex flex-col items-center gap-1 transition-all ${
                active ? "text-orange-600" : done ? "text-orange-400" : "text-gray-300"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                active ? "border-orange-500 bg-orange-50" : done ? "border-orange-400 bg-orange-50" : "border-gray-200"
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
const CreditNotePage = ({ params }) => {
  const router = useRouter();
  const creditNoteId = params?.id;
  const creditRef = useRef(null);
  const dispatch = useDispatch();
  const { t } = useLanguage();

  // Redux
  const currentCreditNote = useSelector(selectCurrentCreditNote);
  const loading = useSelector(selectCreditNoteLoading);
  const error = useSelector(selectCreditNoteError);

  // États locaux
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [creditStatus, setCreditStatus] = useState("DRAFT");
  const [logoPreview, setLogoPreview] = useState("");
  const [isCreditNoteHistoryOpen, setIsCreditNoteHistoryOpen] = useState(false);

  const { symbol } = useCurrency();

  const { setIsViewLocked } = useAppMainContext();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (!isLoggedIn()) setIsViewLocked(true);
  }, [isLoggedIn, setIsViewLocked]);

  // ── Numéro d'avoir ──────────────────────────
  const generateCreditNoteNumber = () => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const rnd = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
    return `AV-${yr}${mo}-${rnd}`;
  };

  // ── Formulaire ──────────────────────────────
  const [formData, setFormData] = useState({
    creditNoteNumber: generateCreditNoteNumber(),
    bisNumber: "",
    creditNoteDate: new Date().toISOString().split("T")[0],
    originalInvoiceNumber: "",
    originalInvoiceDate: "",
    creditReason: "billing_error",
    refundMethod: "bank_transfer",
    companyName: "Sté SEN FIBEM France",
    companyAddress: "51 Rue du Grevarin",
    companyCity: "27200 Vernon",
    companyPostalCode: "",
    companyPhone: "",
    companyPort: "07.52.49.75.46",
    companyEmail: "senfibem.paris@outlook.com",
    companySiret: "445 374 937 00032",
    companyApe: "4120B Travaux Bâtiment & Industrie",
    companyTva: "FR17378128441",
    companyLogo: "",
    clientName: "Amélie Martin",
    clientCompany: "EURL AquaTech",
    clientEmail: "amelie.martin@aquatech.fr",
    clientPhone: "07 89 67 45 32",
    clientAddress: "8 Avenue des Lumières",
    clientCity: "Lyon",
    clientPostalCode: "69008",
    clientTaxId: "FR99887766554",
    notes: "",
    termsAndConditions: "",
  });

  // ── Articles ────────────────────────────────
  const [creditItems, setCreditItems] = useState([
    {
      id: 1,
      description: "Régularisation facture",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 20,
      total: 0,
    },
  ]);

  // ── Chargement édition ──────────────────────
  useEffect(() => {
    if (creditNoteId) dispatch(fetchCreditNoteById(creditNoteId));
  }, [creditNoteId, dispatch]);

  useEffect(() => {
    if (currentCreditNote) {
      setFormData({
        creditNoteNumber: currentCreditNote.creditNoteNumber || generateCreditNoteNumber(),
        bisNumber: currentCreditNote.bisNumber || "",
        creditNoteDate: currentCreditNote.creditNoteDate || new Date().toISOString().split("T")[0],
        originalInvoiceNumber: currentCreditNote.originalInvoiceNumber || "",
        originalInvoiceDate: currentCreditNote.originalInvoiceDate || "",
        creditReason: currentCreditNote.creditReason || "billing_error",
        refundMethod: currentCreditNote.refundMethod || "bank_transfer",
        companyName: currentCreditNote.companyName || "",
        companyAddress: currentCreditNote.companyAddress || "",
        companyCity: currentCreditNote.companyCity || "",
        companyPostalCode: currentCreditNote.companyPostalCode || "",
        companyPhone: currentCreditNote.companyPhone || "",
        companyPort: currentCreditNote.companyPort || "",
        companyEmail: currentCreditNote.companyEmail || "",
        companySiret: currentCreditNote.companySiret || "",
        companyApe: currentCreditNote.companyApe || "",
        companyTva: currentCreditNote.companyTva || "",
        companyLogo: currentCreditNote.companyLogo || "",
        clientName: currentCreditNote.clientName || "",
        clientCompany: currentCreditNote.clientCompany || "",
        clientEmail: currentCreditNote.clientEmail || "",
        clientPhone: currentCreditNote.clientPhone || "",
        clientAddress: currentCreditNote.clientAddress || "",
        clientCity: currentCreditNote.clientCity || "",
        clientPostalCode: currentCreditNote.clientPostalCode || "",
        clientTaxId: currentCreditNote.clientTaxId || "",
        notes: currentCreditNote.notes || "",
        termsAndConditions: currentCreditNote.termsAndConditions || "",
      });
      if (currentCreditNote.creditNoteItems) setCreditItems(currentCreditNote.creditNoteItems);
      if (currentCreditNote.creditNoteStatus) setCreditStatus(currentCreditNote.creditNoteStatus);
      if (currentCreditNote.companyLogo) {
        const logo = currentCreditNote.companyLogo;
        setLogoPreview(logo.startsWith("http") ? logo : `${window.location.origin}/${logo.replace(/^\/+/, "")}`);
      }
    }
  }, [currentCreditNote]);

  useEffect(() => {
    if (error) {
      const tTimeout = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(tTimeout);
    }
  }, [error, dispatch]);

  // ── Handlers formulaire ─────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Handlers articles ───────────────────────
  const addItem = () => {
    const newId = Math.max(...creditItems.map(i => i.id), 0) + 1;
    setCreditItems([...creditItems, {
      id: newId,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 20,
      total: 0
    }]);
  };

  const updateItem = (id, field, value) => {
    setCreditItems(creditItems.map(item => {
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

  const removeItem = (id) => {
    if (creditItems.length > 1) setCreditItems(creditItems.filter(i => i.id !== id));
  };

  const duplicateItem = (id) => {
    const item = creditItems.find(i => i.id === id);
    if (!item) return;
    const newId = Math.max(...creditItems.map(i => i.id), 0) + 1;
    setCreditItems([...creditItems, { ...item, id: newId }]);
  };

  const moveItem = (index, dir) => {
    const items = [...creditItems];
    const newIndex = dir === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < items.length) {
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      setCreditItems(items);
    }
  };

  // ── Calculs ─────────────────────────────────
  const subtotalHT = creditItems.reduce((s, i) => s + i.total, 0);
  const totalTVA = creditItems.reduce((s, i) => {
    const base = i.quantity * i.unitPrice * (1 - (i.discount || 0) / 100);
    return s + base * ((i.taxRate || 0) / 100);
  }, 0);
  const totalTTC = subtotalHT + totalTVA;

  // ── Validation ──────────────────────────────
  const isFormValid = () => true;

  const canGoNext = () => {
    switch (STEPS[currentStep].id) {
      case "identification": return formData.creditNoteNumber?.trim() !== "";
      case "emetteur": return formData.companyName?.trim() !== "";
      case "client": return true;
      case "items": return creditItems.length > 0 && creditItems.every(i => i.description?.trim() && i.unitPrice > 0);
      case "notes": return true;
      case "preview": return true;
      default: return true;
    }
  };

  // ── Navigation ──────────────────────────────
  const goNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };
  const goTo = (i) => setCurrentStep(i);

  // ── Actions ─────────────────────────────────
  const handleGenerateCreditNote = async (format = "pdf") => {
    setIsGenerating(true);
    try {
      const payload = {
        ...formData,
        creditNoteItems: creditItems.map(({ id, ...i }) => i),
        creditNoteStatus: creditStatus,
        subtotalHT,
        totalTVA,
        totalTTC,
      };
      let creditNoteIdResult;
      if (currentCreditNote?.id) {
        await dispatch(updateCreditNoteById({ id: currentCreditNote.id, data: payload })).unwrap();
        creditNoteIdResult = currentCreditNote.id;
      } else {
        const res = await dispatch(createCreditNote(payload)).unwrap();
        creditNoteIdResult = res.content.id;
      }
      if (!creditNoteIdResult) throw new Error("ID de l'avoir introuvable");
      const genRes = await dispatch(generateCreditNoteFiles({ id: creditNoteIdResult, format: "all" })).unwrap();
      if(format.toLowerCase().trim() === "pdf") {
        if (genRes.content?.pdf?.url) window.open(genRes.content.pdf.url, "_blank");
      } else {
        if (genRes.content?.xlsx?.url) window.open(genRes.content.xlsx.url, "_blank");
      }
      setCurrentStep(STEPS.length - 1);
    } catch (err) {
      console.error(err);
      alert(t("credit_note.alerts.error_generating", "Erreur lors de la génération de l'avoir"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (currentCreditNote?.id) {
      setIsGenerating(true);
      try {
        const res = await dispatch(fetchCreditNoteById(currentCreditNote.id)).unwrap();
        if (res.content?.files?.pdf) {
          const a = document.createElement("a");
          a.href = `${UPLOADED_FILES_URL}${res.content.files.pdf}`;
          a.download = `Avoir_${formData.creditNoteNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      await handleGenerateCreditNote();
    }
  };

  const handleDownloadXlsx = async () => {
    if (currentCreditNote?.id) {
      setIsGenerating(true);
      try {
        const res = await dispatch(fetchCreditNoteById(currentCreditNote.id)).unwrap();
        if (res.content?.files?.xlsx) {
          const a = document.createElement("a");
          a.href = `${UPLOADED_FILES_URL}${res.content.files.xlsx}`;
          a.download = `Avoir_${formData.creditNoteNumber}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      await handleGenerateCreditNote("xlsx");
    }
  };

  const handleSendEmail = async () => {
    if (!currentCreditNote?.id) {
      alert(t("credit_note.alerts.generate_first", "Veuillez d'abord générer l'avoir"));
      return;
    }
    if (!formData.clientEmail) {
      alert(t("credit_note.alerts.email_required", "Veuillez renseigner l'email du client"));
      return;
    }
    setIsSending(true);
    try {
      await dispatch(sendCreditNoteByEmail({
        id: currentCreditNote.id,
        email: formData.clientEmail,
        message: `Veuillez trouver ci-joint l'avoir ${formData.creditNoteNumber}`,
      })).unwrap();
      alert(t("credit_note.alerts.email_sent", "Avoir envoyé avec succès"));
      setCreditStatus("issued");
    } catch {
      alert(t("credit_note.alerts.email_error", "Erreur lors de l'envoi de l'avoir"));
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    dispatch(clearCreditNote());
    setFormData(prev => ({
      ...prev,
      creditNoteNumber: generateCreditNoteNumber(),
      creditNoteDate: new Date().toISOString().split("T")[0],
      originalInvoiceNumber: "",
      originalInvoiceDate: "",
      creditReason: "billing_error",
      refundMethod: "bank_transfer",
      clientName: "",
      clientCompany: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      clientCity: "",
      clientPostalCode: "",
      clientTaxId: "",
      notes: "",
      termsAndConditions: "",
    }));
    setCreditItems([{
      id: 1,
      description: "Régularisation facture",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 20,
      total: 0
    }]);
    setCreditStatus("draft");
    setCurrentStep(0);
  };

  // ── Badge statut ────────────────────────────
  const getStatusBadge = () => {
    const statusKey = {
      DRAFT: "credit_note.status.draft",
      ISSUED: "credit_note.status.issued",
      PROCESSED: "credit_note.status.processed",
      CANCELLED: "credit_note.status.cancelled",
    };
    const cfg = {
      DRAFT: { className: "bg-gray-100 text-gray-700" },
      ISSUED: { className: "bg-orange-100 text-orange-700" },
      PROCESSED: { className: "bg-emerald-100 text-emerald-700" },
      CANCELLED: { className: "bg-red-100 text-red-700" },
    };
    const c = cfg[creditStatus] || cfg.DRAFT;
    const label = t(statusKey[creditStatus] || "credit_note.status.draft", creditStatus);
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.className}`}>{label}</span>;
  };

  // ════════════════════════════════════════════
  // RENDU DES ÉTAPES
  // ════════════════════════════════════════════
  const renderStep = () => {
    switch (STEPS[currentStep].id) {

      case "identification":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("credit_note.identification_step.title", "Identification de l'avoir")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("credit_note.identification_step.subtitle", "Numéro, date, facture d'origine, raison et méthode de remboursement.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("credit_note.help_notice.info_title", "À savoir")} 
              tips={t("credit_note.identification_step.tips", [
                "Le numéro d'avoir est obligatoire et doit être unique.",
                "Indiquez toujours la facture d'origine à laquelle se rapporte l'avoir.",
                "La raison et la méthode de remboursement apparaîtront sur le document PDF.",
              ])} 
              t={t}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="creditNoteDate">{t("credit_note.identification_step.credit_note_date", "Date de l'avoir")} *</Label>
                <input
                  id="creditNoteDate"
                  name="creditNoteDate"
                  type="date"
                  value={formData.creditNoteDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalInvoiceNumber">{t("credit_note.identification_step.original_invoice_number", "N° Facture d'origine")}</Label>
                <div className="relative">
                  <input
                    id="originalInvoiceNumber"
                    name="originalInvoiceNumber"
                    value={formData.originalInvoiceNumber}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.identification_step.original_invoice_placeholder", "FA-202601-0042")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <RotateCcw className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalInvoiceDate">{t("credit_note.identification_step.original_invoice_date", "Date de la facture d'origine")}</Label>
                <input
                  id="originalInvoiceDate"
                  name="originalInvoiceDate"
                  type="date"
                  value={formData.originalInvoiceDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="creditReason">{t("credit_note.identification_step.credit_reason", "Raison de l'avoir")}</Label>
                <select
                  id="creditReason"
                  name="creditReason"
                  value={formData.creditReason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  {CREDIT_REASONS.map(r => <option key={r.value} value={r.value}>{t(r.labelKey, r.value)}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="refundMethod">{t("credit_note.identification_step.refund_method", "Méthode de remboursement")}</Label>
                <select
                  id="refundMethod"
                  name="refundMethod"
                  value={formData.refundMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  {REFUND_METHODS.map(m => <option key={m.value} value={m.value}>{t(m.labelKey, m.value)}</option>)}
                </select>
              </div>
            </div>
          </div>
        );

      case "emetteur":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("credit_note.emitter_step.title", "Votre entreprise (émetteur)")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("credit_note.emitter_step.subtitle", "Ces informations apparaîtront dans le bloc prestataire de l'avoir.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("credit_note.help_notice.tips_title", "Conseils")} 
              tips={t("credit_note.emitter_step.tips", [
                "Le nom de l'entreprise est obligatoire.",
                "Le logo sera affiché en haut à gauche du PDF.",
                "SIRET, APE et N° TVA apparaissent dans le bloc émetteur.",
              ])} 
              t={t}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">{t("credit_note.emitter_step.company_name", "Nom de l'entreprise")} *</Label>
                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.emitter_step.company_name_placeholder", "Sté SEN FIBEM France")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyAddress">{t("credit_note.emitter_step.company_address", "Adresse")}</Label>
                <input
                  id="companyAddress"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.emitter_step.company_address_placeholder", "51 Rue du Grevarin")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyCity">{t("credit_note.emitter_step.company_city", "Ville (avec code postal)")}</Label>
                <input
                  id="companyCity"
                  name="companyCity"
                  value={formData.companyCity}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.emitter_step.company_city_placeholder", "27200 Vernon")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">{t("credit_note.emitter_step.company_phone", "Téléphone fixe")}</Label>
                <div className="relative">
                  <input
                    id="companyPhone"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.emitter_step.company_phone_placeholder", "+33 1 XX XX XX XX")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPort">{t("credit_note.emitter_step.company_port", "Portable")}</Label>
                <div className="relative">
                  <input
                    id="companyPort"
                    name="companyPort"
                    value={formData.companyPort}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.emitter_step.company_port_placeholder", "07.52.49.75.46")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyEmail">{t("credit_note.emitter_step.company_email", "Email")}</Label>
                <div className="relative">
                  <input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.emitter_step.company_email_placeholder", "contact@votreentreprise.com")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySiret">{t("credit_note.emitter_step.company_siret", "SIRET")}</Label>
                <input
                  id="companySiret"
                  name="companySiret"
                  value={formData.companySiret}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.emitter_step.company_siret_placeholder", "445 374 937 00032")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyApe">{t("credit_note.emitter_step.company_ape", "Code APE")}</Label>
                <input
                  id="companyApe"
                  name="companyApe"
                  value={formData.companyApe}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.emitter_step.company_ape_placeholder", "4120B Travaux Bâtiment & Industrie")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyTva">{t("credit_note.emitter_step.company_tva", "N° TVA intracommunautaire")}</Label>
                <input
                  id="companyTva"
                  name="companyTva"
                  value={formData.companyTva}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.emitter_step.company_tva_placeholder", "FR17378128441")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyLogo">{t("credit_note.emitter_step.company_logo", "Logo de l'entreprise")}</Label>
                <input
                  id="companyLogo"
                  name="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setFormData(f => ({ ...f, companyLogo: file }));
                        setLogoPreview(ev.target.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setFormData(f => ({ ...f, companyLogo: "" }));
                      setLogoPreview("");
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt={t("credit_note.emitter_step.logo_preview", "Aperçu logo")}
                      className="border rounded max-h-16"
                      style={{ objectFit: "contain", background: "#f9f9f9", padding: 2 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "client":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("credit_note.client_step.title", "Informations du client")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("credit_note.client_step.subtitle", "Destinataire de l'avoir.")}</p>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("credit_note.help_notice.tips_title", "Conseils")} 
              tips={t("credit_note.client_step.tips", [
                "Renseignez l'email pour envoyer l'avoir directement depuis l'application.",
                "Le N° TVA client apparaît dans la colonne CEE du tableau de synthèse.",
              ])} 
              t={t}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t("credit_note.client_step.client_name", "Nom du client")}</Label>
                <div className="relative">
                  <input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.client_step.client_name_placeholder", "Jean Dupont")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <User className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany">{t("credit_note.client_step.client_company", "Entreprise du client")}</Label>
                <div className="relative">
                  <input
                    id="clientCompany"
                    name="clientCompany"
                    value={formData.clientCompany}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.client_step.client_company_placeholder", "Client SA")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <Building2 className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">{t("credit_note.client_step.client_email", "Email")}</Label>
                <div className="relative">
                  <input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.client_step.client_email_placeholder", "client@email.com")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">{t("credit_note.client_step.client_phone", "Téléphone")}</Label>
                <div className="relative">
                  <input
                    id="clientPhone"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.client_step.client_phone_placeholder", "+237 6XX XX XX XX")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientAddress">{t("credit_note.client_step.client_address", "Adresse")}</Label>
                <div className="relative">
                  <input
                    id="clientAddress"
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleInputChange}
                    placeholder={t("credit_note.client_step.client_address_placeholder", "456 Boulevard Principal")}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <MapPin className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCity">{t("credit_note.client_step.client_city", "Ville")}</Label>
                <input
                  id="clientCity"
                  name="clientCity"
                  value={formData.clientCity}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.client_step.client_city_placeholder", "Yaoundé")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPostalCode">{t("credit_note.client_step.client_postal_code", "Code postal / BP")}</Label>
                <input
                  id="clientPostalCode"
                  name="clientPostalCode"
                  value={formData.clientPostalCode}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.client_step.client_postal_code_placeholder", "BP 456")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientTaxId">{t("credit_note.client_step.client_tax_id", "N° TVA / Identification fiscale")}</Label>
                <input
                  id="clientTaxId"
                  name="clientTaxId"
                  value={formData.clientTaxId}
                  onChange={handleInputChange}
                  placeholder={t("credit_note.client_step.client_tax_id_placeholder", "FR12345678901")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
            </div>
          </div>
        );

      case "items":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t("credit_note.items_step.title", "Lignes de l'avoir")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("credit_note.items_step.subtitle", "Ajoutez les articles ou prestations à créditer.")}</p>
              </div>
              <Badge variant="outline" className="text-orange-700 border-orange-300">{creditItems.length} {t("credit_note.items_step.lines_count", "ligne(s)")}</Badge>
            </div>
            <HelpNotice 
              variant="info" 
              title={t("credit_note.help_notice.tips_title", "Conseils")} 
              tips={t("credit_note.items_step.tips", [
                "Chaque ligne doit avoir une description et un prix unitaire > 0.",
                "Les montants représentent des crédits — ils s'afficheront en orange sur le PDF.",
                "La remise est en pourcentage (ex : 10 pour 10%).",
              ])} 
              t={t}
            />
            <div className="space-y-4">
              {creditItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 space-y-3 border border-orange-100 rounded-xl bg-orange-50/30"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">{t("credit_note.items_step.line", "Ligne")} {index + 1}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="w-8 h-8 p-0 text-gray-400 rounded-md hover:bg-gray-100"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === creditItems.length - 1}
                        className="w-8 h-8 p-0 text-gray-400 rounded-md hover:bg-gray-100"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateItem(item.id)}
                        className="w-8 h-8 p-0 text-blue-500 rounded-md hover:bg-blue-50"
                        title={t("credit_note.items_step.duplicate", "Dupliquer")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {creditItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 p-0 text-red-500 rounded-md hover:bg-red-50"
                          title={t("credit_note.items_step.delete", "Supprimer")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("credit_note.items_step.description", "Description")} *</Label>
                    <input
                      value={item.description}
                      onChange={e => updateItem(item.id, "description", e.target.value)}
                      placeholder={t("credit_note.items_step.description_placeholder", "Ex : Retour article / Régularisation")}
                      className="w-full px-3 py-2 text-sm border rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-2">
                      <Label>{t("credit_note.items_step.quantity", "Quantité")}</Label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="flex-shrink-0 w-8 h-8 border rounded-md hover:bg-gray-50"
                          onClick={() => updateItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="w-3 h-3 mx-auto" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          step="0.01"
                          className="w-full px-1 text-center border rounded-md"
                          onChange={e => updateItem(item.id, "quantity", Math.max(1, parseFloat(e.target.value) || 1))}
                        />
                        <button
                          type="button"
                          className="flex-shrink-0 w-8 h-8 border rounded-md hover:bg-gray-50"
                          onClick={() => updateItem(item.id, "quantity", item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("credit_note.items_step.unit_price", "Prix U.")} ({symbol})</Label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 text-sm border rounded-md"
                        onChange={e => updateItem(item.id, "unitPrice", Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("credit_note.items_step.discount", "Remise %")}</Label>
                      <div className="relative">
                        <input
                          type="number"
                          value={item.discount}
                          min="0"
                          max="100"
                          step="1"
                          className="w-full px-3 py-2 pr-8 text-sm border rounded-md"
                          onChange={e => updateItem(item.id, "discount", Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        />
                        <Percent className="absolute w-3 h-3 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("credit_note.items_step.tax", "TVA %")}</Label>
                      <div className="relative">
                        <input
                          type="number"
                          value={item.taxRate}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 pr-8 text-sm border rounded-md"
                          onChange={e => updateItem(item.id, "taxRate", Math.max(0, parseFloat(e.target.value) || 0))}
                        />
                        <Percent className="absolute w-3 h-3 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-100 text-orange-700">
                      {t("credit_note.items_step.total_ht", "Total HT")} : {item.total.toLocaleString()} {symbol}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-orange-700 border border-orange-300 rounded-md hover:bg-orange-50"
            >
              <Plus className="w-4 h-4" /> {t("credit_note.items_step.add_item", "Ajouter une ligne")}
            </button>

            <div className="p-4 space-y-2 border border-orange-200 rounded-xl bg-orange-50/50">
              <h4 className="text-sm font-semibold text-orange-700">{t("credit_note.items_step.summary", "Récapitulatif")}</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("credit_note.items_step.total_ht", "Total HT")}</span>
                <span className="font-medium text-orange-700">{subtotalHT.toLocaleString()} {symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("credit_note.items_step.estimated_tax", "TVA estimée")}</span>
                <span className="font-medium">{totalTVA.toLocaleString()} {symbol}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>{t("credit_note.items_step.net_refund", "Net à rembourser TTC")}</span>
                <span className="text-orange-600">{totalTTC.toLocaleString()} {symbol}</span>
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("credit_note.notes_step.title", "Notes et références")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("credit_note.notes_step.subtitle", "Informations complémentaires qui apparaîtront sur l'avoir.")}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">{t("credit_note.notes_step.notes", "Références / Notes")}</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t("credit_note.notes_step.notes_placeholder", "Référence du dossier, motif détaillé, numéro de retour...")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">{t("credit_note.notes_step.terms_and_conditions", "Conditions générales")}</Label>
                <textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t("credit_note.notes_step.terms_placeholder", "Conditions de remboursement, délais de traitement...")}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
              </div>
            </div>
          </div>
        );

      case "preview": {
        const reasonLabel = t(CREDIT_REASONS.find(r => r.value === formData.creditReason)?.labelKey, formData.creditReason);
        const refundLabel = t(REFUND_METHODS.find(m => m.value === formData.refundMethod)?.labelKey, formData.refundMethod);
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{t("credit_note.preview_step.title", "Aperçu de l'avoir")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("credit_note.preview_step.subtitle", "Vérifiez avant de générer le PDF.")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadXlsx}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  {t("credit_note.preview_step.download_excel", "Télécharger Excel")}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {t("credit_note.preview_step.download_pdf", "Télécharger PDF")}
                </button>
              </div>
            </div>

            <div ref={creditRef} className="space-y-4">
              <div className="flex items-start justify-between p-4 border border-orange-200 rounded-xl bg-orange-50/30">
                <div>
                  {logoPreview ? (
                    <img src={logoPreview} alt={t("credit_note.emitter_step.logo_preview", "Logo")} className="mb-2 max-h-12" style={{ objectFit: "contain" }} />
                  ) : (
                    <p className="text-lg font-bold text-orange-800">{formData.companyName}</p>
                  )}
                  <p className="text-xs text-gray-500">{formData.companyAddress} — {formData.companyCity}</p>
                  {formData.companyEmail && <p className="text-xs text-gray-500">{formData.companyEmail}</p>}
                  {formData.companySiret && <p className="text-xs text-gray-500">{t("credit_note.emitter_step.company_siret", "SIRET")} : {formData.companySiret}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-700">{t("credit_note.preview_step.credit_note_title", "AVOIR")}</p>
                  <p className="font-mono text-sm text-gray-600">
                    {t("credit_note.preview_step.number", "N°")} {formData.creditNoteNumber}{formData.bisNumber ? ` ${formData.bisNumber}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(formData.creditNoteDate).toLocaleDateString("fr-FR")}
                  </p>
                  {formData.originalInvoiceNumber && (
                    <p className="text-xs text-gray-400 mt-0.5">{t("credit_note.preview_step.invoice_ref", "Réf. facture")} : {formData.originalInvoiceNumber}</p>
                  )}
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 text-sm border border-orange-100 rounded-lg bg-orange-50/30">
                  <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">{t("credit_note.preview_step.reason", "Raison")}</p>
                  <p className="font-medium text-orange-700">{reasonLabel}</p>
                </div>
                <div className="p-3 text-sm border border-orange-100 rounded-lg bg-orange-50/30">
                  <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">{t("credit_note.preview_step.refund", "Remboursement")}</p>
                  <p className="font-medium text-orange-700">{refundLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-sm space-y-0.5">
                  <p className="mb-1 font-semibold text-gray-700">{t("credit_note.preview_step.emitter", "Émetteur")}</p>
                  <p className="font-bold">{formData.companyName}</p>
                  {formData.companyAddress && <p className="text-gray-600">{formData.companyAddress}</p>}
                  {formData.companyCity && <p className="text-gray-600">{formData.companyCity}</p>}
                  {formData.companyPort && <p className="text-gray-600">{t("credit_note.preview_step.portable", "Port")} : {formData.companyPort}</p>}
                  {formData.companySiret && <p className="text-gray-600">{t("credit_note.emitter_step.company_siret", "SIRET")} : {formData.companySiret}</p>}
                </div>
                <div className="p-3 border rounded-lg text-sm space-y-0.5">
                  <p className="mb-1 font-semibold text-gray-700">{t("credit_note.preview_step.client", "Client")}</p>
                  <p className="font-bold">{formData.clientCompany || formData.clientName || "—"}</p>
                  {formData.clientName && formData.clientCompany && <p>{formData.clientName}</p>}
                  {formData.clientAddress && <p className="text-gray-600">{formData.clientAddress}</p>}
                  {(formData.clientPostalCode || formData.clientCity) && (
                    <p className="text-gray-600">{formData.clientPostalCode} {formData.clientCity}</p>
                  )}
                  {formData.clientPhone && <p className="text-gray-600">{t("credit_note.client_step.client_phone", "Tél")} : {formData.clientPhone}</p>}
                  {formData.clientEmail && <p className="text-gray-600">{formData.clientEmail}</p>}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="p-2 text-left border border-orange-200">{t("credit_note.preview_step.table.description", "Description")}</th>
                      <th className="p-2 text-center border border-orange-200">{t("credit_note.preview_step.table.quantity", "Qté")}</th>
                      <th className="p-2 text-right border border-orange-200">{t("credit_note.preview_step.table.unit_price_ht", "Prix U. HT")}</th>
                      <th className="p-2 text-center border border-orange-200">{t("credit_note.preview_step.table.discount", "Remise")}</th>
                      <th className="p-2 text-center border border-orange-200">{t("credit_note.preview_step.table.tax", "TVA %")}</th>
                      <th className="p-2 text-right border border-orange-200">{t("credit_note.preview_step.table.amount_ht", "Montant HT")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditItems.map((item, i) => (
                      <tr key={i} className={i % 2 === 1 ? "bg-orange-50/30" : ""}>
                        <td className="p-2 border">{item.description || "—"}</td>
                        <td className="p-2 text-center border">{item?.quantity}</td>
                        <td className="p-2 text-right border">{item?.unitPrice?.toLocaleString()} {symbol}</td>
                        <td className="p-2 text-center border">{item?.discount > 0 ? `${item?.discount}%` : "—"}</td>
                        <td className="p-2 text-center border">{item?.taxRate}%</td>
                        <td className="p-2 font-semibold text-right text-orange-700 border">
                          {item?.total?.toLocaleString()} {symbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("credit_note.preview_step.total_ht", "Total H.T.")}</span>
                    <span className="font-medium">{subtotalHT.toLocaleString()} {symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("credit_note.preview_step.estimated_tax", "TVA estimée")}</span>
                    <span className="font-medium">{totalTVA.toLocaleString()} {symbol}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold border-t-2 border-orange-500">
                    <span>{t("credit_note.preview_step.net_refund", "Net à rembourser T.T.C.")}</span>
                    <span className="text-orange-600">{totalTTC.toLocaleString()} {symbol}</span>
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="p-3 text-sm border border-orange-100 rounded-lg">
                  <p className="mb-1 font-semibold">{t("credit_note.preview_step.references", "Références")} :</p>
                  <p className="text-gray-600">{formData.notes}</p>
                </div>
              )}
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
      <div className="bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-white">
        <div className="container px-4 py-10 mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-4 bg-orange-100 rounded-full w-14 h-14">
              <RotateCcw className="text-orange-600 w-7 h-7" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{t("credit_note.title", "Générateur d'Avoirs")}</h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="font-mono text-sm text-gray-500">{formData.creditNoteNumber}</span>
              {getStatusBadge()}
            </div>
            <p className="mt-1 text-sm text-gray-500">{t("credit_note.subtitle", "Créez un avoir professionnel lié à une facture existante")}</p>
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
          <div className="flex flex-col flex-1 gap-2 md:flex-none">
            <button
              type="button"
              onClick={() => setIsCreditNoteHistoryOpen && setIsCreditNoteHistoryOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 text-wrap"
            >
              <BookOpen className="w-4 h-4" /> {t("credit_note.buttons.history", "Historique")}
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> {t("credit_note.buttons.previous", "Précédent")}
            </button>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            {currentStep + 1} / {STEPS.length}
          </div>
          <div className="flex flex-col flex-1 gap-2 md:flex-none">
            <button
              type="button"
              onClick={() => handleGenerateCreditNote("pdf")}
              disabled={isGenerating || !isFormValid()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: isGenerating ? "#059669" : "#f59e42",
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
                if (!isGenerating) e.currentTarget.style.background = "#ea7b15";
              }}
              onMouseOut={e => {
                if (!isGenerating) e.currentTarget.style.background = "#f59e42";
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ width: 18, height: 18, marginRight: 6 }} />
                  {t("credit_note.buttons.generating", "Génération…")}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" style={{ width: 18, height: 18, marginRight: 6 }} />
                  {t("credit_note.buttons.generate", "Générer")}
                </>
              )}
            </button>
            {currentStep < STEPS.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {t("credit_note.buttons.next", "Suivant")} <ChevronRight className="w-4 h-4" />
              </button>
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
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> {t("credit_note.buttons.previous", "Précédent")}
          </button>
          <div className="hidden text-xs text-muted-foreground sm:block">
            {currentStep + 1} / {STEPS.length}
          </div>
          {currentStep < STEPS.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {t("credit_note.buttons.next", "Suivant")} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {STEPS[currentStep]?.id !== "preview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 mt-8 border border-orange-100 rounded-xl bg-orange-50/30"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="mb-2 text-sm font-semibold">{t("credit_note.tips_section.title", "Bonnes pratiques pour les avoirs")}</h4>
                <ul className="grid grid-cols-1 gap-1 text-xs text-muted-foreground md:grid-cols-2">
                  {t("credit_note.tips_section.tips", [
                    "Référencez toujours la facture d'origine pour assurer la traçabilité",
                    "Un avoir doit être émis dès que le remboursement est acté",
                    "Conservez une copie signée dans votre dossier client",
                    "Vérifiez que le montant de l'avoir correspond à la facture originale",
                  ]).map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {STEPS[currentStep]?.id === "preview" && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" /> {t("credit_note.buttons.new_credit_note", "Nouvel avoir")}
            </button>
          </div>
        )}
      </div>

      <CreditNoteHistoryDialog 
            isOpen={isCreditNoteHistoryOpen}
            onClose={() => setIsCreditNoteHistoryOpen(false)}
            selectedUser={user}
            onDuplicateCreditNote={(avoir) => { /* duplicate logic */ }}
            isLoading={false}
            symbol="FCFA"
      />
    </div>
  );
};

export default CreditNotePage;