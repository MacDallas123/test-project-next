import { useLanguage } from "@/context/LanguageContext";
import {
  Clock,
  Euro,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CharacteristicsSection = () => {
  const { t } = useLanguage();

  const cards = [
    {
      icon: ShieldCheck,
      title: t("characteristics.security.title", "Sécurité Garantie"),
      description: t(
        "characteristics.security.description",
        "Des systèmes fiables pour protéger vos données et vos transactions.",
      ),
    },
    {
      icon: Euro,
      title: t("characteristics.transparent_prices.title", "Prix Transparents"),
      description: t(
        "characteristics.transparent_prices.description",
        "Pas de frais cachés, un devis clair dès le départ pour chaque prestation.",
      ),
    },
    {
      icon: Clock,
      title: t("characteristics.fast_delivery.title", "Rapidité"),
      description: t(
        "characteristics.fast_delivery.description",
        "Des délais respectés et des interventions rapides selon vos besoins.",
      ),
    },
  ];

  return (
    <section className="relative px-4 py-16 overflow-hidden bg-linear-to-br from-primary/10 to-muted/20 md:px-8">
      <div className="container relative z-10 mx-auto">
        <div className="flex flex-col items-center justify-center mb-12">
          <h2 className="mb-4 text-3xl font-bold text-center md:text-4xl drop-shadow">
            {t("characteristics.title", "Pourquoi nous choisir ?")}
          </h2>
          <p className="max-w-2xl text-lg text-center text-muted-foreground">
            {t(
              "characteristics.subtitle",
              "Des garanties concrètes pour votre entreprise",
            )}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="flex flex-col items-center bg-white/90 dark:bg-background/70 rounded-xl shadow-xl px-6 py-8 text-center transition transform hover:scale-[1.035] hover:shadow-2xl backdrop-blur h-full">
                  <div className="inline-flex items-center justify-center mb-4 rounded-full w-14 h-14 bg-primary/10">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardHeader className="w-full">
                    <CardTitle className="mb-2 text-xl font-semibold">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-linear-to-tr from-primary/10 to-muted/5" />
    </section>
  );
};

export default CharacteristicsSection;