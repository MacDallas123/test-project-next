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
  Globe, GraduationCap, Briefcase,
  Award, Star, Plus, Trash2, Edit2, CheckCircle,
  Share2, Loader2, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Info, AlertCircle, Sparkles,
  LayoutTemplate, BookOpen, Languages, FolderOpen,
  Pencil, X, Upload, Lock, Heart, FilePlus, Wand2,
  Calendar, Car, Users, Navigation,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCV, createCV, generateCV,
  importCV,
  selectCurrentCV, updateCVById,
} from "@/redux/slices/cvSlice";
import CVHistoryDialog from "@/components/dialog/CvHistoryDialog";
import { useAuth } from "@/hooks/useAuth";
import { GithubIcon, LinkedInIcon, thunkSucceed } from "@/lib/tools";
import { useAppMainContext } from "@/context/AppProvider";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────
// DONNÉES PAR DÉFAUT
// ─────────────────────────────────────────────
const defaultCvData = {
  personal: {
    firstName: "AAA",
    lastName: "BBB",
    title: "Développeur Web Full Stack",
    email: "aaa.bbb@email.com",
    phone: "+33 6 12 34 56 78",
    address: "12 rue de l'Exemple",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    linkedin: "https://www.linkedin.com/in/aaabbb/",
    github: "https://github.com/jeandupont",
    portfolio: "https://jeandupont.dev",
    summary: "Développeur passionné avec plus de 5 ans d'expérience dans la conception de solutions web modernes et performantes. Compétences solides en React, Node.js et gestion de projet Agile.",
    photoUrl: "",
    showPhoto: true,
    age: 30,
    driverLicense: "",
    maritalStatus: "",
    mobility: "",
  },
  skills: [
    { id: 1, name: "JavaScript", level: "Avancé" },
    { id: 2, name: "React", level: "Avancé" },
    { id: 3, name: "Node.js", level: "Intermédiaire" },
    { id: 4, name: "SQL", level: "Intermédiaire" },
    { id: 5, name: "Git", level: "Avancé" }
  ],
  education: [
    {
      id: 1,
      school: "Université Paris-Sorbonne",
      degree: "Master Informatique",
      field: "Développement logiciel",
      startDate: "2016-09",
      endDate: "2018-07",
      city: "Paris",
      description: "Spécialisation en génie logiciel, architecture web et gestion de projets."
    }
  ],
  experience: [
    {
      id: 1,
      company: "WebTech Solutions",
      title: "Développeur Full Stack",
      location: "Paris, France",
      startDate: "2019-05",
      endDate: "2023-03",
      description: "Développement d'applications web en React et Node.js. Mise en place de CI/CD et de l'intégration API RESTful. Encadrement de 3 stagiaires."
    },
    {
      id: 2,
      company: "StartApp",
      title: "Développeur Frontend",
      location: "Paris, France",
      startDate: "2018-08",
      endDate: "2019-04",
      description: "Création d'interfaces utilisateur dynamiques et responsives avec React.js."
    }
  ],
  projects: [
    {
      id: 1,
      name: "Gestionnaire de tâches collaboratif",
      description: "Application full stack de gestion de tâches avec notifications temps réel.",
      link: "https://github.com/jeandupont/todo-collab"
    }
  ],
  languages: [
    { id: 1, name: "Français", level: "Natif" },
    { id: 2, name: "Anglais", level: "Avancé" }
  ],
  certifications: [
    {
      id: 1,
      name: "Certified JavaScript Developer",
      authority: "OpenClassrooms",
      year: "2021"
    }
  ],
  interests: [
    { id: 1, name: "Voyages" },
    { id: 2, name: "Photographie" },
    { id: 3, name: "Course à pied" }
  ],
  settings: {
    template: "classic",
    color: "#3b82f6",
    font: "Inter",
    showPhoto: true
  },
};

// ─────────────────────────────────────────────
// HELP NOTICE
// ─────────────────────────────────────────────
const HelpNotice = ({ tips, title, variant = "info", t }) => {
  const [open, setOpen] = useState(false);
  const c = {
    info:    { wrap: "bg-blue-50 border-blue-100",   txt: "text-blue-600"  },
    success: { wrap: "bg-emerald-50 border-emerald-100", txt: "text-emerald-600" },
    warning: { wrap: "bg-amber-50 border-amber-100", txt: "text-amber-600" },
  }[variant] || {};
  return (
    <div className={`border rounded-xl overflow-hidden text-sm ${c.wrap}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-4 py-2.5 font-medium ${c.txt}`}>
        <span className="flex items-center gap-2"><Info className="w-3.5 h-3.5" />{title || t("cv.help.title")}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            className="px-4 pb-3 space-y-1.5 overflow-hidden text-gray-600">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0 opacity-50" />
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
// BARRE D'ÉTAPES — flat, horizontale, fenêtre glissante
// ─────────────────────────────────────────────
const StepBar = ({ steps, currentStep, onNavigate, isLocked, t }) => {
  const pct = Math.round((currentStep / (steps.length - 1)) * 100);

  const half  = 2;
  const total = steps.length;
  let lo = Math.max(0, currentStep - half);
  let hi = Math.min(total - 1, lo + half * 2);
  lo = Math.max(0, hi - half * 2);
  const visible = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-primary/80">
          {steps[currentStep]?.label}
        </span>
        <span className="font-mono text-xs text-gray-400">{currentStep + 1} / {steps.length}</span>
      </div>

      <div className="relative h-0.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-primary"
          animate={{ width: `${pct}%` }} transition={{ duration: 0.35, ease: "easeOut" }} />
      </div>

      <div className="flex items-center gap-1">
        {lo > 0 && <span className="text-[10px] text-gray-300 select-none pr-1">···</span>}

        {visible.map((idx) => {
          const step   = steps[idx];
          const done   = idx < currentStep;
          const active = idx === currentStep;
          const locked = isLocked && idx > 0;
          const Icon   = step.icon;
          return (
            <button key={idx} type="button"
              onClick={() => !locked && onNavigate(idx)}
              disabled={locked}
              title={step.label}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-150 select-none
                ${active
                  ? "bg-primary text-white shadow-sm"
                  : done
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : locked
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer"
                }
              `}
            >
              {locked
                ? <Lock className="w-3 h-3" />
                : done
                  ? <CheckCircle className="w-3 h-3" />
                  : <Icon className="w-3 h-3" />
              }
              <span className="hidden sm:inline">{step.shortLabel}</span>
            </button>
          );
        })}

        {hi < total - 1 && <span className="text-[10px] text-gray-300 select-none pl-1">···</span>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
const CVGeneratorPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const cvRef    = useRef();
  const dispatch = useDispatch();
  const selectCurrentCVFS = useSelector(selectCurrentCV);
  const [isCvHistoryOpen, setIsCvHistoryOpen] = useState(false);
  const { user } = useAuth();

  const [currentStep,   setCurrentStep]   = useState(0);
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [cvType,        setCvType]        = useState(null);
  const [mode,          setMode]          = useState(null);
  const [importedFile,  setImportedFile]  = useState(null);
  const [cvData,        setCvData]        = useState(defaultCvData);
  const [newSkill,      setNewSkill]      = useState({ name: "", level: "Intermédiaire" });
  const [editingSkill,  setEditingSkill]  = useState(null);
  const [customMobility, setCustomMobility] = useState("");

  const { setIsViewLocked } = useAppMainContext();
  const { isLoggedIn } = useAuth();

  const isImported = mode === "import" && !!importedFile;
  const isLocked   = isImported;

  // Options pour les nouveaux champs avec traductions
  const getDriverLicenseOptions = () => [
    { value: "B", label: t("cv.driverLicense.options.B") },
    { value: "A", label: t("cv.driverLicense.options.A") },
    { value: "C", label: t("cv.driverLicense.options.C") },
    { value: "D", label: t("cv.driverLicense.options.D") },
    { value: "BE", label: t("cv.driverLicense.options.BE") },
    { value: "none", label: t("cv.driverLicense.options.none") },
  ];

  const getMaritalStatusOptions = () => [
    { value: "single", label: t("cv.maritalStatus.options.single") },
    { value: "married", label: t("cv.maritalStatus.options.married") },
    { value: "divorced", label: t("cv.maritalStatus.options.divorced") },
    { value: "widowed", label: t("cv.maritalStatus.options.widowed") },
    { value: "pacsed", label: t("cv.maritalStatus.options.pacsed") },
  ];

  const getMobilityOptions = () => [
    { value: "negrepelisse_30", label: t("cv.mobility.options.negrepelisse_30") },
    { value: "montauban_100", label: t("cv.mobility.options.montauban_100") },
    { value: "caussade_40", label: t("cv.mobility.options.caussade_40") },
    { value: "custom", label: t("cv.mobility.options.custom") },
  ];

  const getSkillLevels = () => ({
    beginner: t("cv.skills.levels.beginner"),
    intermediate: t("cv.skills.levels.intermediate"),
    advanced: t("cv.skills.levels.advanced"),
    expert: t("cv.skills.levels.expert"),
  });

  const getLanguageLevels = () => ({
    native: t("cv.languages.levels.native"),
    fluent: t("cv.languages.levels.fluent"),
    advanced: t("cv.languages.levels.advanced"),
    intermediate: t("cv.languages.levels.intermediate"),
    beginner: t("cv.languages.levels.beginner"),
    notions: t("cv.languages.levels.notions"),
  });

  useEffect(() => {
    if(!isLoggedIn()) setIsViewLocked(true);
  }, []);

  useEffect(() => {
    if(selectCurrentCVFS) {
      let currentCVData = JSON.parse(JSON.stringify(selectCurrentCVFS));
      currentCVData.personal = selectCurrentCVFS?.personalInfo;
      delete currentCVData.personalInfo;
      setCvData(currentCVData);
      setCvType(currentCVData?.type?.toLowerCase());
      setMode("create");
      setImportedFile(null);
    }
  }, [selectCurrentCVFS]);

  // Définition des étapes avec traductions
  const STEPS = [
    { id: "type",           label: t("cv.steps.start"),          shortLabel: t("cv.steps.start"),      icon: LayoutTemplate },
    { id: "personal",       label: t("cv.steps.personal"),       shortLabel: t("cv.steps.personal"),   icon: User },
    { id: "experience",     label: t("cv.steps.experience"),     shortLabel: t("cv.steps.experience"), icon: Briefcase },
    { id: "education",      label: t("cv.steps.education"),      shortLabel: t("cv.steps.education"),  icon: GraduationCap },
    { id: "skills",         label: t("cv.steps.skills"),         shortLabel: t("cv.steps.skills"),     icon: Star },
    { id: "languages",      label: t("cv.steps.languages"),      shortLabel: t("cv.steps.languages"),  icon: Languages },
    { id: "certifications", label: t("cv.steps.certifications"), shortLabel: t("cv.steps.certifications"), icon: Award },
    { id: "projects",       label: t("cv.steps.projects"),       shortLabel: t("cv.steps.projects"),   icon: FolderOpen },
    { id: "interests",      label: t("cv.steps.interests"),      shortLabel: t("cv.steps.interests"),  icon: Heart },
    { id: "settings",       label: t("cv.steps.appearance"),     shortLabel: t("cv.steps.appearance"), icon: Edit2 },
    { id: "preview",        label: t("cv.steps.export"),         shortLabel: t("cv.steps.export"),     icon: Eye },
  ];

  // Helpers
  const handleInputChange = (section, field, value) =>
    setCvData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const handleArrayChange = (section, index, field, value) =>
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));

  const addItem = (section, defaultItem) =>
    setCvData(prev => ({ ...prev, [section]: [...prev[section], { id: Date.now(), ...defaultItem }] }));

  const removeItem = (section, id) =>
    setCvData(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));

  const moveItem = (section, index, direction) => {
    const items = [...cvData[section]];
    const ni = direction === "up" ? index - 1 : index + 1;
    if (ni >= 0 && ni < items.length) {
      [items[index], items[ni]] = [items[ni], items[index]];
      setCvData(prev => ({ ...prev, [section]: items }));
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    const maxId = cvData.skills.length ? Math.max(...cvData.skills.map(s => +s.id || 0)) : 0;
    addItem("skills", { ...newSkill, id: maxId + 1 });
    setNewSkill({ name: "", level: getSkillLevels().intermediate });
  };

  const handleNewCV = () => {
    dispatch(clearCV());
    setCvData(defaultCvData);
    setCvType(null);
    setMode(null);
    setImportedFile(null);
    setCurrentStep(0);
  };

  // Navigation
  const goNext = () => { if (!isLocked) setCurrentStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 0));
  const goTo   = (i) => { if (i === 0 || !isLocked) setCurrentStep(i); };

  const canGoNext = () => {
    if (currentStep === 0) return (mode === "import" && !!importedFile) || (mode === "create" && !!cvType);
    if (currentStep === 1) return !!(cvData.personal.firstName && cvData.personal.lastName && cvData.personal.email);
    return true;
  };

  // Génération
  const handleGenerateCV = async () => {
    setIsGenerating(true);
    try {
      if (isImported) {
        const importedResponse = await dispatch(importCV(importedFile));

        if(thunkSucceed(importedResponse)) {
          alert(t("cv.alerts.importSuccess"));
          dispatch(clearCV());
          setCvData(defaultCvData);
          setCvType(null);
          setMode(null);
          setImportedFile(null);
          setCurrentStep(0);
        } else {
          console.log("IMPORTED RESPONSE :", importedResponse);
          alert(t("cv.alerts.importError"));
        }
        return;
      }

      cvData.settings.template = cvType;
      const payload = {
        personal: cvData.personal, skills: cvData.skills,
        education: cvData.education, experience: cvData.experience,
        projects: cvData.projects, languages: cvData.languages,
        certifications: cvData.certifications, interests: cvData.interests,
        settings: cvData.settings, cvType,
        title: `CV - ${cvData.personal.firstName || ""} ${cvData.personal.lastName || ""}`.trim() || "Nouveau CV",
      };
      
      let cvId;
      if (selectCurrentCVFS?.id) {
        await dispatch(updateCVById({ id: selectCurrentCVFS.id, data: payload })).unwrap();
        cvId = selectCurrentCVFS.id;
      } else {
        const r = await dispatch(createCV(payload)).unwrap();
        cvId = r.content.id;
      }
      const gen = await dispatch(generateCV({ id: cvId, format: "pdf", template: cvType })).unwrap();
      if (gen.content?.url) window.open(gen.content.url, "_blank");
      else alert(t("cv.alerts.noLink"));
    } catch (err) {
      alert(t("cv.alerts.generationError").replace("{message}", err.message || t("cv.alerts.defaultError")));
    } finally {
      setIsGenerating(false);
    }
  };

  // Gestion de la mobilité
  const handleMobilityChange = (value) => {
    if (value === "custom") {
      handleInputChange("personal", "mobility", customMobility);
    } else {
      const option = getMobilityOptions().find(opt => opt.value === value);
      if (option) {
        handleInputChange("personal", "mobility", option.label);
      }
    }
  };

  // ── Étape 0 ──────────────────────────────────
  const renderStepType = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-semibold text-gray-900">{t("cv.mode.howToProceed")}</h2>
        <p className="text-sm text-gray-400">{t("cv.mode.chooseOption")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => { setMode("create"); setImportedFile(null); }}
          className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all
            ${mode === "create"
              ? "border-primary bg-primary/[0.03]"
              : "border-gray-100 hover:border-gray-200 bg-white"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
            ${mode === "create" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400 group-hover:bg-gray-150"}`}>
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{t("cv.mode.create.title")}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{t("cv.mode.create.description")}</p>
          </div>
          {mode === "create" && (
            <span className="absolute flex items-center justify-center w-5 h-5 rounded-full top-3 right-3 bg-primary">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </span>
          )}
        </button>

        <button type="button" onClick={() => { setMode("import"); setCvType(null); }}
          className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all
            ${mode === "import"
              ? "border-primary bg-primary/[0.03]"
              : "border-gray-100 hover:border-gray-200 bg-white"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
            ${mode === "import" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400 group-hover:bg-gray-150"}`}>
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{t("cv.mode.import.title")}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{t("cv.mode.import.description")}</p>
          </div>
          {mode === "import" && (
            <span className="absolute flex items-center justify-center w-5 h-5 rounded-full top-3 right-3 bg-primary">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === "create" && (
          <motion.div key="create-block"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{t("cv.mode.format.title")}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "classic", label: t("cv.mode.format.classic"), desc: t("cv.mode.format.classicDesc"), icon: FileText },
                { id: "fibem",   label: t("cv.mode.format.fibem"),   desc: t("cv.mode.format.fibemDesc"),   icon: Sparkles },
              ].map(({ id, label, desc, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setCvType(id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                    ${cvType === id
                      ? "border-primary bg-primary/[0.04] text-primary"
                      : "border-gray-100 hover:border-gray-200 text-gray-600"}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${cvType === id ? "text-primary" : "text-gray-400"}`} />
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-[11px] text-gray-400">{desc}</p>
                  </div>
                  {cvType === id && <CheckCircle className="w-4 h-4 ml-auto text-primary" />}
                </button>
              ))}
            </div>
            {!cvType && (
              <p className="flex items-center gap-1.5 text-xs text-amber-500">
                <AlertCircle className="w-3.5 h-3.5" /> {t("cv.mode.format.selectRequired")}
              </p>
            )}
          </motion.div>
        )}

        {mode === "import" && (
          <motion.div key="import-block"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{t("cv.mode.import.title")}</p>

            {!importedFile ? (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors">
                <Upload className="text-gray-300 w-7 h-7" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">{t("cv.mode.import.dragOrClick")}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t("cv.mode.import.maxSize")}</p>
                </div>
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only"
                  onChange={e => { if (e.target.files[0]) setImportedFile(e.target.files[0]); }} />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-4 border bg-emerald-50 border-emerald-100 rounded-xl">
                <div className="flex items-center justify-center flex-shrink-0 rounded-lg w-9 h-9 bg-emerald-100">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-emerald-800">{importedFile.name}</p>
                  <p className="text-xs text-emerald-500">{t("cv.mode.import.ready")}</p>
                </div>
                <button type="button" onClick={() => setImportedFile(null)}
                  className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {importedFile && (
              <p className="flex items-center gap-1.5 text-xs text-amber-500">
                <Lock className="w-3.5 h-3.5" /> {t("cv.mode.import.lockedMessage")}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Rendu de l'étape courante ────────────────
  const renderStep = () => {
    const stepId = STEPS[currentStep]?.id;
    if (stepId === "type") return renderStepType();

    // ÉTAPE 1 : Informations personnelles
    if (stepId === "personal") return (
      <div className="space-y-6">
        <StepHeader icon={User} title={t("cv.steps.personal")} badge={cvType === "fibem" ? "FIBEM" : t("cv.mode.format.classic")} />
        <HelpNotice title={t("cv.help.title")} tips={t("cv.personal.tips")} t={t} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={t("cv.personal.lastName")}><Input value={cvData.personal.lastName}
            onChange={e => handleInputChange("personal", "lastName", e.target.value)} placeholder={t("cv.personal.placeholders.lastName")} /></Field>
          <Field label={t("cv.personal.firstName")}><Input value={cvData.personal.firstName}
            onChange={e => handleInputChange("personal", "firstName", e.target.value)} placeholder={t("cv.personal.placeholders.firstName")} /></Field>
          <Field label={t("cv.personal.age")}>
            <div className="flex items-center gap-2"><Calendar className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <Input type="number" value={cvData.personal.age || ""}
                onChange={e => handleInputChange("personal", "age", e.target.value)} placeholder={t("cv.personal.placeholders.age")} min="16" max="99" /></div>
          </Field>
          <Field label={t("cv.personal.title")} full><Input value={cvData.personal.title}
            onChange={e => handleInputChange("personal", "title", e.target.value)} placeholder={t("cv.personal.placeholders.title")} /></Field>
          <Field label={t("cv.personal.email")}>
            <div className="flex items-center gap-2"><Mail className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <Input type="email" value={cvData.personal.email}
                onChange={e => handleInputChange("personal", "email", e.target.value)} placeholder={t("cv.personal.placeholders.email")} /></div>
          </Field>
          <Field label={t("cv.personal.phone")}>
            <div className="flex items-center gap-2"><Phone className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <Input value={cvData.personal.phone}
                onChange={e => handleInputChange("personal", "phone", e.target.value)} placeholder={t("cv.personal.placeholders.phone")} /></div>
          </Field>
          <Field label={t("cv.personal.address")}>
            <Input value={cvData.personal.address}
              onChange={e => handleInputChange("personal", "address", e.target.value)} placeholder={t("cv.personal.placeholders.address")} /></Field>
          <Field label={t("cv.personal.city")}>
            <div className="flex items-center gap-2"><MapPin className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <Input value={cvData.personal.city}
                onChange={e => handleInputChange("personal", "city", e.target.value)} placeholder={t("cv.personal.placeholders.city")} /></div>
          </Field>
          <Field label={t("cv.personal.country")}><Input value={cvData.personal.country}
            onChange={e => handleInputChange("personal", "country", e.target.value)} placeholder={t("cv.personal.placeholders.country")} /></Field>
          
          <Field label={t("cv.driverLicense.label")}>
            <div className="flex items-center gap-2"><Car className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <select className="w-full px-3 py-2 border rounded-lg" value={cvData.personal.driverLicense || ""}
                onChange={e => handleInputChange("personal", "driverLicense", e.target.value)}>
                <option value="">{t("cv.driverLicense.label")}</option>
                {getDriverLicenseOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </Field>

          <Field label={t("cv.maritalStatus.label")}>
            <div className="flex items-center gap-2"><Users className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <select className="w-full px-3 py-2 border rounded-lg" value={cvData.personal.maritalStatus || ""}
                onChange={e => handleInputChange("personal", "maritalStatus", e.target.value)}>
                <option value="">{t("cv.maritalStatus.label")}</option>
                {getMaritalStatusOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </Field>

          <Field label={t("cv.mobility.label")} full>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><Navigation className="flex-shrink-0 w-4 h-4 text-gray-300" />
                <select className="flex-1 px-3 py-2 border rounded-lg" value={
                  getMobilityOptions().find(opt => opt.label === cvData.personal.mobility)?.value || 
                  (cvData.personal.mobility ? "custom" : "")
                } onChange={e => handleMobilityChange(e.target.value)}>
                  <option value="">{t("cv.mobility.label")}</option>
                  {getMobilityOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {(getMobilityOptions().find(opt => opt.label === cvData.personal.mobility)?.value === "custom" || 
                (cvData.personal.mobility && !getMobilityOptions().find(opt => opt.label === cvData.personal.mobility))) && (
                <Input value={customMobility} onChange={e => {
                  setCustomMobility(e.target.value);
                  handleInputChange("personal", "mobility", e.target.value);
                }} placeholder={t("cv.mobility.placeholder")} />
              )}
            </div>
          </Field>

          <Field label={t("cv.personal.linkedin")}>
            <div className="flex items-center gap-2"><LinkedInIcon className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <Input value={cvData.personal.linkedin}
                onChange={e => handleInputChange("personal", "linkedin", e.target.value)} placeholder={t("cv.personal.placeholders.linkedin")} /></div>
          </Field>
          <Field label={t("cv.personal.github")}>
            <div className="flex items-center gap-2"><GithubIcon className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <Input value={cvData.personal.github}
                onChange={e => handleInputChange("personal", "github", e.target.value)} placeholder={t("cv.personal.placeholders.github")} /></div>
          </Field>
          <Field label={t("cv.personal.portfolio")} full>
            <div className="flex items-center gap-2"><Globe className="flex-shrink-0 w-4 h-4 text-gray-300" />
              <Input value={cvData.personal.portfolio}
                onChange={e => handleInputChange("personal", "portfolio", e.target.value)} placeholder={t("cv.personal.placeholders.portfolio")} /></div>
          </Field>

          <div className="pt-2 space-y-3 md:col-span-2">
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{t("cv.personal.photo")}</p>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={cvData.personal.showPhoto || false}
                  onChange={e => handleInputChange("personal", "showPhoto", e.target.checked)}
                  className="border-gray-300 rounded" />
                <span className="text-xs text-gray-500">{t("cv.personal.includePhoto")}</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors">
                <Upload className="w-5 h-5 text-gray-300" />
                <span className="text-xs text-gray-400">JPG / PNG — format carré recommandé</span>
                <input type="file" accept="image/*" className="sr-only"
                  onChange={e => {
                    if (e.target.files[0]) {
                      const r = new FileReader();
                      r.onload = ev => handleInputChange("personal", "photoUrl", ev.target.result);
                      r.readAsDataURL(e.target.files[0]);
                    }
                  }} />
              </label>
              <div className="relative flex-shrink-0">
                {cvData.personal.photoUrl
                  ? <>
                    <img src={cvData.personal.photoUrl} alt="Photo"
                      className="object-cover w-20 h-20 border border-gray-200 rounded-xl" />
                    <button type="button" onClick={() => handleInputChange("personal", "photoUrl", "")}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center hover:bg-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                  : <div className="flex items-center justify-center w-20 h-20 border-2 border-gray-200 border-dashed rounded-xl bg-gray-50">
                    <User className="text-gray-200 w-7 h-7" />
                  </div>
                }
              </div>
            </div>
          </div>

          <Field label={t("cv.personal.summary")} full>
            <Textarea value={cvData.personal.summary}
              onChange={e => handleInputChange("personal", "summary", e.target.value)}
              placeholder={t("cv.personal.placeholders.summary")} rows={3} />
          </Field>
        </div>
      </div>
    );

    // ÉTAPE 2 : Expérience
    if (stepId === "experience") return (
      <div className="space-y-6">
        <StepHeader icon={Briefcase} title={t("cv.experience.title")}
          badge={`${cvData.experience.length} ${t("cv.experience.title").toLowerCase()}${cvData.experience.length !== 1 ? "s" : ""}`} />
        <HelpNotice title={t("cv.help.title")} tips={t("cv.experience.tips")} t={t} />
        <div className="space-y-4">
          {cvData.experience.map((exp, index) => (
            <Card key={exp.id} title={`${t("cv.experience.title")} #${index + 1}`}
              onUp={() => moveItem("experience", index, "up")} upDisabled={index === 0}
              onDown={() => moveItem("experience", index, "down")} downDisabled={index === cvData.experience.length - 1}
              onDelete={() => removeItem("experience", exp.id)}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("cv.experience.position")}><Input value={exp.title || ""} onChange={e => handleArrayChange("experience", index, "title", e.target.value)} placeholder={t("cv.experience.position")} /></Field>
                <Field label={t("cv.experience.company")}><Input value={exp.company || ""} onChange={e => handleArrayChange("experience", index, "company", e.target.value)} placeholder={t("cv.experience.company")} /></Field>
                <Field label={t("cv.experience.location")}><Input value={exp.location || ""} onChange={e => handleArrayChange("experience", index, "location", e.target.value)} placeholder={t("cv.experience.location")} /></Field>
                <Field label={t("cv.experience.currentlyWorking")}>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input type="checkbox" checked={exp.current || false} onChange={e => handleArrayChange("experience", index, "current", e.target.checked)} className="rounded" />
                    <span className="text-sm text-gray-600">{t("cv.experience.currentlyWorking")}</span>
                  </label>
                </Field>
                <Field label={t("cv.experience.startDate")}><Input type="month" value={exp.startDate || ""} onChange={e => handleArrayChange("experience", index, "startDate", e.target.value)} /></Field>
                <Field label={`${t("cv.experience.endDate")}${!exp.current ? " *" : ""}`}><Input type="month" value={exp.endDate || ""} onChange={e => handleArrayChange("experience", index, "endDate", e.target.value)} disabled={exp.current} /></Field>
                <Field label={t("cv.experience.description")} full><Textarea value={exp.description || ""} onChange={e => handleArrayChange("experience", index, "description", e.target.value)} placeholder={t("cv.experience.description")} rows={3} /></Field>
              </div>
            </Card>
          ))}
        </div>
        <AddButton onClick={() => addItem("experience", { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" })} label={t("cv.experience.addButton")} />
      </div>
    );

    // ÉTAPE 3 : Formation
    if (stepId === "education") return (
      <div className="space-y-6">
        <StepHeader icon={GraduationCap} title={t("cv.education.title")}
          badge={`${cvData.education.length} ${t("cv.education.title").toLowerCase()}${cvData.education.length !== 1 ? "s" : ""}`} />
        <HelpNotice title={t("cv.help.title")} tips={t("cv.education.tips")} t={t} />
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
            <Card key={edu.id} title={`${t("cv.education.title")} #${index + 1}`}
              onUp={() => moveItem("education", index, "up")} upDisabled={index === 0}
              onDown={() => moveItem("education", index, "down")} downDisabled={index === cvData.education.length - 1}
              onDelete={() => removeItem("education", edu.id)}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("cv.education.degree")}><Input value={edu.degree || ""} onChange={e => handleArrayChange("education", index, "degree", e.target.value)} placeholder={t("cv.education.degree")} /></Field>
                <Field label={t("cv.education.school")}><Input value={edu.school || ""} onChange={e => handleArrayChange("education", index, "school", e.target.value)} placeholder={t("cv.education.school")} /></Field>
                <Field label={t("cv.education.location")}><Input value={edu.location || ""} onChange={e => handleArrayChange("education", index, "location", e.target.value)} placeholder={t("cv.education.location")} /></Field>
                <Field label={t("cv.education.currentlyStudying")}>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input type="checkbox" checked={edu.current || false} onChange={e => handleArrayChange("education", index, "current", e.target.checked)} className="rounded" />
                    <span className="text-sm text-gray-600">{t("cv.education.currentlyStudying")}</span>
                  </label>
                </Field>
                <Field label={t("cv.education.startDate")}><Input type="month" value={edu.startDate || ""} onChange={e => handleArrayChange("education", index, "startDate", e.target.value)} /></Field>
                <Field label={`${t("cv.education.endDate")}${!edu.current ? " *" : ""}`}><Input type="month" value={edu.endDate || ""} onChange={e => handleArrayChange("education", index, "endDate", e.target.value)} disabled={edu.current} /></Field>
                <Field label={t("cv.education.description")} full><Textarea value={edu.description || ""} onChange={e => handleArrayChange("education", index, "description", e.target.value)} placeholder={t("cv.education.description")} rows={2} /></Field>
              </div>
            </Card>
          ))}
        </div>
        <AddButton onClick={() => addItem("education", { degree: "", school: "", location: "", startDate: "", endDate: "", current: false, description: "" })} label={t("cv.education.addButton")} />
      </div>
    );
    
    // ÉTAPE 4 : Compétences
    if (stepId === "skills") return (
      <div className="space-y-6">
        <StepHeader icon={Star} title={t("cv.skills.title")}
          badge={`${cvData.skills.length} ${t("cv.skills.title").toLowerCase()}${cvData.skills.length !== 1 ? "s" : ""}`} />
        <HelpNotice title={t("cv.help.title")} tips={t("cv.skills.tips")} t={t} />
        <div className="space-y-2">
          {cvData.skills.map((skill, index) => {
            const skillLevels = getSkillLevels();
            return (
              <div key={skill.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                {editingSkill === skill.id ? (
                  <>
                    <Input value={skill.name} onChange={e => handleArrayChange("skills", index, "name", e.target.value)}
                      className="flex-1 h-8 text-sm" autoFocus />
                    <select className="px-2 py-1.5 text-xs border rounded-lg w-32" value={skill.level}
                      onChange={e => handleArrayChange("skills", index, "level", e.target.value)}>
                      <option>{skillLevels.beginner}</option><option>{skillLevels.intermediate}</option><option>{skillLevels.advanced}</option><option>{skillLevels.expert}</option>
                    </select>
                    <IconBtn onClick={() => setEditingSkill(null)} className="text-emerald-500 hover:bg-emerald-50"><CheckCircle className="w-4 h-4" /></IconBtn>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-700">{skill.name}</span>
                    <span className="text-xs text-gray-400 bg-white border border-gray-100 rounded-md px-2 py-0.5">{skill.level}</span>
                    <div className="flex items-center gap-0.5">
                      <IconBtn onClick={() => moveItem("skills", index, "up")} disabled={index === 0}><ChevronUp className="w-3.5 h-3.5" /></IconBtn>
                      <IconBtn onClick={() => moveItem("skills", index, "down")} disabled={index === cvData.skills.length - 1}><ChevronDown className="w-3.5 h-3.5" /></IconBtn>
                      <IconBtn onClick={() => setEditingSkill(skill.id)} className="text-amber-400 hover:bg-amber-50"><Pencil className="w-3.5 h-3.5" /></IconBtn>
                      <IconBtn onClick={() => removeItem("skills", skill.id)} className="text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <Separator />
        <div className="flex items-end gap-3">
          <Field label={t("cv.skills.name")} className="flex-1">
            <Input value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder={t("cv.skills.name")} onKeyDown={e => e.key === "Enter" && addSkill()} />
          </Field>
          <Field label={t("cv.skills.level")}>
            <select className="px-3 py-2 text-sm border rounded-lg w-36" value={newSkill.level}
              onChange={e => setNewSkill({ ...newSkill, level: e.target.value })}>
              <option>{getSkillLevels().beginner}</option><option>{getSkillLevels().intermediate}</option><option>{getSkillLevels().advanced}</option><option>{getSkillLevels().expert}</option>
            </select>
          </Field>
          <Button type="button" onClick={addSkill} disabled={!newSkill.name.trim()} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" /> {t("cv.skills.addButton")}
          </Button>
        </div>
      </div>
    );
    
    // ÉTAPE 5 : Langues
    if (stepId === "languages") return (
      <div className="space-y-6">
        <StepHeader icon={Globe} title={t("cv.languages.title")}
          badge={`${cvData.languages.length} ${t("cv.languages.title").toLowerCase()}${cvData.languages.length !== 1 ? "s" : ""}`} />
        <div className="space-y-2">
          {cvData.languages.map((lang, index) => {
            const langLevels = getLanguageLevels();
            return (
              <div key={lang.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <Input value={lang.name || ""} onChange={e => handleArrayChange("languages", index, "name", e.target.value)}
                  placeholder={t("cv.languages.name")} className="flex-1 h-8 text-sm" />
                <select className="px-2 py-1.5 text-xs border rounded-lg w-40" value={lang.level || ""}
                  onChange={e => handleArrayChange("languages", index, "level", e.target.value)}>
                  <option>{langLevels.native}</option><option>{langLevels.fluent}</option><option>{langLevels.advanced}</option>
                  <option>{langLevels.intermediate}</option><option>{langLevels.beginner}</option><option>{langLevels.notions}</option>
                </select>
                <IconBtn onClick={() => removeItem("languages", lang.id)} className="text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></IconBtn>
              </div>
            );
          })}
        </div>
        <AddButton onClick={() => addItem("languages", { name: "", level: getLanguageLevels().intermediate })} label={t("cv.languages.addButton")} />
      </div>
    );
    
    // ÉTAPE 6 : Certifications
    if (stepId === "certifications") return (
      <div className="space-y-6">
        <StepHeader icon={Award} title={t("cv.certifications.title")}
          badge={`${cvData.certifications.length} ${t("cv.certifications.title").toLowerCase()}${cvData.certifications.length !== 1 ? "s" : ""}`} />
        <div className="space-y-3">
          {cvData.certifications.map((cert, index) => (
            <Card key={cert.id} title={`${t("cv.certifications.title")} #${index + 1}`} onDelete={() => removeItem("certifications", cert.id)}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label={t("cv.certifications.name")} full><Input value={cert.name || ""} onChange={e => handleArrayChange("certifications", index, "name", e.target.value)} placeholder={t("cv.certifications.name")} /></Field>
                <Field label={t("cv.certifications.issuer")} className="md:col-span-2"><Input value={cert.issuer || ""} onChange={e => handleArrayChange("certifications", index, "issuer", e.target.value)} placeholder={t("cv.certifications.issuer")} /></Field>
                <Field label={t("cv.certifications.year")}><Input value={cert.date || ""} onChange={e => handleArrayChange("certifications", index, "date", e.target.value)} placeholder={t("cv.certifications.year")} /></Field>
              </div>
            </Card>
          ))}
        </div>
        <AddButton onClick={() => addItem("certifications", { name: "", issuer: "", date: "" })} label={t("cv.certifications.addButton")} />
      </div>
    );

    // ÉTAPE 7 : Projets
    if (stepId === "projects") return (
      <div className="space-y-6">
        <StepHeader icon={FolderOpen} title={t("cv.projects.title")}
          badge={`${cvData.projects.length} ${t("cv.projects.title").toLowerCase()}${cvData.projects.length !== 1 ? "s" : ""}`} />
        <div className="space-y-4">
          {cvData.projects.map((project, index) => (
            <Card key={project.id} title={`${t("cv.projects.title")} #${index + 1}`} onDelete={() => removeItem("projects", project.id)}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label={t("cv.projects.name")} full><Input value={project.name || ""} onChange={e => handleArrayChange("projects", index, "name", e.target.value)} placeholder={t("cv.projects.name")} /></Field>
                <Field label={t("cv.projects.description")} full><Textarea value={project.description || ""} onChange={e => handleArrayChange("projects", index, "description", e.target.value)} placeholder={t("cv.projects.description")} rows={2} /></Field>
                <Field label={t("cv.projects.technologies")}><Input value={Array.isArray(project.technologies) ? project.technologies.join(", ") : project.technologies || ""} onChange={e => handleArrayChange("projects", index, "technologies", e.target.value.split(",").map(t => t.trim()))} placeholder={t("cv.projects.technologies")} /></Field>
                <Field label={t("cv.projects.link")}><Input value={project.link || ""} onChange={e => handleArrayChange("projects", index, "link", e.target.value)} placeholder={t("cv.projects.link")} /></Field>
              </div>
            </Card>
          ))}
        </div>
        <AddButton onClick={() => addItem("projects", { name: "", description: "", technologies: [], link: "" })} label={t("cv.projects.addButton")} />
      </div>
    );

    // ÉTAPE 8 : Centres d'intérêt
    if (stepId === "interests") return (
      <div className="space-y-6">
        <StepHeader icon={Heart} title={t("cv.interests.title")}
          badge={`${cvData.interests.length} ${t("cv.interests.title").toLowerCase()}${cvData.interests.length !== 1 ? "s" : ""}`} />
        <HelpNotice title={t("cv.help.title")} tips={t("cv.interests.tips")} t={t} />
        <div className="space-y-2">
          {cvData.interests.map((interest, index) => (
            <div key={interest.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <Heart className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
              <Input value={interest.name || ""} onChange={e => handleArrayChange("interests", index, "name", e.target.value)}
                placeholder={t("cv.interests.name")} className="flex-1 h-8 text-sm" />
              <Input value={interest.description || ""} onChange={e => handleArrayChange("interests", index, "description", e.target.value)}
                placeholder={t("cv.interests.description")} className="flex-1 hidden h-8 text-sm md:block" />
              <div className="flex items-center gap-0.5">
                <IconBtn onClick={() => moveItem("interests", index, "up")} disabled={index === 0}><ChevronUp className="w-3.5 h-3.5" /></IconBtn>
                <IconBtn onClick={() => moveItem("interests", index, "down")} disabled={index === cvData.interests.length - 1}><ChevronDown className="w-3.5 h-3.5" /></IconBtn>
                <IconBtn onClick={() => removeItem("interests", interest.id)} className="text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></IconBtn>
              </div>
            </div>
          ))}
          {cvData.interests.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center border-2 border-gray-100 border-dashed rounded-2xl">
              <Heart className="text-gray-200 w-7 h-7" />
              <p className="text-sm text-gray-400">{t("cv.interests.title")}</p>
            </div>
          )}
        </div>
        <AddButton onClick={() => addItem("interests", { name: "", description: "" })} label={t("cv.interests.addButton")} />
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400">{t("cv.interests.suggestions")}</p>
          <div className="flex flex-wrap gap-2">
            {["Sport / Fitness", "Voyages", "Lecture", "Musique", "Photographie", "Cuisine", "Bénévolat", "Jeux vidéo", "Randonnée", "Cinéma"].map(s => (
              <button key={s} type="button" onClick={() => addItem("interests", { name: s, description: "" })}
                className="px-3 py-1 text-xs border border-gray-200 rounded-full text-gray-500 hover:border-primary/40 hover:text-primary hover:bg-primary/[0.03] transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    // ÉTAPE 9 : Apparence
    if (stepId === "settings") return (
      <div className="space-y-6">
        <StepHeader icon={Edit2} title={t("cv.appearance.title")} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Field label={t("cv.appearance.primaryColor")}>
              <div className="flex items-center gap-3">
                <input type="color" value={cvData.settings.color}
                  onChange={e => handleInputChange("settings", "color", e.target.value)}
                  className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent p-0.5" />
                <Input value={cvData.settings.color} onChange={e => handleInputChange("settings", "color", e.target.value)} placeholder="#3b82f6" />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {["#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444","#0f172a","#0e7490"].map(color => (
                  <button key={color} type="button" onClick={() => handleInputChange("settings", "color", color)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${cvData.settings.color === color ? "border-gray-700 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </Field>
          </div>
          <Field label={t("cv.appearance.font")}>
            <select className="w-full px-3 py-2 border rounded-lg" value={cvData.settings.font}
              onChange={e => handleInputChange("settings", "font", e.target.value)}>
              <option value="Inter">{t("cv.appearance.fonts.inter")}</option>
              <option value="Roboto">{t("cv.appearance.fonts.roboto")}</option>
              <option value="Open Sans">{t("cv.appearance.fonts.openSans")}</option>
              <option value="Merriweather">{t("cv.appearance.fonts.merriweather")}</option>
              <option value="Montserrat">{t("cv.appearance.fonts.montserrat")}</option>
            </select>
          </Field>
        </div>
      </div>
    );

    // ÉTAPE 10 : Export/Prévisualisation
    if (stepId === "preview") return (
      <div className="space-y-6">
        <StepHeader icon={Eye} title={t("cv.export.title")} />
        <div className="flex flex-col items-center justify-center gap-5 py-10 border-2 border-gray-100 border-dashed rounded-2xl">
          <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">
              {t("cv.export.ready").replace("{type}", cvType === "fibem" ? t("cv.mode.format.fibem") : t("cv.mode.format.classic"))}
            </p>
            {isImported && importedFile && (
              <p className="mt-1 text-sm text-emerald-500">{importedFile.name}</p>
            )}
          </div>
          <Button onClick={handleGenerateCV} disabled={isGenerating} className="gap-2 px-6 text-white bg-primary">
            {isGenerating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("cv.export.generate")}…</>
              : <><Download className="w-4 h-4" /> {t("cv.export.generate")}</>}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 text-sm"><Share2 className="w-3.5 h-3.5" /> {t("cv.export.share")}</Button>
          <Button variant="outline" className="gap-2 text-sm" onClick={() => setIsCvHistoryOpen(true)}>
            <BookOpen className="w-3.5 h-3.5" /> {t("cv.export.history")}
          </Button>
          <Button variant="ghost" onClick={handleNewCV} className="gap-2 text-sm text-red-400 hover:text-red-500 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> {t("cv.export.restart")}
          </Button>
        </div>
      </div>
    );

    return null;
  };

  // Barre de navigation Préc/Suiv
  const NavButtons = ({ className = "" }) => (
    <div className={`flex items-center justify-between w-full flex-col gap-2 sm:flex-row ${className}`}>
      <div className="flex items-center justify-between w-full gap-2 sm:w-auto sm:justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCvHistoryOpen(true)}
          className="gap-1.5 text-xs text-gray-500 flex-1 sm:flex-initial"
        >
          <BookOpen className="w-3.5 h-3.5" />{" "}
          <span className="xs:inline">{t("cv.navigation.history")}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateCV}
          disabled={isGenerating || !canGoNext()}
          className="gap-1.5 text-xs flex-1 sm:flex-initial"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="xs:inline">{isImported ? t("cv.buttons.import") : t("cv.buttons.generate")}</span>
        </Button>
      </div>

      <div className="flex items-center justify-between w-full gap-2 sm:w-auto sm:justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex-1 gap-1 text-xs text-gray-500 sm:flex-initial"
        >
          <ChevronLeft className="w-3.5 h-3.5" />{" "}
          <span className="xs:inline">{t("cv.buttons.previous")}</span>
        </Button>
        {currentStep < STEPS.length - 1 && (
          <Button
            size="sm"
            onClick={goNext}
            disabled={!canGoNext() || (isLocked && currentStep > 0)}
            className="flex-1 gap-1 text-xs sm:flex-initial"
          >
            {isLocked && currentStep > 0 ? (
              <>
                <Lock className="w-3.5 h-3.5" />{" "}
                <span className="xs:inline">{t("cv.buttons.locked")}</span>
              </>
            ) : (
              <>
                <span className="xs:inline">{t("cv.buttons.next")}</span>{" "}
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  // RENDU
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="bg-linear-to-r from-primary/10 via-primary/5 to-white">
        <div className="container px-4 py-4 mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-4 rounded-full w-14 h-14 bg-primary/10">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{t("cv.title")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("cv.subtitle")}</p>
            <Button variant="ghost" size="sm" onClick={handleNewCV} className="gap-1.5 text-xs text-gray-500 mt-3">
              <FilePlus className="w-3.5 h-3.5" /> {t("cv.newCv")}
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-5xl px-4 py-6 mx-auto space-y-4">
        <div className="sticky z-20 px-5 py-4 bg-white border border-gray-100 shadow-sm top-16 md:top-16 rounded-2xl">
          <StepBar steps={STEPS} currentStep={currentStep} onNavigate={goTo} isLocked={isLocked} t={t} />
        </div>

        <NavButtons />

        <AnimatePresence mode="wait">
          <motion.div key={currentStep}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 min-h-[400px]">
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <NavButtons />

        {STEPS[currentStep]?.id !== "preview" && (
          <div className="flex items-start gap-3 p-4 text-xs text-gray-400 bg-white border border-gray-100 rounded-2xl">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {t("cv.generalTips").map(tip => (
                <span key={tip}>• {tip}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <CVHistoryDialog isOpen={isCvHistoryOpen} onClose={() => setIsCvHistoryOpen(false)} selectedUser={user}
        cvHistory={[]} onPreviewCV={cv => window.open(cv.url, "_blank")}
        onDownloadCV={() => {}} onDeleteCV={() => {}} onDuplicateCV={() => {}} />
    </div>
  );
};

// MICRO-COMPOSANTS UI
const Field = ({ label, children, full = false, className = "" }) => (
  <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""} ${className}`}>
    {label && <Label className="text-xs font-medium text-gray-500">{label}</Label>}
    {children}
  </div>
);

const IconBtn = ({ onClick, disabled, className = "", children }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    className={`p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${className}`}>
    {children}
  </button>
);

const AddButton = ({ onClick, label }) => (
  <button type="button" onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-primary/40 hover:text-primary hover:bg-primary/[0.02] transition-colors">
    <Plus className="w-4 h-4" /> {label}
  </button>
);

const StepHeader = ({ icon: Icon, title, badge }) => (
  <div className="flex items-center justify-between">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
      <Icon className="w-5 h-5 text-primary" /> {title}
    </h3>
    {badge && <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">{badge}</span>}
  </div>
);

const Card = ({ title, children, onUp, onDown, upDisabled, downDisabled, onDelete }) => (
  <div className="p-5 space-y-4 border border-gray-100 rounded-xl bg-gray-50/40">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{title}</span>
      <div className="flex items-center gap-1">
        {onUp && <IconBtn onClick={onUp} disabled={upDisabled}><ChevronUp className="w-3.5 h-3.5" /></IconBtn>}
        {onDown && <IconBtn onClick={onDown} disabled={downDisabled}><ChevronDown className="w-3.5 h-3.5" /></IconBtn>}
        {onDelete && <IconBtn onClick={onDelete} className="text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></IconBtn>}
      </div>
    </div>
    {children}
  </div>
);

export default CVGeneratorPage;