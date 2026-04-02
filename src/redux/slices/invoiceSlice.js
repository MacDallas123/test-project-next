// invoiceSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/api/axios';

const initialState = {
    currentInvoice: null,
    invoices: [],
    loading: false,
    error: null,
    generatedPDF: null,
    stats: null,

    invoicesFilter: {
      search: "",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC"
    },

    invoicesPagination: {
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
};

// GET fetch all invoices (with filters)
export const fetchInvoices = createAsyncThunk(
  "invoice/fetchInvoices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`/invoices${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      console.log("GET INVOICES ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des factures");
    }
  }
);

// GET fetch invoice by ID
export const fetchInvoiceById = createAsyncThunk(
  "invoice/fetchInvoiceById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.log("GET INVOICE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération de la facture");
    }
  }
);

// GET fetch user invoices
export const fetchUserInvoices = createAsyncThunk(
  "invoice/fetchUserInvoices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`/invoices/user/me${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      console.log("GET USER INVOICES ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération de vos factures");
    }
  }
);

// POST create new invoice
export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async (data, { rejectWithValue }) => {
    try {
      let sendData = data;
      let config = {};

      // If already a FormData instance, use directly
      if (typeof FormData !== "undefined" && data instanceof FormData) {
        sendData = data;
        config.headers = { "Content-Type": "multipart/form-data" };
      } else {
        // If data is a plain object, convert to FormData
        const formData = new FormData();
        Object.entries(data || {}).forEach(([key, value]) => {
          if (
            typeof value === "object" &&
            value &&
            (value instanceof File || value instanceof Blob)
          ) {
            formData.append(key, value);
          } else if (
            typeof value === "object" &&
            value !== null
          ) {
            // For objects (except File/Blob), serialize as JSON
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined) {
            formData.append(key, value);
          }
        });
        sendData = formData;
        config.headers = { "Content-Type": "multipart/form-data" };
      }

      const response = await axios.post("/invoices", sendData, config);
      return response.data;
    } catch (error) {
      console.log("CREATE INVOICE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la création de la facture");
    }
  }
);

// PATCH update invoice
export const updateInvoiceById = createAsyncThunk(
  "invoice/updateInvoiceById",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Send data via FormData, including handling of file fields if present
      let sendData = data;
      let config = {};

      // If already a FormData instance, use directly
      if (typeof FormData !== "undefined" && data instanceof FormData) {
        sendData = data;
        config.headers = { "Content-Type": "multipart/form-data" };
      } else {
        // If data is a plain object, convert to FormData
        const formData = new FormData();
        Object.entries(data || {}).forEach(([key, value]) => {
          // If value is an object and is a File, append as is
          if (
            typeof value === "object" &&
            value &&
            (value instanceof File || value instanceof Blob)
          ) {
            formData.append(key, value);
          } else if (
            typeof value === "object" &&
            value !== null
          ) {
            // For objects (except File/Blob), serialize as JSON
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined) {
            formData.append(key, value);
          }
        });
        sendData = formData;
        config.headers = { "Content-Type": "multipart/form-data" };
      }

      const response = await axios.patch(`/invoices/${id}`, sendData, config);
      return response.data;
    } catch (error) {
      console.log("UPDATE INVOICE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la mise à jour de la facture");
    }
  }
);

// PATCH update invoice status
export const updateInvoiceStatus = createAsyncThunk(
  "invoice/updateInvoiceStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/invoices/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.log("UPDATE INVOICE STATUS ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la mise à jour du statut");
    }
  }
);

// DELETE invoice
export const deleteInvoice = createAsyncThunk(
  "invoice/deleteInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/invoices/${id}`);
      return { id, ...response.data };
    } catch (error) {
      console.log("DELETE INVOICE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la suppression de la facture");
    }
  }
);

// POST duplicate invoice
export const duplicateInvoice = createAsyncThunk(
  "invoice/duplicateInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/invoices/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.log("DUPLICATE INVOICE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la duplication de la facture");
    }
  }
);

// POST generate invoice PDF
export const generateInvoicePDF = createAsyncThunk(
  "invoice/generateInvoicePDF",
  async ({ id, format = 'pdf' }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/invoices/${id}/generate?format=${format}`);
      return response.data;
    } catch (error) {
      console.log("GENERATE INVOICE PDF ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la génération de la facture");
    }
  }
);

// POST send invoice by email
export const sendInvoiceByEmail = createAsyncThunk(
  "invoice/sendInvoiceByEmail",
  async ({ id, email, message }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/invoices/${id}/send`, { email, message });
      return response.data;
    } catch (error) {
      console.log("SEND INVOICE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'envoi de la facture");
    }
  }
);

// GET invoice stats
export const fetchInvoiceStats = createAsyncThunk(
  "invoice/fetchInvoiceStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/invoices/dashboard/stats");
      return response.data;
    } catch (error) {
      console.log("FETCH INVOICE STATS ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des statistiques");
    }
  }
);

// GET export invoice
export const exportInvoice = createAsyncThunk(
  "invoice/exportInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/invoices/${id}/export`);
      return response.data;
    } catch (error) {
      console.log("EXPORT INVOICE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'export de la facture");
    }
  }
);

// Slice
const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setPersoError: (state, action) => {
            state.error = action.payload;
        },
        setCurrentInvoice: (state, action) => {
            state.currentInvoice = action.payload.invoice;
        },
        clearInvoice: (state) => {
            state.currentInvoice = null;
            state.generatedPDF = null;
        },
        clearInvoices: (state) => {
            state.invoices = [];
        },
        clearStats: (state) => {
            state.stats = null;
        },

        setInvoicesFilter: (state, action) => {
          state.quotesFilter = action.payload;
        },

        resetInvoicesFilter: (state) => {
            state.quotesFilter = initialState.quotesFilter;
        },

        setInvoicesPagination: (state, action) => {
            state.quotesPagination = action.payload;
        },

        resetInvoicesPagination: (state) => {
            state.quotesPagination = initialState.quotesPagination;
        },
    },
    extraReducers: (builder) => {
        // fetchInvoices
        builder
        .addCase(fetchInvoices.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchInvoices.fulfilled, (state, action) => {
            state.loading = false;
            state.invoices = action.payload.content?.data || action.payload.content || [];
            state.error = null;
        })
        .addCase(fetchInvoices.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération des factures";
        });

        // fetchInvoiceById
        builder
        .addCase(fetchInvoiceById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchInvoiceById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentInvoice = action.payload.content;
            state.error = null;
        })
        .addCase(fetchInvoiceById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération de la facture";
        });

        // fetchUserInvoices
        builder
        .addCase(fetchUserInvoices.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUserInvoices.fulfilled, (state, action) => {
            state.loading = false;
            state.invoices = action.payload.content?.data || action.payload.content || [];
            state.error = null;
        })
        .addCase(fetchUserInvoices.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération de vos factures";
        });

        // createInvoice
        builder
        .addCase(createInvoice.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createInvoice.fulfilled, (state, action) => {
            state.loading = false;
            state.currentInvoice = action.payload.content;
            if (state.invoices.length > 0) {
                state.invoices.unshift(action.payload.content);
            }
            state.error = null;
        })
        .addCase(createInvoice.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la création de la facture";
        });

        // updateInvoiceById
        builder
        .addCase(updateInvoiceById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateInvoiceById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentInvoice = action.payload.content;
            // Mettre à jour dans la liste si présente
            if (state.invoices.length > 0) {
                const index = state.invoices.findIndex(inv => inv.id === action.payload.content.id);
                if (index !== -1) {
                    state.invoices[index] = action.payload.content;
                }
            }
            state.error = null;
        })
        .addCase(updateInvoiceById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la mise à jour de la facture";
        });

        // updateInvoiceStatus
        builder
        .addCase(updateInvoiceStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
            state.loading = false;
            if (state.currentInvoice?.id === action.payload.content.id) {
                state.currentInvoice = action.payload.content;
            }
            // Mettre à jour dans la liste
            if (state.invoices.length > 0) {
                const index = state.invoices.findIndex(inv => inv.id === action.payload.content.id);
                if (index !== -1) {
                    state.invoices[index] = action.payload.content;
                }
            }
            state.error = null;
        })
        .addCase(updateInvoiceStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la mise à jour du statut";
        });

        // deleteInvoice
        builder
        .addCase(deleteInvoice.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteInvoice.fulfilled, (state, action) => {
            state.loading = false;
            if (state.currentInvoice?.id === action.payload.id) {
                state.currentInvoice = null;
            }
            state.invoices = state.invoices.filter(inv => inv.id !== action.payload.id);
            state.error = null;
        })
        .addCase(deleteInvoice.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la suppression de la facture";
        });

        // duplicateInvoice
        builder
        .addCase(duplicateInvoice.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(duplicateInvoice.fulfilled, (state, action) => {
            state.loading = false;
            state.currentInvoice = action.payload.content;
            if (state.invoices.length > 0) {
                state.invoices.unshift(action.payload.content);
            }
            state.error = null;
        })
        .addCase(duplicateInvoice.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la duplication de la facture";
        });

        // generateInvoicePDF
        builder
        .addCase(generateInvoicePDF.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(generateInvoicePDF.fulfilled, (state, action) => {
            state.loading = false;
            state.generatedPDF = action.payload.content;
            // Mettre à jour le currentInvoice avec le chemin du fichier si présent
            if (state.currentInvoice && action.payload.content?.filePath) {
                state.currentInvoice.file = action.payload.content.filePath;
            }
            state.error = null;
        })
        .addCase(generateInvoicePDF.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la génération de la facture";
        });

        // sendInvoiceByEmail
        builder
        .addCase(sendInvoiceByEmail.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(sendInvoiceByEmail.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
        })
        .addCase(sendInvoiceByEmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de l'envoi de la facture";
        });

        // fetchInvoiceStats
        builder
        .addCase(fetchInvoiceStats.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchInvoiceStats.fulfilled, (state, action) => {
            state.loading = false;
            state.stats = action.payload.content;
            state.error = null;
        })
        .addCase(fetchInvoiceStats.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération des statistiques";
        });

        // exportInvoice
        builder
        .addCase(exportInvoice.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(exportInvoice.fulfilled, (state) => {
            state.loading = false;
            state.error = null;
        })
        .addCase(exportInvoice.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de l'export de la facture";
        });
    }
});

export const { 
  clearError,
  setPersoError,
  setCurrentInvoice,
  clearInvoice,
  clearInvoices,
  clearStats,
  setInvoicesFilter,
  resetInvoicesFilter,
  setInvoicesPagination,
  resetInvoicesPagination
} = invoiceSlice.actions;

export default invoiceSlice.reducer;

// Selectors
export const selectCurrentInvoice = (state) => state.invoice.currentInvoice;
export const selectInvoices = (state) => state.invoice.invoices;
export const selectInvoiceLoading = (state) => state.invoice.loading;
export const selectInvoiceError = (state) => state.invoice.error;
export const selectGeneratedPDF = (state) => state.invoice.generatedPDF;
export const selectInvoiceStats = (state) => state.invoice.stats;
export const selectInvoicesFilter = (state) => state.cv.invoicesFilter;
export const selectInvoicesPagination = (state) => state.cv.invoicesPagination;