import axios from '@/api/axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentContact: null,
    contacts: [],
    loading: false,
    error: null,
    stats: null,

    contactsFilter: {
      search: "",
      page: 1,
      limit: 10,
      sortBy: "subject",
      sortOrder: "ASC"
  },

  contactsPagination: {
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
  }
}

// async thunks
export const fetchAllContacts = createAsyncThunk(
    'contacts/get',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axios.get('/contacts', { params });
            return response.data;
        } catch (error) {
            console.log("GET CONTACTS     ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
);

export const getContactById = createAsyncThunk(
    'contacts/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/contacts/${id}`);
            return response.data;
        } catch (error) {
            console.log("GET CONTACT     ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
);

export const createContact = createAsyncThunk(
    'contacts/createContact',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post('/contacts', credentials);
            return response.data;
        } catch (error) {
            console.log("CREATE CONTACTS     ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
);

export const updateContact = createAsyncThunk(
    'contacts/updateContact',
    async ({ id, contactData }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`/contacts/${id}`, contactData);
            return response.data;
        } catch (error) {
            console.log("UPDATE CONTACT     ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
);

export const deleteContactById = createAsyncThunk(
    'contacts/deleteContactById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`/contacts/${id}`);
            return response.data;
        } catch (error) {
            console.log("DELETE CONTACT     ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
);

export const contactsStats = createAsyncThunk(
  'subscriptions/contactsStats',
  async (_, { rejectWithValue }) => {
      try {
          const response = await axios.get(`/contacts/dashboard/stats`);
          return response.data;
      } catch (error) {
          console.log("GET FB STATS    ", error);
          const axiosError = error;
          return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
      }
  }
);

const feebacksSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearError: (state) => {
        state.error = null;
    },
    setPersoError: (state, action) => {
        state.error = action.payload;
    },
    setCurrentContact: (state, action) => {
        state.currentContact = action.payload.contact;
    },
    
    clearContact: (state) => {
        state.currentContact = null;
    },

    setContactsFilter: (state, action) => {
        state.contactsFilter = action.payload;
    },

    resetContactsFilter: (state) => {
        state.contactsFilter = initialState.contactsFilter;
    },

    setContactsPagination: (state, action) => {
        state.contactsPagination = action.payload;
    },

    resetContactsPagination: (state) => {
        state.contactsPagination = initialState.initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchAllContacts
      .addCase(fetchAllContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.content.data;
        state.contactsPagination = { ...action.payload.content.pagination };
        state.error = null;
      })
      .addCase(fetchAllContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getContactById
      .addCase(getContactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContactById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContact = action.payload.content;
        state.error = null;
      })
      .addCase(getContactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createContact
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally, you could push to contacts if it's an array
        state.error = null;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateContact
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update currentContact or contacts here
        state.error = null;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteContactById
      .addCase(deleteContactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContactById.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally remove from contacts if it's an array
        state.error = null;
      })
      .addCase(deleteContactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      builder
        .addCase(contactsStats.fulfilled, (state, action) => {
            state.stats = action.payload.content;
        });
  }
})

export const { 
    setContactsFilter,
    resetContactsFilter,
    setContactsPagination,
    resetContactsPagination,
    clearError,
    setPersoError,
    setCurrentContact,
    clearContact } = feebacksSlice.actions

export default feebacksSlice.reducer;

export const selectCurrentContact = (state) => state.contact.currentContact;
export const selectContacts = (state) => state.contact.contacts;
export const selectContactsFilter = (state) => state.contact.contactsFilter;
export const selectContactsPagination = (state) => state.contact.contactsPagination;
export const selectContactLoading = (state) => state.contact.loading;
export const selectContactError = (state) => state.contact.error;
export const selectContactStats = (state) => state.contact.stats;
