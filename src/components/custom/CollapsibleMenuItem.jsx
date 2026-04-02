import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CollapsibleMenuItem — version sans shadcn
 *
 * Props :
 *   label           {string}        — libellé du menu parent
 *   icon            {ReactNode}     — icône lucide-react déjà instanciée
 *   children        {Array}         — liste des sous-items : { label, href, icon? }
 *   closeMobileMenu {() => void}    — ferme le menu mobile après navigation
 */
const CollapsibleMenuItem = ({ label, icon, children = [], closeMobileMenu }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {/* ── Bouton toggle ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center w-full gap-3 px-3 py-2 text-sm font-medium text-orange-300 transition-colors rounded-md hover:text-white hover:bg-white/10"
      >
        {/* Icône parente */}
        {icon && (
          <span className="text-red-400 shrink-0">{icon}</span>
        )}

        {/* Label */}
        <span className="flex-1 text-left">{label}</span>

        {/* Chevron animé */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-white/60" />
        </motion.span>
      </button>

      {/* ── Sous-items animés ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            key="submenu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children.map((sub, i) => {
              const SubIcon = sub.icon;
              return (
                <li key={sub.href || i}>
                  <Link
                    to={sub.href}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2 ml-6 text-sm transition-colors border-l rounded-md text-white/70 hover:text-white hover:bg-white/10 border-white/10"
                  >
                    {SubIcon && (
                      <SubIcon className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{sub.label}</span>
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleMenuItem;