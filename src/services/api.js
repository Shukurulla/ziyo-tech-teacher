import axios from "axios";

// Base URL - production/development ga qarab sozlang
const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:2025" // Local development
    : "https://ziyo.test-avtomaktab.uz"; // Production

// Axios default konfiguratsiyasi
axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000; // 30 seconds

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ziyo-jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData uchun Content-Type ni o'rnatmang
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ziyo-jwt");
      window.location.href = "/auth/login";
    }

    // CORS xatolarini console da ko'rsatish
    if (error.message.includes("CORS")) {
      console.error("CORS Error:", error);
    }

    return Promise.reject(error);
  }
);

export default axios;
