"use client"

import { useLanguage } from "@/context/LanguageContext";
import Prest from "@images/deliv.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import {
  ArrowRight,
  Home,
  Clock,
  Heart,
  Star,
  Zap,
  MapPin,
  ShieldCheck,
  Utensils,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   Données des slides
───────────────────────────────────────────────────────────── */
const getSlides = (t) => [
  {
    id: 1,
    type: "step1",
    badge: t("hero.slide1.badge", "Bienvenue"),
    icon: <Home className="w-5 h-5" />,
    title: (
      <>
        {t("hero.slide1.title.part1", "Bienvenu sur")}{" "}
        <span className="text-secondary">L</span>{t("hero.slide1.title.part2", "ivrer")}
        <span className="text-secondary">N</span>{t("hero.slide1.title.part3", "ourriture")}
      </>
    ),
    subtitle: t("hero.slide1.subtitle", "Vos plats préférés, livrés en un clin d'œil"),
    tagline: t("hero.slide1.tagline", "Commandez en 3 clics. Recevez en 30 min."),
    cta: { label: t("hero.slide1.cta", "Commander maintenant"), to: "/" },
    stats: [
      { icon: <Utensils className="w-5 h-5" />, value: "100+", label: t("hero.slide1.stats.restaurants", "Restaurants") },
      { icon: <Clock className="w-5 h-5" />, value: "30 min", label: t("hero.slide1.stats.deliveryTime", "Livraison moy.") },
      { icon: <Users className="w-5 h-5" />, value: "10k+", label: t("hero.slide1.stats.satisfiedClients", "Clients satisfaits") },
      { icon: <MapPin className="w-5 h-5" />, value: "5 km", label: t("hero.slide1.stats.deliveryRadius", "Rayon de livraison") },
    ],
    visual: { emoji: "🍔", label: t("hero.slide1.visual.label", "Commande en cours…"), sub: t("hero.slide1.visual.sub", "Livraison dans 18 min") },
  },
  {
    id: 2,
    type: "step2",
    badge: t("hero.slide2.badge", "Express"),
    icon: <Zap className="w-5 h-5" />,
    title: t("hero.slide2.title", "Rapide. Simple. Sans prise de tête."),
    subtitle: t("hero.slide2.subtitle", "En quelques clics, votre repas est en route."),
    tagline: t("hero.slide2.tagline", "Interface intuitive • Paiement 100 % sécurisé • Suivi GPS"),
    cta: { label: t("hero.slide2.cta", "Accéder à l'app"), to: "/auth/login" },
    stats: [
      { icon: <ShieldCheck className="w-5 h-5" />, value: "100%", label: t("hero.slide2.stats.securePayment", "Paiement sécurisé") },
      { icon: <MapPin className="w-5 h-5" />, value: "GPS", label: t("hero.slide2.stats.liveTracking", "Suivi en direct") },
      { icon: <Zap className="w-5 h-5" />, value: "3 clics", label: t("hero.slide2.stats.clicks", "Pour commander") },
      { icon: <Clock className="w-5 h-5" />, value: "24/7", label: t("hero.slide2.stats.availability", "Disponibilité") },
    ],
    visual: { emoji: "⚡", label: t("hero.slide2.visual.label", "Suivi GPS actif"), sub: t("hero.slide2.visual.sub", "Livreur à 2 km de chez vous") },
  },
  {
    id: 3,
    type: "step3",
    badge: t("hero.slide3.badge", "Populaire"),
    icon: <Heart className="w-5 h-5" />,
    title: t("hero.slide3.title", "Un choix pour toutes vos envies"),
    subtitle: t("hero.slide3.subtitle", "Burgers, pizzas, plats locaux, options healthy…"),
    tagline: t("hero.slide3.tagline", "100+ restaurants • Cuisines variées • Options végétariennes"),
    cta: { label: t("hero.slide3.cta", "Explorer les restaurants"), to: "/auth/register" },
    stats: [
      { icon: <Utensils className="w-5 h-5" />, value: "20+", label: t("hero.slide3.stats.cuisineTypes", "Types de cuisine") },
      { icon: <Heart className="w-5 h-5" />, value: "500+", label: t("hero.slide3.stats.dishes", "Plats au menu") },
      { icon: <Star className="w-5 h-5" />, value: "4.8★", label: t("hero.slide3.stats.rating", "Note moyenne") },
      { icon: <TrendingUp className="w-5 h-5" />, value: t("hero.slide3.stats.new", "Nouveau"), label: t("hero.slide3.stats.perWeek", "Chaque semaine") },
    ],
    visual: { emoji: "🥗", label: t("hero.slide3.visual.label", "Suggestion du jour"), sub: t("hero.slide3.visual.sub", "Bowl healthy • 1 200 FCFA") },
  },
  {
    id: 4,
    type: "step4",
    badge: t("hero.slide4.badge", "Local"),
    icon: <Star className="w-5 h-5" />,
    title: t("hero.slide4.title", "Des restaurants d'ici, livrés avec soin"),
    subtitle: t("hero.slide4.subtitle", "Partenaires locaux • Produits frais • Engagement qualité"),
    tagline: t("hero.slide4.tagline", "Nous soutenons les restaurateurs de votre ville."),
    cta: { label: t("hero.slide4.cta", "Devenir partenaire"), to: "/contact" },
    stats: [
      { icon: <Package className="w-5 h-5" />, value: t("hero.slide4.stats.fresh", "Frais"), label: t("hero.slide4.stats.localProducts", "Produits locaux") },
      { icon: <ShieldCheck className="w-5 h-5" />, value: t("hero.slide4.stats.certified", "Certifié"), label: t("hero.slide4.stats.quality", "Qualité garantie") },
      { icon: <Users className="w-5 h-5" />, value: "50+", label: t("hero.slide4.stats.partners", "Partenaires") },
      { icon: <TrendingUp className="w-5 h-5" />, value: "+30%", label: t("hero.slide4.stats.sales", "Ventes restaurateurs") },
    ],
    visual: { emoji: "🏪", label: t("hero.slide4.visual.label", "Partenaire certifié"), sub: t("hero.slide4.visual.sub", "Restaurant du quartier") },
  },
];

const HomeHero = () => {
  const { t } = useLanguage();
  const slides = getSlides(t);

  // Correction pour l'utilisation de Prest dans le style de background.
  // Cette variable (backgroundUrl) gère les différents cas fréquemment rencontrés selon le type d'import.
  let backgroundUrl = "";
  if (Prest && typeof Prest === "object") {
    if (Prest.src) backgroundUrl = Prest.src;
    // Next.js <Image> static import (ancien webpack/Next.js < 13)
    else if (Prest.default && Prest.default.src) backgroundUrl = Prest.default.src;
    // Juste au cas où Next.js ou loader retourne {default: "string"}
    else if (Prest.default && typeof Prest.default === "string") backgroundUrl = Prest.default;
    // Peut-être déjà une string pour certains loaders
    else if (typeof Prest === "string") backgroundUrl = Prest;
    // Fallback "empty"
  } else if (typeof Prest === "string") {
    backgroundUrl = Prest;
  }

  const renderSlide = (slide) => (
    <div className="container px-4 py-16 mx-auto md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

        {/* Colonne gauche et droite : inchangé par rapport à l'original */}
        {/* ... */}
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Badge className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-full bg-secondary/20 text-secondary border-secondary/30">
              {slide.icon}
              {slide.badge}
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl"
          >
            {slide.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg text-lg text-primary-foreground/80 md:text-xl"
          >
            {slide.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative inline-block"
          >
            <span className="text-base font-medium text-muted md:text-lg">
              {slide.tagline}
            </span>
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4"
          >
            {slide.stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
                className="flex flex-col items-center gap-1 p-3 text-center transition-colors border rounded-xl bg-white/10 backdrop-blur-sm border-white/15 hover:bg-white/15"
              >
                <span className="text-secondary">{s.icon}</span>
                <span className="text-base font-bold text-primary-foreground">{s.value}</span>
                <span className="text-xs leading-tight text-primary-foreground/60">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="pt-2"
          >
            <Button
              asChild
              size="lg"
              className="gap-3 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/30 transition-all hover:shadow-secondary/50 hover:scale-[1.02]"
            >
              <Link href={slide.cta.to}>
                {slide.cta.label}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
        {/* Colonne droite : inchangé */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative items-center justify-center hidden lg:flex"
        >
          <div className="absolute inset-0 rounded-3xl bg-secondary/10 blur-3xl" />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center justify-center w-64 h-64 gap-6 p-10 border shadow-2xl rounded-3xl bg-white/10 backdrop-blur-md border-white/20"
          >
            <span className="text-8xl drop-shadow-lg">{slide.visual.emoji}</span>
            <div className="text-center">
              <p className="text-sm font-semibold text-primary-foreground">{slide.visual.label}</p>
              <p className="mt-1 text-xs text-primary-foreground/60">{slide.visual.sub}</p>
            </div>
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="w-[320px] h-[320px] rounded-full border border-dashed border-secondary/30"
              style={{ position: "absolute" }}
            />
            <motion.div
              className="absolute"
              style={{ top: "0%", left: "50%", transformOrigin: "0 160px" }}
            >
              <span className="flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full shadow-md bg-secondary text-secondary-foreground">
                {slide.icon}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <section
      className="relative overflow-hidden min-h-[70vh] flex items-center"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/50 to-primary/30" />

      {/* Particules décoratives discrètes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-secondary/20"
            style={{
              width: 40 + i * 12,
              height: 40 + i * 12,
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: (index, className) =>
            `<span class="${className} !w-3 !h-3 !bg-secondary/70 hover:!bg-secondary"></span>`,
        }}
        autoplay={{ delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={1000}
        loop={true}
        allowTouchMove={true}
        className="w-full h-full hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative z-10">{renderSlide(slide)}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HomeHero;