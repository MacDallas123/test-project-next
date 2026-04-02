import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Printer,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  User,
  Building,
  MapPin,
  Phone,
  AlertCircle,
  ExternalLink,
  XCircle,
  Package,
  BarChart3,
} from "lucide-react";

const OrderDetailsDialog = ({
  isOrderDetailOpen,
  setIsOrderDetailOpen,
  selectedOrder,
  getStatusColor,
  getTypeColor,
  formatMontant,
  commandes,
  cancelOrder,
}) => {
  return (
    <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        {selectedOrder && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle>{selectedOrder.id}</DialogTitle>
                  <DialogDescription>
                    Commande du {selectedOrder.dateCommande}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(selectedOrder.statut)}`}>
                    {selectedOrder.statut}
                  </Badge>
                  <Badge className={`${getTypeColor(selectedOrder.type)}`}>
                    {selectedOrder.type}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="articles">Articles</TabsTrigger>
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="suivi">Suivi</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* Informations générales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Informations générales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Montant total</Label>
                      <p className="mt-2 text-2xl font-bold">
                        {formatMontant(
                          selectedOrder.montant,
                          selectedOrder.devise,
                        )}
                      </p>
                    </div>
                    <div>
                      <Label>Mode de paiement</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <CreditCard className="w-4 h-4" />
                        <span>{selectedOrder.modePaiement}</span>
                      </div>
                      {selectedOrder.referencePaiement && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Réf: {selectedOrder.referencePaiement}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Date de commande</Label>
                      <p className="mt-2 font-medium">
                        {selectedOrder.dateCommande}
                      </p>
                    </div>
                    <div>
                      <Label>Date de livraison</Label>
                      <p className="mt-2 font-medium">
                        {selectedOrder.dateLivraison || "Non livrée"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Adresse de livraison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Adresse de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedOrder.adresseLivraison.nom}</span>
                      </div>
                      {selectedOrder.adresseLivraison.entreprise && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {selectedOrder.adresseLivraison.entreprise}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedOrder.adresseLivraison.rue}</span>
                      </div>
                      <div className="pl-6">
                        <span>
                          {selectedOrder.adresseLivraison.codePostal}{" "}
                          {selectedOrder.adresseLivraison.ville}
                        </span>
                      </div>
                      <div className="pl-6">
                        <span>{selectedOrder.adresseLivraison.pays}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedOrder.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="articles" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Articles commandés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Article</TableHead>
                          <TableHead className="text-right">Quantité</TableHead>
                          <TableHead className="text-right">
                            Prix unitaire
                          </TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.articles.map((article, index) => (
                          <TableRow key={index}>
                            <TableCell>{article.nom}</TableCell>
                            <TableCell className="text-right">
                              {article.quantite}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMontant(
                                article.prix,
                                selectedOrder.devise,
                              )}
                            </TableCell>
                            <TableCell className="font-bold text-right">
                              {formatMontant(
                                article.prix * article.quantite,
                                selectedOrder.devise,
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-accent/50">
                          <TableCell
                            colSpan={3}
                            className="font-bold text-right"
                          >
                            Total
                          </TableCell>
                          <TableCell className="text-lg font-bold text-right">
                            {formatMontant(
                              selectedOrder.montant,
                              selectedOrder.devise,
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="client" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Informations client
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={selectedOrder.client.avatar} />
                        <AvatarFallback className="text-lg">
                          {selectedOrder.client.prenom[0]}
                          {selectedOrder.client.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">
                          {selectedOrder.client.prenom}{" "}
                          {selectedOrder.client.nom}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedOrder.client.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Téléphone</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Phone className="w-4 h-4" />
                          <span>{selectedOrder.client.telephone}</span>
                        </div>
                      </div>
                      {selectedOrder.client.entreprise && (
                        <div>
                          <Label>Entreprise</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Building className="w-4 h-4" />
                            <span>{selectedOrder.client.entreprise}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <h4 className="mb-3 font-medium">
                        Historique des commandes
                      </h4>
                      <div className="space-y-2">
                        {commandes
                          .filter(
                            (cmd) =>
                              cmd.client.email === selectedOrder.client.email,
                          )
                          .slice(0, 3)
                          .map((cmd) => (
                            <div
                              key={cmd.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{cmd.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {cmd.dateCommande}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {formatMontant(cmd.montant, cmd.devise)}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  {cmd.statut}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suivi" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Suivi de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.suivi ? (
                      <div className="space-y-6">
                        <div className="p-4 border rounded-lg bg-green-50">
                          <div className="flex items-center gap-3">
                            <Truck className="w-6 h-6 text-green-600" />
                            <div>
                              <h4 className="font-medium">Numéro de suivi</h4>
                              <p className="text-green-700">
                                {selectedOrder.suivi}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Timeline de livraison */}
                        <div className="relative space-y-4">
                          {[
                            {
                              etape: "Commande validée",
                              date: selectedOrder.dateCommande,
                              statut: "complete",
                            },
                            {
                              etape: "Préparation en cours",
                              date: selectedOrder.dateCommande,
                              statut: "complete",
                            },
                            {
                              etape: "Expédiée",
                              date: selectedOrder.dateLivraison
                                ? "1 jour avant livraison"
                                : "En cours",
                              statut:
                                selectedOrder.statut === "livrée"
                                  ? "complete"
                                  : "current",
                            },
                            {
                              etape: "Livrée",
                              date: selectedOrder.dateLivraison || "En attente",
                              statut:
                                selectedOrder.statut === "livrée"
                                  ? "complete"
                                  : "pending",
                            },
                          ].map((etape, index) => (
                            <div key={index} className="flex items-start gap-4">
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                  etape.statut === "complete"
                                    ? "bg-green-100 text-green-600"
                                    : etape.statut === "current"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {etape.statut === "complete" ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : etape.statut === "current" ? (
                                  <Clock className="w-4 h-4" />
                                ) : (
                                  <Clock className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{etape.etape}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {etape.date}
                                </p>
                              </div>
                              {index < 3 && (
                                <div
                                  className={`absolute left-4 top-8 w-0.5 h-10 ${
                                    etape.statut === "complete"
                                      ? "bg-green-200"
                                      : "bg-gray-200"
                                  }`}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>

                        <Button className="w-full gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Voir le suivi détaillé
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-amber-50">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                          <div>
                            <h4 className="font-medium">
                              Pas de suivi disponible
                            </h4>
                            <p className="text-amber-700">
                              Aucun numéro de suivi n'a été généré pour cette
                              commande.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOrderDetailOpen(false)}
              >
                Fermer
              </Button>
              <Button variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelOrder(selectedOrder.id)}
              >
                Annuler la commande
              </Button>
              <Button>Mettre à jour</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
