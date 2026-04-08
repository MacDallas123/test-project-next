"use client";

import { useEffect, useState } from "react";
import { useAppMainContext } from "@/context/AppProvider";
import { useRouter } from "next/navigation";

/**
 * UnauthorizedDialog — 100% custom, zéro dépendance shadcn/ui
 * ─────────────────────────────────────────────────────────────
 * Placé une seule fois dans App.jsx (sans props).
 * S'affiche quand isViewLocked === true dans AppProvider.
 *
 * Déclencher depuis n'importe quel composant :
 *   const { setIsViewLocked } = useAppMainContext();
 *   setIsViewLocked(true);
 */
export default function UnauthorizedDialog() {
  const { isViewLocked, setIsViewLocked } = useAppMainContext();
  const router = useRouter();

  // Gestion montage/démontage avec animation
  const [mounted,  setMounted]  = useState(false);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    if (isViewLocked) {
      setMounted(true);
      // Petit délai pour laisser le DOM peindre avant l'animation CSS
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(t);
    }
  }, [isViewLocked]);

  const handleLogin = () => {
    setIsViewLocked(false);
    setTimeout(() => router.replace("/auth/login"), 50);
  };

  const handleClose = () => {
    setIsViewLocked(false);
    setTimeout(() => router.replace("/"), 50);
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Overlay ────────────────────────────────────────────────── */
        .ua-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          /* pointer-events sur l'overlay : on NE ferme PAS au clic dans le vide */
          background: rgba(6, 6, 14, 0.78);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .ua-overlay.ua-in {
          opacity: 1;
        }

        /* ── Carte centrale ─────────────────────────────────────────── */
        .ua-card {
          position: relative;
          background: #0e0e1c;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 22px;
          padding: 52px 44px 42px;
          max-width: 420px;
          width: 90%;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          box-shadow:
            0 0 0 1px rgba(255, 95, 55, 0.13),
            0 36px 90px rgba(0, 0, 0, 0.65),
            0 0 70px rgba(255, 75, 35, 0.05);
          transform: translateY(32px) scale(0.95);
          opacity: 0;
          transition:
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            opacity   0.38s ease;
        }
        .ua-overlay.ua-in .ua-card {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        /* Trait lumineux haut */
        .ua-card::before {
          content: '';
          position: absolute;
          top: -1px; left: 12%; right: 12%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #ff5520 25%,
            #ff8c52 50%,
            #ff5520 75%,
            transparent
          );
          border-radius: 0 0 2px 2px;
        }

        /* Lueur ambiante en bas de la carte */
        .ua-card::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 15%; right: 15%;
          height: 60px;
          background: radial-gradient(ellipse at center, rgba(255, 80, 30, 0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Icône verrou ────────────────────────────────────────────── */
        .ua-icon-ring {
          position: relative;
          width: 74px;
          height: 74px;
          margin: 0 auto 22px;
        }
        .ua-icon-ring::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px solid rgba(255, 90, 40, 0.09);
        }
        .ua-icon-inner {
          width: 74px;
          height: 74px;
          background: rgba(255, 88, 38, 0.09);
          border: 1px solid rgba(255, 88, 38, 0.22);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Badge ───────────────────────────────────────────────────── */
        .ua-badge {
          display: inline-block;
          font-family: 'Syne', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 2.8px;
          text-transform: uppercase;
          color: #ff6b3a;
          background: rgba(255, 88, 38, 0.09);
          border: 1px solid rgba(255, 88, 38, 0.2);
          padding: 4px 13px;
          border-radius: 99px;
          margin-bottom: 15px;
        }

        /* ── Titre ───────────────────────────────────────────────────── */
        .ua-title {
          font-family: 'Syne', sans-serif;
          font-size: 21px;
          font-weight: 800;
          color: #eeeef8;
          margin: 0 0 11px;
          line-height: 1.4;
          letter-spacing: -0.4px;
        }

        /* ── Description ─────────────────────────────────────────────── */
        .ua-desc {
          font-size: 13.5px;
          color: rgba(195, 195, 218, 0.5);
          line-height: 1.7;
          margin: 0 0 30px;
          font-weight: 300;
        }

        /* ── Bouton principal ────────────────────────────────────────── */
        .ua-btn-login {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px 24px;
          background: linear-gradient(135deg, #ff5520 0%, #ff7e3a 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.2px;
          border: none;
          border-radius: 11px;
          cursor: pointer;
          box-shadow: 0 4px 22px rgba(255, 88, 38, 0.38);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
          margin-bottom: 10px;
        }
        .ua-btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 88, 38, 0.48);
          filter: brightness(1.07);
        }
        .ua-btn-login:active {
          transform: translateY(0);
          filter: brightness(0.97);
        }

        /* ── Séparateur ──────────────────────────────────────────────── */
        .ua-sep {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 10px;
        }
        .ua-sep-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.055);
        }
        .ua-sep-label {
          font-size: 11px;
          color: rgba(195, 195, 218, 0.2);
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        /* ── Bouton secondaire ───────────────────────────────────────── */
        .ua-btn-cancel {
          width: 100%;
          padding: 11px 24px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 11px;
          color: rgba(195, 195, 218, 0.4);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .ua-btn-cancel:hover {
          border-color: rgba(255, 255, 255, 0.16);
          color: rgba(195, 195, 218, 0.75);
        }
        .ua-btn-cancel:active {
          filter: brightness(0.92);
        }
      `}</style>

      {/*
        L'overlay n'a PAS de onClick → cliquer dans le vide ne ferme rien.
        Seuls les deux boutons ferment le dialog.
      */}
      <div className={`ua-overlay${visible ? " ua-in" : ""}`} role="dialog" aria-modal="true" aria-labelledby="ua-title">
        <div className="ua-card">

          {/* Icône verrou */}
          <div className="ua-icon-ring">
            <div className="ua-icon-inner">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="#ff6b3a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div className="ua-badge">Accès restreint</div>

          {/* Titre */}
          <h2 className="ua-title" id="ua-title">
            Vous n'êtes pas autorisé<br />à accéder à cette page
          </h2>

          {/* Description */}
          <p className="ua-desc">
            Cette section est réservée aux utilisateurs connectés.
            Veuillez vous identifier pour continuer.
          </p>

          {/* CTA principal */}
          <button className="ua-btn-login" onClick={handleLogin}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Se connecter
          </button>

          {/* Séparateur */}
          <div className="ua-sep">
            <span className="ua-sep-line" />
            <span className="ua-sep-label">ou</span>
            <span className="ua-sep-line" />
          </div>

          {/* Bouton retour */}
          <button className="ua-btn-cancel" onClick={handleClose}>
            Retour à l'accueil
          </button>

        </div>
      </div>
    </>
  );
}