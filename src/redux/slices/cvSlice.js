//const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/api/axios';

const initialState = {
    cvs: null,
    currentCV: null,
    loading: false,
    error: null,

    cvsFilter: {
      search: "",
      page: 1,
      limit: 10,
      type: "all",
      generated: "all",
      sortBy: "createdAt",
      sortOrder: "DESC"
    },

    cvsPagination: {
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
};

// GET fetch CVs by user
export const fetchCVsByUser = createAsyncThunk(
  "cv/fetchCVsByUser",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/cv/user/me`, { params });
      return response.data;
    } catch (error) {
      console.log("GET USER CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la recuperation des CVs");
    }
  }
);

// GET fetch CV
export const fetchCVById = createAsyncThunk(
  "cv/fetchCVById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/cv/${id}`);
      return response.data;
    } catch (error) {
      console.log("GET CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la recuperation du CV");
    }
  }
);

// POST create new CV
export const createCV = createAsyncThunk(
  "cv/createCV",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/cv", data);
      return response.data;
    } catch (error) {
      console.log("CREATE CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la création du CV");
    }
  }
);

// PATCH update CV
export const updateCVById = createAsyncThunk(
  "cv/updateCVById",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/cv/${id}`, data);
      return response.data;
    } catch (error) {
      console.log("UPDATE CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la mise a jour du CV");
    }
  }
);

export const generateCV = createAsyncThunk(
  "cv/generateCV",
  async ({ id, format = 'pdf', template = 'classic' }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/cv/${id}/generate?format=${format}&template=${template}`);
      return response.data;
    } catch (error) {
      console.log("GENERATE CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la génération du CV");
    }
  }
);

export const importCV = createAsyncThunk(
  "cv/importCV",
  async (cv, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('cv', cv);

      const response = await axios.post(`/cv/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log("IMPORT CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'import du CV");
    }
  }
);

export const downloadCv = createAsyncThunk(
  "cv/downloadCv",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/cv/${id}/download`);
      return response.data;
    } catch (error) {
      console.log("DOWNLOAD CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors du telechargement du CV");
    }
  }
);

export const deleteCV = createAsyncThunk(
  "cv/deleteCV",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/cv/${id}`);
      return response.data;
    } catch (error) {
      console.log("DELETE CV ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la suppression du CV");
    }
  }
);

// Slice
const cvSlice = createSlice({
    name: 'cv',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        setPersoError: (state, action) => {
            state.error = action.payload;
        },

        setCurrentCV: (state, action) => {
            state.currentCV = action.payload;
        },

        clearCV: (state) => {
            state.currentCV = null;
        },

        setCVsFilter: (state, action) => {
          state.cvsFilter = action.payload;
        },

        resetCVsFilter: (state) => {
            state.cvsFilter = initialState.cvsFilter;
        },

        setCVsPagination: (state, action) => {
            state.cvsPagination = action.payload;
        },

        resetCVsPagination: (state) => {
            state.cvsPagination = initialState.cvsPagination;
        },
    },
    extraReducers: (builder) => {
        // fetchCVsByUser
        builder
        .addCase(fetchCVsByUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCVsByUser.fulfilled, (state, action) => {
            state.loading = false;
            state.cvs = action.payload.content.data;
            state.error = null;
        })
        .addCase(fetchCVsByUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération des cvs";
        });

        builder
        .addCase(fetchCVById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCVById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCV = action.payload.content;
            state.error = null;
        })
        .addCase(fetchCVById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération du profil";
        });

        // createCV
        builder
        .addCase(createCV.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createCV.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCV = action.payload.content;
            // Optionally update users list or currentUser if needed
            state.error = null;
        })
        .addCase(createCV.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la modification du CV";
        });

        // updateUserById
        builder
        .addCase(updateCVById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateCVById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCV = action.payload.content;
            state.error = null;
        })
        .addCase(updateCVById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la modification de l'utilisateur";
        });

        builder
        .addCase(generateCV.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(generateCV.fulfilled, (state, action) => {
          state.loading = false;
          //state.currentCV = action.payload.content;
          state.error = null;
        })
        .addCase(generateCV.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Erreur lors de la génération du CV";
        });

        builder
        .addCase(importCV.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(importCV.fulfilled, (state, action) => {
          state.loading = false;
          state.currentCV = action.payload.content;
          state.error = null;
        })
        .addCase(importCV.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Erreur lors de l'import du CV";
        });

        builder
        .addCase(downloadCv.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(downloadCv.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
        })
        .addCase(downloadCv.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Erreur lors du telechargement du CV";
        });

        builder
        .addCase(deleteCV.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteCV.fulfilled, (state, action) => {
          state.loading = false;
          state.currentCV = null;
          state.error = null;
        })
        .addCase(deleteCV.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Erreur lors de la suppression du CV";
        });
    }
});

export const { 
  clearError,
  setPersoError,
  setCurrentCV,
  clearCV,
  setCVsFilter,
  resetCVsFilter,
  setCVsPagination,
  resetCVsPagination } = cvSlice.actions;

export default cvSlice.reducer;

export const selectCurrentCV = (state) => state.cv.currentCV;
export const selectCVs = (state) => state.cv.cvs;
export const selectCVsFilter = (state) => state.cv.cvsFilter;
export const selectCVsPagination = (state) => state.cv.cvsPagination;
export const selectCVLoading = (state) => state.cv.loading;
export const selectCVError = (state) => state.cv.error;
// export const selectUserStats = (state) => state.cv.stats;
// export const selectUserActivity = (state) => state.cv.activity;
