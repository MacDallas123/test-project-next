import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react"; 

const UserProvider = () => {
  const providers = [
    {
      id: 1,
      name: "Professionnel 1",
      category: "Lorem Ipsum",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus mi.",
      avatar: "bg-gradient-to-br from-slate-300 to-gray-400",
      website: "https://professionnel1.fake",
    },
    {
      id: 2,
      name: "Partenaire 1",
      category: "Dolor Sit",
      description:
        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia.",
      avatar: "bg-gradient-to-br from-yellow-300 to-pink-400",
      website: "https://partenaire1.fake",
    },
    {
      id: 3,
      name: "Entreprise 1",
      category: "Amet Consectetur",
      description:
        "Maecenas non leo laoreet, condimentum lorem nec, vulputate massa. Cras ultricies ligula.",
      avatar: "bg-gradient-to-br from-red-200 to-orange-300",
      website: "https://entreprisefausse.fake",
    },
    {
      id: 4,
      name: "WORKER 2.0",
      category: "Adipiscing Elit",
      description:
        "Suspendisse potenti. Proin consequat, ipsum eu venenatis semper, justo turpis posuere tortor.",
      avatar: "bg-gradient-to-br from-blue-200 to-teal-300",
      website: "https://professionliberale.fake",
    },
    {
      id: 5,
      name: "Partenaire XF",
      category: "Vestibulum Orci",
      description:
        "Morbi ut blandit risus. Donec mollis nec tellus et rutrum. Orci varius natoque penatibus.",
      avatar: "bg-gradient-to-br from-green-200 to-lime-300",
      website: "https://fauxprestataire.fake",
    },
    {
      id: 6,
      name: "Particulier ALT. CO.",
      category: "Ultricies Ligula",
      description:
        "Integer facilisis, ex nec sollicitudin ullamcorper, purus dui varius augue.",
      avatar: "bg-gradient-to-br from-purple-200 to-indigo-300",
      website: "https://particulierfictif.fake",
    },
  ];

  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280; // 340
      if (direction === "left") {
        scrollContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section id="providers" className="px-4 py-4 mb-4 h-[700px]">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold">Produits et Prestations</h2>
          <p className="max-w-xl mx-auto text-muted-foreground">
            Découvrez les produits et prestations proposés par nos utilisateurs
          </p>
        </div>

        {/* Conteneur scrollable */}
        <div className="relative">
          <div className="relative">
            {/* Scroll Buttons */}
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => handleScroll("left")}
              className="absolute left-0 z-10 flex items-center justify-center w-12 h-12 transition -translate-y-1/2 border rounded-full shadow top-1/2 bg-background/80 hover:bg-background disabled:opacity-40"
              style={{ boxShadow: "0 2px 12px 0 rgb(0 0 0 / 0.10)" }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => handleScroll("right")}
              className="absolute right-0 z-10 flex items-center justify-center w-12 h-12 transition -translate-y-1/2 border rounded-full shadow top-1/2 bg-background/80 hover:bg-background disabled:opacity-40"
              style={{ boxShadow: "0 2px 12px 0 rgb(0 0 0 / 0.10)" }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              ref={scrollContainerRef}
              className="relative flex h-full py-16 pb-8 space-x-6 overflow-x-auto scrollbar-hide"
            >
              {providers.map((provider) => (
                <div key={provider.id} className="w-64 shrink-0">
                  <Card className="h-full transition-shadow duration-300 border-none shadow-sm hover:shadow-md">
                    {/* Avatar circulaire centré */}
                    <div className="flex justify-center py-2">
                      <div
                        className={`w-32 h-32 rounded-full bg-accent flex items-center justify-center text-white text-5xl font-bold border-4 border-background`}
                      >
                        {provider.name.charAt(0)}
                      </div>
                    </div>

                    <CardContent className="pt-6 text-center">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.category}
                        </p>
                      </div>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                        {provider.description}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <a
                        // href={provider.website}
                        href={`/prestataire/${provider.id}`}
                        // target="_blank"
                        // rel="noopener noreferrer"
                        className="flex items-center justify-center w-full gap-1 text-sm text-primary hover:text-primary/80 hover:underline"
                      >
                        Voir les produits/prestations
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Indicateurs de défilement discrets */}
          <div className="flex justify-center mt-6 space-x-1">
            {providers.slice(0, 4).map((_, index) => (
              <div
                key={index}
                className="w-1 h-1 rounded-full bg-muted-foreground/20"
              />
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/providers"
            className="text-sm transition-colors text-muted-foreground hover:text-primary"
          >
            Voir tous les prestataires →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UserProvider;
