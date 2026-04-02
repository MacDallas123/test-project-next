import { createSlice } from "@reduxjs/toolkit";

// Générer un ID unique
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// Données fictives initiales
export const fakeData = {
  users: [
    {
      id: 1,
      name: "Admin System",
      email: "admin@foodapp.com",
      phone: "+33612345678",
      type: "administrateur",
      address: "12 Rue de la Paix, 75002 Paris, France",
      password: "admin123",
      profile: {
        enterprise: "FoodApp Inc.",
        post: "Administrateur",
        salary: 0,
        geoMobility: "France",
        experience: 5,
        workType: "full-time",
        availability: "immédiate",
        contacts: [],
        documents: {
          cv: null,
          motivation: null,
          diploma: null,
        },
      },
    },
  ],

  foods: [
    {
      id: 1,
      name: "Pizza Margherita",
      description:
        "Une pizza italienne classique avec sauce tomate, mozzarella et basilic frais.",
      price: 10.99,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
      restaurant: "Bella Italia",
      category: "Pizza",
      available: true,
      currency: "EUR",
      userId: 1, // Propriétaire du produit
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Poulet Yassa",
      description:
        "Poulet mariné dans le citron, les oignons et les épices, servi avec du riz.",
      price: 8.5,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      restaurant: "Saveurs du Sénégal",
      category: "Africain",
      available: true,
      currency: "XOF",
      userId: 1,
      createdAt: "2024-01-16",
    },
  ],

  // Offres d'emploi
  jobOffers: [
    {
      id: 1,
      title: "Livreur à vélo",
      description: "Recherche livreur pour livraison de repas dans Paris",
      type: "CDD",
      contractType: "temps-partiel",
      salary: 1800,
      currency: "EUR",
      location: "Paris",
      isInternship: false,
      company: "FoodExpress",
      contactEmail: "recrutement@foodexpress.com",
      status: "active",
      userId: 1, // Utilisateur qui a publié l'offre
      createdAt: "2024-01-10",
      applications: [],
    },
    {
      id: 2,
      title: "Stage Cuisinier",
      description: "Stage de 6 mois en cuisine française",
      type: "Stage",
      contractType: "stage",
      salary: 600,
      currency: "EUR",
      location: "Lyon",
      isInternship: true,
      company: "Bistro Français",
      contactEmail: "stage@bistrofrancais.com",
      status: "active",
      userId: 1,
      createdAt: "2024-01-12",
      applications: [],
    },
  ],

  // Candidatures
  jobApplications: [
    {
      id: 1,
      jobId: 1,
      userId: 1, // Candidat
      status: "pending",
      message: "Je suis intéressé par ce poste",
      appliedAt: "2024-01-14",
      documents: {
        cv: "cv_1.pdf",
        motivation: "lettre_motivation_1.pdf",
      },
    },
  ],

  // Commandes
  orders: [
    {
      id: 1,
      orderNumber: "CMD001",
      userId: 1,
      items: [
        { foodId: 1, quantity: 2, price: 10.99 },
        { foodId: 2, quantity: 1, price: 8.5 },
      ],
      total: 30.48,
      status: "delivered",
      deliveryAddress: "12 Rue de la Paix, 75002 Paris",
      deliveryTime: "19:30",
      paymentMethod: "card",
      paymentStatus: "paid",
      createdAt: "2024-01-15T18:30:00",
      deliveredAt: "2024-01-15T19:30:00",
    },
  ],

  // Factures
  invoices: [
    {
      id: 1,
      invoiceNumber: "FA-2024-0001",
      quoteId: null, // Si généré à partir d'un devis
      orderId: 1,
      userId: 1,
      clientInfo: {
        name: "Admin System",
        email: "admin@foodapp.com",
        address: "12 Rue de la Paix, 75002 Paris",
        phone: "+33612345678",
      },
      companyInfo: {
        name: "FoodApp Inc.",
        address: "123 Business Street, 75001 Paris",
        phone: "+33123456789",
        email: "contact@foodapp.com",
        siret: "12345678901234",
        rib: "FR76 1234 5678 9012 3456 7890 123",
      },
      items: [
        {
          description: "Pizza Margherita x2",
          quantity: 2,
          unitPrice: 10.99,
          total: 21.98,
        },
        {
          description: "Poulet Yassa x1",
          quantity: 1,
          unitPrice: 8.5,
          total: 8.5,
        },
      ],
      subtotal: 30.48,
      tax: 6.1, // 20% TVA
      total: 36.58,
      currency: "EUR",
      status: "paid", // draft, pending, paid, cancelled, overdue
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      paymentDate: "2024-01-15",
      notes: "Merci pour votre commande",
      version: 1,
      isBis: false,
      pdfUrl: "/invoices/FA-2024-0001.pdf",
    },
  ],

  // Devis
  quotes: [
    {
      id: 1,
      quoteNumber: "DEV-2024-0001",
      userId: 1,
      clientInfo: {
        name: "Client Entreprise",
        email: "contact@entreprise.com",
        address: "45 Avenue des Champs, 75008 Paris",
      },
      items: [
        {
          description: "Formule Traiteur Standard",
          quantity: 1,
          unitPrice: 500,
          total: 500,
        },
      ],
      subtotal: 500,
      tax: 100,
      total: 600,
      currency: "EUR",
      status: "validated", // draft, sent, validated, expired, rejected
      validityDays: 30,
      issueDate: "2024-01-10",
      expiryDate: "2024-02-10",
      notes: "Devis pour service traiteur mensuel",
      convertedToInvoice: true,
      invoiceId: 1,
    },
  ],

  // Avoirs
  creditNotes: [
    {
      id: 1,
      creditNumber: "AV-2024-0001",
      invoiceId: 1,
      userId: 1,
      reason: "Retour produit",
      amount: 10.99,
      currency: "EUR",
      status: "issued", // draft, issued, applied, cancelled
      issueDate: "2024-01-16",
      notes: "Avoir pour pizza retournée",
    },
  ],

  // Clients (pour les professionnels)
  clients: [
    {
      id: 1,
      name: "Restaurant Le Gourmet",
      email: "contact@legourmet.com",
      phone: "+33123456790",
      type: "entreprise",
      address: "8 Rue de la Gastronomie, 75001 Paris",
      userId: 1, // Professionnel qui gère ce client
      createdAt: "2024-01-01",
    },
  ],
};

const initialState = {
  user: null,
  cart: [],
  error: null,
  // Données supplémentaires pour les fonctionnalités
  foods: fakeData.foods,
  jobOffers: fakeData.jobOffers,
  jobApplications: fakeData.jobApplications,
  orders: fakeData.orders,
  invoices: fakeData.invoices,
  quotes: fakeData.quotes,
  creditNotes: fakeData.creditNotes,
  clients: fakeData.clients,
  activeTab: "dashboard", // Pour la navigation dans le dashboard
  isLoading: false,
  isLoggedIn: true
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // ===== AUTHENTIFICATION =====
    loginAction: (state, action) => {
      const { identifier, password } = action.payload || {};

      if (!password) {
        state.error = "Mot de passe requis.";
        state.user = null;
        return;
      }

      const foundUser = fakeData.users.find(
        (user) => user.email === identifier || user.phone === identifier,
      );

      if (!foundUser) {
        state.user = null;
        state.error = "Utilisateur non trouvé.";
        return;
      }

      if (foundUser.password !== password) {
        state.user = null;
        state.error = "Mot de passe incorrect.";
        return;
      }

      const { password: _, ...userData } = foundUser;
      state.user = userData;
      state.error = null;
    },

    registerAction: (state, action) => {
      const { name, email, phone, type, address, password } =
        action.payload || {};

      if (!email || !password) {
        state.error = "Email et mot de passe requis.";
        state.user = null;
        return;
      }

      const newUser = {
        id: generateId(),
        name: name || "Nouvel Utilisateur",
        email,
        phone: phone || "",
        type: type || "particulier",
        address: address || "",
        password,
        profile: {
          enterprise: "",
          post: "",
          salary: 0,
          geoMobility: null,
          experience: 0,
          workType: null,
          availability: null,
          contacts: [],
          documents: {
            cv: null,
            motivation: null,
            diploma: null,
          },
        },
      };

      fakeData.users.push(newUser);
      const { password: _, ...userData } = newUser;
      state.user = userData;
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.cart = [];
      state.error = null;
    },

    setIsLoggedIn: (state, action) => {
        state.isLoggedIn = action.payload;
    },

    // ===== PANIER =====
    addToCart: (state, action) => {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },

    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((item) => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },

    clearCart: (state) => {
      state.cart = [];
    },

    // ===== GESTION DES PRODUITS/REPAS =====
    addFood: (state, action) => {
      const newFood = {
        ...action.payload,
        id: generateId(),
        userId: state.user?.id,
        createdAt: new Date().toISOString().split("T")[0],
        available: true,
      };
      state.foods.push(newFood);
      fakeData.foods.push(newFood);
    },

    updateFood: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.foods.findIndex((food) => food.id === id);
      if (index !== -1) {
        state.foods[index] = { ...state.foods[index], ...updates };
        // Mettre à jour aussi dans fakeData
        const fakeDataIndex = fakeData.foods.findIndex(
          (food) => food.id === id,
        );
        if (fakeDataIndex !== -1) {
          fakeData.foods[fakeDataIndex] = {
            ...fakeData.foods[fakeDataIndex],
            ...updates,
          };
        }
      }
    },

    deleteFood: (state, action) => {
      state.foods = state.foods.filter((food) => food.id !== action.payload);
      fakeData.foods = fakeData.foods.filter(
        (food) => food.id !== action.payload,
      );
    },

    // ===== OFFRES D'EMPLOI =====
    addJobOffer: (state, action) => {
      const newJob = {
        ...action.payload,
        id: generateId(),
        userId: state.user?.id,
        createdAt: new Date().toISOString().split("T")[0],
        status: "active",
        applications: [],
      };
      state.jobOffers.push(newJob);
      fakeData.jobOffers.push(newJob);
    },

    updateJobOffer: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.jobOffers.findIndex((job) => job.id === id);
      if (index !== -1) {
        state.jobOffers[index] = { ...state.jobOffers[index], ...updates };
      }
    },

    deleteJobOffer: (state, action) => {
      state.jobOffers = state.jobOffers.filter(
        (job) => job.id !== action.payload,
      );
      fakeData.jobOffers = fakeData.jobOffers.filter(
        (job) => job.id !== action.payload,
      );
    },

    // ===== CANDIDATURES =====
    applyToJob: (state, action) => {
      const { jobId, message, documents } = action.payload;
      const newApplication = {
        id: generateId(),
        jobId,
        userId: state.user?.id,
        status: "pending",
        message: message || "",
        appliedAt: new Date().toISOString().split("T")[0],
        documents: documents || {},
      };
      state.jobApplications.push(newApplication);
      fakeData.jobApplications.push(newApplication);

      // Ajouter la candidature à l'offre d'emploi
      const jobIndex = state.jobOffers.findIndex((job) => job.id === jobId);
      if (jobIndex !== -1) {
        state.jobOffers[jobIndex].applications.push(newApplication.id);
      }
    },

    updateApplicationStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.jobApplications.findIndex((app) => app.id === id);
      if (index !== -1) {
        state.jobApplications[index].status = status;
      }
    },

    // ===== COMMANDES =====
    createOrder: (state, action) => {
      const { items, deliveryAddress, paymentMethod } = action.payload;
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const newOrder = {
        id: generateId(),
        orderNumber: `CMD${(state.orders.length + 1).toString().padStart(3, "0")}`,
        userId: state.user?.id,
        items: items.map((item) => ({
          foodId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        total,
        status: "pending",
        deliveryAddress,
        deliveryTime: "30-45 min",
        paymentMethod,
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
      };

      state.orders.push(newOrder);
      fakeData.orders.push(newOrder);
      state.cart = []; // Vider le panier après commande

      // Générer automatiquement une facture
      const invoiceId = generateInvoiceFromOrder(state, newOrder);
      newOrder.invoiceId = invoiceId;
    },

    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.orders.findIndex((order) => order.id === id);
      if (index !== -1) {
        state.orders[index].status = status;
        if (status === "delivered") {
          state.orders[index].deliveredAt = new Date().toISOString();
        }
      }
    },

    // ===== FACTURES =====
    createInvoice: (state, action) => {
      const { clientInfo, items, notes } = action.payload;
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.2; // 20% TVA
      const total = subtotal + tax;

      const invoiceNumber = generateInvoiceNumber(state);

      const newInvoice = {
        id: generateId(),
        invoiceNumber,
        quoteId: action.payload.quoteId || null,
        orderId: action.payload.orderId || null,
        userId: state.user?.id,
        clientInfo,
        companyInfo: {
          name: "FoodApp Inc.",
          address: "123 Business Street, 75001 Paris",
          phone: "+33123456789",
          email: "contact@foodapp.com",
          siret: "12345678901234",
          rib: "FR76 1234 5678 9012 3456 7890 123",
        },
        items,
        subtotal,
        tax,
        total,
        currency: "EUR",
        status: "draft",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        notes,
        version: 1,
        isBis: false,
        pdfUrl: `/invoices/${invoiceNumber}.pdf`,
      };

      state.invoices.push(newInvoice);
      fakeData.invoices.push(newInvoice);
    },

    updateInvoiceStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.invoices.findIndex((invoice) => invoice.id === id);
      if (index !== -1) {
        state.invoices[index].status = status;
        if (status === "paid") {
          state.invoices[index].paymentDate = new Date()
            .toISOString()
            .split("T")[0];
        }
      }
    },

    // ===== DEVIS =====
    createQuote: (state, action) => {
      const { clientInfo, items, validityDays, notes } = action.payload;
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.2;
      const total = subtotal + tax;

      const quoteNumber = generateQuoteNumber(state);

      const newQuote = {
        id: generateId(),
        quoteNumber,
        userId: state.user?.id,
        clientInfo,
        items,
        subtotal,
        tax,
        total,
        currency: "EUR",
        status: "draft",
        validityDays: validityDays || 30,
        issueDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(
          Date.now() + (validityDays || 30) * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
        notes,
        convertedToInvoice: false,
        invoiceId: null,
      };

      state.quotes.push(newQuote);
      fakeData.quotes.push(newQuote);
    },

    convertQuoteToInvoice: (state, action) => {
      const { quoteId } = action.payload;
      const quoteIndex = state.quotes.findIndex((q) => q.id === quoteId);

      if (quoteIndex !== -1) {
        const quote = state.quotes[quoteIndex];
        quote.status = "validated";
        quote.convertedToInvoice = true;

        // Créer la facture à partir du devis
        const invoiceId = generateId();
        const invoiceNumber = generateInvoiceNumber(state);

        const newInvoice = {
          id: invoiceId,
          invoiceNumber,
          quoteId: quote.id,
          orderId: null,
          userId: state.user?.id,
          clientInfo: quote.clientInfo,
          companyInfo: {
            name: "FoodApp Inc.",
            address: "123 Business Street, 75001 Paris",
            phone: "+33123456789",
            email: "contact@foodapp.com",
            siret: "12345678901234",
            rib: "FR76 1234 5678 9012 3456 7890 123",
          },
          items: quote.items,
          subtotal: quote.subtotal,
          tax: quote.tax,
          total: quote.total,
          currency: quote.currency,
          status: "pending",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          notes: `Facture générée à partir du devis ${quote.quoteNumber}`,
          version: 1,
          isBis: false,
          pdfUrl: `/invoices/${invoiceNumber}.pdf`,
        };

        state.invoices.push(newInvoice);
        fakeData.invoices.push(newInvoice);
        quote.invoiceId = invoiceId;
      }
    },

    // ===== AVOIRS =====
    createCreditNote: (state, action) => {
      const { invoiceId, reason, amount, notes } = action.payload;

      const creditNumber = `AV-${new Date().getFullYear()}-${(state.creditNotes.length + 1).toString().padStart(4, "0")}`;

      const newCreditNote = {
        id: generateId(),
        creditNumber,
        invoiceId,
        userId: state.user?.id,
        reason,
        amount,
        currency: "EUR",
        status: "issued",
        issueDate: new Date().toISOString().split("T")[0],
        notes,
      };

      state.creditNotes.push(newCreditNote);
      fakeData.creditNotes.push(newCreditNote);
    },

    // ===== CLIENTS =====
    addClient: (state, action) => {
      const newClient = {
        ...action.payload,
        id: generateId(),
        userId: state.user?.id,
        createdAt: new Date().toISOString().split("T")[0],
      };

      state.clients.push(newClient);
      fakeData.clients.push(newClient);
    },

    // ===== DASHBOARD & UI =====
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

// Fonctions utilitaires
const generateInvoiceNumber = (state) => {
  const year = new Date().getFullYear();
  const sequence =
    state.invoices.filter((inv) => inv.invoiceNumber.includes(year.toString()))
      .length + 1;
  return `FA-${year}-${sequence.toString().padStart(4, "0")}`;
};

const generateQuoteNumber = (state) => {
  const year = new Date().getFullYear();
  const sequence =
    state.quotes.filter((q) => q.quoteNumber.includes(year.toString())).length +
    1;
  return `DEV-${year}-${sequence.toString().padStart(4, "0")}`;
};

const generateInvoiceFromOrder = (state, order) => {
  const invoiceNumber = generateInvoiceNumber(state);
  const invoiceId = generateId();

  const invoice = {
    id: invoiceId,
    invoiceNumber,
    orderId: order.id,
    userId: order.userId,
    clientInfo: {
      name: state.user?.name || "Client",
      email: state.user?.email || "",
      address: order.deliveryAddress,
      phone: state.user?.phone || "",
    },
    companyInfo: {
      name: "FoodApp Inc.",
      address: "123 Business Street, 75001 Paris",
      phone: "+33123456789",
      email: "contact@foodapp.com",
      siret: "12345678901234",
      rib: "FR76 1234 5678 9012 3456 7890 123",
    },
    items: order.items.map((item) => ({
      description: `${item.name} x${item.quantity}`,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    })),
    subtotal: order.total,
    tax: order.total * 0.2,
    total: order.total * 1.2,
    currency: "EUR",
    status: "pending",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: `Facture pour commande ${order.orderNumber}`,
    version: 1,
    isBis: false,
    pdfUrl: `/invoices/${invoiceNumber}.pdf`,
  };

  state.invoices.push(invoice);
  fakeData.invoices.push(invoice);
  return invoiceId;
};

// Export des actions
export const {
  loginAction,
  registerAction,
  setIsLoggedIn,
  logout,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  addFood,
  updateFood,
  deleteFood,
  addJobOffer,
  updateJobOffer,
  deleteJobOffer,
  applyToJob,
  updateApplicationStatus,
  createOrder,
  updateOrderStatus,
  createInvoice,
  updateInvoiceStatus,
  createQuote,
  convertQuoteToInvoice,
  createCreditNote,
  addClient,
  setActiveTab,
  clearError,
  setLoading,
} = appSlice.actions;

// Sélecteurs pour accéder facilement aux données
export const selectUser = (state) => state.app.user;
export const selectIsLoggedIn = (state) => state.app.isLoggedIn;
export const selectCart = (state) => state.app.cart;
export const selectCartTotal = (state) =>
  state.app.cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0,
  );
export const selectFoodsByUser = (state) =>
  state.app.foods.filter((food) => food.userId === state.app.user?.id);
export const selectJobOffersByUser = (state) =>
  state.app.jobOffers.filter((job) => job.userId === state.app.user?.id);
export const selectUserApplications = (state) =>
  state.app.jobApplications.filter((app) => app.userId === state.app.user?.id);
export const selectUserOrders = (state) =>
  state.app.orders.filter((order) => order.userId === state.app.user?.id);
export const selectUserInvoices = (state) =>
  state.app.invoices.filter((invoice) => invoice.userId === state.app.user?.id);
export const selectUserQuotes = (state) =>
  state.app.quotes.filter((quote) => quote.userId === state.app.user?.id);
export const selectUserClients = (state) =>
  state.app.clients.filter((client) => client.userId === state.app.user?.id);

export default appSlice.reducer;
