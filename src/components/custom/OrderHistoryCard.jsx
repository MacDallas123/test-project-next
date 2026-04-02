// OrderHistoryCard.jsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  User,
  FileText,
  Download,
  MessageSquare,
  Truck,
  Shield,
  Star,
  ExternalLink,
  Receipt,
} from "lucide-react";

const OrderHistoryCard = ({ order }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Fonction pour déterminer le statut
  const getStatusInfo = (status) => {
    const statusMap = {
      completed: {
        label: "Terminée",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        iconColor: "text-green-600",
      },
      in_progress: {
        label: "En cours",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
        iconColor: "text-blue-600",
      },
      pending: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle,
        iconColor: "text-yellow-600",
      },
      cancelled: {
        label: "Annulée",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        iconColor: "text-red-600",
      },
      delivered: {
        label: "Livrée",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Package,
        iconColor: "text-purple-600",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <Card className="transition-colors border hover:border-primary/30">
      {/* En-tête - Aperçu de la commande */}
      <CardHeader className="pb-3">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Commande #{order.orderNumber}</h3>
              <Badge className={`${statusInfo.color} border`}>
                <statusInfo.icon
                  className={`w-3 h-3 mr-1 ${statusInfo.iconColor}`}
                />
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Commandé le {order.date}</span>
              </div>
              {order.deliveryDate && (
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  <span>Livraison prévue : {order.deliveryDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold">{order.totalAmount} €</div>
            <div className="text-sm text-muted-foreground">
              {order.itemsCount} {order.itemsCount > 1 ? "services" : "service"}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Contenu principal - Aperçu des items */}
      <CardContent className="pt-0">
        <div className="space-y-3">
          {order.items.slice(0, 2).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.provider} • {item.category}
                  </div>
                </div>
              </div>
              <div className="font-medium">{item.price.toFixed(2)} €</div>
            </div>
          ))}

          {order.items.length > 2 && (
            <div className="text-sm text-center text-muted-foreground">
              + {order.items.length - 2} autres services
            </div>
          )}
        </div>

        {/* Détails de la commande (cachés par défaut) */}
        {showDetails && (
          <div className="pt-6 mt-6 duration-300 border-t animate-in fade-in">
            {/* Informations de facturation */}
            <div className="mb-6">
              <h4 className="flex items-center gap-2 mb-3 font-semibold">
                <Receipt className="w-4 h-4" />
                Informations de facturation
              </h4>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="space-y-2">
                  <div className="font-medium">Client</div>
                  <div className="text-muted-foreground">
                    {order.billing.name}
                  </div>
                  <div className="text-muted-foreground">
                    {order.billing.email}
                  </div>
                  <div className="text-muted-foreground">
                    {order.billing.phone}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Adresse</div>
                  <div className="text-muted-foreground">
                    {order.billing.address}
                  </div>
                  <div className="text-muted-foreground">
                    {order.billing.postalCode} {order.billing.city}
                  </div>
                  <div className="text-muted-foreground">
                    {order.billing.country}
                  </div>
                </div>
              </div>
            </div>

            {/* Tous les items de la commande */}
            <div className="mb-6">
              <h4 className="flex items-center gap-2 mb-3 font-semibold">
                <Package className="w-4 h-4" />
                Détail des services ({order.items.length})
              </h4>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex flex-col justify-between gap-4 mb-3 sm:flex-row sm:items-center">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/10">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Fournisseur : {item.provider}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {item.price.toFixed(2)} €
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} × {item.unitPrice.toFixed(2)} €
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div>
                        <div className="mb-1 font-medium">Description</div>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div>
                        <div className="mb-1 font-medium">Détails</div>
                        <div className="space-y-1 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>Durée : {item.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>Début : {item.startDate}</span>
                          </div>
                          {item.endDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>Fin prévue : {item.endDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fonctionnalités incluses */}
                    {item.features && item.features.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 text-sm font-medium">Inclus :</div>
                        <div className="flex flex-wrap gap-2">
                          {item.features.map((feature, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact du prestataire */}
                    <div className="pt-4 mt-4 border-t">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Contact prestataire :</span>
                          <a
                            href={`mailto:${item.providerEmail}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {item.providerEmail}
                          </a>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`/prestataire/${item.providerId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Voir le profil
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Détails du paiement */}
            <div className="mb-6">
              <h4 className="flex items-center gap-2 mb-3 font-semibold">
                <CreditCard className="w-4 h-4" />
                Détails du paiement
              </h4>
              <div className="p-4 border rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{order.subtotal.toFixed(2)} €</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Réduction</span>
                      <span className="text-green-600">
                        -{order.discount.toFixed(2)} €
                      </span>
                    </div>
                  )}

                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        TVA ({order.taxRate}%)
                      </span>
                      <span>{order.tax.toFixed(2)} €</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{order.totalAmount.toFixed(2)} €</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 text-sm border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-3 h-3" />
                      <span>Méthode : {order.paymentMethod}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Référence : {order.paymentReference}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Télécharger la facture
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="w-4 h-4" />
                Contrat de service
              </Button>
              {order.status === "completed" && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Star className="w-4 h-4" />
                  Laisser un avis
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Contacter le support
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Pied de carte avec bouton d'action */}
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Garantie : {order.warranty}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                Masquer les détails
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Afficher les détails
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderHistoryCard;
