"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle,
  User,
  Globe,
  Briefcase,
  UserCircle,
  Handshake,
  ArrowRight,
  Building,
  Check,
  X,
  Settings,
} from "lucide-react";
import Logo from "@/assets/logo_fibem3.jpg";
import { useLanguage } from "@/context/LanguageContext";
import SiteTileForm1 from "@/components/custom/SiteTitleForm1";
import { availableLanguages } from "@/i18n/translations";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/AppSlice";
import { activateAccount, registerUser, selectAuthError, selectAuthLoading } from "@/redux/slices/authSlice";
import { thunkSucceed } from "@/lib/tools";
import { Indicator } from "@radix-ui/react-progress";
import ReactCountryFlag from "react-country-flag";

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingFormData, setPendingFormData] = useState(null);
  const { t } = useLanguage();

  const dispatch = useDispatch();
  const selectUserFS = useSelector(selectUser);
  const selectErrorFS = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);

  // Schéma de validation avec Zod
  const registerSchema = z
    .object({
      firstName: z
        .string()
        .min(2, {
          message: t("register.firstName.tooShort"),
        })
        .max(50, {
          message: t("register.firstName.tooLong"),
        }),

      lastName: z
        .string()
        .min(2, {
          message: t("register.lastName.tooShort"),
        })
        .max(50, {
          message: t("register.lastName.tooLong"),
        }),

      phone: z
        .string()
        .min(7, {
          message: t("register.phone.tooShort"),
        })
        .max(20, {
          message: t("register.phone.tooLong"),
        }),
      
      email: z
        .string()
        .min(1, { message: t("register.email.required") })
        .email({
          message: t("register.email.invalid"),
        }),

      accountType: z
        .string()
        .min(1, {
          message: t("register.accountType.required"),
        }),

      language: z
        .string()
        .min(1, {
          message: t("register.language.required"),
        }),

      password: z
        .string()
        .min(8, {
          message: t("register.password.tooShort"),
        })
        .max(50, {
          message: t("register.password.tooLong"),
        })
        .regex(/[A-Z]/, {
          message: t("register.password.uppercase"),
        })
        .regex(/[a-z]/, {
          message: t("register.password.lowercase"),
        })
        .regex(/[0-9]/, {
          message: t("register.password.number"),
        }),

      confirmPassword: z
        .string()
        .min(1, {
          message: t("register.confirmPassword.required"),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("register.passwords.mismatch"),
      path: ["confirmPassword"],
    });

  // Initialisation de React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      phone: "",
      email: "",
      accountType: "",
      language: "fr",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedFields = watch();

  // Vérification de la force du mot de passe
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: t("register.passwordStrength.empty") };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = [
      t("register.passwordStrength.veryWeak"),
      t("register.passwordStrength.weak"),
      t("register.passwordStrength.medium"),
      t("register.passwordStrength.good"),
      t("register.passwordStrength.veryGood"),
      t("register.passwordStrength.excellent"),
    ];
    return { score, label: labels[Math.min(score, 5)] };
  };

  const passwordStrength = getPasswordStrength(watchedFields.password);

  const isRedirected = searchParams.has("redirect");

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("contactData"));
      setValue("firstName", data?.firstName);
      setValue("lastName", data?.lastName);
      setValue("email", data?.email);
      setValue("phone", data?.phone);
    } catch (err) {
      console.log("CANNOT LOAD CONTACT DATAS : ", err);
    }
    
  }, [setValue]);
  

  // Soumission du formulaire → passe à l'étape de vérification email
  const onSubmit = async (data) => {
    try {
      const response = await dispatch(registerUser(data));
      if (thunkSucceed(response)) {
        setPendingFormData(data);
        setCurrentStep(2);
        startResendCooldown();
      }
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
    }
  };

  // Lance le compte à rebours de renvoi (60s)
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Gestion de la saisie du code OTP (6 chiffres)
  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setVerificationError("");
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...verificationCode];
    pasted.split("").forEach((char, i) => { if (i < 6) newCode[i] = char; });
    setVerificationCode(newCode);
    const lastFilled = Math.min(pasted.length, 5);
    document.getElementById(`otp-${lastFilled}`)?.focus();
  };

  // Vérification du code et inscription définitive
  const handleVerifyAndRegister = async () => {
    const code = verificationCode.join("");
    if (code.length < 6) {
      setVerificationError(t("verification.codeError"));
      return;
    }
    setIsVerifying(true);
    try {
      const verifyResponse = await dispatch(activateAccount({ email: pendingFormData.email, code }));
      if (!thunkSucceed(verifyResponse)) { 
        setVerificationError(t("verification.codeIncorrect")); 
        return; 
      }

      router.push("/auth/login");
    } catch (error) {
      console.error("Erreur de vérification:", error);
      setVerificationError(t("verification.errorOccurred"));
    } finally {
      setIsVerifying(false);
    }
  };

  // Types de compte disponibles
  const accountTypes = [
    {
      value: "INDIVIDUAL",
      label: t("register.accountTypes.individual.label"),
      icon: UserCircle,
      description: t("register.accountTypes.individual.description"),
    },
    {
      value: "CANDIDATE",
      label: t("register.accountTypes.candidate.label"),
      icon: User,
      description: t("register.accountTypes.candidate.description"),
    },
    {
      value: "PROFESSIONAL",
      label: t("register.accountTypes.professional.label"),
      icon: UserCircle,
      description: t("register.accountTypes.professional.description"),
    },
    {
      value: "PARTNER",
      label: t("register.accountTypes.partner.label"),
      icon: Handshake,
      description: t("register.accountTypes.partner.description"),
    },
    {
      value: "ADMIN",
      label: t("register.accountTypes.admin.label"),
      icon: Settings,
      description: t("register.accountTypes.admin.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-primary to-muted/20">
      <div className="container px-4 py-8 mx-auto md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Logo et titre */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <img src={Logo.src} alt={t("common.logoAlt", "Logo FIBEM")} className="w-12 h-8" />
              </div>
              <SiteTileForm1 />
            </div>
            <p className="text-primary-foreground">
              {t("register.subtitle", "Rejoignez notre plateforme de livraison des repas")}
            </p>
          </div>

          {/* Carte d'inscription */}
          <Card className="border">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {currentStep === 1 ? t("register.title") : t("verification.title")}
              </CardTitle>
                {currentStep === 1 ? (
                  isRedirected ? (
                    <CardDescription className="text-lg">
                      {t("register.redirectMessage", "Merci de nous contacter, Veuillez terminer la creation de votre compte pour pouvoir nous envoyer un message")}
                    </CardDescription>
                  ) : (
                    <CardDescription>
                      {t("register.description")}
                    </CardDescription>
                  )
                ) : (
                  <CardDescription>
                    {t("verification.description")}{" "}
                    <span className="font-medium text-foreground">{pendingFormData?.email}</span>
                  </CardDescription>
                )}

              {/* Indicateur d'étapes */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"}`}>
                  {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <div className={`h-0.5 w-10 transition-all ${currentStep > 1 ? "bg-green-500" : "bg-muted"}`} />
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  2
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* ───────────── ÉTAPE 1 : Formulaire ───────────── */}
              {currentStep === 1 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informations de base */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {t("register.lastName.label")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder={t("register.lastName.placeholder")}
                        className="pl-10"
                        {...register("lastName")}
                        aria-invalid={!!errors.lastName}
                      />
                      {watchedFields.lastName && !errors.lastName && (
                        <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors.lastName && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.lastName.message}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Prénom */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {t("register.firstName.label")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t("register.firstName.placeholder")}
                        className="pl-10"
                        {...register("firstName")}
                        aria-invalid={!!errors.firstName}
                      />
                      {watchedFields.firstName && !errors.firstName && (
                        <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors.firstName && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.firstName.message}</span>
                      </div>
                    )}
                  </div>

                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Téléphone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {t("register.phone.label")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("register.phone.placeholder")}
                        className="pl-10"
                        {...register("phone")}
                        aria-invalid={!!errors.phone}
                      />
                      {watchedFields.phone && !errors.phone && (
                        <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors.phone && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.phone.message}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("register.email.label")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("register.email.placeholder")}
                        className="pl-10"
                        {...register("email")}
                        aria-invalid={!!errors.email}
                      />
                      {watchedFields.email && !errors.email && (
                        <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                  </div>
                </div>


                {/* Type de compte */}
                <div className="space-y-2">
                  <Label htmlFor="accountType">
                    {t("register.accountType.label")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {accountTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected =
                        watchedFields.accountType === type.value;

                      return (
                        <button
                          type="button"
                          key={type.value}
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all relative ${
                            isSelected
                              ? "border-destructive border-2 bg-primary/80 text-primary-foreground hover:border-4"
                              : "border-input hover:border-primary"
                          }`}
                          onClick={() => {
                            setValue("accountType", type.value);
                            trigger("accountType");
                          }}
                        >
                          <div className="flex flex-row gap-2">
                            <Icon className={`w-6 h-6 mb-2`} />
                            <span className={`font-medium`}>{type.label}</span>
                          </div>
                          <span className="mt-1 text-xs text-center">
                            {type.description}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" {...register("accountType")} />
                  {errors.accountType && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.accountType.message}</span>
                    </div>
                  )}
                </div>

                {/* Langue préférée */}
                <div className="space-y-2">
                  <Label htmlFor="language">
                    {t("register.language.label")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute z-10 transform -translate-y-1/2 left-3 top-1/2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Select
                      onValueChange={(value) => {
                        setValue("language", value);
                        trigger("language");
                      }}
                      defaultValue={watchedFields.language}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder={t("register.language.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center gap-2">
                              <ReactCountryFlag svg countryCode={lang.reactFlag} className="w-4 h-4" />
                              <span>{lang.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.language && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.language.message}</span>
                    </div>
                  )}
                </div>

                {/* Mot de passe */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {t("register.password.label")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("register.password.placeholder")}
                        className="pl-10 pr-10"
                        {...register("password")}
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        className="absolute transform -translate-y-1/2 right-3 top-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword
                            ? t("common.hidePassword")
                            : t("common.showPassword")
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Indicateur de force du mot de passe */}
                    {watchedFields.password && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {t("register.passwordStrength.label")}{" "}
                            <span
                              className={`font-medium ${
                                passwordStrength.score <= 1
                                  ? "text-red-500"
                                  : passwordStrength.score <= 3
                                    ? "text-yellow-500"
                                    : "text-green-500"
                              }`}
                            >
                              {passwordStrength.label}
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {watchedFields.password.length}/50
                          </span>
                        </div>
                        <div className="w-full h-1 overflow-hidden bg-gray-200 rounded-full">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.score <= 1
                                ? "bg-red-500 w-1/5"
                                : passwordStrength.score <= 2
                                  ? "bg-red-500 w-2/5"
                                  : passwordStrength.score <= 3
                                    ? "bg-yellow-500 w-3/5"
                                    : passwordStrength.score <= 4
                                      ? "bg-green-500 w-4/5"
                                      : "bg-green-600 w-full"
                            }`}
                          />
                        </div>

                        {/* Critères de validation */}
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          {[
                            {
                              label: t("register.passwordCriteria.minChars"),
                              valid: watchedFields.password.length >= 8,
                            },
                            {
                              label: t("register.passwordCriteria.uppercase"),
                              valid: /[A-Z]/.test(watchedFields.password),
                            },
                            {
                              label: t("register.passwordCriteria.lowercase"),
                              valid: /[a-z]/.test(watchedFields.password),
                            },
                            {
                              label: t("register.passwordCriteria.number"),
                              valid: /[0-9]/.test(watchedFields.password),
                            },
                            {
                              label: t("register.passwordCriteria.specialChar"),
                              valid: /[^A-Za-z0-9]/.test(
                                watchedFields.password,
                              ),
                            },
                          ].map((criterion, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 text-xs"
                            >
                              {criterion.valid ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <X className="w-3 h-3 text-gray-300" />
                              )}
                              <span
                                className={
                                  criterion.valid
                                    ? "text-green-500"
                                    : "text-gray-400"
                                }
                              >
                                {criterion.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirmation du mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t("register.confirmPassword.label")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("register.confirmPassword.placeholder")}
                        className="pl-10 pr-10"
                        {...register("confirmPassword")}
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        className="absolute transform -translate-y-1/2 right-3 top-1/2"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? t("common.hidePassword")
                            : t("common.showPassword")
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {watchedFields.confirmPassword &&
                      !errors.confirmPassword &&
                      watchedFields.password ===
                        watchedFields.confirmPassword && (
                        <div className="flex items-center gap-2 text-sm text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t("register.passwords.match")}</span>
                        </div>
                      )}
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectErrorFS && (
                  <div className="flex items-center gap-2 px-3 py-2 mt-2 text-sm text-red-500 rounded-sm bg-red-300/20">
                    <AlertCircle className="w-4 h-4" />
                    <span>{selectErrorFS}</span>
                  </div>
                )}
                
                {/* Bouton d'inscription */}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                      {t("register.creatingAccount")}
                    </>
                  ) : (
                    <>
                      {t("register.createButton")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
              )}

              {/* ───────────── ÉTAPE 2 : Vérification email ───────────── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <p className="max-w-xs text-sm text-center text-muted-foreground">
                      {t("verification.instruction")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("verification.codeLabel")}</Label>
                    <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all focus:border-primary bg-background ${
                            verificationError ? "border-red-400" : digit ? "border-primary" : "border-input"
                          }`}
                        />
                      ))}
                    </div>
                    {verificationError && (
                      <div className="flex items-center justify-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{verificationError}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    className="w-full gap-2"
                    disabled={isVerifying || verificationCode.join("").length < 6}
                    onClick={handleVerifyAndRegister}
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                        {t("verification.verifying")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t("verification.verifyButton")}
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-center text-muted-foreground">
                    {t("verification.codeNotReceived")}{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-muted-foreground">
                        {t("verification.resendIn")} {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={startResendCooldown}
                      >
                        {t("verification.resend")}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 mx-auto text-sm transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => { setCurrentStep(1); setVerificationCode(["","","","","",""]); setVerificationError(""); }}
                  >
                    ← {t("verification.backToForm")}
                  </button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Separator />
              <div className="text-sm text-center">
                <span className="text-muted-foreground">
                  {t("register.alreadyHaveAccount")}{" "}
                </span>
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  {t("register.loginLink")}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;