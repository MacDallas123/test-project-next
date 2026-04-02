import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ShoppingCart,
  Users,
  Building,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Receipt,
  Package,
  BarChart3,
  Clock,
  Star,
  MapPin,
  ChefHat,
  Briefcase,
  TrendingUp,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPinned,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Timer,
  Leaf,
  Crown,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import Plat1 from "@/assets/hero.avif";

const Plat2 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80";
const Plat3 = "https://images.unsplash.com/photo-1458642849426-cfb724f15ef7?auto=format&fit=crop&w=600&q=80";
const Plat4 = "https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&w=600&q=80"; 
const Plat5 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80";
const Plat6 = "https://images.unsplash.com/photo-1458642849426-cfb724f15ef7?auto=format&fit=crop&w=600&q=80";
const Plat7 = "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80";
const Plat8 = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80";
const Plat9 = "https://images.unsplash.com/photo-1519864600243-96510cfc7489?auto=format&fit=crop&w=600&q=80";
const Plat10 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80";
import { useCurrency } from "@/context/CurrencyContext";
import Autoplay from "embla-carousel-autoplay";
import { useLanguage } from "@/context/LanguageContext";


const ServicesSection = () => {
  const { formatPriceFrom } = useCurrency();
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Carrousels refs
  const autoplayRef = useRef(
    Autoplay(
      { delay: 4500, stopOnMouseEnter: true, stopOnInteraction: false }
    )
  );

  const autoplayRef2 = useRef(
    Autoplay(
      { delay: 4500, stopOnMouseEnter: true, stopOnInteraction: false }
    )
  );

  const [mealsEmblaRef, mealsEmblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      dragFree: false,
      loop: false,
      skipSnaps: false,
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 768px)": { slidesToScroll: 2 },
        "(min-width: 1024px)": { slidesToScroll: 4 },
      },
    },
    [autoplayRef.current]
  );

  const [jobsEmblaRef, jobsEmblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: false,
    skipSnaps: false,
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  }, [autoplayRef2.current]);

  // Données des plats populaires (10 plats)
  const popularMeals = [
    {
      id: 1,
      title: t("services.meals.yassa.title", "Poulet Yassa"),
      restaurant: t("services.meals.yassa.restaurant", "Le Dakarois"),
      category: t("services.meals.yassa.category", "Africain"),
      price: formatPriceFrom(9.90),
      rating: 4.8,
      reviews: 124,
      deliveryTime: "30-40 min",
      description: t("services.meals.yassa.description", "Poulet mariné au citron avec oignons caramélisés, accompagné de riz blanc"),
      image: Plat1,
      tags: [t("services.tags.popular", "Populaire"), t("services.tags.spicy", "Épicé")],
      badge: t("services.badges.favorite", "Coup de cœur"),
      badgeColor: "bg-amber-500",
      icon: <Flame className="w-3 h-3" />,
    },
    {
      id: 2,
      title: t("services.meals.burger.title", "Burger Gourmet"),
      restaurant: t("services.meals.burger.restaurant", "Burger House"),
      category: t("services.meals.burger.category", "Fast-food"),
      price: formatPriceFrom(12.50),
      rating: 4.7,
      reviews: 89,
      deliveryTime: "25-35 min",
      description: t("services.meals.burger.description", "Steak haché 180g, cheddar fondu, bacon croustillant et sauce maison"),
      image: Plat2,
      tags: [t("services.tags.new", "Nouveau")],
      badge: t("services.badges.new", "Nouveau"),
      badgeColor: "bg-blue-500",
      icon: <Sparkles className="w-3 h-3" />,
    },
    {
      id: 3,
      title: t("services.meals.pizza.title", "Pizza Margherita"),
      restaurant: t("services.meals.pizza.restaurant", "Pizzeria Roma"),
      category: t("services.meals.pizza.category", "Italien"),
      price: formatPriceFrom(10.90),
      rating: 4.9,
      reviews: 256,
      deliveryTime: "35-45 min",
      description: t("services.meals.pizza.description", "Base tomate, mozzarella fraîche, basilic et huile d'olive"),
      image: Plat3,
      tags: [t("services.tags.vegetarian", "Végétarien")],
      badge: t("services.badges.topChef", "Top Chef"),
      badgeColor: "bg-purple-500",
      icon: <Crown className="w-3 h-3" />,
    },
    {
      id: 4,
      title: t("services.meals.salad.title", "Salade César"),
      restaurant: t("services.meals.salad.restaurant", "Green Life"),
      category: t("services.meals.salad.category", "Healthy"),
      price: formatPriceFrom(8.80),
      rating: 4.6,
      reviews: 67,
      deliveryTime: "20-30 min",
      description: t("services.meals.salad.description", "Poulet grillé, parmesan, croûtons et sauce césar maison"),
      image: Plat4,
      tags: [t("services.tags.healthy", "Healthy")],
      badge: t("services.badges.light", "Light"),
      badgeColor: "bg-emerald-500",
      icon: <Leaf className="w-3 h-3" />,
    },
    {
      id: 5,
      title: t("services.meals.padthai.title", "Pad Thaï"),
      restaurant: t("services.meals.padthai.restaurant", "Thai Orchidée"),
      category: t("services.meals.padthai.category", "Asiatique"),
      price: formatPriceFrom(13.50),
      rating: 4.8,
      reviews: 145,
      deliveryTime: "35-45 min",
      description: t("services.meals.padthai.description", "Nouilles de riz sautées aux crevettes, cacahuètes et germes de soja"),
      image: Plat5,
      tags: [t("services.tags.popular", "Populaire"), t("services.tags.spicy", "Épicé")],
      badge: t("services.badges.chefSpecial", "Chef's special"),
      badgeColor: "bg-orange-500",
      icon: <Crown className="w-3 h-3" />,
    },
    {
      id: 6,
      title: t("services.meals.poke.title", "Bowl Poké"),
      restaurant: t("services.meals.poke.restaurant", "Hawaii Bowl"),
      category: t("services.meals.poke.category", "Healthy"),
      price: formatPriceFrom(14.90),
      rating: 4.9,
      reviews: 98,
      deliveryTime: "25-35 min",
      description: t("services.meals.poke.description", "Saumon frais, riz vinaigré, avocat, algues et sauce soja"),
      image: Plat6,
      tags: [t("services.tags.new", "Nouveau"), t("services.tags.healthy", "Healthy")],
      badge: t("services.badges.new", "Nouveau"),
      badgeColor: "bg-blue-500",
      icon: <Sparkles className="w-3 h-3" />,
    },
    {
      id: 7,
      title: t("services.meals.tacos.title", "Tacos Al Pastor"),
      restaurant: t("services.meals.tacos.restaurant", "El Camino"),
      category: t("services.meals.tacos.category", "Mexicain"),
      price: formatPriceFrom(11.90),
      rating: 4.7,
      reviews: 156,
      deliveryTime: "30-40 min",
      description: t("services.meals.tacos.description", "Tortillas de maïs, porc mariné, ananas, oignons et coriandre"),
      image: Plat7,
      tags: [t("services.tags.spicy", "Épicé")],
      badge: t("services.badges.authentic", "Authentique"),
      badgeColor: "bg-red-500",
      icon: <Flame className="w-3 h-3" />,
    },
    {
      id: 8,
      title: t("services.meals.ramen.title", "Ramen Tonkotsu"),
      restaurant: t("services.meals.ramen.restaurant", "Izakaya San"),
      category: t("services.meals.ramen.category", "Japonais"),
      price: formatPriceFrom(15.90),
      rating: 4.9,
      reviews: 203,
      deliveryTime: "40-50 min",
      description: t("services.meals.ramen.description", "Bouillon de porc, nouilles, œuf mariné, nori et poitrine de porc"),
      image: Plat8,
      tags: [t("services.tags.popular", "Populaire")],
      badge: t("services.badges.mustHave", "Incontournable"),
      badgeColor: "bg-amber-500",
      icon: <Crown className="w-3 h-3" />,
    },
    {
      id: 9,
      title: t("services.meals.couscous.title", "Couscous Royal"),
      restaurant: t("services.meals.couscous.restaurant", "Le Marocain"),
      category: t("services.meals.couscous.category", "Africain"),
      price: formatPriceFrom(16.50),
      rating: 4.8,
      reviews: 187,
      deliveryTime: "45-55 min",
      description: t("services.meals.couscous.description", "Semoule fine, légumes, merguez, poulet et mouton"),
      image: Plat9,
      tags: [t("services.tags.family", "Familial")],
      badge: t("services.badges.familyMeal", "Plat familial"),
      badgeColor: "bg-green-500",
      icon: <Users className="w-3 h-3" />,
    },
    {
      id: 10,
      title: t("services.meals.sushi.title", "Sushi Deluxe"),
      restaurant: t("services.meals.sushi.restaurant", "Sushi Master"),
      category: t("services.meals.sushi.category", "Japonais"),
      price: formatPriceFrom(22.90),
      rating: 5.0,
      reviews: 312,
      deliveryTime: "35-45 min",
      description: t("services.meals.sushi.description", "Assortiment de 20 pièces : saumon, thon, daurade, makis et californiens"),
      image: Plat10,
      tags: [t("services.tags.premium", "Premium"), t("services.tags.new", "Nouveau")],
      badge: t("services.badges.premium", "Premium"),
      badgeColor: "bg-indigo-500",
      icon: <Crown className="w-3 h-3" />,
    },
  ];

  // Données des offres d'emploi (8 offres)
  const jobOffers = [
    {
      id: 101,
      title: t("services.jobs.chef.title", "Chef de partie"),
      restaurant: t("services.jobs.chef.restaurant", "Le Grand Restaurant"),
      location: t("services.jobs.chef.location", "Paris 8ème"),
      contract: t("services.contracts.permanent", "CDI"),
      salary: formatPriceFrom(2800) + " - " + formatPriceFrom(3200),
      experience: t("services.experience.years", "2-5 ans", { years: "2-5" }),
      postedAt: t("services.posted.daysAgo", "Il y a 2 jours", { days: 2 }),
      type: t("services.jobTypes.kitchen", "Cuisine"),
      description: t("services.jobs.chef.description", "Nous recherchons un chef de partie passionné pour rejoindre notre brigade."),
      image: Plat1,
      tags: [t("services.tags.experienced", "Expérimenté"), t("services.tags.fullTime", "Temps plein")],
      badge: t("services.badges.urgent", "Urgent"),
      badgeColor: "bg-red-500",
    },
    {
      id: 102,
      title: t("services.jobs.waiter.title", "Serveur / Serveuse"),
      restaurant: t("services.jobs.waiter.restaurant", "Brasserie Moderne"),
      location: t("services.jobs.waiter.location", "Lyon 2ème"),
      contract: t("services.contracts.fixedTerm", "CDD"),
      salary: formatPriceFrom(2100) + " - " + formatPriceFrom(2400),
      experience: t("services.experience.beginner", "Débutant accepté"),
      postedAt: t("services.posted.daysAgo", "Il y a 1 jour", { days: 1 }),
      type: t("services.jobTypes.dining", "Salle"),
      description: t("services.jobs.waiter.description", "Service en salle dynamique, travail en équipe, anglais souhaité."),
      image: Plat2,
      tags: [t("services.tags.beginner", "Débutant"), t("services.tags.training", "Formation")],
      badge: t("services.badges.training", "Formation"),
      badgeColor: "bg-blue-500",
    },
    {
      id: 103,
      title: t("services.jobs.sousChef.title", "Second de cuisine"),
      restaurant: t("services.jobs.sousChef.restaurant", "Auberge du Soleil"),
      location: t("services.jobs.sousChef.location", "Nice"),
      contract: t("services.contracts.permanent", "CDI"),
      salary: formatPriceFrom(3000) + " - " + formatPriceFrom(3500),
      experience: t("services.experience.years", "5-8 ans", { years: "5-8" }),
      postedAt: t("services.posted.daysAgo", "Il y a 3 jours", { days: 3 }),
      type: t("services.jobTypes.kitchen", "Cuisine"),
      description: t("services.jobs.sousChef.description", "Gestion de la brigade, création de menus, respect des normes HACCP."),
      image: Plat3,
      tags: [t("services.tags.experienced", "Expérimenté"), t("services.tags.management", "Management")],
      badge: t("services.badges.topSalary", "Top salaire"),
      badgeColor: "bg-green-500",
    },
    {
      id: 104,
      title: t("services.jobs.pizzaiolo.title", "Pizzaiolo"),
      restaurant: t("services.jobs.pizzaiolo.restaurant", "Pizza Di Napoli"),
      location: t("services.jobs.pizzaiolo.location", "Marseille"),
      contract: t("services.contracts.permanent", "CDI"),
      salary: formatPriceFrom(2500) + " - " + formatPriceFrom(3000),
      experience: t("services.experience.years", "2-4 ans", { years: "2-4" }),
      postedAt: t("services.posted.daysAgo", "Il y a 5 jours", { days: 5 }),
      type: t("services.jobTypes.kitchen", "Cuisine"),
      description: t("services.jobs.pizzaiolo.description", "Maîtrise de la pâte à pizza, cuisson au feu de bois, créativité."),
      image: Plat4,
      tags: [t("services.tags.specialized", "Spécialisé"), t("services.tags.seasonal", "Saisonnier")],
      badge: t("services.badges.seasonal", "Saisonnier"),
      badgeColor: "bg-amber-500",
    },
    {
      id: 105,
      title: t("services.jobs.bartender.title", "Barman / Barmaid"),
      restaurant: t("services.jobs.bartender.restaurant", "Skybar Lounge"),
      location: t("services.jobs.bartender.location", "Bordeaux"),
      contract: t("services.contracts.permanent", "CDI"),
      salary: formatPriceFrom(2300) + " - " + formatPriceFrom(2700),
      experience: t("services.experience.years", "1-3 ans", { years: "1-3" }),
      postedAt: t("services.posted.daysAgo", "Il y a 1 semaine", { days: 7 }),
      type: t("services.jobTypes.bar", "Bar"),
      description: t("services.jobs.bartender.description", "Création de cocktails, service au bar, gestion des stocks."),
      image: Plat5,
      tags: [t("services.tags.creative", "Créatif"), t("services.tags.evening", "Soirée")],
      badge: t("services.badges.creative", "Créatif"),
      badgeColor: "bg-purple-500",
    },
    {
      id: 106,
      title: t("services.jobs.dishwasher.title", "Plongeur"),
      restaurant: t("services.jobs.dishwasher.restaurant", "Hôtel Palace"),
      location: t("services.jobs.dishwasher.location", "Cannes"),
      contract: t("services.contracts.seasonal", "Saisonnier"),
      salary: formatPriceFrom(1900) + " - " + formatPriceFrom(2100),
      experience: t("services.experience.beginner", "Débutant accepté"),
      postedAt: t("services.posted.daysAgo", "Il y a 3 jours", { days: 3 }),
      type: t("services.jobTypes.cleaning", "Nettoyage"),
      description: t("services.jobs.dishwasher.description", "Nettoyage de la vaisselle et des locaux, aide en cuisine."),
      image: Plat6,
      tags: [t("services.tags.seasonal", "Saisonnier"), t("services.tags.flexible", "Flexible")],
      badge: t("services.badges.housingPossible", "Logement possible"),
      badgeColor: "bg-teal-500",
    },
    {
      id: 107,
      title: t("services.jobs.manager.title", "Gérant restaurant"),
      restaurant: t("services.jobs.manager.restaurant", "Fast Food Chain"),
      location: t("services.jobs.manager.location", "Toulouse"),
      contract: t("services.contracts.permanent", "CDI"),
      salary: formatPriceFrom(3500) + " - " + formatPriceFrom(4200),
      experience: t("services.experience.years", "5-10 ans", { years: "5-10" }),
      postedAt: t("services.posted.daysAgo", "Il y a 2 jours", { days: 2 }),
      type: t("services.jobTypes.management", "Management"),
      description: t("services.jobs.manager.description", "Gestion complète du restaurant, management d'équipe, objectifs commerciaux."),
      image: Plat7,
      tags: [t("services.tags.management", "Management"), t("services.tags.senior", "Confirmé")],
      badge: t("services.badges.executive", "Cadre"),
      badgeColor: "bg-indigo-500",
    },
    {
      id: 108,
      title: t("services.jobs.pastryChef.title", "Pâtissier"),
      restaurant: t("services.jobs.pastryChef.restaurant", "Boulangerie Fine"),
      location: t("services.jobs.pastryChef.location", "Strasbourg"),
      contract: t("services.contracts.permanent", "CDI"),
      salary: formatPriceFrom(2600) + " - " + formatPriceFrom(3000),
      experience: t("services.experience.years", "3-5 ans", { years: "3-5" }),
      postedAt: t("services.posted.daysAgo", "Il y a 4 jours", { days: 4 }),
      type: t("services.jobTypes.pastry", "Pâtisserie"),
      description: t("services.jobs.pastryChef.description", "Création de pâtisseries, entremets, viennoiseries. Créativité exigée."),
      image: Plat8,
      tags: [t("services.tags.creative", "Créatif"), t("services.tags.specialized", "Spécialisé")],
      badge: t("services.badges.artisan", "Artisan"),
      badgeColor: "bg-rose-500",
    },
  ];

  // Outils professionnels
  const professionalTools = [
    {
      to: "/cv",
      icon: <FileText className="w-8 h-8" />,
      iconBg: "bg-blue-500",
      cardBg: "bg-gradient-to-br from-blue-50 to-white",
      accentText: "text-blue-600",
      title: t("services.tools.cv.title", "Générateur de CV"),
      description: t("services.tools.cv.description", "Créez un CV professionnel pour la restauration en quelques minutes"),
      button: t("services.tools.cv.button", "Créer mon CV"),
      bottom: t("services.tools.cv.bottom", "Modèles exclusifs pour la restauration"),
      border: "",
      delay: 0,
    },
    {
      to: "/devis",
      icon: <FileSpreadsheet className="w-8 h-8" />,
      iconBg: "bg-amber-500",
      cardBg: "bg-gradient-to-br from-amber-50 to-white",
      accentText: "text-amber-600",
      title: t("services.tools.quote.title", "Générateur de devis"),
      description: t("services.tools.quote.description", "Devis professionnels pour vos prestations et événements"),
      button: t("services.tools.quote.button", "Créer un devis"),
      bottom: t("services.tools.quote.bottom", "Personnalisable, conversion en facture"),
      border: "",
      delay: 0.2,
    },
    {
      to: "/facture",
      icon: <Receipt className="w-8 h-8" />,
      iconBg: "bg-green-500",
      cardBg: "bg-gradient-to-br from-green-50 to-white",
      accentText: "text-green-600",
      title: t("services.tools.invoice.title", "Générateur de factures"),
      description: t("services.tools.invoice.description", "Factures personnalisées et conformes à la législation"),
      button: t("services.tools.invoice.button", "Créer une facture"),
      bottom: t("services.tools.invoice.bottom", "TVA incluse, numérotation automatique"),
      border: "",
      delay: 0.1,
    },
    {
      to: "/avoirs",
      icon: <FileText className="w-8 h-8" />,
      iconBg: "bg-purple-500",
      cardBg: "bg-gradient-to-br from-purple-50 to-white",
      accentText: "text-purple-600",
      title: t("services.tools.creditNote.title", "Générateur d'avoirs"),
      description: t("services.tools.creditNote.description", "Créez des avoirs et notes de crédit en quelques clics"),
      button: t("services.tools.creditNote.button", "Créer un avoir"),
      bottom: t("services.tools.creditNote.bottom", "Remboursements, annulations, corrections"),
      border: "",
      delay: 0.3,
    },
  ];

  // Cartes d'outils
  const cardTools = [
    {
      title: t("services.tools.employeeManagement.title", "Gestion des employés"),
      description: t("services.tools.employeeManagement.description", "Planning, paie, contrats de travail"),
      to: "/outils/gestion-employes",
      icon: <Users className="w-6 h-6" />,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      linkColor: "text-indigo-600"
    },
    {
      title: t("services.tools.inventoryManagement.title", "Gestion des stocks"),
      description: t("services.tools.inventoryManagement.description", "Inventaire, alertes, commandes fournisseurs"),
      to: "/outils/gestion-stocks",
      icon: <Package className="w-6 h-6" />,
      iconColor: "text-pink-600",
      iconBg: "bg-pink-100",
      linkColor: "text-pink-600"
    },
    {
      title: t("services.tools.dashboard.title", "Tableaux de bord"),
      description: t("services.tools.dashboard.description", "Analyses, chiffre d'affaires, performances"),
      to: "/outils/analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-100",
      linkColor: "text-teal-600"
    }
  ];
  
  // Scroll progress pour les carrousels
  const onMealsScroll = useCallback(() => {
    if (!mealsEmblaApi) return;
    const progress = Math.max(0, Math.min(1, mealsEmblaApi.scrollProgress()));
    setScrollProgress(progress);
  }, [mealsEmblaApi]);

  useEffect(() => {
    if (mealsEmblaApi) {
      onMealsScroll();
      mealsEmblaApi.on("scroll", onMealsScroll);
      mealsEmblaApi.on("reInit", onMealsScroll);
    }
  }, [mealsEmblaApi, onMealsScroll]);

  const scrollPrev = useCallback(() => {
    if (mealsEmblaApi) mealsEmblaApi.scrollPrev();
  }, [mealsEmblaApi]);

  const scrollNext = useCallback(() => {
    if (mealsEmblaApi) mealsEmblaApi.scrollNext();
  }, [mealsEmblaApi]);

  const scrollJobsPrev = useCallback(() => {
    if (jobsEmblaApi) jobsEmblaApi.scrollPrev();
  }, [jobsEmblaApi]);

  const scrollJobsNext = useCallback(() => {
    if (jobsEmblaApi) jobsEmblaApi.scrollNext();
  }, [jobsEmblaApi]);

  return (
    <section id="services" className="px-4 pt-16 pb-8 bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary shadow-sm">
              <ChefHat className="w-4 h-4" />
              <span>{t("services.discoverBadge", "Découvrez nos services")}</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-transparent md:text-4xl lg:text-5xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
              {t("services.title", "Qu'est-ce qui vous ferait plaisir ?")}
            </h2>
            <p className="text-lg text-gray-600">
              {t("services.subtitle", "Des plats délicieux et des opportunités professionnelles pour une expérience culinaire complète")}
            </p>
          </motion.div>
        </div>

        {/* SECTION REPAS - Scroll horizontal optimisé */}
        <div className="mb-20">
          <div className="flex flex-wrap items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold md:text-3xl">{t("services.popularMeals", "Plats populaires")}</h3>
              </div>
              <p className="text-gray-600">
                {t("services.popularMealsDesc", "Découvrez les préférés de notre communauté")}
              </p>
            </div>
            
            {/* Navigation buttons */}
            <div className="hidden gap-2 md:flex">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                className="transition-all border-2 rounded-full hover:bg-primary hover:text-white hover:border-primary"
                aria-label={t("services.previous", "Précédent")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                className="transition-all border-2 rounded-full hover:bg-primary hover:text-white hover:border-primary"
                aria-label={t("services.next", "Suivant")}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Carrousel Repas */}
          <div className="relative">
            <div className="py-4 overflow-hidden" ref={mealsEmblaRef}>
              <div className="flex gap-4">
                {popularMeals.map((meal, index) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, delay: index * 0.025 }}
                    className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(25%-12px)]"
                  >
                    <Card className="h-full overflow-hidden transition-all duration-150 bg-white border-0 shadow-md group hover:shadow-xl hover:-translate-y-1 rounded-2xl">
                      {/* Image Container */}
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 z-10 transition-opacity opacity-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:opacity-100" />
                        <img
                          src={meal.image}
                          alt={meal.title}
                          className="object-cover w-full h-full transition-transform duration-400 group-hover:scale-110"
                        />
                        
                        {/* Badge */}
                        <div className="absolute z-20 flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-full top-3 left-3 bg-primary/90 backdrop-blur-sm">
                          {meal.icon}
                          <span>{meal.badge}</span>
                        </div>

                        {/* Tags */}
                        <div className="absolute z-20 flex gap-2 bottom-3 left-3">
                          {meal.tags?.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 text-xs font-medium bg-white/95 rounded-full shadow-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold line-clamp-1">{meal.title}</h4>
                            <p className="text-sm text-gray-500">{meal.restaurant}</p>
                          </div>
                          <span className="px-3 py-1 text-sm font-bold text-white rounded-full bg-primary">
                            {meal.price.toLocaleString()}
                          </span>
                        </div>

                        {/* Rating & Time */}
                        <div className="flex items-center justify-between mb-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{meal.rating}</span>
                            <span className="text-gray-400">({meal.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Timer className="w-4 h-4" />
                            <span>{meal.deliveryTime}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                          {meal.description}
                        </p>

                        {/* Action Button */}
                        <Button 
                          className="w-full gap-2 text-white transition-all rounded-xl bg-primary hover:bg-primary/90 group-hover:shadow-lg"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {t("services.addToCart", "Ajouter au panier")}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Carte "Voir plus" */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(25%-12px)]"
                >
                  <Link href="/services">
                    <Card className="h-full overflow-hidden transition-all duration-150 border-2 border-gray-300 border-dashed cursor-pointer group bg-gray-50 hover:border-primary hover:bg-primary/5 rounded-2xl">
                      <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="flex items-center justify-center w-20 h-20 mb-4 transition-all bg-white rounded-full shadow-md group-hover:shadow-lg">
                          <PlusCircle className="w-10 h-10 text-primary" />
                        </div>
                        <h4 className="mb-2 text-xl font-bold">{t("services.seeMoreMeals", "Voir plus de plats")}</h4>
                        <p className="text-sm text-gray-500">
                          {t("services.seeMoreMealsDesc", "Découvrez tous nos restaurants et leurs menus")}
                        </p>
                        <Button variant="link" className="gap-2 mt-4 text-primary">
                          {t("services.explore", "Explorer")}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 mt-6 overflow-hidden bg-gray-200 rounded-full">
              <div 
                className="h-full transition-all duration-300 rounded-full bg-primary"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECTION EMPLOI - Scroll horizontal */}
        <div className="mb-20">
          <div className="flex flex-wrap items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold md:text-3xl">{t("services.jobOffers", "Offres d'emploi en restauration")}</h3>
              </div>
              <p className="text-gray-600">
                {t("services.jobOffersDesc", "Rejoignez les meilleurs restaurants près de chez vous")}
              </p>
            </div>
            
            {/* Navigation buttons */}
            <div className="hidden gap-2 md:flex">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollJobsPrev}
                className="transition-all border-2 rounded-full hover:bg-green-500 hover:text-white hover:border-green-500"
                aria-label={t("services.previous", "Précédent")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollJobsNext}
                className="transition-all border-2 rounded-full hover:bg-green-500 hover:text-white hover:border-green-500"
                aria-label={t("services.next", "Suivant")}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Carrousel Emplois */}
          <div className="relative">
            <div className="py-4 overflow-hidden" ref={jobsEmblaRef}>
              <div className="flex gap-4">
                {jobOffers.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(33.333%-10.666px)]"
                  >
                    <Card className="h-full overflow-hidden transition-all duration-300 bg-white border-0 shadow-md group hover:shadow-xl hover:-translate-y-1 rounded-2xl">
                      <CardContent className="p-5">
                        {/* Header with badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-xl">
                              <Briefcase className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold">{job.title}</h4>
                              <p className="text-sm text-gray-600">{job.restaurant}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium text-white ${job.badgeColor} rounded-full`}>
                            {job.badge}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                          <MapPinned className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 text-xs font-medium bg-gray-100 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Job details grid */}
                        <div className="grid grid-cols-2 gap-3 p-3 mb-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500">{t("services.contract", "Contrat")}</p>
                            <p className="text-sm font-medium">{job.contract}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t("services.salary", "Salaire")}</p>
                            <p className="text-sm font-medium">{job.salary}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t("services.experience", "Expérience")}</p>
                            <p className="text-sm font-medium">{job.experience}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t("services.posted", "Posté")}</p>
                            <p className="text-sm font-medium">{job.postedAt}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                          {job.description}
                        </p>

                        {/* Action Button */}
                        <Button 
                          className="w-full gap-2 text-white transition-all bg-secondary/80 rounded-xl hover:bg-secondary group-hover:shadow-lg"
                          size="sm"
                        >
                          {t("services.viewOffer", "Voir l'offre")}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Carte "Voir plus" pour les emplois */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(33.333%-10.666px)]"
                >
                  <Link href="/emploi">
                    <Card className="h-full overflow-hidden transition-all duration-300 border-2 border-gray-300 border-dashed cursor-pointer group bg-gray-50 hover:border-green-500 hover:bg-green-50/30 rounded-2xl">
                      <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="flex items-center justify-center w-20 h-20 mb-4 transition-all bg-white rounded-full shadow-md group-hover:shadow-lg">
                          <Briefcase className="w-10 h-10 text-green-500" />
                        </div>
                        <h4 className="mb-2 text-xl font-bold">{t("services.moreJobs", "Plus d'offres d'emploi")}</h4>
                        <p className="text-sm text-gray-500">
                          {t("services.moreJobsDesc", "Découvrez toutes les opportunités dans la restauration")}
                        </p>
                        <Button variant="link" className="gap-2 mt-4 text-green-500">
                          {t("services.exploreJobs", "Explorer les offres")}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION OUTILS POUR RESTAURATEURS */}
        <div className="mb-20">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-4 text-sm font-medium rounded-full bg-purple-100 text-purple-700">
              <Building className="w-4 h-4" />
              <span>{t("services.forProfessionals", "Pour les professionnels")}</span>
            </div>
            <h3 className="mb-4 text-2xl font-bold md:text-3xl">
              {t("services.toolsTitle", "Des outils professionnels pour les restaurateurs")}
            </h3>
            <p className="text-gray-600">
              {t("services.toolsDesc", "Gérez votre établissement efficacement avec notre suite d'outils professionnels gratuits")}
            </p>
          </div>

          {/* Outils principaux en grille */}
          <div className="grid gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
            {professionalTools.map((tool, i) => (
              <motion.div
                key={tool.to}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: tool.delay }}
                whileHover={{ y: -5 }}
              >
                <Link href={tool.to}>
                  <Card
                    className="h-full p-6 transition-all bg-white border cursor-pointer border-primary group rounded-2xl hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center w-16 h-16 mb-4 text-white bg-primary rounded-2xl">
                      {tool.icon}
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-primary">{tool.title}</h4>
                    <p className="mb-4 text-gray-700">{tool.description}</p>
                    <div className="flex items-center font-medium text-primary">
                      {tool.button}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <span className="text-xs text-primary/70">{tool.bottom}</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Statistiques et témoignages */}
          <div className="grid gap-6 mb-8 md:grid-cols-3">
            <div className="p-6 text-center bg-white shadow-sm rounded-2xl">
              <div className="mb-2 text-3xl font-bold text-primary">15k+</div>
              <p className="text-gray-600">{t("services.stats.documents", "Documents générés par mois")}</p>
            </div>
            <div className="p-6 text-center bg-white shadow-sm rounded-2xl">
              <div className="mb-2 text-3xl font-bold text-primary">4.8/5</div>
              <p className="text-gray-600">{t("services.stats.satisfaction", "Satisfaction utilisateurs")}</p>
            </div>
            <div className="p-6 text-center bg-white shadow-sm rounded-2xl">
              <div className="mb-2 text-3xl font-bold text-primary">100%</div>
              <p className="text-gray-600">{t("services.stats.free", "Outils gratuits")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;