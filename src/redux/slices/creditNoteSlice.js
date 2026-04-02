// creditNoteSlice.js
// Slice Redux pour la gestion des avoirs (notes de crédit)
// Calqué exactement sur invoiceSlice.js — routes : /credit-notes
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/api/axios';

const initialState = {
  currentCreditNote: null,
  creditNotes: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  },
  filters: {},
  loading: false,
  error: null,
  generatedPDF: null,
  stats: null,
};

// Helper pour convertir objet en FormData (cf. invoiceSlice)
function toFormData(data) {
  const formData = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v, idx) => {
        formData.append(`${key}[${idx}]`, v);
      });
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined) {
      formData.append(key, value);
    }
  });
  return formData;
}

// ──────────────────────────────────────────────
// THUNKS
// ──────────────────────────────────────────────

// GET — liste paginée avec filtres optionnels
export const fetchCreditNotes = createAsyncThunk(
  'creditNote/fetchCreditNotes',
  async ({ page = 1, pageSize = 10, filters = {}, ...rest } = {}, { rejectWithValue }) => {
    try {
      // Construit la query string pagination + filtres
      const merged = { page, pageSize, ...filters, ...rest };
      const qs = new URLSearchParams(merged).toString();
      const response = await axios.get(`/credit-notes${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('GET CREDIT NOTES ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération des avoirs'
      );
    }
  }
);

// GET — avoir par ID
export const fetchCreditNoteById = createAsyncThunk(
  'creditNote/fetchCreditNoteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/credit-notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('GET CREDIT NOTE ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la récupération de l'avoir"
      );
    }
  }
);

// GET — avoirs de l'utilisateur connecté
export const fetchUserCreditNotes = createAsyncThunk(
  'creditNote/fetchUserCreditNotes',
  async ({ page = 1, pageSize = 10, filters = {}, ...rest } = {}, { rejectWithValue }) => {
    try {
      const merged = { page, pageSize, ...filters, ...rest };
      const qs = new URLSearchParams(merged).toString();
      const response = await axios.get(`/credit-notes/user/me${qs ? `?${qs}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('GET USER CREDIT NOTES ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération de vos avoirs'
      );
    }
  }
);

// POST — créer un avoir
export const createCreditNote = createAsyncThunk(
  'creditNote/createCreditNote',
  async (data, { rejectWithValue }) => {
    try {
      let sendData, config = {};
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        sendData = data;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        sendData = toFormData(data);
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await axios.post('/credit-notes', sendData, config);
      return response.data;
    } catch (error) {
      console.error('CREATE CREDIT NOTE ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la création de l'avoir"
      );
    }
  }
);

// PATCH — mettre à jour un avoir
export const updateCreditNoteById = createAsyncThunk(
  'creditNote/updateCreditNoteById',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      let sendData, config = {};
      if (typeof FormData !== 'undefined' && data instanceof FormData) {
        sendData = data;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        sendData = toFormData(data);
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await axios.patch(`/credit-notes/${id}`, sendData, config);
      return response.data;
    } catch (error) {
      console.error('UPDATE CREDIT NOTE ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la mise à jour de l'avoir"
      );
    }
  }
);

// PATCH — changer le statut d'un avoir
export const updateCreditNoteStatus = createAsyncThunk(
  'creditNote/updateCreditNoteStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/credit-notes/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('UPDATE CREDIT NOTE STATUS ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la mise à jour du statut'
      );
    }
  }
);

// DELETE — supprimer un avoir
export const deleteCreditNote = createAsyncThunk(
  'creditNote/deleteCreditNote',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/credit-notes/${id}`);
      return { id, ...response.data };
    } catch (error) {
      console.error('DELETE CREDIT NOTE ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la suppression de l'avoir"
      );
    }
  }
);

// POST — dupliquer un avoir
export const duplicateCreditNote = createAsyncThunk(
  'creditNote/duplicateCreditNote',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/credit-notes/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('DUPLICATE CREDIT NOTE ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la duplication de l'avoir"
      );
    }
  }
);

// POST — générer le PDF d'un avoir
export const generateCreditNotePDF = createAsyncThunk(
  'creditNote/generateCreditNotePDF',
  async ({ id, format = 'pdf' }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/credit-notes/${id}/generate?format=${format}`);
      return response.data;
    } catch (error) {
      console.error('GENERATE CREDIT NOTE PDF ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la génération de l'avoir"
      );
    }
  }
);

// POST — envoyer un avoir par email
export const sendCreditNoteByEmail = createAsyncThunk(
  'creditNote/sendCreditNoteByEmail',
  async ({ id, email, message }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/credit-notes/${id}/send`, { email, message });
      return response.data;
    } catch (error) {
      console.error('SEND CREDIT NOTE ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de l'envoi de l'avoir"
      );
    }
  }
);

// GET — statistiques avoirs
export const fetchCreditNoteStats = createAsyncThunk(
  'creditNote/fetchCreditNoteStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/credit-notes/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('FETCH CREDIT NOTE STATS ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération des statistiques'
      );
    }
  }
);

// GET — export d'un avoir
export const exportCreditNote = createAsyncThunk(
  'creditNote/exportCreditNote',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/credit-notes/${id}/export`);
      return response.data;
    } catch (error) {
      console.error('EXPORT CREDIT NOTE ERROR', error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de l'export de l'avoir"
      );
    }
  }
);

// ──────────────────────────────────────────────
// SLICE
// ──────────────────────────────────────────────
const creditNoteSlice = createSlice({
  name: 'creditNote',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPersoError: (state, action) => {
      state.error = action.payload;
    },
    setCurrentCreditNote: (state, action) => {
      state.currentCreditNote = action.payload.creditNote;
    },
    clearCreditNote: (state) => {
      state.currentCreditNote = null;
      state.generatedPDF = null;
    },
    clearCreditNotes: (state) => {
      state.creditNotes = [];
      state.pagination = {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      };
    },
    clearStats: (state) => {
      state.stats = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCreditNotesFilters: (state, action) => {
      state.filters = { ...action.payload };
    },
    resetCreditNotesFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    // fetchCreditNotes
    builder
      .addCase(fetchCreditNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreditNotes.fulfilled, (state, action) => {
        state.loading = false;
        const content = action.payload.content ?? {};
        if (content.data && Array.isArray(content.data)) {
          state.creditNotes = content.data;
        } else if (Array.isArray(content)) {
          state.creditNotes = content;
        } else if (Array.isArray(action.payload)) {
          state.creditNotes = action.payload;
        } else {
          state.creditNotes = [];
        }
        state.pagination = {
          page: content.page ?? 1,
          pageSize: content.pageSize ?? 10,
          totalCount: content.totalCount ?? (content.data ? content.data.length : 0),
          totalPages: content.totalPages ?? 0,
        };
        state.error = null;
      })
      .addCase(fetchCreditNotes.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Erreur lors de la récupération des avoirs';
      });

    // fetchCreditNoteById
    builder
      .addCase(fetchCreditNoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreditNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCreditNote = action.payload.content;
        state.error = null;
      })
      .addCase(fetchCreditNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de la récupération de l'avoir";
      });

    // fetchUserCreditNotes
    builder
      .addCase(fetchUserCreditNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCreditNotes.fulfilled, (state, action) => {
        state.loading = false;
        const content = action.payload.content ?? {};
        if (content.data && Array.isArray(content.data)) {
          state.creditNotes = content.data;
        } else if (Array.isArray(content)) {
          state.creditNotes = content;
        } else if (Array.isArray(action.payload)) {
          state.creditNotes = action.payload;
        } else {
          state.creditNotes = [];
        }
        state.pagination = {
          page: content.page ?? 1,
          pageSize: content.pageSize ?? 10,
          totalCount: content.totalCount ?? (content.data ? content.data.length : 0),
          totalPages: content.totalPages ?? 0,
        };
        state.error = null;
      })
      .addCase(fetchUserCreditNotes.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Erreur lors de la récupération de vos avoirs';
      });

    // createCreditNote
    builder
      .addCase(createCreditNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCreditNote.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCreditNote = action.payload.content;
        // Ajout en haut de la liste ou reload
        if (state.creditNotes && Array.isArray(state.creditNotes) && state.creditNotes.length > 0) {
          state.creditNotes.unshift(action.payload.content);
        }
        state.error = null;
      })
      .addCase(createCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de la création de l'avoir";
      });

    // updateCreditNoteById
    builder
      .addCase(updateCreditNoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCreditNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCreditNote = action.payload.content;
        if (
          state.creditNotes &&
          Array.isArray(state.creditNotes) &&
          state.creditNotes.length > 0
        ) {
          const idx = state.creditNotes.findIndex(
            (cn) => cn.id === action.payload.content.id
          );
          if (idx !== -1) state.creditNotes[idx] = action.payload.content;
        }
        state.error = null;
      })
      .addCase(updateCreditNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de la mise à jour de l'avoir";
      });

    // updateCreditNoteStatus
    builder
      .addCase(updateCreditNoteStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCreditNoteStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (
          state.currentCreditNote?.id === action.payload.content.id
        ) {
          state.currentCreditNote = action.payload.content;
        }
        if (
          state.creditNotes &&
          Array.isArray(state.creditNotes) &&
          state.creditNotes.length > 0
        ) {
          const idx = state.creditNotes.findIndex(
            (cn) => cn.id === action.payload.content.id
          );
          if (idx !== -1) state.creditNotes[idx] = action.payload.content;
        }
        state.error = null;
      })
      .addCase(updateCreditNoteStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Erreur lors de la mise à jour du statut';
      });

    // deleteCreditNote
    builder
      .addCase(deleteCreditNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCreditNote.fulfilled, (state, action) => {
        state.loading = false;
        if (
          state.currentCreditNote?.id === action.payload.id
        ) {
          state.currentCreditNote = null;
        }
        state.creditNotes = state.creditNotes.filter(
          (cn) => cn.id !== action.payload.id
        );
        state.error = null;
      })
      .addCase(deleteCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de la suppression de l'avoir";
      });

    // duplicateCreditNote
    builder
      .addCase(duplicateCreditNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateCreditNote.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCreditNote = action.payload.content;
        if (
          state.creditNotes &&
          Array.isArray(state.creditNotes) &&
          state.creditNotes.length > 0
        ) {
          state.creditNotes.unshift(action.payload.content);
        }
        state.error = null;
      })
      .addCase(duplicateCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de la duplication de l'avoir";
      });

    // generateCreditNotePDF
    builder
      .addCase(generateCreditNotePDF.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateCreditNotePDF.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedPDF = action.payload.content;
        if (
          state.currentCreditNote &&
          action.payload.content?.filePath
        ) {
          state.currentCreditNote.file = action.payload.content.filePath;
        }
        state.error = null;
      })
      .addCase(generateCreditNotePDF.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de la génération de l'avoir";
      });

    // sendCreditNoteByEmail
    builder
      .addCase(sendCreditNoteByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendCreditNoteByEmail.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendCreditNoteByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de l'envoi de l'avoir";
      });

    // fetchCreditNoteStats
    builder
      .addCase(fetchCreditNoteStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreditNoteStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.content;
        state.error = null;
      })
      .addCase(fetchCreditNoteStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          'Erreur lors de la récupération des statistiques';
      });

    // exportCreditNote
    builder
      .addCase(exportCreditNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportCreditNote.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(exportCreditNote.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Erreur lors de l'export de l'avoir";
      });
  },
});

// EXPORTS
export const {
  clearError,
  setPersoError,
  setCurrentCreditNote,
  clearCreditNote,
  clearCreditNotes,
  clearStats,
  setPagination,
  setCreditNotesFilters,
  resetCreditNotesFilters,
} = creditNoteSlice.actions;

export default creditNoteSlice.reducer;

// Selectors
export const selectCurrentCreditNote = (state) => state.creditNote.currentCreditNote;
export const selectCreditNotes = (state) => state.creditNote.creditNotes;
export const selectCreditNotePagination = (state) => state.creditNote.pagination;
export const selectCreditNoteFilters = (state) => state.creditNote.filters;
export const selectCreditNoteLoading = (state) => state.creditNote.loading;
export const selectCreditNoteError = (state) => state.creditNote.error;
export const selectGeneratedCreditPDF = (state) => state.creditNote.generatedPDF;
export const selectCreditNoteStats = (state) => state.creditNote.stats;