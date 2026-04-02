import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Send,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/assets/logo_fibem3.jpg";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useLanguage } from "@/context/LanguageContext";
import ReactCountryFlag from "react-country-flag";
import SiteTileForm1 from "../custom/SiteTitleForm1";

const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      console.log("Abonnement à la newsletter:", email);
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // Menus correspondant au Header
  const mainMenus = [
    { label: t("mainMenu.home", "Accueil"), href: "/" },
    { label: t("mainMenu.foods", "Rech. Repas"), href: "/services" },
    { label: t("mainMenu.job", "Rech. Emploi"), href: "/emploi" },
    { label: t("mainMenu.cv", "CV"), href: "/cv" },
    { label: t("mainMenu.contact", "Contact"), href: "/contact" },
    { label: t("mainMenu.facture", "Facture"), href: "/facture" },
  ];

  const serviceSubMenus = [
    {
      label: t("mainMenu.service.prestation", "Rechercher un repas"),
      href: "/service/prestation",
    },
    {
      label: t("mainMenu.service.formulaireCV", "Formulaire CV FIBEM"),
      href: "/service/formulaire-cv",
    },
    {
      label: t("mainMenu.service.facture", "Facture"),
      href: "/service/facture",
    },
  ];

  const emploiSubMenus = [
    {
      label: t("mainMenu.emploi.espaceCandidat", "Espace candidat"),
      href: "/emploi/candidat",
    },
    {
      label: t("mainMenu.emploi.espaceRecruteur", "Espace recruteur"),
      href: "/emploi/recruteur",
    },
    {
      label: t("mainMenu.emploi.espaceStagiaire", "Espace stagiaire"),
      href: "/emploi/stagiaire",
    },
    {
      label: t("mainMenu.emploi.espaceAbonnement", "Espace abonnement"),
      href: "/emploi/abonnement",
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/profile.php?id=61580826024280",
      label: t("footer.social.facebook", "Facebook"),
      className: "bg-[#1877f3] text-white hover:bg-[#165fc7]"
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/sen-fibem-france-953349213/?originalSubdomain=fr",
      label: t("footer.social.linkedin", "LinkedIn"),
      className: "bg-[#0077b5] text-white hover:bg-[#005983]"
    },
    {
      icon: Instagram,
      href: "https://www.instagram.com/sen.fibemfrance/",
      label: t("footer.social.instagram", "Instagram"),
      className: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90"
    },
    {
      //icon: Twitter,
      svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 462.799"><path fill="#FFFFFF" fillRule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/></svg>,
      href: "https://x.com/senfibemfrance",
      label: t("footer.social.x", "X (Twitter)"),
      className: "bg-black text-white hover:bg-neutral-700"
    },
    {
      icon: Youtube,
      href: "https://www.youtube.com/channel/UC1ro5Fjh6Se9pMQ_kc-QzBw",
      label: t("footer.social.youtube", "YouTube"),
      className: "bg-[#ff0000] text-white hover:bg-[#cc0000]"
    },
    {
      //icon: Tiktok,
      svg: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 455 512.098"><path fill="#FFFFFF" fillRule="nonzero" d="M321.331.011h-81.882v347.887c0 45.59-32.751 74.918-72.582 74.918-39.832 0-75.238-29.327-75.238-74.918 0-52.673 41.165-80.485 96.044-74.727v-88.153c-7.966-1.333-15.932-1.77-22.576-1.77C75.249 183.248 0 255.393 0 344.794c0 94.722 74.353 167.304 165.534 167.304 80.112 0 165.097-58.868 165.097-169.96V161.109c35.406 35.406 78.341 46.476 124.369 46.476V126.14C398.35 122.151 335.494 84.975 321.331 0v.011z"/></svg>,
      href: "https://www.tiktok.com/@senfibemfrance",
      label: t("footer.social.tiktok", "TikTok"),
      className: "bg-black text-white hover:bg-neutral-700"
    },
  ];

  return (
    <footer className="mt-20 text-white border-t bg-linear-to-b bg-primary">
      <div className="container px-4 py-6 mx-auto">
        {/* Section principale */}
        <div className="grid gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo et description */}
          <div className="space-y-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-lg bg-linear-to-r from-primary/10 to-secondary/10 group-hover:scale-105">
                <img src={Logo} alt={t("footer.logoAlt", "LOGO FIBEM")} className="rounded-lg" />
              </div>
              <SiteTileForm1 />
            </Link>
            <div>
              <ul className="grid grid-cols-3 gap-1 ml-4 space-y-1">
                {mainMenus.map((item) => (
                  <li key={item.href} className="flex flex-col items-center justify-center col-span-1 whitespace-nowrap">
                    <Link
                      to={item.href}
                      className="w-full px-1 py-1.5 text-xs font-bold text-center transition-colors bg-white rounded-md border-primary text-primary hover:text-destructive"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contacts */}
          <div className="pt-4 mt-4 space-y-4 border-t border-secondary lg:col-span-2">
            <h4 className="mb-3 text-sm font-semibold text-accent">
              {t("footer.contacts", "Contacts")}
            </h4>
            <div className="flex flex-row flex-wrap space-y-6 md:flex-nowrap">
              {/* France Contact */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ReactCountryFlag svg countryCode="FR" className="w-5 h-5" />
                  <span className="text-xs font-semibold text-secondary md:text-base">
                    {t("footer.france.name", "FIBEM France")}
                  </span>
                </div>
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span className="text-sm">
                      {t("footer.france.address", "51 Rue du Grévarin – 27200 Vernon")}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4" />
                    <a
                      href="tel:+33"
                      className="text-sm transition-colors hover:text-slate-700"
                    >
                      {t("footer.france.phone", "Tel: +33 6 05 51 14 32")}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    {t("footer.france.siret", "SIRET 445 374 937 00032")}
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    <a
                      href="mailto:france@fibem.fr"
                      className="text-sm transition-colors hover:text-slate-700"
                    >
                      gg.livrernourriture-fibem75@gmail.com
                    </a>
                  </li>
                  <li className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1 text-sm font-medium transition-colors bg-white border rounded hover:bg-gray-100 text-primary border-border whitespace-nowrap"
                      onClick={() =>
                        window.open(
                          "https://maps.google.com/?q=51 Rue du Grévarin – 27200 Vernon",
                          "_blank"
                        )
                      }
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                      {t("footer.viewGoogleMap", "Voir Google Map")}
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white transition-colors bg-green-500 rounded hover:bg-green-600"
                      onClick={() =>
                        window.open("https://wa.me/33605511432", "_blank")
                      }
                    >
                      <svg role="img" className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      {t("footer.whatsapp", "Whatsapp")}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Senegal Contact */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ReactCountryFlag svg countryCode="SN" className="w-5 h-5" />
                  <span className="text-xs font-semibold text-secondary md:text-base">
                    {t("footer.senegal.name", "FIBEM Sénégal")}
                  </span>
                </div>
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span className="text-sm">
                      {t("footer.senegal.address", "Rue 7 Corniche x 6, Médina, Dakar")}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4" />
                    <a
                      href="tel:+221"
                      className="text-sm transition-colors hover:text-slate-700"
                    >
                      {t("footer.senegal.phone", "Tel: +221 78 370 06 02")}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    {t("footer.senegal.ninea", "N.I.N.E.A.: 30 84 31 62 U2 — NAF: 7112B Engineering")}
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    <a
                      href="mailto:senegal@fibem.fr"
                      className="text-sm transition-colors hover:text-slate-700"
                    >
                      gg.livrernourriture-fibem99@gmail.com
                    </a>
                  </li>
                  <li className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1 text-sm font-medium transition-colors bg-white border rounded hover:bg-gray-100 text-primary border-border whitespace-nowrap"
                      onClick={() =>
                        window.open(
                          "https://maps.google.com/?q=Rue 7, Médina, Dakar",
                          "_blank",
                        )
                      }
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                      {t("footer.viewGoogleMap", "Voir Google Map")}
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white transition-colors bg-green-500 rounded hover:bg-green-600"
                      onClick={() =>
                        window.open("https://wa.me/221783700602", "_blank")
                      }
                    >
                      <svg role="img" className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      {t("footer.whatsapp", "Whatsapp")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="pt-4 mt-4 space-y-4 border-t border-secondary lg:col-span-1">
            <h4 className="mb-3 text-sm font-semibold text-secondary">
              {t("footer.newsletter", "Newsletter")}
            </h4>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t("footer.emailPlaceholder", "Votre email")}
                  className="flex-1 bg-white text-destructive"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 bg-destructive/80 hover:bg-destructive"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {subscribed && (
                <p className="text-xs text-green-600">
                  {t("footer.subscribed", "Merci pour votre inscription !")}
                </p>
              )}
              <p className="text-xs">
                {t(
                  "footer.newsletterDesc",
                  "Recevez nos actualités et offres spéciales",
                )}
              </p>
            </form>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex flex-col justify-between gap-6 mb-8 md:flex-row md:items-center">
          <div className="flex flex-row items-center justify-center">
            <h4 className="mb-3 mr-10 font-semibold text-white">
              {t("footer.social.followUs", "Suivez-nous :")}
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-10 h-10 transition-all rounded-full ${social.className}`}
                    aria-label={social.label}
                  >
                    {Icon ? <Icon className="w-5 h-5" /> : social.svg}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="pt-4 border-t border-secondary">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm font-light text-center text-white/70">
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-2xl text-secondary">L</span>ivrer
              <span className="text-2xl text-secondary">N</span>ourriture.{" "}
              {t("footer.rights", "Tous droits réservés.")}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mr-2 text-sm font-light text-white/70">
              <Link
                to="/privacy"
                className="hover:text-slate-700 hover:underline"
              >
                {t("footer.privacy", "Politique de confidentialité")}
              </Link>
              <Link to="/terms" className="hover:text-slate-700 hover:underline">
                {t("footer.terms", "Conditions d'utilisation")}
              </Link>
              <Link
                to="/cookies"
                className="hover:text-slate-700 hover:underline"
              >
                {t("footer.cookies", "Cookies")}
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-slate-700 hover:underline"
              >
                {t("footer.sitemap", "Plan du site")}
              </Link>
              <Link
                to="/contact"
                className="hover:text-slate-700 hover:underline"
              >
                {t("footer.contact", "Contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;