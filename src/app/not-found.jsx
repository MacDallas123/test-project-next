"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", window.location.pathname);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <motion.div
        className="text-center max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animation et icône */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto"
            >
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </motion.div>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
            >
              404
            </motion.span>
          </div>
        </motion.div>

        {/* Titre et message */}
        <motion.h1
          variants={itemVariants}
          className="mb-4 text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
        >
          Oups !
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-2 text-xl font-semibold text-foreground"
        >
          Page non trouvée
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="mb-8 text-muted-foreground leading-relaxed"
        >
          La page que vous recherchez semble avoir été déplacée, supprimée ou n'existe pas. 
          Revenez sur vos pas ou explorez notre plateforme.
        </motion.p>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <Button
            asChild
            size="lg"
            className="gap-2 flex-1 sm:flex-initial"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="gap-2 flex-1 sm:flex-initial"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </motion.div>

        {/* Suggestions supplémentaires */}
        <motion.div
          variants={itemVariants}
          className="text-sm text-muted-foreground space-y-2"
        >
          <p>Vous pouvez aussi :</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/search"
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Search className="h-3 w-3" />
              <span>Rechercher</span>
            </Link>
          </div>
        </motion.div>

        {/* Message technique discret */}
        <motion.div
          variants={itemVariants}
          className="mt-8 p-4 bg-muted/50 rounded-lg"
        >
          <p className="text-xs text-muted-foreground">
            Erreur 404 •{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {typeof window !== 'undefined' ? window.location.pathname : '...'}
            </code>
          </p>
        </motion.div>
      </motion.div>

      {/* Éléments décoratifs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-destructive/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default NotFound;