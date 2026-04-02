import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCheck, Briefcase, Users, ArrowRight } from "lucide-react";

const RecruitsSection = () => {
  const jobOffers = [
    {
      id: 1,
      title: "Développeur Fullstack React/Node.js",
      company: "FIBEM Digital",
      location: "Paris, France",
      type: "CDI",
      salary: "100-400 €",
      urgency: true,
      category: "tech",
    },
    {
      id: 2,
      title: "Commercial BTP",
      company: "FIBEM Construction",
      location: "Dakar, Sénégal",
      type: "CDD",
      salary: "Selon profil",
      urgency: true,
      category: "commercial",
    },
  ];
  return (
    <section id="recruitment" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="px-4 py-2 mb-4 text-orange-600 bg-orange-100">
              <UserCheck className="w-4 h-4 mr-2" />
              Recrutement
            </Badge>
            <h2 className="mb-6 text-4xl font-bold">
              Trouvez le talent idéal ou votre{" "}
              <span className="text-orange-600">prochain emploi</span>
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Plateforme de recrutement intelligente qui met en relation
              candidats qualifiés et recruteurs exigeants.
            </p>
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-orange-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Pour les recruteurs</h4>
                    <p className="text-sm text-muted-foreground">
                      Accédez à une base de candidats présélectionnés
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-blue-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Pour les candidats</h4>
                    <p className="text-sm text-muted-foreground">
                      Découvrez des offres adaptées à votre profil
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button asChild size="lg" variant="link" className="gap-3 mt-8">
              <Link href="/emploi">
                <UserCheck className="w-5 h-5" />
                Recherche d&apos;emploi
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* <div className="p-8 border rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50"> */}
            <div className="p-8 rounded-2xl bg-linear-to-br from-orange-50 to-amber-50">
              {/* <h3 className="mb-6 text-2xl font-bold">Offres en vedette</h3> */}
              <h3 className="mb-6 text-2xl font-bold">Offres</h3>
              <div className="space-y-4">
                {jobOffers.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 bg-white shadow-sm rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{job.title}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {job.company}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {job.location}
                          </span>
                        </div>
                      </div>
                      {job.urgency && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="outline">{job.type}</Badge>
                      <span className="text-sm font-medium">{job.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RecruitsSection;
