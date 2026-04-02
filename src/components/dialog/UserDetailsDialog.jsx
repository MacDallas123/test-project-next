import { CreditCard, Building, Lock, Unlock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const UserDetailsDialog = ({
  isUserDetailOpen,
  setIsUserDetailOpen,
  selectedUser,
  getStatusColor,
  getRoleColor,
  toggleUserStatus,
}) => {
  return (
    <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
      <DialogContent className="sm:max-w-[700px]">
        {selectedUser && (
          <>
            <DialogHeader>
              <DialogTitle>
                Profil de {selectedUser.prenom} {selectedUser.nom}
              </DialogTitle>
              <DialogDescription>
                Informations détaillées et statistiques de l'utilisateur
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* En-tête du profil */}
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.prenom[0]}
                    {selectedUser.nom[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedUser.prenom} {selectedUser.nom}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={`${getStatusColor(selectedUser.statut)}`}
                      >
                        {selectedUser.statut}
                      </Badge>
                      <Badge className={`${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{selectedUser.telephone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date d'inscription
                      </p>
                      <p className="font-medium">
                        {selectedUser.dateInscription}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Dernière connexion
                      </p>
                      <p className="font-medium">
                        {selectedUser.derniereConnexion}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Compte vérifié
                      </p>
                      <p className="font-medium">
                        {selectedUser.compteVerifie ? "Oui" : "Non"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Statistiques */}
              <div>
                <h4 className="mb-4 font-medium">Statistiques d'activité</h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {selectedUser.stats.candidatures}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Candidatures
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {selectedUser.stats.offresPostees}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Offres postées
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {selectedUser.stats.messages}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Messages
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {selectedUser.stats.satisfaction}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Satisfaction
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Informations complémentaires */}
              <div className="space-y-4">
                <h4 className="font-medium">Informations complémentaires</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Abonnement</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <CreditCard className="w-4 h-4" />
                      <span>{selectedUser.abonnement}</span>
                    </div>
                  </div>
                  {selectedUser.entreprise && (
                    <div>
                      <Label>Entreprise</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Building className="w-4 h-4" />
                        <span>{selectedUser.entreprise}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUserDetailOpen(false)}
              >
                Fermer
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  toggleUserStatus(selectedUser.id, selectedUser.statut)
                }
              >
                {selectedUser.statut === "actif"
                  ? "Suspendre le compte"
                  : "Activer le compte"}
              </Button>
              <Button>Modifier le profil</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
