import CustomDialog from "@/components/dialog/CustomDialog";
import { useCallback, useState } from "react";

export const useDialog = () => {
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    // Configuration par défaut
    title: "",
    message: "",
    type: "confirm",
    variant: "default",
    onConfirm: null,
    onClose: null,
    // Autres props
    confirmText: "Confirmer",
    cancelText: "Annuler",
    buttonText: "Fermer",
    isLoading: false,
    autoClose: false,
    duration: 3000,
    customIcon: null,
    hideCloseButton: false,
    hideCancelButton: false,
    customActions: null,
    size: "md"
  });

  const showDialog = useCallback((config) => {
    setDialogConfig(prev => ({
      ...prev,
      isOpen: true,
      ...config
    }));
  }, []);

  const showConfirm = useCallback((config) => {
    showDialog({
      type: "confirm",
      ...config
    });
  }, [showDialog]);

  const showMessage = useCallback((config) => {
    showDialog({
      type: "message",
      ...config
    });
  }, [showDialog]);

  const hideDialog = useCallback(() => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
    
    // Appeler le callback onClose si fourni
    if (dialogConfig.onClose) {
      dialogConfig.onClose();
    }
  }, [dialogConfig]);

  const handleConfirm = useCallback(() => {
    if (dialogConfig.onConfirm) {
      dialogConfig.onConfirm();
    }
    hideDialog();
  }, [dialogConfig, hideDialog]);

  const DialogComponent = useCallback(() => {
    return <CustomDialog
        isOpen={dialogConfig.isOpen}
        onClose={hideDialog}
        onConfirm={handleConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        variant={dialogConfig.variant}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        buttonText={dialogConfig.buttonText}
        isLoading={dialogConfig.isLoading}
        autoClose={dialogConfig.autoClose}
        duration={dialogConfig.duration}
        customIcon={dialogConfig.customIcon}
        hideCloseButton={dialogConfig.hideCloseButton}
        hideCancelButton={dialogConfig.hideCancelButton}
        customActions={dialogConfig.customActions}
        size={dialogConfig.size}
      />;
  }, [dialogConfig, hideDialog, handleConfirm]);

  return {
    showDialog,
    showConfirm,
    showMessage,
    hideDialog,
    DialogComponent,
    isDialogOpen: dialogConfig.isOpen
  };
};