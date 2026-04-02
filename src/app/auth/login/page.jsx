"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle,
  User,
  Shield,
  ArrowRight,
  Smartphone,
  Fingerprint,
  Building,
} from "lucide-react";
import Logo from "@/assets/logo_fibem3.jpg";
import { useLanguage } from "@/context/LanguageContext";
import SiteTileForm1 from "@/components/custom/SiteTitleForm1";
import { useDispatch, useSelector } from "react-redux";
import { loginAction, selectUser, setIsLoggedIn } from "@/redux/slices/AppSlice";
import { activateAccount, clearError, loginUser, selectAuthError } from "@/redux/slices/authSlice";
import { thunkSucceed } from "@/lib/tools";
import { translations } from "@/i18n/translations";

//type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");
  const [currentStep, setCurrentStep] = useState(1); // 1 = formulaire, 2 = validation email
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [inactiveUserEmail, setInactiveUserEmail] = useState("");
  
  const dispatch = useDispatch();
  const selectUserFS = useSelector(selectUser);
  const selectErrorFS = useSelector(selectAuthError);

  const { t, language } = useLanguage();

  // Schéma de validation avec Zod
  const loginSchema = z.object({
    identifier: z
      .string()
      .min(1, {
        message: t(
          "login.identifier.required",
          "L'email ou le numéro de téléphone est requis",
        ),
      })
      .refine(
        (value) => {
          // Valider soit comme email, soit comme numéro de téléphone
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        },
        {
          message: t(
            "login.identifier.incorrect",
            "Veuillez entrer un email valide ou un numéro de téléphone (format international)",
          ),
        },
      ),
    password: z
      .string()
      .min(6, {
        message: t(
          "login.password.tooShort",
          "Le mot de passe doit contenir au moins 6 caractères",
        ),
      })
      .max(50, {
        message: t("login.identifier.tooLong", "Le mot de passe est trop long"),
      }),
    rememberMe: z.boolean().optional(),
  });

  // Initialisation de React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  // Observateur pour l'identifiant
  const identifierValue = watch("identifier");

  // Détecter automatiquement le type d'identifiant
  const detectIdentifierType = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;

    if (emailRegex.test(value)) {
      setLoginMethod("email");
    } else if (phoneRegex.test(value)) {
      setLoginMethod("phone");
    }
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onFieldChange = () => {
      dispatch(clearError());
  }

  /*useEffect(() => {
    console.log("TRANSLATIONS : ", translations);
    alert(`LANGUAGE : ${language}, LOGIN : ${t("login.title")}`);
  }, [language]);*/

  // Soumission du formulaire
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await dispatch(loginUser(data));

      if (thunkSucceed(response)) {
        const payloadContent = response.payload.content;
        if (payloadContent.user.status === "INACTIVE") {
          // Compte inactif → demande de vérification email
          setInactiveUserEmail(payloadContent.user.email);
          setCurrentStep(2);
          startResendCooldown();
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Compte à rebours pour le renvoi du code (60s)
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Gestion de la saisie des cases OTP
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
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  // Vérification du code et activation du compte
  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length < 6) {
      setVerificationError("Veuillez entrer les 6 chiffres du code.");
      return;
    }
    setIsVerifying(true);
    try {
      // TODO: dispatcher l'action de vérification du code
      const verifyResponse = await dispatch(activateAccount({ email: inactiveUserEmail, code }));
      if (!thunkSucceed(verifyResponse)) { setVerificationError("Code incorrect ou expiré."); return; }
      router.push("/");
    } catch (error) {
      console.error("Erreur de vérification:", error);
      setVerificationError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-linear-to-b from-primary to-muted/20">
      <div className="container px-4 py-8 mx-auto md:py-16">
        <div className="max-w-md mx-auto">
          {/* Logo et titre */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                {/* <Shield className="w-6 h-6 text-primary" /> */}
                <img src={Logo.src} alt="Logo FIBEM" className="w-12 h-8" />
              </div>
              <SiteTileForm1 />
            </div>
            <p className="text-primary-foreground">
              Accédez à votre espace professionnel
            </p>
          </div>

          {/* Carte de connexion */}
          <Card className="border">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {currentStep === 1 ? t("login.title", "Connexion") : t("verification.title", "Vérifier votre email")}
              </CardTitle>
              <CardDescription>
                {currentStep === 1
                  ? t("login.description", "Utilisez votre email ou numéro de téléphone")
                  : <>{t("verification.description", "Votre compte est inactif. Entrez le code envoyé à")} <span className="font-medium text-foreground">{inactiveUserEmail}</span></>
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* ───── ÉTAPE 1 : Formulaire de connexion ───── */}
              {currentStep === 1 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Champ identifiant */}
                <div className="space-y-2">
                  <Label htmlFor="identifier">
                    {t("common.emailOrPhone", "Email ou numéro de téléphone")}
                  </Label>
                  <div className="relative">
                    <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                      {loginMethod === "email" ? (
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder={t(
                        "login.identifier.placeholder",
                        "Email ou numero de telephone"
                      )}
                      className="pl-10"
                      {...register("identifier", {
                        onChange: (e) => {
                          onFieldChange();
                          detectIdentifierType(e.target.value);
                        },
                      })}
                      aria-invalid={!!errors.identifier}
                    />
                    {identifierValue && !errors.identifier && (
                      <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.identifier && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.identifier.message}</span>
                    </div>
                  )}
                </div>

                {/* Champ mot de passe */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("common.password", "Mot de passe")}</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                      {t("login.forgotPassword", "Mot de passe oublié ?")}
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute transform -translate-y-1/2 left-3 top-1/2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("common.yourPassword", "Votre mot de passe")}
                      className="pl-10 pr-10"
                      {...register("password", {
                        onChange: () => onFieldChange()
                      })}
                      aria-invalid={!!errors.password}
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
                  {errors.password && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.password.message}</span>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="w-4 h-4 border rounded border-input"
                      {...register("rememberMe", {
                        onChange: () => onFieldChange()
                      })}
                    />
                    <label htmlFor="rememberMe" className="text-sm font-medium leading-none">
                      {t("login.rememberMe", "Se souvenir de moi")}
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      {t("login.secureConnection", "Connexion sécurisée")}
                    </span>
                  </div>
                </div>
                
                {selectErrorFS && (
                  <div className="flex items-center gap-2 px-3 py-2 mt-2 text-sm text-red-500 rounded-sm bg-red-300/20">
                    <AlertCircle className="w-4 h-4" />
                    <span>{selectErrorFS}</span>
                  </div>
                )}

                {/* Bouton de connexion */}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                      {t("login.loggingIn", "Connexion en cours...")}
                    </>
                  ) : (
                    <>
                      {t("login.loginButton", "Se connecter")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
              )} {/* fin currentStep === 1 */}

              {/* ───── ÉTAPE 2 : Validation email (compte inactif) ───── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Icône */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <p className="max-w-xs text-sm text-center text-muted-foreground">
                      {t("verification.instruction", "Pour activer votre compte, entrez le code à 6 chiffres envoyé à votre adresse email.")}
                    </p>
                  </div>

                  {/* Saisie OTP */}
                  <div className="space-y-2">
                    <Label>{t("verification.codeLabel", "Code de vérification")}</Label>
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

                  {/* Bouton valider */}
                  <Button
                    type="button"
                    className="w-full gap-2"
                    disabled={isVerifying || verificationCode.join("").length < 6}
                    onClick={handleVerifyCode}
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                        {t("verification.verifying", "Vérification...")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t("verification.verifyButton", "Valider et accéder à mon compte")}
                      </>
                    )}
                  </Button>

                  {/* Renvoi du code */}
                  <div className="text-sm text-center text-muted-foreground">
                    {t("verification.codeNotReceived", "Code non reçu ?")}{" "}
                    {resendCooldown > 0 ? (
                      <span>{t("verification.resendIn", "Renvoyer dans")} {resendCooldown}s</span>
                    ) : (
                      <button type="button" className="font-medium text-primary hover:underline" onClick={startResendCooldown}>
                        {t("verification.resend", "Renvoyer le code")}
                      </button>
                    )}
                  </div>

                  {/* Retour */}
                  <button
                    type="button"
                    className="flex items-center gap-1 mx-auto text-sm transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setCurrentStep(1);
                      setVerificationCode(["", "", "", "", "", ""]);
                      setVerificationError("");
                    }}
                  >
                    ← {t("verification.backToLogin", "Retour à la connexion")}
                  </button>
                </div>
              )} {/* fin currentStep === 2 */}
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Separator />
              <div className="text-sm text-center">
                <span className="text-muted-foreground">
                  {t("login.noAccount", "Pas encore de compte ?")}{" "}
                </span>
                <Link href="/auth/register" className="font-medium text-primary hover:underline">
                  {t("login.signUp", "S'inscrire gratuitement")}
                </Link>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                {t("login.termsAndPrivacy", "En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité")}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;