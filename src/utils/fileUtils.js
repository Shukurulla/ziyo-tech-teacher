// src/utils/fileUtils.js - Fayllar bilan ishlash uchun utility
export const convertFileUrl = (url) => {
  if (!url) return url;

  // Agar URL allaqachon to'g'ri bo'lsa (server.ziyo-tech.uz dan boshlansa)
  if (url.startsWith("https://server.ziyo-tech.uz")) {
    return url;
  }

  // Agar URL eski domenlardan boshlansa, server.ziyo-tech.uz ga o'zgartirish
  if (url.includes("ziyo-tech.uz")) {
    return url.replace(
      /https?:\/\/[^\/]*ziyo-tech\.uz/,
      "https://server.ziyo-tech.uz"
    );
  }

  // Agar URL relative bo'lsa (/uploads/... ), server domain qo'shish
  if (url.startsWith("/uploads/")) {
    return `https://server.ziyo-tech.uz${url}`;
  }

  // Agar URL faqat filename bo'lsa
  if (!url.includes("/")) {
    return `https://server.ziyo-tech.uz/uploads/files/${url}`;
  }

  return url;
};

// File download function
export const downloadFile = async (url, fileName) => {
  try {
    const correctedUrl = convertFileUrl(url);
    console.log("Downloading from:", correctedUrl);

    const response = await fetch(correctedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName || url.split("/").pop();
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: open in new tab
    window.open(convertFileUrl(url), "_blank");
  }
};

// Audio play function
export const getAudioUrl = (url) => {
  return convertFileUrl(url);
};
