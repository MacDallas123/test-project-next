"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@images/logo_fibem3.jpg";
import { useLanguage } from "@/context/LanguageContext";
import ReactCountryFlag from "react-country-flag";
import SiteTileForm1 from "../custom/SiteTitleForm1";


/* ════════════════════════════════════════════════════════════════ */
const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [hoveredLegal, setHoveredLegal] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  
  /* ─── Palette colors (accessible via Tailwind config or custom classes) ── */
  const C = {
    primary:        "#066dc2",
    primaryDark:    "#044f8e",
    primaryDeeper:  "#033a6a",
    secondary:      "#db8e2a",
    secondaryLight: "#f5b04a",
    foreground:     "#1a2744",
    border:         "#d1dae8",
    white:          "#ffffff",
  };
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      console.log("Abonnement à la newsletter:", email);
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  /* ─── Icônes SVG (unchanged) ────────────────────────────────────────── */
  const WhatsAppIcon = () => (
    <svg role="img" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
  
  const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 510.125"><path fill="#fff" fillRule="nonzero" d="M512 256C512 114.615 397.385 0 256 0S0 114.615 0 256c0 120.059 82.652 220.797 194.157 248.461V334.229h-52.79V256h52.79v-33.709c0-87.134 39.432-127.521 124.977-127.521 16.218 0 44.202 3.18 55.651 6.36v70.916c-6.042-.635-16.537-.954-29.575-.954-41.977 0-58.196 15.901-58.196 57.241V256h83.619l-14.365 78.229h-69.254v175.896C413.771 494.815 512 386.885 512 256z"/></svg>  
  );
  
  const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512">
      <path fill="#fff" d="M474.919 0H38.592C17.72 0 0 16.504 0 36.841V475.14C0 495.496 11.629 512 32.492 512h436.327C489.718 512 512 495.496 512 475.14V36.841C512 16.504 495.809 0 474.919 0zM195.043 195.043h68.928v35.136h.755c10.505-18.945 41.541-38.177 79.921-38.177 73.655 0 94.214 39.108 94.214 111.538v135.321h-73.148V316.883c0-32.427-12.947-60.883-43.227-60.883-36.768 0-54.295 24.889-54.295 65.758v117.103h-73.148V195.043zM73.139 438.861h73.148V195.043H73.139v243.818zm82.289-329.148c0 25.258-20.457 45.715-45.715 45.715-25.258 0-45.715-20.457-45.715-45.715 0-25.258 20.457-45.715 45.715-45.715 25.258 0 45.715 20.457 45.715 45.715z"/>
    </svg>
  );
  
  const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512">
      <path fill="#fff" fillRule="nonzero" d="M170.663 256.157c-.083-47.121 38.055-85.4 85.167-85.483 47.121-.092 85.407 38.03 85.499 85.16.091 47.129-38.047 85.4-85.176 85.492-47.112.09-85.399-38.039-85.49-85.169zm-46.108.091c.141 72.602 59.106 131.327 131.69 131.186 72.592-.141 131.35-59.09 131.209-131.692-.141-72.577-59.114-131.335-131.715-131.194-72.585.141-131.325 59.115-131.184 131.7zm237.104-137.091c.033 16.953 13.817 30.681 30.772 30.648 16.961-.033 30.689-13.811 30.664-30.764-.033-16.954-13.818-30.69-30.78-30.657-16.962.033-30.689 13.818-30.656 30.773zm-208.696 345.4c-24.958-1.087-38.511-5.234-47.543-8.709-11.961-4.629-20.496-10.178-29.479-19.094-8.966-8.95-14.532-17.46-19.202-29.397-3.508-9.032-7.73-22.569-8.9-47.527-1.269-26.982-1.559-35.077-1.683-103.432-.133-68.339.116-76.434 1.294-103.441 1.069-24.942 5.242-38.512 8.709-47.536 4.628-11.977 10.161-20.496 19.094-29.479 8.949-8.982 17.459-14.532 29.403-19.202 9.025-3.525 22.561-7.714 47.511-8.9 26.998-1.277 35.085-1.551 103.423-1.684 68.353-.132 76.448.108 103.456 1.295 24.94 1.086 38.51 5.217 47.527 8.709 11.968 4.628 20.503 10.144 29.478 19.094 8.974 8.95 14.54 17.443 19.21 29.412 3.524 9 7.714 22.553 8.892 47.494 1.285 26.999 1.576 35.095 1.7 103.433.132 68.355-.117 76.451-1.302 103.441-1.087 24.958-5.226 38.52-8.709 47.561-4.629 11.952-10.161 20.487-19.103 29.471-8.941 8.949-17.451 14.531-29.403 19.201-9.009 3.517-22.561 7.714-47.494 8.9-26.998 1.269-35.086 1.559-103.448 1.684-68.338.132-76.424-.125-103.431-1.294zM149.977 1.773c-27.239 1.285-45.843 5.648-62.101 12.018-16.829 6.561-31.095 15.354-45.286 29.604C28.381 57.653 19.655 71.944 13.144 88.79c-6.303 16.299-10.575 34.912-11.778 62.168C.172 178.264-.102 186.973.031 256.489c.133 69.508.439 78.234 1.741 105.547 1.302 27.231 5.649 45.828 12.019 62.093 6.569 16.83 15.353 31.088 29.611 45.288 14.25 14.201 28.55 22.918 45.404 29.438 16.282 6.295 34.902 10.583 62.15 11.778 27.305 1.203 36.022 1.468 105.521 1.335 69.532-.132 78.25-.439 105.555-1.733 27.239-1.303 45.826-5.665 62.1-12.019 16.829-6.586 31.095-15.353 45.288-29.611 14.191-14.251 22.917-28.55 29.428-45.405 6.304-16.282 10.592-34.903 11.777-62.134 1.195-27.322 1.478-36.048 1.344-105.556-.133-69.516-.447-78.225-1.741-105.523-1.294-27.255-5.657-45.844-12.019-62.118-6.577-16.829-15.352-31.079-29.602-45.287-14.25-14.192-28.55-22.935-45.404-29.429-16.29-6.305-34.903-10.601-62.15-11.779C333.747.164 325.03-.102 255.506.031c-69.507.133-78.224.431-105.529 1.742z"/>
    </svg>
  );
  
  const YoutubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 360.726"><path fill="#fff" d="M456.035 10.769c22.031 5.926 39.377 23.386 45.265 45.56C512 96.516 512 180.363 512 180.363s0 83.846-10.7 124.037c-5.888 22.17-23.234 39.631-45.265 45.559-39.928 10.767-200.034 10.767-200.034 10.767s-160.107 0-200.035-10.767C33.937 344.031 16.587 326.57 10.7 304.4 0 264.209 0 180.363 0 180.363S0 96.516 10.7 56.329c5.887-22.174 23.237-39.634 45.266-45.56C95.894 0 256.001 0 256.001 0s160.106 0 200.034 10.769zm-252.398 245.72l133.818-76.122-133.818-76.131v152.253z"/></svg>  
  );
  
  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 512 462.799">
      <path fillRule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z" />
    </svg>
  );
  
  const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 455 512.098">
      <path fillRule="nonzero" d="M321.331.011h-81.882v347.887c0 45.59-32.751 74.918-72.582 74.918-39.832 0-75.238-29.327-75.238-74.918 0-52.673 41.165-80.485 96.044-74.727v-88.153c-7.966-1.333-15.932-1.77-22.576-1.77C75.249 183.248 0 255.393 0 344.794c0 94.722 74.353 167.304 165.534 167.304 80.112 0 165.097-58.868 165.097-169.96V161.109c35.406 35.406 78.341 46.476 124.369 46.476V126.14C398.35 122.151 335.494 84.975 321.331 0v.011z" />
    </svg>
  );
  
  const socialLinks = [
    { Icon: FacebookIcon,  href: "https://www.facebook.com/profile.php?id=61580826024280", label: "Facebook",  bg: "#1877f3" },
    { Icon: LinkedInIcon,  href: "https://www.linkedin.com/in/sen-fibem-france-953349213/", label: "LinkedIn",  bg: "#0077b5" },
    { Icon: InstagramIcon, href: "https://www.instagram.com/sen.fibemfrance/",              label: "Instagram", bg: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)" },
    { Icon: XIcon,         href: "https://x.com/senfibemfrance",                            label: "X",         bg: "#000" },
    { Icon: YoutubeIcon,   href: "https://www.youtube.com/channel/UC1ro5Fjh6Se9pMQ_kc-QzBw",label: "YouTube",  bg: "#ff0000" },
    { Icon: TikTokIcon,    href: "https://www.tiktok.com/@senfibemfrance",                  label: "TikTok",    bg: "#010101" },
  ];

  const mainMenus = [
    { label: t("mainMenu.home.label",    "Accueil"),      href: "/" },
    { label: t("mainMenu.foods",   "Rech. Repas"),  href: "/services" },
    { label: t("mainMenu.job",     "Rech. Emploi"), href: "/emploi" },
    { label: t("mainMenu.cv",      "CV"),            href: "/cv" },
    { label: t("mainMenu.contact", "Contact"),       href: "/contact" },
    { label: t("mainMenu.facture", "Facture"),       href: "/facture" },
  ];

  const legalLinks = [
    { label: t("footer.privacy", "Confidentialité"), href: "/privacy" },
    { label: t("footer.terms",   "CGU"),              href: "/terms" },
    { label: t("footer.cookies", "Cookies"),          href: "/cookies" },
    { label: t("footer.sitemap", "Plan du site"),     href: "/sitemap" },
    { label: t("footer.contact", "Contact"),          href: "/contact" },
  ];

  return (
    <footer className="relative mt-20 overflow-hidden border-t-4" style={{ borderTopColor: C.secondary }}>
      {/* Background gradient */}
      <div 
        className="absolute inset-0"
        style={{ background: `linear-gradient(170deg, ${C.primaryDeeper} 0%, ${C.primaryDark} 40%, ${C.primary} 100%)` }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 z-0 pointer-events-none border-solid border-r-[200px] border-t-0 border-b-[200px] border-l-0" style={{ borderColor: `transparent rgba(219,142,42,0.1) transparent transparent` }} />
      <div className="absolute -bottom-[70px] -left-[70px] z-0 pointer-events-none w-[280px] h-[280px] rounded-full blur-[55px]" style={{ background: "rgba(3,58,106,0.5)" }} />

      {/* Main content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_2fr_1fr] gap-6 md:gap-8 lg:gap-10 mb-10">
          
          {/* Logo + Nav section */}
          <div className="flex flex-col gap-6 md:gap-4">
            <div className="flex-1">
              <Link href="/" className="flex items-center gap-3 mb-4 no-underline">
                <div className="relative w-[50px] h-[50px] flex-shrink-0">
                  <img
                    src="/img/logo_fibem3.jpg"
                    alt="FIBEM Logo"
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    width={50}
                    height={50}
                  />
                </div>
                <SiteTileForm1 />
              </Link>
              <p className="text-white/60 text-sm leading-relaxed max-w-[260px]">
                {t("footer.tagline", "Votre partenaire RH, restauration & services professionnels en France, Sénégal et Cameroun.")}
              </p>
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="grid grid-cols-2 gap-2">
                {mainMenus.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-1 py-2 text-xs font-bold text-center transition-all duration-200 border rounded-md"
                    style={{
                      color: C.primary,
                      background: C.white,
                      borderColor: C.border,
                      ...(hoveredNav === item.href && {
                        background: C.secondary,
                        color: C.white,
                        borderColor: C.secondary,
                        transform: "translateY(-2px)",
                      })
                    }}
                    onMouseEnter={() => setHoveredNav(item.href)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contacts section */}
          <div>
            <p className="flex items-center gap-2 text-[0.68rem] font-extrabold tracking-[0.14em] uppercase mb-4 pb-2 border-b" style={{ color: C.secondary, borderBottomColor: "rgba(219,142,42,0.3)" }}>
              <MapPin size={13} />
              {t("footer.contacts", "Nos Bureaux")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              
              {/* France */}
              <div className="flex-1 bg-white/6 border border-white/12 rounded-[10px] p-4">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/10">
                  <ReactCountryFlag svg countryCode="FR" className="text-[1.15rem]" />
                  <span className="text-sm font-bold" style={{ color: C.secondaryLight }}>{t("footer.france.name", "FIBEM France")}</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <MapPin size={13} className="flex-shrink-0 mt-0.5" style={{ color: C.secondary }} />
                    <span>{t("footer.france.address", "51 Rue du Grévarin – 27200 Vernon")}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <Phone size={13} className="flex-shrink-0 mt-0.5" style={{ color: C.secondary }} />
                    <a href="tel:+33744691748" className="no-underline text-white/70 hover:text-white/90">+33 7 44 69 17 48</a>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <Mail size={13} className="flex-shrink-0 mt-0.5" style={{ color: C.secondary }} />
                    <a href="mailto:gg.livrernourriture-fibem75@gmail.com" className="no-underline text-white/70 hover:text-white/90">gg.livrernourriture-fibem75@gmail.com</a>
                  </li>
                  <li>
                    <div className="flex gap-2 mt-1">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-opacity whitespace-nowrap"
                        style={{ background: C.white, color: C.primary }}
                        onClick={() => window.open("https://maps.google.com/?q=51+Rue+du+Grévarin+Vernon", "_blank")}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <MapPin size={11} /> Google Map
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-opacity"
                        style={{ background: "#25d366", color: C.white }}
                        onClick={() => window.open("https://wa.me/33744691748", "_blank")}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <WhatsAppIcon /> WhatsApp
                      </button>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Senegal */}
              <div className="flex-1 bg-white/6 border border-white/12 rounded-[10px] p-4">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/10">
                  <ReactCountryFlag svg countryCode="SN" className="text-[1.15rem]" />
                  <span className="text-sm font-bold" style={{ color: C.secondaryLight }}>{t("footer.senegal.name", "FIBEM Sénégal")}</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <MapPin size={13} className="flex-shrink-0 mt-0.5" style={{ color: C.secondary }} />
                    <span>{t("footer.senegal.address", "Rue 7 Corniche x 6, Médina, Dakar")}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <Phone size={13} className="flex-shrink-0 mt-0.5" style={{ color: C.secondary }} />
                    <a href="tel:+221783700602" className="no-underline text-white/70 hover:text-white/90">+221 78 370 06 02</a>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <Mail size={13} className="flex-shrink-0 mt-0.5" style={{ color: C.secondary }} />
                    <a href="mailto:gg.livrernourriture-fibem99@gmail.com" className="no-underline text-white/70 hover:text-white/90">gg.livrernourriture-fibem99@gmail.com</a>
                  </li>
                  <li className="text-xs italic text-white/40">
                    N.I.N.E.A.: 30 84 31 62 U2 — NAF: 7112B Engineering
                  </li>
                  <li>
                    <div className="flex gap-2 mt-1">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-opacity whitespace-nowrap"
                        style={{ background: C.white, color: C.primary }}
                        onClick={() => window.open("https://maps.google.com/?q=Rue+7+Médina+Dakar", "_blank")}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <MapPin size={11} /> Google Map
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-opacity"
                        style={{ background: "#25d366", color: C.white }}
                        onClick={() => window.open("https://wa.me/221783700602", "_blank")}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <WhatsAppIcon /> WhatsApp
                      </button>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Newsletter section */}
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-2 text-[0.68rem] font-extrabold tracking-[0.14em] uppercase mb-2 pb-2 border-b" style={{ color: C.secondary, borderBottomColor: "rgba(219,142,42,0.3)" }}>
              <Mail size={13} />
              {t("footer.newsletter", "Newsletter")}
            </p>
            <p className="text-sm leading-relaxed text-white/60">
              {t("footer.newsletterDesc", "Recevez nos actualités et offres spéciales directement dans votre boîte mail.")}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("footer.emailPlaceholder", "Votre adresse email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 min-w-0 px-3 py-2 text-sm transition-all rounded-lg outline-none font-inherit"
                  style={{
                    border: `1.5px solid ${inputFocused ? C.secondary : "rgba(219,142,42,0.4)"}`,
                    background: inputFocused ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.08)",
                    color: C.white,
                  }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                />
                <button
                  type="submit"
                  className="px-4 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold transition-all flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${C.secondary}, ${C.secondaryLight})`, color: C.foreground }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <Send size={14} />
                  {t("footer.send", "Envoyer")}
                </button>
              </div>
              {subscribed && (
                <p className="text-[#4cdd96] text-xs py-1.5 px-2 rounded-md border" style={{ background: "rgba(76,221,150,0.1)", borderColor: "rgba(76,221,150,0.3)" }}>
                  ✓ {t("footer.subscribed", "Merci pour votre inscription !")}
                </p>
              )}
            </form>
            <div className="pt-4 mt-2 text-xs leading-relaxed border-t border-white/8 text-white/30">
              <p>🔒 {t("footer.gdpr", "Données protégées — conforme RGPD")}</p>
              <p>📧 {t("footer.unsubscribe", "Désabonnement en un clic")}</p>
            </div>
          </div>

        </div>

        {/* Social section */}
        <hr className="my-6 border-0 border-t border-white/10" />
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:gap-6">
          <span className="text-white/45 text-[0.72rem] font-extrabold tracking-[0.12em] uppercase flex-shrink-0">
            {t("footer.social.followUs", "Suivez-nous")}
          </span>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ Icon, href, label, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center flex-shrink-0 transition-all duration-200 rounded-lg w-9 h-9"
                style={{
                  background: bg,
                  transform: hoveredSocial === label ? "translateY(-4px) scale(1.12)" : "scale(1)",
                  boxShadow: hoveredSocial === label ? "0 6px 18px rgba(0,0,0,0.35)" : "0 2px 6px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={() => setHoveredSocial(label)}
                onMouseLeave={() => setHoveredSocial(null)}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 py-5 px-4 sm:px-6 max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-lg font-extrabold" style={{ color: C.secondary }}>L</span>ivrer
          <span className="text-lg font-extrabold" style={{ color: C.secondary }}>N</span>ourriture.{" "}
          {t("footer.rights", "Tous droits réservés.")}
        </p>
        <nav className="flex flex-wrap gap-3">
          {legalLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs no-underline transition-colors"
              style={{ color: hoveredLegal === l.href ? C.secondary : "rgba(255,255,255,0.35)" }}
              onMouseEnter={() => setHoveredLegal(l.href)}
              onMouseLeave={() => setHoveredLegal(null)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;