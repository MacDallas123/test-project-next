"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  Building2,
  MessageCircle,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearError, createContact, selectContactError, selectContactLoading } from "@/redux/slices/contactSlice";
import { useAuth } from "@/hooks/useAuth";
import { thunkSucceed } from "@/lib/tools";
import { useLanguage } from "@/context/LanguageContext";
import ReactCountryFlag from "react-country-flag";

const contactInfo = [
  {
    icon: Mail,
    titleKey: "contact.info.email.title",
    title: "Email",
    description: "senfibem.paris@outlook.com",
    descriptionFR: "gg.livrernourriture-fibem75@gmail.com",
    descriptionSN: "gg.livrernourriture-fibem90@gmail.com",
    detailsKey: "contact.info.email.details",
    details: "Réponse sous 24h",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Phone,
    titleKey: "contact.info.phone.title",
    title: "Téléphone",
    description: "+33 6 05 51 14 32",
    descriptionFR: "+33 6 05 51 14 32",
    descriptionSN: "+221 783 700 602",
    detailsKey: "contact.info.phone.details",
    details: "Lun-Ven: 9h-18h",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: MapPin,
    titleKey: "contact.info.address.title",
    title: "Adresse",
    description: "Vernon, France",
    descriptionFR: "Vernon, France",
    descriptionSN: "Dakar, Senegal",
    detailsKey: "contact.info.address.details",
    details: "75 001",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Clock,
    titleKey: "contact.info.hours.title",
    title: "Horaires",
    descriptionKey: "contact.info.hours.days",
    description: "Lundi - Vendredi",
    detailsKey: "contact.info.hours.time",
    details: "9h00 - 18h00",
    gradient: "from-orange-500 to-red-500",
  },
];

const officeLocations = [
  {
    country: "France",
    countryCode: "FR",
    nameKey: "contact.offices.france.name",
    name: "FIBEM France",
    addressKey: "contact.offices.france.address",
    address: "51 Rue du Grévarin – 27200 Vernon",
    phone: "+33 7 44 69 17 48",
    email: "gg.livrernourriture-fibem75@gmail.com",
    mapLink: "https://maps.google.com/?q=51+Rue+du+Grévarin+Vernon",
    whatsapp: "https://wa.me/33744691748",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    country: "Sénégal",
    countryCode: "SN",
    nameKey: "contact.offices.senegal.name",
    name: "FIBEM Sénégal",
    addressKey: "contact.offices.senegal.address",
    address: "Rue 7 Corniche x 6, Médina, Dakar",
    phone: "+221 78 370 06 02",
    email: "gg.livrernourriture-fibem99@gmail.com",
    mapLink: "https://maps.google.com/?q=Rue+7+Médina+Dakar",
    whatsapp: "https://wa.me/221783700602",
    gradient: "from-green-600 to-emerald-600",
    ninnea: "30 84 31 62 U2",
    naf: "7112B Engineering",
  },
];

const ContactPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dispatch = useDispatch();
  const selectErrorFS = useSelector(selectContactError);
  const isLoading = useSelector(selectContactLoading);

  const { isLoggedIn, user } = useAuth();

  const handleInputChange = (e) => {
    if (selectErrorFS) dispatch(clearError());

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (selectErrorFS) dispatch(clearError());
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
      }));
    }
  }, [user, selectErrorFS, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isLoggedIn()) {
      localStorage.setItem("contactData", JSON.stringify(formData));
      router.push("/auth/register?redirect=contact");
      setIsSubmitting(false);
    } else {
      const response = await dispatch(createContact(formData));

      if (thunkSucceed(response)) {
        setIsSubmitted(true);
        setFormData({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          address: "",
          subject: "",
          message: "",
        });
      }
      setIsSubmitting(false);
    }
  };

  const getTranslatedText = (item, field) => {
    if (item[`${field}Key`] && t(item[`${field}Key`]) !== item[`${field}Key`]) {
      return t(item[`${field}Key`]);
    }
    return item[field];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Contact */}
      <section className="border-b bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 py-12 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {t("contact.hero.title", "Contactez nous")}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              {t(
                "contact.hero.subtitle",
                "Découvrez les opportunités professionnelles proposées par nos entreprises partenaires"
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center mb-8">
                  <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {t("contact.form.title", "Envoyez-nous un message")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t(
                        "contact.form.subtitle",
                        "Nous vous répondrons sous 48h"
                      )}
                    </p>
                  </div>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold">
                      {t("contact.form.success.title", "Message envoyé !")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(
                        "contact.form.success.message",
                        "Merci pour votre message. Notre équipe vous contactera très rapidement."
                      )}
                    </p>
                    <Button
                      variant="default"
                      className="mt-6"
                      onClick={() => setIsSubmitted(false)}
                    >
                      {t(
                        "contact.form.success.button",
                        "Envoyer un autre message"
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block mb-2 text-sm font-medium"
                        >
                          {t("contact.form.firstName", "Nom")} *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder={t(
                            "contact.form.firstNamePlaceholder",
                            "Votre nom"
                          )}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block mb-2 text-sm font-medium"
                        >
                          {t("contact.form.lastName", "Prénom")} *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder={t(
                            "contact.form.lastNamePlaceholder",
                            "Votre prénom"
                          )}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block mb-2 text-sm font-medium"
                        >
                          {t("contact.form.email", "Email")} *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={t(
                            "contact.form.emailPlaceholder",
                            "votre@email.com"
                          )}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="address"
                          className="block mb-2 text-sm font-medium"
                        >
                          {t("contact.form.address", "Adresse")} *
                        </label>
                        <Input
                          id="address"
                          name="address"
                          type="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          placeholder={t(
                            "contact.form.addressPlaceholder",
                            "Ex: Vernon"
                          )}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block mb-2 text-sm font-medium"
                        >
                          {t("contact.form.phone", "Téléphone")}
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={t(
                            "contact.form.phonePlaceholder",
                            "+33 1 23 45 67 89"
                          )}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="subject"
                          className="block mb-2 text-sm font-medium"
                        >
                          {t("contact.form.subject", "Sujet")} *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder={t(
                            "contact.form.subjectPlaceholder",
                            "Objet de votre message"
                          )}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium"
                      >
                        {t("contact.form.message", "Message")} *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder={t(
                          "contact.form.messagePlaceholder",
                          "Décrivez votre demande ou posez-nous vos questions..."
                        )}
                        rows={15}
                        className="h-52"
                      />
                    </div>

                    <div className="p-3 text-sm rounded-lg text-muted-foreground bg-muted/30">
                      <p>
                        {t(
                          "contact.form.locationNote",
                          "Votre position actuelle sera automatiquement jointe à votre message pour un meilleur service."
                        )}
                      </p>
                    </div>

                    {selectErrorFS && (
                      <div className="flex items-center gap-2 px-3 py-2 mt-2 text-sm text-red-500 rounded-sm bg-red-300/20">
                        <AlertCircle className="w-4 h-4" />
                        <span>{selectErrorFS}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      className="w-full text-lg font-semibold h-14"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                          {t("contact.form.sending", "Envoi en cours...")}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {t("contact.form.submit", "Envoyer le message")}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="mb-8 text-center lg:text-left">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                {t("contact.info.title1", "Parlons de Votre")}
                <span className="block text-transparent bg-primary bg-clip-text">
                  {t("contact.info.title2", "Projet")}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                {t(
                  "contact.info.subtitle",
                  "Notre équipe d'experts est à votre disposition pour vous accompagner."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {contactInfo.map((contact, index) => (
                <motion.div
                  key={contact.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="transition-all duration-300 border-0 cursor-pointer group hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                        >
                          <contact.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-xl font-bold">
                            {getTranslatedText(contact, "title")}
                          </h3>
                          {/* <p className="mb-1 text-lg font-semibold text-primary">
                            {contact.description}
                          </p> */}
                          <p className="text-[1rem] font-medium text-primary/70">
                            {contact.descriptionFR}
                          </p>
                          <p className="text-[1rem] font-medium text-primary/70">
                            {contact.descriptionSN}
                          </p>
                          <p className="text-muted-foreground">
                            {getTranslatedText(contact, "details")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Nos Bureaux Section */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Building2 className="w-6 h-6 mr-3 text-primary" />
                    <h3 className="text-xl font-bold">
                      {t("contact.offices.title", "Nos Bureaux")}
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {officeLocations.map((office, idx) => (
                      <div
                        key={office.country}
                        className={`${idx !== 0 ? "pt-4 border-t border-gray-200 dark:border-gray-700" : ""}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <ReactCountryFlag
                            svg
                            countryCode={office.countryCode}
                            className="text-2xl"
                          />
                          <h4 className="font-bold text-primary">
                            {getTranslatedText(office, "name")}
                          </h4>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{getTranslatedText(office, "address")}</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <a
                              href={`tel:${office.phone.replace(/\s/g, "")}`}
                              className="transition-colors hover:text-primary"
                            >
                              {office.phone}
                            </a>
                          </p>
                          <p className="flex items-start gap-2">
                            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <a
                              href={`mailto:${office.email}`}
                              className="transition-colors hover:text-primary"
                            >
                              {office.email}
                            </a>
                          </p>
                          {office.ninnea && (
                            <p className="text-xs italic text-muted-foreground/60">
                              N.I.N.E.A.: {office.ninnea} — NAF: {office.naf}
                            </p>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(office.mapLink, "_blank")}
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              Google Maps
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => window.open(office.whatsapp, "_blank")}
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}

            {/* Mini Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="w-6 h-6 mr-3 text-primary" />
                    <h3 className="text-xl font-bold">
                      {t("contact.location.title", "Votre Position")}
                    </h3>
                  </div>
                  <p className="mb-4 text-muted-foreground">
                    {t(
                      "contact.location.description",
                      "Pour un service personnalisé, votre position sera automatiquement incluse avec votre message."
                    )}
                  </p>

                  <div className="flex items-center justify-center h-48 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <div className="text-center">
                      <div className="relative">
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-primary animate-pulse" />
                        <div className="absolute top-0 w-2 h-2 transform -translate-x-1/2 bg-red-500 rounded-full left-1/2 animate-ping"></div>
                      </div>
                      <p className="font-medium text-muted-foreground">
                        {t(
                          "contact.location.detected",
                          "Position actuelle détectée"
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                          "contact.location.included",
                          "(Incluse dans votre message)"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>
                      {t(
                        "contact.location.consent",
                        "Position partagée uniquement avec votre consentement"
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;