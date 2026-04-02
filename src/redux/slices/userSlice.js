// const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/api/axios';

const initialState = {
    users: [],
    currentUser: null,
    currentSubscription: null,
    subscriptions: [],
    suggestions: [],
    isEmailExists: false,
    loading: false,
    error: null,
    stats: null,
    activity: null,

    usersFilter: {
        search: "",
        page: 1,
        limit: 10,
        role: "",
        status: "",
        sortBy: "fullname",
        sortOrder: "ASC"
    },

    usersPagination: {
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    }
};


// GET all users (admin only)
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAllUsers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users", { params });
      return response.data;
    } catch (error) {
      console.log("FETCH ALL USERS ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des utilisateurs");
    }
  }
);

// GET user by id (admin only)
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.log("FETCH USER BY ID ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération de l'utilisateur");
    }
  }
);

// GET current user profile (auth)
export const fetchCurrentUser = createAsyncThunk(
  "users/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users/current/me");
      return response.data;
    } catch (error) {
      console.log("FETCH CURRENT USER ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération du profil");
    }
  }
);

// PATCH user by id (admin only)
export const updateUserById = createAsyncThunk(
  "users/updateUserById",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.log("UPDATE USER BY ID ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la modification de l'utilisateur");
    }
  }
);

// PATCH current user profile (auth)
export const updateCurrentUserProfile = createAsyncThunk(
  "users/updateCurrentUserProfile",
  async (data, { rejectWithValue }) => {
    try {    
      const response = await axios.patch("/users/current/update-profile/", data);
      console.log("UPDATE RESPONSE", response);
      // const response2 = await axios.patch("/users/current/update-user-informations/", data);
      // console.log("UPDATE RESPONSE 2", response);
      return response.data;
    } catch (error) {
      console.log("UPDATE CURRENT USER PROFILE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la modification du profil");
    }
  }
);

// PATCH current user informations (auth)
export const updateCurrentUserInformations = createAsyncThunk(
  "users/updateCurrentUserInformations",
  async (data, { rejectWithValue }) => {
    try {    
      const response = await axios.patch("/users/current/update-user-informations/", data);
      console.log("UPDATE RESPONSE", response);
      return response.data;
    } catch (error) {
      console.log("UPDATE CURRENT USER INFORMATIONS ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la modification des informations du profil");
    }
  }
);

// PATCH current user password (auth)
export const changeCurrentUserPassword = createAsyncThunk(
  "users/changeCurrentUserPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.patch("/users/current/change-password", data);
      return response.data;
    } catch (error) {
      console.log("CHANGE CURRENT USER PASSWORD ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors du changement de mot de passe");
    }
  }
);

// DELETE user by id (admin only)
export const deleteUserById = createAsyncThunk(
  "users/deleteUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.log("DELETE USER BY ID ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la suppression de l'utilisateur");
    }
  }
);

// DELETE current user profile (auth)
export const deleteCurrentUserProfile = createAsyncThunk(
  "users/deleteCurrentUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete("/users/current/delete-profile");
      return response.data;
    } catch (error) {
      console.log("DELETE CURRENT USER PROFILE ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la suppression du profil");
    }
  }
);

// POST create new user (admin only)
export const createUser = createAsyncThunk(
  "users/createUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/users", data);
      return response.data;
    } catch (error) {
      console.log("CREATE USER ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la création de l'admin");
    }
  }
);

// GET all subscriptions for current user (auth)
export const fetchAllUserSubscriptions = createAsyncThunk(
  "users/fetchAllUserSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users/current/get-all-subscriptions");
      return response.data;
    } catch (error) {
      console.log("FETCH ALL USER SUBSCRIPTIONS ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des abonnements");
    }
  }
);

// GET active subscription for current user (auth)
export const fetchActiveUserSubscription = createAsyncThunk(
  "users/fetchActiveUserSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/users/current/get-active-subscription");
      return response.data;
    } catch (error) {
      console.log("FETCH ACTIVE USER SUBSCRIPTION ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération de l'abonnement actif");
    }
  }
);

// POST set subscription for current user (auth)
export const setUserSubscription = createAsyncThunk(
  "users/setUserSubscription",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post("/users/current/set-subscription", data);
      return response.data;
    } catch (error) {
      console.log("SET USER SUBSCRIPTION ERROR", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la souscription");
    }
  }
);

// POST changer le status d'un utilisateur (admin)
export const changeStatus = createAsyncThunk(
    "users/changeStatus",
    async ({ userId, status }, { rejectWithValue }) => {
      try {
        const response = await axios.patch(`/users/${userId}/change-status`, { status });
        return response.data;
      } catch (error) {
        console.log("CHANGE STATUS ERROR", error);
        return rejectWithValue(error.response?.data?.message || "Erreur lors de la modification du status");
      }
    }
);

// POST changer le role d'un utilisateur (admin)
export const changeRole = createAsyncThunk(
    "users/changeRole",
    async ({ userId, role }, { rejectWithValue }) => {
      try {
        const response = await axios.patch(`/users/${userId}/change-role`, { role });
        return response.data;
      } catch (error) {
        console.log("CHANGE ROLE ERROR", error);
        return rejectWithValue(error.response?.data?.message || "Erreur lors de la modification du role");
      }
    }
);

// GET EMAILS SUGGESTIONS
export const fetchSuggestionsThunk = createAsyncThunk(
  "users/fetchSuggestionsThunk",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/suggestions/search?query=${encodeURIComponent(query)}&limit=3`);
      return response.data;
    } catch (error) {
      console.log("FETCH USER SUGGESTIONS /search/", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des suggestions");
    }
  }
);

// VERIFY EMAIL EXISTS
export const verifyEmailExists = createAsyncThunk(
  "users/verifyEmailExists",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/suggestions/verify-email?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.log("FETCH USER EMAIL VERIFICATION", error);
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la récupération des suggestions");
    }
  }
);

// GET USERS STATS
export const usersStats = createAsyncThunk(
    'users/usersStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/users/dashboard/stats`);
            return response.data;
        } catch (error) {
            console.log("GET USERS STATS    ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
  );

export const usersActivities = createAsyncThunk(
    'subscriptions/usersActivities',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/users/dashboard/activity`);
            return response.data;
        } catch (error) {
            console.log("GET USERS ACTIVITIES    ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
  );

// Slice
const usersSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        setPersoError: (state, action) => {
            state.error = action.payload;
        },

        setCurrentUser: (state, action) => {
            state.currentUser = action.payload.user;
        },

        setCurrentSubscription: (state, action) => {
            state.currentSubscription = action.payload.subscription;
        },
        
        setUsersFilter: (state, action) => {
            state.usersFilter = action.payload;
        },

        resetUsersFilter: (state) => {
            state.usersFilter = initialState.usersFilter;
        },

        setUsersPagination: (state, action) => {
            state.usersPagination = action.payload;
        },

        resetUsersPagination: (state) => {
            state.usersPagination = initialState.initialState;
        },

        clearUser: (state) => {
            state.currentUser = null;
        },

        clearSuggestions: (state) => {
            state.suggestions = [];
        },

        clearSubscription: (state) => {
            state.currentSubscription = null;
        }
    },
    extraReducers: (builder) => {
        // fetchAllUserSubscriptions
        builder
        .addCase(fetchAllUserSubscriptions.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAllUserSubscriptions.fulfilled, (state, action) => {
            state.loading = false;
            state.subscriptions = action.payload.content;
            state.error = null;
        })
        .addCase(fetchAllUserSubscriptions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération des abonnements";
        });

        // fetchActiveUserSubscription
        builder
        .addCase(fetchActiveUserSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchActiveUserSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.currentSubscription = action.payload.content;
            state.error = null;
        })
        .addCase(fetchActiveUserSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération de l'abonnement actif";
        });

        // setUserSubscription
        builder
        .addCase(setUserSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(setUserSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.activeSubscription = action.payload.content;
            state.error = null;
        })
        .addCase(setUserSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la souscription";
        });

        // fetchAllUsers
        builder
        .addCase(fetchAllUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAllUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload.content.data;
            state.usersPagination = { ...action.payload.content.pagination };
            state.error = null;
        })
        .addCase(fetchAllUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération des utilisateurs";
        });

        // fetchUserById
        builder
        .addCase(fetchUserById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUserById.fulfilled, (state, action) => {
            state.loading = false;
            state.currentUser = action.payload.content;
            state.error = null;
        })
        .addCase(fetchUserById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération de l'utilisateur";
        });

        // fetchCurrentUser
        builder
        .addCase(fetchCurrentUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.loading = false;
            state.currentUser = action.payload.content;
            state.error = null;
        })
        .addCase(fetchCurrentUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la récupération du profil";
        });

        // updateUserById
        builder
        .addCase(updateUserById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateUserById.fulfilled, (state, action) => {
            state.loading = false;
            // Optionally update users list or currentUser if needed
            state.error = null;
        })
        .addCase(updateUserById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la modification de l'utilisateur";
        });

        // updateCurrentUserProfile
        builder
        .addCase(updateCurrentUserProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateCurrentUserProfile.fulfilled, (state, action) => {
            state.loading = false;
            const currentCnt = state.currentUser;
            const newCnt = action.payload.content;
            state.currentUser = {
                ...currentCnt,
                ...newCnt
            };
            state.error = null;
        })
        .addCase(updateCurrentUserProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la modification du profil";
        });

        // updateCurrentUserInformations
        builder
        .addCase(updateCurrentUserInformations.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateCurrentUserInformations.fulfilled, (state, action) => {
            state.loading = false;
            const currentCnt = state.currentUser?.informations;
            const newCnt = action.payload.content;
            state.currentUser.informations = {
                ...currentCnt,
                ...newCnt
            };
            state.error = null;
        })
        .addCase(updateCurrentUserInformations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la modification des informations du profil";
        });

        // changeCurrentUserPassword
        builder
        .addCase(changeCurrentUserPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(changeCurrentUserPassword.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
        })
        .addCase(changeCurrentUserPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors du changement de mot de passe";
        });

        // deleteUserById
        builder
        .addCase(deleteUserById.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteUserById.fulfilled, (state, action) => {
            state.loading = false;
            // Optionally remove user from users list
            state.error = null;
        })
        .addCase(deleteUserById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la suppression de l'utilisateur";
        });

        // deleteCurrentUserProfile
        builder
        .addCase(deleteCurrentUserProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteCurrentUserProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.currentUser = null;
            state.error = null;
        })
        .addCase(deleteCurrentUserProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la suppression du profil";
        });

        // createUser
        builder
        .addCase(createUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createUser.fulfilled, (state, action) => {
            state.loading = false;
            // Optionally add new admin to users list
            state.error = null;
        })
        .addCase(createUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la création de l'utilisateur";
        });

        // fetchSuggestionsThunk
        builder
        .addCase(fetchSuggestionsThunk.pending, (state) => {
            state.loading = true;
            state.suggestions = [];
            state.error = null;
        })
        .addCase(fetchSuggestionsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.suggestions = action.payload.content.users;
            state.error = null;
        })
        .addCase(fetchSuggestionsThunk.rejected, (state, action) => {
            state.loading = false;
            state.suggestions = [];
            state.error = action.payload || "Erreur lors de la recuperation des suggestions";
        });

        // verifyEmailExists
        builder
        .addCase(verifyEmailExists.pending, (state) => {
            state.loading = true;
            state.isEmailExists = false;
            state.error = null;
        })
        .addCase(verifyEmailExists.fulfilled, (state, action) => {
            state.loading = false;
            state.isEmailExists = action.payload.content.exists;
            state.error = null;
        })
        .addCase(verifyEmailExists.rejected, (state, action) => {
            state.loading = false;
            state.isEmailExists = false;
            state.error = action.payload || "Erreur lors de la verification de l'existence de l'email";
        });

        // changeStatus
        builder
        .addCase(changeStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(changeStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            // Optionally update user status in users list
            const updatedUser = action.payload?.content;
            if (updatedUser && state.users) {
                state.users = state.users.map(user =>
                    user.id === updatedUser.id ? { ...user, status: updatedUser.status } : user
                );
            }
        })
        .addCase(changeStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la modification du status";
        });

        // changeRole
        builder
        .addCase(changeRole.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(changeRole.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            // Optionally update user role in users list
            const updatedUser = action.payload?.content;
            if (updatedUser && state.users) {
                state.users = state.users.map(user =>
                    user.id === updatedUser.id ? { ...user, role: updatedUser.role } : user
                );
            }
        })
        .addCase(changeRole.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Erreur lors de la modification du role";
        });

        builder
        .addCase(usersStats.fulfilled, (state, action) => {
            state.stats = action.payload.content;
        });

        builder
        .addCase(usersActivities.fulfilled, (state, action) => {
            state.activity = action.payload.content;
        });
    }
});

export const { 
    clearError,
    setPersoError,
    setCurrentUser,
    setCurrentSubscription,
    setUsersFilter,
    resetUsersFilter,
    setUsersPagination,
    resetUsersPagination,
    clearUser,
    clearSuggestions,
    clearSubscription } = usersSlice.actions;

export default usersSlice.reducer;

export const selectUsers = (state) => state.user.users;
export const selectSuggestions = (state) => state.user.suggestions;
export const selectUsersFilter = (state) => state.user.usersFilter;
export const selectUsersPagination = (state) => state.user.usersPagination;
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserSubscription = (state) => state.user.subscriptions;
export const selectUserCurrentSubscription = (state) => state.user.currentSubscription;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectUserStats = (state) => state.user.stats;
export const selectUserActivity = (state) => state.user.activity;
