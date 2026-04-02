import axios from '@/api/axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    tmpData: null,
    isLoggedIn: false,
    loading: false,
    error: null,
}

// async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post('/auth/login', credentials);
            // localStorage.setItem("accessToken", response.data.content.accessToken);
            // localStorage.setItem("refreshToken", response.data.content.refreshToken);
            return response.data;
        } catch (error) {
            console.log("LOGIN ERROR     ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de connexion au serveur');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/auth/register', userData);
            //return { status: response.status, data: response.data };
            return response.data;
        } catch (error) {
            console.log("REGITER ERROR     ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur d\'inscription au serveur');
        }
    }
);

export const activateAccount = createAsyncThunk(
  'auth/activateAccount',
  async ({ email, code }, { rejectWithValue }) => {
      try {
          const response = await axios.post('/auth/activate-account', { email, code });
          return response.data;
      } catch (error) {
          console.log("ACTIVATE ACCOUNT ERROR     ", error);
          const axiosError = error;
          return rejectWithValue(axiosError.response?.data?.message || 'Erreur d\'inscription au serveur');
      }
  }
);

export const sendResetCode = createAsyncThunk(
    'auth/sendResetCode',
    async (email, { rejectWithValue }) => {
        try {
            await axios.post('/auth/send-reset-code', { email });
            return { success: true };
        } catch (error) {
            console.log("SEND RESET CODE ERROR ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur d\'envoi du code au serveur');
        }
    }
);

export const verifyCode = createAsyncThunk(
    'auth/verifyCode',
    async (verificationData, { rejectWithValue }) => {
        try {
        const response = await axios.post('/auth/verify-code', verificationData);
        return response.data;
        } catch (error) {
            console.log("VERIFY CODE ERROR ", error);
            const axiosError = error;
            //return rejectWithValue(axiosError.response?.data?.message || 'Erreur de vérification du code au serveur');
            return rejectWithValue(axiosError.response?.data?.message || 'Code de réinitialisation incorrect');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (resetData, { rejectWithValue }) => {
        try {
            const { confirmNewPassword, ...data } = resetData;
            
            if(confirmNewPassword !== data.newPassword) {
              return rejectWithValue("Les mots de passes ne correspondent pas");
            }

            await axios.post('/auth/reset-password', data);
            return { success: true };
        } catch (error) {
            console.log("RESET PASSWORD ERROR ", error);
            const axiosError = error;
            return rejectWithValue(axiosError.response?.data?.message || 'Erreur de réinitialisation au serveur');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (refreshToken, { rejectWithValue }) => {
        try {
        await axios.post('/auth/logout', { refreshToken });
        return { success: true };
        } catch (error) {
        const axiosError = error;
        return rejectWithValue(axiosError.response?.data?.message || 'Erreur de déconnexion au serveur');
        }
    }
);

export const logoutUserAll = createAsyncThunk(
  'auth/logoutAll',
  async (userId, { rejectWithValue }) => {
      try {
      await axios.post('/auth/logout-all', { userId });
      return { success: true };
      } catch (error) {
      const axiosError = error;
      return rejectWithValue(axiosError.response?.data?.message || 'Erreur de déconnexion au serveur');
      }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
        state.error = null;
    },
    setPersoError: (state, action) => {
        state.error = action.payload;
    },
    setUser: (state, action) => {
        state.user = action.payload.user;
    },
    
    clearUser: (state) => {
        state.user = null;
        state.isLoggedIn = false;
    },
    
    resetAuthState: () => {
        return { ...initialState };
    },
  },

  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        console.log("PAYLOAD", action.payload);
        try {
          const payloadContent = action.payload.content;
          if(action.payload.content.user.status !== "INACTIVE") {
            localStorage.setItem("accessToken", payloadContent.accessToken);
            localStorage.setItem("refreshToken", payloadContent.refreshToken);
            state.user = payloadContent.user;
          } else {
            state.tmpData = {
              access: payloadContent.accessToken,
              refreshToken: payloadContent.refreshToken,
              user: payloadContent.user
            };
          }
        } catch (err) {
          console.log("ERROR DURING PROCESS ", err);
        }
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        console.log("PAYLOAD ", action.payload);
        state.error = action.payload || 'Erreur de connexion';
        state.isLoggedIn = false;
      });
      
    builder
      .addCase(activateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateAccount.fulfilled, (state, action) => {
        state.loading = false;
        // Possibly, the user is now fully activated, so update tmpData/user if needed
        if (state.tmpData && state.tmpData.user && state.tmpData.user.status === "INACTIVE") {
          // The account was inactive but should now be activated, move user to state.user and set isLoggedIn to true
          state.user = { ...state.tmpData.user, status: "ACTIVE" };
          state.isLoggedIn = true;
          
          localStorage.setItem("accessToken", state.tmpData.access);
          localStorage.setItem("refreshToken", state.tmpData.refresh);

          state.tmpData = null;
        }
        state.error = null;
      })
      .addCase(activateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Erreur lors de l'activation du compte";
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors de l\'inscription';
        state.isLoggedIn = false;
      });

    // sendResetCode
    builder
      .addCase(sendResetCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetCodeSent = false;
      })
      .addCase(sendResetCode.fulfilled, (state, action) => {
        state.loading = false;
        state.resetCodeSent = true;
        state.error = null;
      })
      .addCase(sendResetCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur lors de l\'envoi du code';
        state.resetCodeSent = false;
      });

    // verifyCode
    builder
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.codeVerified = false;
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.loading = false;
        state.codeVerified = true;
        state.error = null;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Code invalide ou expiré';
        state.codeVerified = false;
      });

    // resetPassword
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordReset = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordReset = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur de réinitialisation du mot de passe';
        state.passwordReset = false;
      });

    // logoutUser
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur de déconnexion';
      });

    // logoutAll
    builder
      .addCase(logoutUserAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUserAll.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(logoutUserAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Erreur de déconnexion de tous les appareils';
      });
  }
})

export const { 
    clearError,
    setPersoError,
    setUser,
    clearUser,
    resetAuthState } = authSlice.actions

export default authSlice.reducer;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthIsLoggedIn = (state) => state.auth.isLoggedIn;