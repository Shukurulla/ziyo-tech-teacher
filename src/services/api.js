import axios from "axios";

// Base URL sozlash
const API_BASE_URL = "https://server.ziyo-tech.uz";

// Axios instance yaratish
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for large file uploads
});

// Request interceptor - har bir so'rovga token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ziyo-jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Basic headers
    config.headers["Accept"] = "application/json";

    // Content-Type ni faqat JSON uchun o'rnatish
    // FormData uchun Content-Type avtomatik o'rnatiladi
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - xatoliklarni boshqarish
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Error:", error);

    // Network xatolari
    if (error.code === "ERR_NETWORK") {
      console.error("Network Error");
      error.message = "Tarmoq xatosi. Server bilan aloqa o'rnatilmadi.";
    }

    // Timeout xatolari
    if (error.code === "ECONNABORTED") {
      error.message = "So'rov vaqti tugadi. Qaytadan urinib ko'ring.";
    }

    // Token xatolari
    if (error.response?.status === 401) {
      console.warn("Unauthorized - Token invalid or expired");
      localStorage.removeItem("ziyo-jwt");
      // Redirect to login if needed
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

// Axios defaultlarini o'rnatish backward compatibility uchun
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 120000;

// Request interceptor ham default axios uchun
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("ziyo-jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Professional file upload function
export const uploadWithProgress = (url, formData, onProgress = null) => {
  return api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
    timeout: 300000, // 5 minutes for large file uploads
  });
};

// Health check function
export const checkServerHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Server health check failed:", error);
    throw error;
  }
};

// Export both api instance and default axios for backward compatibility
export { api };
export default axios;
