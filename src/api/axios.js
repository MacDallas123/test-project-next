import axios from "axios";

// export const API_URL = "http://localhost:5005/api/v1";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api/v1";
// export const API_URL = "https://api.livrernourriture-fibem.com/api/v1";

//console.log("process.env : ", process.env);
//export const UPLOADED_FILES_URL = `${API_URL}/uploads`;
export const UPLOADED_FILES_URL = `${API_URL}`;

// Créer l'instance axios de base
const axiosInstance = axios.create({
  baseURL: API_URL
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

const refreshRoute = "/auth/refresh";

// Intercepteur de réponse
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà en train de rafraîchir
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith(refreshRoute)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Mettre la requête en file d'attente jusqu'au rafraîchissement du token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Attacher le nouveau token et réessayer
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      // Récupérer le refresh token du stockage
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        isRefreshing = false;
        // Rediriger vers la page de login ou gérer la déconnexion
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(error);
      }

      try {
        // Appeler l'endpoint de rafraîchissement
        const res = await axiosInstance.post(refreshRoute, { 
          refreshToken: refreshToken
        });
        
        const newAccessToken = res.data.content.accessToken;
        const newRefreshToken = res.data.content.refreshToken;

        // Stocker les nouveaux tokens
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Traiter la file d'attente avec le nouveau token
        processQueue(null, newAccessToken);

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = "Bearer " + newAccessToken;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // En cas d'erreur de rafraîchissement, déconnecter l'utilisateur
        console.log("REFRESHING ERROR     ", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Pour les autres erreurs, rejeter normalement
    return Promise.reject(error);
  }
);

// Intercepteur de requête pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
  config => {
    // Récupérer le token du localStorage OU des cookies
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    } else {
      // Si pas de token, supprimer l'en-tête Authorization pour éviter d'envoyer "Bearer null"
      delete config.headers.Authorization;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;