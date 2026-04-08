// quoteSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/api/axios';

const initialState = {
    currentQuote: null,
    quotes: [],
    loading: false,
    error: null,
    generatedPDF: null,
    stats: null,

    quotesFilter: {
      search: "",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC"
    },

    quotesPagination: {
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
};

// GET fetch all quotes (with filters)
export const fetchQuotes = createAsyncThunk(
  "quote/fetchQuotes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`/quotes${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      console.log("GET QUOTES ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des devis");
    }
  }
);

// GET fetch quote by ID
export const fetchQuoteById = createAsyncThunk(
  "quote/fetchQuoteById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/quotes/${id}`);
      return response.data;
    } catch (error) {
      console.log("GET QUOTE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération du devis");
    }
  }
);

// GET fetch user quotes
export const fetchUserQuotes = createAsyncThunk(
  "quote/fetchUserQuotes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`/quotes/user/me${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      console.log("GET USER QUOTES ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération de vos devis");
    }
  }
);

// POST create new quote
export const createQuote = createAsyncThunk(
  "quote/createQuote",
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

      const response = await axios.post("/quotes", sendData, config);
      return response.data;
    } catch (error) {
      console.log("CREATE QUOTE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la création du devis");
    }
  }
);

// PATCH update quote
export const updateQuoteById = createAsyncThunk(
  "quote/updateQuoteById",
  async ({ id, data }, { rejectWithValue }) => {
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

      const response = await axios.patch(`/quotes/${id}`, sendData, config);
      return response.data;
    } catch (error) {
      console.log("UPDATE QUOTE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la mise à jour du devis");
    }
  }
);

// PATCH update quote status
export const updateQuoteStatus = createAsyncThunk(
  "quote/updateQuoteStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/quotes/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.log("UPDATE QUOTE STATUS ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la mise à jour du statut");
    }
  }
);

// DELETE quote
export const deleteQuote = createAsyncThunk(
  "quote/deleteQuote",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/quotes/${id}`);
      return { id, ...response.data };
    } catch (error) {
      console.log("DELETE QUOTE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la suppression du devis");
    }
  }
);

// POST duplicate quote
export const duplicateQuote = createAsyncThunk(
  "quote/duplicateQuote",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/quotes/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.log("DUPLICATE QUOTE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la duplication du devis");
    }
  }
);

// POST generate quote PDF
export const generateQuoteFiles = createAsyncThunk(
  "quote/generateQuoteFiles",
  async ({ id, format = 'all' }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/quotes/${id}/generate?format=${format}`);
      return response.data;
    } catch (error) {
      console.log("GENERATE QUOTE PDF ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la génération du devis");
    }
  }
);

// POST send quote by email
export const sendQuoteByEmail = createAsyncThunk(
  "quote/sendQuoteByEmail",
  async ({ id, email, message }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/quotes/${id}/send`, { email, message });
      return response.data;
    } catch (error) {
      console.log("SEND QUOTE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'envoi du devis");
    }
  }
);

// GET quote stats
export const fetchQuoteStats = createAsyncThunk(
  "quote/fetchQuoteStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/quotes/dashboard/stats");
      return response.data;
    } catch (error) {
      console.log("FETCH QUOTE STATS ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des statistiques");
    }
  }
);

// GET export quote
export const exportQuote = createAsyncThunk(
  "quote/exportQuote",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/quotes/${id}/export`);
      return response.data;
    } catch (error) {
      console.log("EXPORT QUOTE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'export du devis");
    }
  }
);

// Slice
const quoteSlice = createSlice({
    name: 'quote',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setPersoError: (state, action) => {
            state.error = action.payload;
        },
        setCurrentQuote: (state, action) => {
            state.currentQuote = action.payload.quote;
        },
        clearQuote: (state) => {
            state.currentQuote = null;
            state.generatedPDF = null;
        },
        clearQuotes: (state) => {
            state.quotes = [];
        },
        clearStats: (state) => {
            state.stats = null;
        },

        setQuotesFilter: (state, action) => {
          state.quotesFilter = action.payload;
        },

        resetQuotesFilter: (state) => {
            state.quotesFilter = initialState.quotesFilter;
        },

        setQuotesPagination: (state, action) => {
            state.quotesPagination = action.payload;
        },

        resetQuotesPagination: (state) => {
            state.quotesPagination = initialState.quotesPagination;
        },
    },
    extraReducers: (builder) => {
        // fetchQuotes
        builder
        .addCase(fetchQuotes.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchQuotes.fulfilled, (state, action) => {
            state.loading = false;
            state.quotes = action.payload.content?.data || action.payload.content || [];
            state.error = null;
        })
        .addCase(fetchQuotes.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération des devis";
        });

        // fetchQuoteById
        builder
        .addCase(fetchQuoteById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchQuoteById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentQuote = action.payload.content;
            state.error = null;
        })
        .addCase(fetchQuoteById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération du devis";
        });

        // fetchUserQuotes
        builder
        .addCase(fetchUserQuotes.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUserQuotes.fulfilled, (state, action) => {
            state.loading = false;
            state.quotes = action.payload.content?.data || action.payload.content || [];
            state.error = null;
        })
        .addCase(fetchUserQuotes.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération de vos devis";
        });

        // createQuote
        builder
        .addCase(createQuote.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createQuote.fulfilled, (state, action) => {
            state.loading = false;
            state.currentQuote = action.payload.content;
            if (state.quotes.length > 0) {
                state.quotes.unshift(action.payload.content);
            }
            state.error = null;
        })
        .addCase(createQuote.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la création du devis";
        });

        // updateQuoteById
        builder
        .addCase(updateQuoteById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateQuoteById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentQuote = action.payload.content;
            // Mettre à jour dans la liste si présente
            if (state.quotes.length > 0) {
                const index = state.quotes.findIndex(quote => quote.id === action.payload.content.id);
                if (index !== -1) {
                    state.quotes[index] = action.payload.content;
                }
            }
            state.error = null;
        })
        .addCase(updateQuoteById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la mise à jour du devis";
        });

        // updateQuoteStatus
        builder
        .addCase(updateQuoteStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateQuoteStatus.fulfilled, (state, action) => {
            state.loading = false;
            if (state.currentQuote?.id === action.payload.content.id) {
                state.currentQuote = action.payload.content;
            }
            // Mettre à jour dans la liste
            if (state.quotes.length > 0) {
                const index = state.quotes.findIndex(quote => quote.id === action.payload.content.id);
                if (index !== -1) {
                    state.quotes[index] = action.payload.content;
                }
            }
            state.error = null;
        })
        .addCase(updateQuoteStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la mise à jour du statut";
        });

        // deleteQuote
        builder
        .addCase(deleteQuote.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteQuote.fulfilled, (state, action) => {
            state.loading = false;
            if (state.currentQuote?.id === action.payload.id) {
                state.currentQuote = null;
            }
            state.quotes = state.quotes.filter(quote => quote.id !== action.payload.id);
            state.error = null;
        })
        .addCase(deleteQuote.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la suppression du devis";
        });

        // duplicateQuote
        builder
        .addCase(duplicateQuote.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(duplicateQuote.fulfilled, (state, action) => {
            state.loading = false;
            state.currentQuote = action.payload.content;
            if (state.quotes.length > 0) {
                state.quotes.unshift(action.payload.content);
            }
            state.error = null;
        })
        .addCase(duplicateQuote.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la duplication du devis";
        });

        // generateQuoteFiles
        builder
        .addCase(generateQuoteFiles.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(generateQuoteFiles.fulfilled, (state, action) => {
            state.loading = false;
            state.generatedPDF = action.payload.content;
            // Mettre à jour le currentQuote avec le chemin du fichier si présent
            if (state.currentQuote && action.payload.content?.filePath) {
                state.currentQuote.file = action.payload.content.filePath;
            }
            state.error = null;
        })
        .addCase(generateQuoteFiles.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la génération du devis";
        });

        // sendQuoteByEmail
        builder
        .addCase(sendQuoteByEmail.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(sendQuoteByEmail.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
        })
        .addCase(sendQuoteByEmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de l'envoi du devis";
        });

        // fetchQuoteStats
        builder
        .addCase(fetchQuoteStats.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchQuoteStats.fulfilled, (state, action) => {
            state.loading = false;
            state.stats = action.payload.content;
            state.error = null;
        })
        .addCase(fetchQuoteStats.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération des statistiques";
        });

        // exportQuote
        builder
        .addCase(exportQuote.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(exportQuote.fulfilled, (state) => {
            state.loading = false;
            state.error = null;
        })
        .addCase(exportQuote.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de l'export du devis";
        });
    }
});

export const { 
  clearError,
  setPersoError,
  setCurrentQuote,
  clearQuote,
  clearQuotes,
  clearStats,
  setQuotesFilter,
  resetQuotesFilter,
  setQuotesPagination,
  resetQuotesPagination
} = quoteSlice.actions;

export default quoteSlice.reducer;

// Selectors
export const selectCurrentQuote = (state) => state.quote.currentQuote;
export const selectQuotes = (state) => state.quote.quotes;
export const selectQuoteLoading = (state) => state.quote.loading;
export const selectQuoteError = (state) => state.quote.error;
export const selectGeneratedQuotePDF = (state) => state.quote.generatedPDF;
export const selectQuoteStats = (state) => state.quote.stats;
export const selectQuotesFilter = (state) => state.cv.quotesFilter;
export const selectQuotesPagination = (state) => state.cv.quotesPagination;