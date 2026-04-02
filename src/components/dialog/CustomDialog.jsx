import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  HelpCircle, 
  AlertCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CustomDialog = ({
  // Props de base
  isOpen = false,
  onClose,
  onConfirm,
  
  // Contenu
  title = "Dialogue",
  message = "Message par défaut",
  
  // Actions
  confirmText = "Confirmer",
  cancelText = "Annuler",
  buttonText = "Fermer",
  
  // Configuration
  variant = "default", // "default", "danger", "warning", "success", "info"
  type = "confirm", // "confirm" | "message"
  isLoading = false,
  autoClose = false,
  duration = 3000,
  
  // Personnalisation avancée
  customIcon,
  hideCloseButton = false,
  hideCancelButton = false,
  customActions,
  size = "md" // "sm" | "md" | "lg" | "xl"
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoClose && type === "message") {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose, type]);

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose?.();
    }
  };

  const getVariantConfig = () => {
    const variants = {
      default: {
        icon: HelpCircle,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-100",
        confirmButtonClass: "bg-blue-600 hover:bg-blue-700",
        textColor: "text-blue-800"
      },
      danger: {
        icon: AlertTriangle,
        iconColor: "text-red-600",
        bgColor: "bg-red-100",
        confirmButtonClass: "bg-red-600 hover:bg-red-700",
        textColor: "text-red-800"
      },
      warning: {
        icon: AlertCircle,
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-100",
        confirmButtonClass: "bg-yellow-600 hover:bg-yellow-700",
        textColor: "text-yellow-800"
      },
      success: {
        icon: CheckCircle,
        iconColor: "text-green-600",
        bgColor: "bg-green-100",
        confirmButtonClass: "bg-green-600 hover:bg-green-700",
        textColor: "text-green-800"
      },
      info: {
        icon: Info,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-100",
        confirmButtonClass: "bg-blue-600 hover:bg-blue-700",
        textColor: "text-blue-800"
      },
      error: {
        icon: XCircle,
        iconColor: "text-red-600",
        bgColor: "bg-red-100",
        confirmButtonClass: "bg-red-600 hover:bg-red-700",
        textColor: "text-red-800"
      }
    };
    return variants[variant] || variants.default;
  };

  const getSizeClass = () => {
    const sizes = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl"
    };
    return sizes[size] || sizes.md;
  };

  const { 
    icon: DefaultIcon, 
    iconColor, 
    bgColor, 
    confirmButtonClass,
    textColor 
  } = getVariantConfig();

  const IconComponent = customIcon || DefaultIcon;
  const isConfirmType = type === "confirm";

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1850]"
            onClick={handleClose}
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-[1850] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full ${getSizeClass()}`}
            >
              <Card className="relative border-0 shadow-2xl">
                {/* Close Button */}
                {!hideCloseButton && (
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="absolute z-10 p-1 transition-colors rounded-full top-4 right-4 hover:bg-muted disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <CardHeader className="pb-4 text-center">
                  <div className="mx-auto mb-4">
                    <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center`}>
                      <IconComponent className={`h-8 w-8 ${iconColor}`} />
                    </div>
                  </div>
                  <CardTitle className={`text-xl ${isConfirmType ? '' : textColor}`}>
                    {title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 text-center">
                  {/* Message */}
                  <div className="space-y-2">
                    {typeof message === 'string' ? (
                      <p className="leading-relaxed text-muted-foreground">
                        {message}
                      </p>
                    ) : (
                      <div className="leading-relaxed text-muted-foreground">
                        {message}
                      </div>
                    )}
                  </div>

                  {/* Actions personnalisées */}
                  {customActions ? (
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                      {customActions}
                    </div>
                  ) : (
                    <div className={`flex gap-3 justify-center ${
                      isConfirmType && !hideCancelButton ? 'flex-col sm:flex-row' : ''
                    }`}>
                      {/* Bouton Annuler pour les confirmations */}
                      {isConfirmType && !hideCancelButton && (
                        <Button
                          variant="outline"
                          onClick={handleClose}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          {cancelText}
                        </Button>
                      )}
                      
                      {/* Bouton Principal */}
                      <Button
                        onClick={isConfirmType ? handleConfirm : handleClose}
                        disabled={isLoading}
                        className={`flex-1 text-white ${isConfirmType ? confirmButtonClass : 
                          variant === 'success' ? 'bg-green-600 hover:bg-green-700' :
                          variant === 'error' ? 'bg-red-600 hover:bg-red-700' :
                          variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                          variant === 'info' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          isConfirmType ? confirmText : buttonText
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomDialog;