"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Eye, FileText, User, Mail, Phone, MapPin,
  Building2, Calendar, Clock, Package, Plus, Trash2,
  Send, CheckCircle, AlertCircle, CreditCard, FileCheck,
  Receipt, Hash, Percent, Printer, Save, Loader2, Copy,
  RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Info, BookOpen, Edit2, Check, DollarSign,
  FileSpreadsheet,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentInvoice,
  selectInvoiceLoading,
  selectInvoiceError,
  selectGeneratedFiles,
  createInvoice,
  updateInvoiceById,
  generateInvoiceFiles,
  sendInvoiceByEmail,
  clearInvoice,
  clearError,
  fetchInvoiceById,
} from "@/redux/slices/invoiceSlice";
import { useCurrency } from "@/context/CurrencyContext";
import InvoiceHistoryDialog from "@/components/dialog/InvoiceHistoryDialog";
import QuoteSelectionDialog from "@/components/dialog/QuoteSelectionDialog";
import { useAppMainContext } from "@/context/AppProvider";
import { useAuth } from "@/hooks/useAuth";
import { UPLOADED_FILES_URL } from "@/api/axios";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────
// ÉTAPES DU WIZARD (avec traductions dynamiques)
// ─────────────────────────────────────────────
const getSteps = (t) => [
  { id: "invoice",  label: t("invoice.steps.invoice"),  icon: FileText   },
  { id: "company",  label: t("invoice.steps.company"),  icon: Building2  },
  { id: "client",   label: t("invoice.steps.client"),   icon: User       },
  { id: "items",    label: t("invoice.steps.items"),    icon: Package    },
  { id: "payment",  label: t("invoice.steps.payment"),  icon: CreditCard },
  { id: "notes",    label: t("invoice.steps.notes"),    icon: FileCheck  },
  { id: "preview",  label: t("invoice.steps.preview"),  icon: Eye        },
];

// ─────────────────────────────────────────────
// NOTICE D'AIDE
// ─────────────────────────────────────────────
const HelpNotice = ({ tips, title, variant = "info", t }) => {
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
          {title || t("invoice.help.title")}
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
          {t("invoice.progress.step")} {currentStep + 1} / {steps.length} — <span className="text-primary">{steps[currentStep]?.label}</span>
        </span>
        <span className="font-semibold text-primary">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
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
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onNavigate(i)}
              title={step.label}
              className="flex flex-col items-center gap-1 transition-opacity group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${active ? "border-primary bg-primary text-white scale-110 shadow-md shadow-primary/30"
                  : done  ? "border-green-500 bg-green-50 text-green-600"
                  : "border-gray-300 bg-white text-gray-400 group-hover:border-primary/50"}`}>
                {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className={`hidden sm:block text-[10px] font-medium leading-tight text-center
                ${active ? "text-primary" : done ? "text-green-600" : "text-gray-400"}`}>
                {step.label}
              </span>
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
const InvoicePage = ({ params }) => {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const invoiceId = params?.id;
  const invoiceRef = useRef(null);
  const dispatch = useDispatch();

  // Redux
  const currentInvoice = useSelector(selectCurrentInvoice);
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);
  const generatedPDF = useSelector(selectGeneratedFiles);

  // États locaux
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInvoiceHistoryOpen, setIsInvoiceHistoryOpen] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState("DRAFT");

  const { symbol } = useCurrency();

  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const { setIsViewLocked } = useAppMainContext();
  const { isLoggedIn } = useAuth();

  // Options paiement avec traductions
  const getPaymentMethods = () => [
    { value: "BANK_TRANSFER", label: t("invoice.paymentMethods.bankTransfer"), icon: "🏦" },
    { value: "CREDIT_CARD",   label: t("invoice.paymentMethods.creditCard"),   icon: "💳" },
    { value: "CASH",          label: t("invoice.paymentMethods.cash"),          icon: "💵" },
    { value: "PAYPAL",        label: t("invoice.paymentMethods.paypal"),        icon: "🅿️" },
    { value: "CHECK",         label: t("invoice.paymentMethods.check"),         icon: "📝" },
    { value: "STRIPE",        label: t("invoice.paymentMethods.stripe"),        icon: "💠" },
    { value: "DIRECT_DEBIT",  label: t("invoice.paymentMethods.directDebit"),   icon: "🏛️" },
    { value: "BITCOIN",       label: t("invoice.paymentMethods.bitcoin"),       icon: "₿" },
    { value: "APPLE_PAY",     label: t("invoice.paymentMethods.applePay"),      icon: "🍏" },
    { value: "GOOGLE_PAY",    label: t("invoice.paymentMethods.googlePay"),     icon: "🅶" },
    { value: "WIRE_TRANSFER", label: t("invoice.paymentMethods.wireTransfer"),  icon: "💱" },
    { value: "OTHER",         label: t("invoice.paymentMethods.other"),         icon: "❓" },
  ];

  useEffect(() => {
    if (!isLoggedIn()) setIsViewLocked(true);
  }, [isLoggedIn, setIsViewLocked]);

  // ── Formulaire ──────────────────────────────
  const [formData, setFormData] = useState({
    invoiceNumber: "FA-XXXX",
    quoteNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    purchaseOrder: "",
    companyName: "fibem",
    companyAddress: "fibem address",
    companyCity: "Vernon",
    companyPostalCode: "xxx - unknow",
    companyPhone: "+33 xx xx xx x",
    companyEmail: "email@gmail.com",
    companyTaxId: "",
    companyLogo: "",
    clientName: "Client",
    clientCompany: "companie client",
    clientEmail: "client@gmail.com",
    clientPhone: "+237 xxx xxx xxx",
    clientAddress: "Adresse",
    clientCity: "Yaounde",
    clientPostalCode: "BP xxx - Yaounde",
    clientTaxId: "",
    paymentTerms: "30",
    paymentMethod: "OTHER",
    bankName: "",
    bankAccount: "",
    notes: "",
    termsAndConditions: "",
  });

  // ── Articles ────────────────────────────────
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: "Développement application web", quantity: 1, unitPrice: 10, discount: 10, taxRate: 18, total: 0 },
    { id: 2, description: "Maintenance", quantity: 2, unitPrice: 50, discount: 0, taxRate: 18, total: 0 },
    { id: 3, description: "Hébergement annuel", quantity: 1, unitPrice: 20, discount: 0, taxRate: 18, total: 0 },
  ]);

  const [logoPreview, setLogoPreview] = useState("");

  // ── Chargement si édition ───────────────────
  useEffect(() => {
    if (invoiceId) dispatch(fetchInvoiceById(invoiceId));
  }, [invoiceId, dispatch]);

  useEffect(() => {
    if (currentInvoice) {
      setFormData({
        invoiceNumber: currentInvoice.invoiceNumber || "FA-XXXX",
        invoiceDate: currentInvoice.invoiceDate || new Date().toISOString().split("T")[0],
        dueDate: currentInvoice.dueDate || "",
        purchaseOrder: currentInvoice.purchaseOrder || "",
        companyName: currentInvoice.companyName || "",
        companyAddress: currentInvoice.companyAddress || "",
        companyCity: currentInvoice.companyCity || "",
        companyPostalCode: currentInvoice.companyPostalCode || "",
        companyPhone: currentInvoice.companyPhone || "",
        companyEmail: currentInvoice.companyEmail || "",
        companyTaxId: currentInvoice.companyTaxId || "",
        companyLogo: currentInvoice.companyLogo || "",
        clientName: currentInvoice.clientName || "",
        clientCompany: currentInvoice.clientCompany || "",
        clientEmail: currentInvoice.clientEmail || "",
        clientPhone: currentInvoice.clientPhone || "",
        clientAddress: currentInvoice.clientAddress || "",
        clientCity: currentInvoice.clientCity || "",
        clientPostalCode: currentInvoice.clientPostalCode || "",
        clientTaxId: currentInvoice.clientTaxId || "",
        paymentTerms: currentInvoice.paymentTerms || "30",
        paymentMethod: currentInvoice.paymentMethod || "OTHER",
        bankName: currentInvoice.bankName || "",
        bankAccount: currentInvoice.bankAccount || "",
        notes: currentInvoice.notes || "",
        termsAndConditions: currentInvoice.termsAndConditions || "",
      });
      if (currentInvoice.invoiceItems) setInvoiceItems(currentInvoice.invoiceItems);
      if (currentInvoice.invoiceStatus) setInvoiceStatus(currentInvoice.invoiceStatus);
    }
  }, [currentInvoice]);

  useEffect(() => {
    if (selectedQuote) {
      setFormData({
        invoiceNumber: selectedQuote.quoteNumber ? `FA-${selectedQuote.quoteNumber.replace(/^DE-/, "")}` : "FA-XXXX",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        purchaseOrder: selectedQuote.projectInfo?.projectName || "",
        companyName: selectedQuote.companyInfo?.companyName || "",
        companyAddress: selectedQuote.companyInfo?.companyAddress || "",
        companyCity: selectedQuote.companyInfo?.companyCity || "",
        companyPostalCode: "",
        companyPhone: selectedQuote.companyInfo?.companyPhone || selectedQuote.companyInfo?.companyPort || "",
        companyEmail: selectedQuote.companyInfo?.companyEmail || "",
        companyTaxId: selectedQuote.companyInfo?.companyTva || "",
        companyLogo: selectedQuote.companyInfo?.companyLogo || "",
        clientName: selectedQuote.clientInfo ? `${selectedQuote.clientInfo.firstName || ""} ${selectedQuote.clientInfo.lastName || ""}`.trim() : "",
        clientCompany: selectedQuote.clientInfo?.company || "",
        clientEmail: selectedQuote.clientInfo?.email || "",
        clientPhone: selectedQuote.clientInfo?.phone || "",
        clientAddress: selectedQuote.clientInfo?.address || "",
        clientCity: selectedQuote.clientInfo?.city || "",
        clientPostalCode: selectedQuote.clientInfo?.postalCode || "",
        clientTaxId: "",
        paymentTerms: "30",
        paymentMethod: "OTHER",
        bankName: "",
        bankAccount: "",
        notes: selectedQuote.additionalNotes || "",
        termsAndConditions: selectedQuote.termsAndConditions || "",
      });
      if (selectedQuote.quoteItems) setInvoiceItems(selectedQuote.quoteItems);
      setInvoiceStatus("DRAFT");
    }
  }, [selectedQuote]);

  useEffect(() => {
    if (error) {
      const tTimeout = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(tTimeout);
    }
  }, [error, dispatch]);

  // ── Formulaire handlers ─────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceDateChange = (e) => {
    const invoiceDate = e.target.value;
    const paymentTerms = parseInt(formData.paymentTerms) || 30;
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + paymentTerms);
    setFormData(prev => ({ ...prev, invoiceDate, dueDate: date.toISOString().split("T")[0] }));
  };

  const handlePaymentTermsChange = (e) => {
    const paymentTerms = e.target.value;
    if (formData.invoiceDate) {
      const date = new Date(formData.invoiceDate);
      date.setDate(date.getDate() + parseInt(paymentTerms));
      setFormData(prev => ({ ...prev, paymentTerms, dueDate: date.toISOString().split("T")[0] }));
    } else {
      setFormData(prev => ({ ...prev, paymentTerms }));
    }
  };

  // ── Articles handlers ───────────────────────
  const addInvoiceItem = () => {
    const newId = Math.max(...invoiceItems.map(i => i.id), 0) + 1;
    setInvoiceItems([...invoiceItems, { id: newId, description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 18, total: 0 }]);
  };

  const updateInvoiceItem = (id, field, value) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id !== id) return item;
      const u = { ...item, [field]: value };
      const qty = parseFloat(field === "quantity" ? value : u.quantity) || 0;
      const price = parseFloat(field === "unitPrice" ? value : u.unitPrice) || 0;
      const disc = parseFloat(field === "discount" ? value : u.discount) || 0;
      const tax = parseFloat(field === "taxRate" ? value : u.taxRate) || 0;
      const base = qty * price;
      const afterDisc = base - base * (disc / 100);
      u.total = afterDisc + afterDisc * (tax / 100);
      return u;
    }));
  };

  const removeInvoiceItem = (id) => {
    if (invoiceItems.length > 1) setInvoiceItems(invoiceItems.filter(i => i.id !== id));
  };

  const duplicateInvoiceItem = (id) => {
    const item = invoiceItems.find(i => i.id === id);
    if (!item) return;
    const newId = Math.max(...invoiceItems.map(i => i.id), 0) + 1;
    setInvoiceItems([...invoiceItems, { ...item, id: newId }]);
  };

  // ── Calculs ─────────────────────────────────
  const subtotal = invoiceItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalDiscount = invoiceItems.reduce((s, i) => s + i.quantity * i.unitPrice * (i.discount / 100), 0);
  const subtotalAfterDiscount = subtotal - totalDiscount;
  const totalTax = invoiceItems.reduce((s, i) => {
    const base = i.quantity * i.unitPrice * (1 - i.discount / 100);
    return s + base * (i.taxRate / 100);
  }, 0);
  const total = invoiceItems.reduce((s, i) => s + i.total, 0);

  // ── Validation ──────────────────────────────
  const isFormValid = () => {
    const ok = ["invoiceDate", "companyName", "clientName"]
      .every(f => formData[f]?.toString().trim() !== "");
    const itemsOk = invoiceItems.every(i => i.description?.trim() && i.unitPrice > 0);
    return ok && itemsOk;
  };

  // ── Validation par étape ────────────────────
  const canGoNext = () => {
    switch (getSteps(t)[currentStep].id) {
      case "invoice": return formData.invoiceNumber && formData.invoiceDate;
      case "company": return formData.companyName?.trim() !== "";
      case "client": return formData.clientName?.trim() !== "";
      case "items": return invoiceItems.length > 0 && invoiceItems.every(i => i.description?.trim() && i.unitPrice > 0);
      default: return true;
    }
  };

  // ── Navigation ──────────────────────────────
  const goNext = () => { if (currentStep < getSteps(t).length - 1) setCurrentStep(s => s + 1); };
  const goPrev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const goTo = (i) => setCurrentStep(i);

  // ── Actions ─────────────────────────────────
  const handleGenerateInvoice = async (format = "pdf") => {
    setIsGenerating(true);
    try {
      const payload = {
        ...formData,
        invoiceItems: invoiceItems.map(({ id, ...i }) => i),
        invoiceStatus,
        subtotal, totalDiscount, subtotalAfterDiscount, totalTax, total,
      };
      let invoiceIdResult;
      if (currentInvoice?.id) {
        await dispatch(updateInvoiceById({ id: currentInvoice.id, data: payload })).unwrap();
        invoiceIdResult = currentInvoice.id;
      } else {
        const res = await dispatch(createInvoice(payload)).unwrap();
        invoiceIdResult = res.content.id;
      }
      if (!invoiceIdResult) throw new Error(t("invoice.errors.idNotFound"));
      const genRes = await dispatch(generateInvoiceFiles({ id: invoiceIdResult, format: "all" })).unwrap();
      if (format.toLowerCase().trim() === "pdf") {
        if (genRes.content?.pdf?.url) window.open(genRes.content.pdf.url, "_blank");
      } else {
        if (genRes.content?.xlsx?.url) window.open(genRes.content.xlsx.url, "_blank");
      }
      setCurrentStep(getSteps(t).length - 1);
    } catch (err) {
      console.error(err);
      alert(err.message || t("invoice.errors.generationError"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (currentInvoice?.id) {
      setIsGenerating(true);
      try {
        const res = await dispatch(fetchInvoiceById(currentInvoice.id)).unwrap();
        if (res.content?.files?.pdf) {
          const a = document.createElement("a");
          a.href = `${UPLOADED_FILES_URL}${res.content.files.pdf}`;
          a.download = `${t("invoice.fileName")}_${res.content.invoiceNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      await handleGenerateInvoice();
    }
  };

  const handleDownloadXlsx = async () => {
    if (currentInvoice?.id) {
      setIsGenerating(true);
      try {
        const res = await dispatch(fetchInvoiceById(currentInvoice.id)).unwrap();
        if (res.content?.files?.xlsx) {
          const a = document.createElement("a");
          a.href = `${UPLOADED_FILES_URL}${res.content.files.xlsx}`;
          a.download = `${t("invoice.fileName")}_${res.content.invoiceNumber}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      await handleGenerateInvoice("xlsx");
    }
  };

  const handleSendEmail = async () => {
    if (!currentInvoice?.id) {
      alert(t("invoice.errors.generateFirst"));
      return;
    }
    if (!formData.clientEmail) {
      alert(t("invoice.errors.clientEmailRequired"));
      return;
    }
    setIsSending(true);
    try {
      await dispatch(sendInvoiceByEmail({
        id: currentInvoice.id,
        email: formData.clientEmail,
        message: t("invoice.emailMessage", { number: formData.invoiceNumber }),
      })).unwrap();
      alert(t("invoice.alerts.sendSuccess"));
      setInvoiceStatus("SENT");
    } catch (err) {
      alert(t("invoice.alerts.sendError"));
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    dispatch(clearInvoice());
    setFormData({
      invoiceNumber: "FA-XXXX",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      purchaseOrder: "",
      companyName: "",
      companyAddress: "",
      companyCity: "",
      companyPostalCode: "",
      companyPhone: "",
      companyEmail: "",
      companyTaxId: "",
      companyLogo: "",
      clientName: "",
      clientCompany: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      clientCity: "",
      clientPostalCode: "",
      clientTaxId: "",
      paymentTerms: "30",
      paymentMethod: "OTHER",
      bankName: "",
      bankAccount: "",
      notes: "",
      termsAndConditions: "",
    });
    setInvoiceItems([{ id: 1, description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 18, total: 0 }]);
    setInvoiceStatus("DRAFT");
    setCurrentStep(0);
  };

  // ── Badge statut ────────────────────────────
  const getStatusBadge = () => {
    const cfg = {
      DRAFT: { label: t("invoice.status.draft"), className: "bg-gray-100 text-gray-700" },
      SENT: { label: t("invoice.status.sent"), className: "bg-blue-100 text-blue-700" },
      PAID: { label: t("invoice.status.paid"), className: "bg-green-100 text-green-700" },
      OVERDUE: { label: t("invoice.status.overdue"), className: "bg-red-100 text-red-700" },
    };
    const c = cfg[invoiceStatus] || cfg.DRAFT;
    return <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.className}`}>{c.label}</span>;
  };

  // ════════════════════════════════════════════
  // RENDU DES ÉTAPES
  // ════════════════════════════════════════════
  const renderStep = () => {
    const steps = getSteps(t);
    switch (steps[currentStep].id) {

      // ── Étape 1 : Informations facture ───────
      case "invoice":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("invoice.invoice.title")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("invoice.invoice.subtitle")}</p>
            </div>
            <HelpNotice variant="info" title={t("invoice.help.title")} tips={t("invoice.invoice.tips")} t={t} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quoteNumber">{t("invoice.invoice.quoteSelection")}</Label>
                <div className="relative">
                  <Button type="button" onClick={() => setIsQuoteDialogOpen(true)} variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    {t("invoice.invoice.selectQuote")}
                  </Button>
                  {selectedQuote && (
                    <div className="mt-2 px-3 py-1.5 border rounded text-xs bg-gray-50 text-gray-700">
                      <div>
                        <span className="font-semibold">{t("invoice.invoice.quoteNumber")} : </span>
                        <span className="font-mono text-primary">{selectedQuote.quoteNumber}</span>
                      </div>
                      <div>
                        <span className="font-semibold">{t("invoice.invoice.client")} : </span>
                        {selectedQuote.clientInfo
                          ? `${selectedQuote.clientInfo.firstName} ${selectedQuote.clientInfo.lastName}`
                          : 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">{t("invoice.invoice.amount")} : </span>
                        {selectedQuote.total
                          ? Number(selectedQuote.total).toLocaleString(locale) + ` ${symbol}`
                          : 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseOrder">{t("invoice.invoice.purchaseOrder")}</Label>
                <Input id="purchaseOrder" name="purchaseOrder" value={formData.purchaseOrder} onChange={handleInputChange} placeholder={t("invoice.invoice.purchaseOrderPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">{t("invoice.invoice.invoiceDate")} *</Label>
                <div className="relative">
                  <Input id="invoiceDate" name="invoiceDate" type="date" value={formData.invoiceDate} onChange={handleInvoiceDateChange} required />
                  <Calendar className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">{t("invoice.invoice.dueDate")}</Label>
                <div className="relative">
                  <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} />
                  <Clock className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">{t("invoice.invoice.paymentTerms")}</Label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handlePaymentTermsChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  <option value="0">{t("invoice.paymentTerms.immediate")}</option>
                  <option value="7">{t("invoice.paymentTerms.days7")}</option>
                  <option value="15">{t("invoice.paymentTerms.days15")}</option>
                  <option value="30">{t("invoice.paymentTerms.days30")}</option>
                  <option value="45">{t("invoice.paymentTerms.days45")}</option>
                  <option value="60">{t("invoice.paymentTerms.days60")}</option>
                  <option value="90">{t("invoice.paymentTerms.days90")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t("invoice.invoice.paymentMethod")}</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border rounded-md"
                >
                  <option value="">{t("invoice.invoice.selectPaymentMethod")}</option>
                  {getPaymentMethods().map(m => <option key={m.value} value={m.value}>{m.icon} {m.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        );

      // ── Étape 2 : Émetteur ───────────────────
      case "company":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("invoice.company.title")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("invoice.company.subtitle")}</p>
            </div>
            <HelpNotice variant="info" title={t("invoice.help.title")} tips={t("invoice.company.tips")} t={t} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">{t("invoice.company.name")} *</Label>
                <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder={t("invoice.company.namePlaceholder")} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyAddress">{t("invoice.company.address")}</Label>
                <Input id="companyAddress" name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} placeholder={t("invoice.company.addressPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyCity">{t("invoice.company.city")}</Label>
                <Input id="companyCity" name="companyCity" value={formData.companyCity} onChange={handleInputChange} placeholder={t("invoice.company.cityPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPostalCode">{t("invoice.company.postalCode")}</Label>
                <Input id="companyPostalCode" name="companyPostalCode" value={formData.companyPostalCode} onChange={handleInputChange} placeholder={t("invoice.company.postalCodePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">{t("invoice.company.phone")}</Label>
                <div className="relative">
                  <Input id="companyPhone" name="companyPhone" value={formData.companyPhone} onChange={handleInputChange} placeholder={t("invoice.company.phonePlaceholder")} />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">{t("invoice.company.email")}</Label>
                <div className="relative">
                  <Input id="companyEmail" name="companyEmail" type="email" value={formData.companyEmail} onChange={handleInputChange} placeholder={t("invoice.company.emailPlaceholder")} />
                  <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyTaxId">{t("invoice.company.taxId")}</Label>
                <Input id="companyTaxId" name="companyTaxId" value={formData.companyTaxId} onChange={handleInputChange} placeholder={t("invoice.company.taxIdPlaceholder")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyLogo">{t("invoice.company.logo")}</Label>
                <Input
                  id="companyLogo"
                  name="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={e => {
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
                      alt={t("invoice.company.logoAlt")}
                      className="border rounded max-h-16"
                      style={{ objectFit: "contain", background: "#f9f9f9", padding: 2 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ── Étape 3 : Client ─────────────────────
      case "client":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("invoice.client.title")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("invoice.client.subtitle")}</p>
            </div>
            <HelpNotice variant="info" title={t("invoice.help.title")} tips={t("invoice.client.tips")} t={t} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientName">{t("invoice.client.name")} *</Label>
                <Input id="clientName" name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder={t("invoice.client.namePlaceholder")} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientCompany">{t("invoice.client.company")}</Label>
                <Input id="clientCompany" name="clientCompany" value={formData.clientCompany} onChange={handleInputChange} placeholder={t("invoice.client.companyPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">{t("invoice.client.email")}</Label>
                <div className="relative">
                  <Input id="clientEmail" name="clientEmail" type="email" value={formData.clientEmail} onChange={handleInputChange} placeholder={t("invoice.client.emailPlaceholder")} />
                  <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">{t("invoice.client.phone")}</Label>
                <div className="relative">
                  <Input id="clientPhone" name="clientPhone" value={formData.clientPhone} onChange={handleInputChange} placeholder={t("invoice.client.phonePlaceholder")} />
                  <Phone className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientAddress">{t("invoice.client.address")}</Label>
                <Input id="clientAddress" name="clientAddress" value={formData.clientAddress} onChange={handleInputChange} placeholder={t("invoice.client.addressPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCity">{t("invoice.client.city")}</Label>
                <Input id="clientCity" name="clientCity" value={formData.clientCity} onChange={handleInputChange} placeholder={t("invoice.client.cityPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPostalCode">{t("invoice.client.postalCode")}</Label>
                <Input id="clientPostalCode" name="clientPostalCode" value={formData.clientPostalCode} onChange={handleInputChange} placeholder={t("invoice.client.postalCodePlaceholder")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientTaxId">{t("invoice.client.taxId")}</Label>
                <Input id="clientTaxId" name="clientTaxId" value={formData.clientTaxId} onChange={handleInputChange} placeholder={t("invoice.client.taxIdPlaceholder")} />
              </div>
            </div>
          </div>
        );

      // ── Étape 4 : Articles ───────────────────
      case "items":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t("invoice.items.title")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("invoice.items.subtitle")}</p>
              </div>
              <Badge variant="outline">{invoiceItems.length} {t("invoice.items.count", { count: invoiceItems.length })}</Badge>
            </div>
            <HelpNotice variant="info" title={t("invoice.help.title")} tips={t("invoice.items.tips")} t={t} />
            <div className="space-y-4">
              {invoiceItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 space-y-3 border rounded-xl bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{t("invoice.items.line")} {index + 1}</Badge>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        onClick={() => duplicateInvoiceItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
                        title={t("invoice.items.duplicate")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {invoiceItems.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInvoiceItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-red-500 hover:bg-red-50"
                          title={t("invoice.items.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("invoice.items.description")} *</Label>
                    <Input
                      value={item.description}
                      onChange={e => updateInvoiceItem(item.id, "description", e.target.value)}
                      placeholder={t("invoice.items.descriptionPlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    <div className="space-y-2">
                      <Label>{t("invoice.items.quantity")}</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        min="1"
                        step="0.01"
                        onChange={e => updateInvoiceItem(item.id, "quantity", Math.max(1, parseFloat(e.target.value) || 1))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("invoice.items.unitPrice")} ({symbol})</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        min="0"
                        step="0.01"
                        onChange={e => updateInvoiceItem(item.id, "unitPrice", Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("invoice.items.discount")}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={item.discount}
                          min="0"
                          max="100"
                          step="0.01"
                          onChange={e => updateInvoiceItem(item.id, "discount", Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        />
                        <Percent className="absolute w-3 h-3 text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("invoice.items.taxRate")}</Label>
                      <Input
                        type="number"
                        value={item.taxRate}
                        min="0"
                        step="0.01"
                        onChange={e => updateInvoiceItem(item.id, "taxRate", Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("invoice.items.total")}</Label>
                      <div className="flex items-center h-10 px-3 py-2 text-sm font-semibold bg-white border rounded-lg text-primary">
                        {item.total.toLocaleString(locale)} {symbol}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button type="button" onClick={addInvoiceItem} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" /> {t("invoice.items.addButton")}
            </Button>

            {/* Mini récap */}
            <div className="p-4 space-y-2 border rounded-xl bg-primary/5">
              <h4 className="text-sm font-semibold text-primary">{t("invoice.items.summary")}</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("invoice.items.subtotal")}</span>
                <span>{subtotal.toLocaleString(locale)} {symbol}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("invoice.items.totalDiscount")}</span>
                  <span className="text-green-600">-{totalDiscount.toLocaleString(locale)} {symbol}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("invoice.items.totalTax")}</span>
                <span>{totalTax.toLocaleString(locale)} {symbol}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("invoice.items.grandTotal")}</span>
                <span className="text-primary">{total.toLocaleString(locale)} {symbol}</span>
              </div>
            </div>
          </div>
        );

      // ── Étape 5 : Paiement ───────────────────
      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("invoice.payment.title")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("invoice.payment.subtitle")}</p>
            </div>
            <HelpNotice variant="info" title={t("invoice.help.title")} tips={t("invoice.payment.tips")} t={t} />
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">{t("invoice.payment.bankName")}</Label>
                <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder={t("invoice.payment.bankNamePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">{t("invoice.payment.bankAccount")}</Label>
                <Input id="bankAccount" name="bankAccount" value={formData.bankAccount} onChange={handleInputChange} placeholder={t("invoice.payment.bankAccountPlaceholder")} />
              </div>
            </div>
          </div>
        );

      // ── Étape 6 : Notes ──────────────────────
      case "notes":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{t("invoice.notes.title")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("invoice.notes.subtitle")}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">{t("invoice.notes.message")}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t("invoice.notes.messagePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">{t("invoice.notes.terms")}</Label>
                <Textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={t("invoice.notes.termsPlaceholder")}
                />
              </div>
            </div>
          </div>
        );

      // ── Étape 7 : Aperçu ─────────────────────
      case "preview":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{t("invoice.preview.title")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("invoice.preview.subtitle")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadXlsx}
                  disabled={isGenerating}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  {t("invoice.preview.downloadExcel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {t("invoice.preview.downloadPdf")}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ════════════════════════════════════════════
  const steps = getSteps(t);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-white">
        <div className="container px-4 py-10 mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-4 rounded-full w-14 h-14 bg-primary/10">
              <Receipt className="w-7 h-7 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{t("invoice.title")}</h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="font-mono text-sm text-gray-500">{formData.invoiceNumber}</span>
              {getStatusBadge()}
            </div>
            <p className="mt-1 text-sm text-gray-500">{t("invoice.subtitle")}</p>
          </motion.div>
        </div>
      </div>

      {/* Erreur Redux */}
      {error && (
        <div className="container max-w-5xl px-4 mx-auto mt-4">
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="flex-shrink-0 w-4 h-4" /> {error}
          </div>
        </div>
      )}

      <div className="container max-w-5xl px-4 py-8 mx-auto">
        {/* Barre de progression */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 mb-8 bg-white border shadow-sm rounded-2xl">
          <ProgressBar steps={steps} currentStep={currentStep} onNavigate={goTo} t={t} />
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-row items-center justify-between gap-3 mb-6">
          <div className="flex flex-col flex-1 gap-2 md:flex-none">
            <Button type="button" variant="outline" onClick={() => setIsInvoiceHistoryOpen(true)} className="gap-2 text-wrap">
              <BookOpen className="w-4 h-4" /> {t("invoice.navigation.history")}
            </Button>
            <Button type="button" variant="outline" onClick={goPrev} disabled={currentStep === 0} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> {t("invoice.navigation.previous")}
            </Button>
          </div>

          <div className="hidden text-xs text-muted-foreground sm:block">
            {currentStep + 1} / {steps.length}
          </div>

          <div className="flex flex-col flex-1 gap-2 md:flex-none">
            <Button
              type="button"
              onClick={() => handleGenerateInvoice("pdf")}
              disabled={isGenerating || !isFormValid()}
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
                  {t("invoice.navigation.generating")}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" style={{ width: 18, height: 18, marginRight: 6 }} />
                  {t("invoice.navigation.generate")}
                </>
              )}
            </Button>
            {currentStep < steps.length - 1 && (
              <Button type="button" variant="outline" onClick={goNext} disabled={!canGoNext()} className="gap-2">
                {t("invoice.navigation.next")} <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Contenu de l'étape */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-white border rounded-2xl shadow-sm p-6 md:p-8 min-h-[400px]"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation bas */}
        <div className="flex flex-row items-center justify-between gap-3 mt-6">
          <Button type="button" variant="outline" onClick={goPrev} disabled={currentStep === 0} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {t("invoice.navigation.previous")}
          </Button>
          <div className="hidden text-xs text-muted-foreground sm:block">
            {currentStep + 1} / {steps.length}
          </div>
          {currentStep < steps.length - 1 && (
            <Button type="button" variant="outline" onClick={goNext} disabled={!canGoNext()} className="gap-2">
              {t("invoice.navigation.next")} <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Conseils généraux (sauf aperçu) */}
        {steps[currentStep]?.id !== "preview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-8 border rounded-xl bg-muted/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="mb-2 text-sm font-semibold">{t("invoice.tips.title")}</h4>
                <ul className="grid grid-cols-1 gap-1 text-xs text-muted-foreground md:grid-cols-2">
                  {t("invoice.tips.list").map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bouton Nouvelle facture */}
        {steps[currentStep]?.id === "preview" && (
          <div className="flex justify-center mt-6">
            <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
              <RefreshCw className="w-4 h-4" /> {t("invoice.preview.newInvoice")}
            </Button>
          </div>
        )}
      </div>

      {/* Dialog Historique */}
      <InvoiceHistoryDialog
        isOpen={isInvoiceHistoryOpen}
        onClose={() => setIsInvoiceHistoryOpen(false)}
        onPreviewInvoice={(inv) => window.open(inv.url, "_blank")}
        onDownloadInvoice={(inv) => {}}
        onDeleteInvoice={(inv) => {}}
        onDuplicateInvoice={(inv) => {}}
      />

      {/* Dialog selection de devis */}
      <QuoteSelectionDialog
        isOpen={isQuoteDialogOpen}
        onClose={() => setIsQuoteDialogOpen(false)}
        onConfirm={(quote) => {
          setSelectedQuote(quote);
        }}
        title={t("invoice.quoteDialog.title")}
        description={t("invoice.quoteDialog.description")}
        allowVersionSelection={true}
      />
    </div>
  );
};

export default InvoicePage;