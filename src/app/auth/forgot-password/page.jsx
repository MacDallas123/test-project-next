"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Shield,
  Key,
  Clock,
  Check,
  X,
} from "lucide-react";
import Logo from "@/assets/logo_fibem3.jpg";
import { useLanguage } from "@/context/LanguageContext";
import SiteTileForm1 from "@/components/custom/SiteTitleForm1";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, selectAuthError, selectAuthLoading, sendResetCode, verifyCode } from "@/redux/slices/authSlice";
import { thunkSucceed } from "@/lib/tools";

// Énumération des étapes
const RESET_STEPS = {
  EMAIL: 1,
  CODE: 2,
  PASSWORD: 3,
};

const PasswordResetPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(RESET_STEPS.EMAIL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const { t } = useLanguage();

  const dispatch = useDispatch();

  const selectAuthErrorFS = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);
  
  // Gestion du compte à rebours pour le renvoi du code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Schémas de validation pour chaque étape
  const emailSchema = z.object({
    email: z
      .string()
      .min(1, { message: t("reset.email.required", "L'email est requis") })
      .email({ message: t("reset.email.invalid", "Format d'email invalide") }),
  });

  const codeSchema = z.object({
    code: z
      .string()
      .length(6, {
        message: t("reset.code.length", "Le code doit contenir 6 chiffres"),
      })
      .regex(/^\d{6}$/, {
        message: t(
          "reset.code.numeric",
          "Le code ne doit contenir que des chiffres",
        ),
      }),
  });

  const passwordSchema = z
    .object({
      password: z
        .string()
        .min(8, {
          message: t(
            "reset.password.tooShort",
            "Le mot de passe doit contenir au moins 8 caractères",
          ),
        })
        .max(50, {
          message: t("reset.password.tooLong", "Le mot de passe est trop long"),
        })
        .regex(/[A-Z]/, {
          message: t("reset.password.uppercase", "Au moins une majuscule"),
        })
        .regex(/[a-z]/, {
          message: t("reset.password.lowercase", "Au moins une minuscule"),
        })
        .regex(/[0-9]/, {
          message: t("reset.password.number", "Au moins un chiffre"),
        })
        .regex(/[^A-Za-z0-9]/, {
          message: t("reset.password.special", "Au moins un caractère spécial"),
        }),
      confirmPassword: z
        .string()
        .min(1, {
          message: t(
            "reset.confirmPassword.required",
            "La confirmation du mot de passe est requise",
          ),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t(
        "reset.passwords.mismatch",
        "Les mots de passe ne correspondent pas",
      ),
      path: ["confirmPassword"],
    });

  // Initialisation des formulaires pour chaque étape
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
    },
  });

  const codeForm = useForm({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Étape 1: Demande de code par email
  const handleEmailSubmit = async (data) => {
    setResetEmail(data.email);

    try {
      const sendResetCodeResponse = await dispatch(sendResetCode(data.email));

      if(thunkSucceed(sendResetCodeResponse)) {
        setCurrentStep(RESET_STEPS.CODE);
        setCountdown(60); // 60 secondes avant de pouvoir renvoyer le code
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du code:", error);
    }
  };

  // Étape 2: Vérification du code
  const handleCodeSubmit = async (data) => {
    try {
      setResetCode(data.code);
      const codeSubmitResponse = await dispatch(verifyCode({
        email: resetEmail,
        code: data.code
      }));

      if(thunkSucceed(codeSubmitResponse)) {
        setCurrentStep(RESET_STEPS.PASSWORD);
      } else {
        codeForm.setError("code", {
          type: "manual",
          message: t(
            "reset.code.incorrect",
            "Code incorrect. Veuillez réessayer.",
          ),
        });
      }
    } catch (error) {
      console.error("Erreur de vérification:", error);
    }
  };

  // Étape 3: Réinitialisation du mot de passe
  const handlePasswordSubmit = async (data) => {
    try {
      // Verifier mot de passe corrects

      const passwordSubmitResponse = await dispatch(resetPassword({
        email: resetEmail,
        code: resetCode,
        newPassword: data.password,
        confirmNewPassword: data.confirmPassword
      }));

      if(thunkSucceed(passwordSubmitResponse)) {
        router.push(`/auth/login?email=${encodeURIComponent(resetEmail)}`);
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
    }
  };

  // Renvoyer le code
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
      const sendResetCodeResponse = await dispatch(sendResetCode(resetEmail));
  
      if(thunkSucceed(sendResetCodeResponse)) {
        setCountdown(60);
      }
    } catch (error) {
      console.error("Erreur lors du renvoi:", error);
    }
  };

  // Retour à l'étape précédente
  const handleBack = () => {
    if (currentStep === RESET_STEPS.CODE) {
      setCurrentStep(RESET_STEPS.EMAIL);
    } else if (currentStep === RESET_STEPS.PASSWORD) {
      setCurrentStep(RESET_STEPS.CODE);
    }
  };

  // Vérification de la force du mot de passe
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "Vide" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = [
      "Très faible",
      "Faible",
      "Moyen",
      "Bon",
      "Très bon",
      "Excellent",
    ];
    return { score, label: labels[Math.min(score, 5)] };
  };

  const passwordStrength = getPasswordStrength(passwordForm.watch("password"));

  // Étapes de la réinitialisation
  const steps = [
    { number: 1, label: "Vérification", description: "Saisissez votre email" },
    {
      number: 2,
      label: "Code de sécurité",
      description: "Entrez le code reçu",
    },
    {
      number: 3,
      label: "Nouveau mot de passe",
      description: "Définissez votre mot de passe",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-primary to-muted/20">
      <div className="container px-4 py-8 mx-auto md:py-16">
        <div className="max-w-md mx-auto">
          {/* Logo et titre */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <img src={Logo.src} alt="Logo FIBEM" className="w-12 h-8" />
              </div>
              <SiteTileForm1 />
            </div>
            <p className="text-primary-foreground">
              Réinitialisation du mot de passe
            </p>
          </div>

          {/* Indicateur d'étapes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                    ${
                      currentStep === step.number
                        ? "border-primary bg-secondary text-primary-foreground"
                        : currentStep > step.number
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${currentStep === step.number ? "text-accent" : "text-primary-foreground"}`}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-center text-primary-foreground">
                    {step.description}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative h-1 rounded-full bg-muted">
              <div
                className="absolute top-0 left-0 h-full transition-all duration-300 rounded-full bg-secondary"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Carte de réinitialisation */}
          <Card className="border">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                {currentStep === RESET_STEPS.EMAIL && (
                  <>
                    <Mail className="w-5 h-5" />
                    Saisissez votre email
                  </>
                )}
                {currentStep === RESET_STEPS.CODE && (
                  <>
                    <Key className="w-5 h-5" />
                    Vérifiez votre identité
                  </>
                )}
                {currentStep === RESET_STEPS.PASSWORD && (
                  <>
                    <Lock className="w-5 h-5" />
                    Nouveau mot de passe
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {currentStep === RESET_STEPS.EMAIL &&
                  "Nous vous enverrons un code de vérification"}
                {currentStep === RESET_STEPS.CODE &&
                  `Entrez le code à 6 chiffres envoyé à ${resetEmail}`}
                {currentStep === RESET_STEPS.PASSWORD &&
                  "Définissez un nouveau mot de passe sécurisé"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Étape 1: Email */}
              {currentStep === RESET_STEPS.EMAIL && (
                <form
                  onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Adresse email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        autoComplete="email"
                        className="pl-10"
                        {...emailForm.register("email")}
                        aria-invalid={!!emailForm.formState.errors.email}
                      />
                      {emailForm.watch("email") &&
                        !emailForm.formState.errors.email && (
                          <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                    </div>
                    {emailForm.formState.errors.email && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{emailForm.formState.errors.email.message}</span>
                      </div>
                    )}
                    {selectAuthErrorFS && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{selectAuthErrorFS}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 text-sm border rounded-lg bg-muted/30">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Sécurité garantie</p>
                        <p className="text-muted-foreground">
                          Le code de vérification est valide 15 minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                        Envoi du code...
                      </>
                    ) : (
                      <>
                        Envoyer le code de vérification
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Étape 2: Code de vérification */}
              {currentStep === RESET_STEPS.CODE && (
                <form
                  onSubmit={codeForm.handleSubmit(handleCodeSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Code de vérification{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                        <Key className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        className="pl-10 text-lg tracking-widest text-center"
                        maxLength={7}
                        {...codeForm.register("code", {
                          onChange: (e) => {
                            // Formatter automatiquement (ajouter un espace après 3 chiffres)
                            const value = e.target.value
                              .replace(/\s/g, "")
                              .replace(/\D/g, "");
                            /*const formatted = value.length > 3 
                              ? `${value.slice(0, 3)} ${value.slice(3, 6)}`
                              : value;
                            codeForm.setValue("code", formatted);*/
                            codeForm.setValue("code", value);
                          },
                        })}
                        aria-invalid={!!codeForm.formState.errors.code}
                      />
                      {codeForm.watch("code")?.replace(/\s/g, "").length ===
                        6 &&
                        !codeForm.formState.errors.code && (
                          <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                    </div>
                    {codeForm.formState.errors.code && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{codeForm.formState.errors.code.message}</span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Code à 6 chiffres envoyé à{" "}
                      <span className="font-medium text-foreground">
                        {resetEmail}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={countdown > 0 || isLoading}
                      className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${countdown > 0 ? "animate-spin" : ""}`}
                      />
                      {countdown > 0
                        ? `Renvoyer (${countdown}s)`
                        : "Renvoyer le code"}
                    </button>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Valide 15 min</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={handleBack}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={
                        isLoading ||
                        codeForm.watch("code")?.replace(/\s/g, "").length !== 6
                      }
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <>
                          Vérifier
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Étape 3: Nouveau mot de passe */}
              {currentStep === RESET_STEPS.PASSWORD && (
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-6">
                    {/* Nouveau mot de passe */}
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Nouveau mot de passe{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Votre nouveau mot de passe"
                          className="pl-10 pr-10"
                          {...passwordForm.register("password")}
                          aria-invalid={
                            !!passwordForm.formState.errors.password
                          }
                        />
                        <button
                          type="button"
                          className="absolute transform -translate-y-1/2 right-3 top-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "Cacher le mot de passe"
                              : "Afficher le mot de passe"
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
                      {passwordForm.watch("password") && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Force du mot de passe:{" "}
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
                              {passwordForm.watch("password").length}/50
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
                                label: "8 caractères min",
                                valid:
                                  passwordForm.watch("password").length >= 8,
                              },
                              {
                                label: "1 majuscule",
                                valid: /[A-Z]/.test(
                                  passwordForm.watch("password"),
                                ),
                              },
                              {
                                label: "1 minuscule",
                                valid: /[a-z]/.test(
                                  passwordForm.watch("password"),
                                ),
                              },
                              {
                                label: "1 chiffre",
                                valid: /[0-9]/.test(
                                  passwordForm.watch("password"),
                                ),
                              },
                              {
                                label: "1 caractère spécial",
                                valid: /[^A-Za-z0-9]/.test(
                                  passwordForm.watch("password"),
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

                      {passwordForm.formState.errors.password && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            {passwordForm.formState.errors.password.message}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirmation du mot de passe */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmer le mot de passe{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirmez votre nouveau mot de passe"
                          className="pl-10 pr-10"
                          {...passwordForm.register("confirmPassword")}
                          aria-invalid={
                            !!passwordForm.formState.errors.confirmPassword
                          }
                        />
                        <button
                          type="button"
                          className="absolute transform -translate-y-1/2 right-3 top-1/2"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Cacher le mot de passe"
                              : "Afficher le mot de passe"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      {passwordForm.watch("confirmPassword") &&
                        !passwordForm.formState.errors.confirmPassword &&
                        passwordForm.watch("password") ===
                          passwordForm.watch("confirmPassword") && (
                          <div className="flex items-center gap-2 text-sm text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            <span>Les mots de passe correspondent</span>
                          </div>
                        )}
                      {passwordForm.formState.errors.confirmPassword && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            {
                              passwordForm.formState.errors.confirmPassword
                                .message
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={handleBack}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={
                        isLoading ||
                        !passwordForm.watch("password") ||
                        !passwordForm.watch("confirmPassword")
                      }
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <>
                          Réinitialiser
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Separator />
              <div className="text-sm text-center">
                <span className="text-muted-foreground">
                  Vous vous souvenez de votre mot de passe ?{" "}
                </span>
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;