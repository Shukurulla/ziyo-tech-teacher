// Frontend utility function for handling uploads with proper CORS
import { api, uploadWithProgress } from "../services/api";
import toast from "react-hot-toast";

// Enhanced upload function with retry mechanism
export const uploadFileWithRetry = async (url, formData, options = {}) => {
  const {
    onProgress = null,
    retries = 3,
    retryDelay = 1000,
    timeout = 300000, // 5 minutes
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${retries} to ${url}`);

      const response = await uploadWithProgress(url, formData, onProgress);

      console.log("Upload successful:", response.data);
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Upload attempt ${attempt} failed:`, error);

      // Don't retry for certain errors
      if (
        error.response?.status === 400 ||
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        console.log("Non-retryable error, stopping retries");
        break;
      }

      // Wait before retry (except for last attempt)
      if (attempt < retries) {
        console.log(`Waiting ${retryDelay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
  }

  // If we get here, all retries failed
  console.error("All upload attempts failed:", lastError);
  throw lastError;
};

// Video upload function with enhanced error handling
export const uploadVideo = async (formData, onProgress = null) => {
  try {
    // Check server health first
    try {
      await api.get("/health");
      console.log("Server health check passed");
    } catch (healthError) {
      console.warn("Server health check failed:", healthError);
      toast.error("Server bilan aloqa yo'q. Iltimos, keyinroq urinib ko'ring.");
      throw new Error("Server unavailable");
    }

    const response = await uploadFileWithRetry("/api/upload", formData, {
      onProgress,
      retries: 3,
      timeout: 300000, // 5 minutes for video uploads
    });

    return response.data;
  } catch (error) {
    console.error("Video upload error:", error);

    if (error.code === "ERR_NETWORK") {
      toast.error("Tarmoq xatosi. Internetingizni tekshiring.");
    } else if (error.response?.status === 413) {
      toast.error("Fayl hajmi juda katta. Maksimal hajm: 1GB");
    } else if (error.response?.status === 415) {
      toast.error("Fayl formati qo'llab-quvvatlanmaydi.");
    } else if (error.message === "Server unavailable") {
      // Already handled above
    } else {
      toast.error(
        "Yuklashda xatolik yuz berdi: " +
          (error.response?.data?.message || error.message)
      );
    }

    throw error;
  }
};

// Material upload function
export const uploadMaterial = async (formData, onProgress = null) => {
  try {
    const response = await uploadFileWithRetry("/api/materials", formData, {
      onProgress,
      retries: 2,
      timeout: 120000, // 2 minutes for materials
    });

    return response.data;
  } catch (error) {
    console.error("Material upload error:", error);

    if (error.code === "ERR_NETWORK") {
      toast.error("Tarmoq xatosi. Internet aloqasini tekshiring.");
    } else if (error.response?.status === 413) {
      toast.error("Fayl hajmi juda katta.");
    } else if (error.response?.status === 415) {
      toast.error("Fayl formati qo'llab-quvvatlanmaydi.");
    } else {
      toast.error(
        "Material yuklashda xatolik: " +
          (error.response?.data?.message || error.message)
      );
    }

    throw error;
  }
};

// Practice upload function
export const uploadPractice = async (formData, onProgress = null) => {
  try {
    const response = await uploadFileWithRetry("/api/practices", formData, {
      onProgress,
      retries: 2,
      timeout: 120000,
    });

    return response.data;
  } catch (error) {
    console.error("Practice upload error:", error);

    if (error.code === "ERR_NETWORK") {
      toast.error("Tarmoq xatosi. Internet aloqasini tekshiring.");
    } else if (error.response?.status === 413) {
      toast.error("Fayl hajmi juda katta.");
    } else if (error.response?.status === 415) {
      toast.error("Fayl formati qo'llab-quvvatlanmaydi.");
    } else {
      toast.error(
        "Praktika yuklashda xatolik: " +
          (error.response?.data?.message || error.message)
      );
    }

    throw error;
  }
};

// Video work upload function
export const uploadVideoWork = async (formData, onProgress = null) => {
  try {
    const response = await uploadFileWithRetry("/api/videoWork", formData, {
      onProgress,
      retries: 2,
      timeout: 120000,
    });

    return response.data;
  } catch (error) {
    console.error("Video work upload error:", error);

    if (error.code === "ERR_NETWORK") {
      toast.error("Tarmoq xatosi. Internet aloqasini tekshiring.");
    } else if (error.response?.status === 413) {
      toast.error("Fayl hajmi juda katta.");
    } else if (error.response?.status === 415) {
      toast.error("Fayl formati qo'llab-quvvatlanmaydi.");
    } else {
      toast.error(
        "Video ish yuklashda xatolik: " +
          (error.response?.data?.message || error.message)
      );
    }

    throw error;
  }
};

// Practice work upload function
export const uploadPracticeWork = async (formData, onProgress = null) => {
  try {
    const response = await uploadFileWithRetry(
      "/api/practiceWork/upload",
      formData,
      {
        onProgress,
        retries: 2,
        timeout: 120000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Practice work upload error:", error);

    if (error.code === "ERR_NETWORK") {
      toast.error("Tarmoq xatosi. Internet aloqasini tekshiring.");
    } else if (error.response?.status === 413) {
      toast.error("Fayl hajmi juda katta.");
    } else if (error.response?.status === 415) {
      toast.error("Fayl formati qo'llab-quvvatlanmaydi.");
    } else {
      toast.error(
        "Praktika ishi yuklashda xatolik: " +
          (error.response?.data?.message || error.message)
      );
    }

    throw error;
  }
};

// Generic file validation function
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 1024 * 1024 * 1024, // 1GB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    throw new Error(
      `Fayl hajmi juda katta. Maksimal hajm: ${(
        maxSize /
        (1024 * 1024)
      ).toFixed(0)}MB`
    );
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`Fayl turi qo'llab-quvvatlanmaydi: ${file.type}`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`Fayl kengaytmasi qo'llab-quvvatlanmaydi: .${extension}`);
    }
  }

  return true;
};

// CORS preflight check function
export const checkCORSSupport = async () => {
  try {
    // Make a simple OPTIONS request to check CORS
    const response = await api.options("/health");
    console.log("CORS preflight check passed");
    return true;
  } catch (error) {
    console.error("CORS preflight check failed:", error);
    return false;
  }
};
