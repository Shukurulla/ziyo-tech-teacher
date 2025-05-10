export const convertToHttps = (url) => {
  // Agar URL HTTP bilan boshlasa, HTTPS ga o'zgartiramiz
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url; // Agar URL allaqachon HTTPS bo'lsa, uni o'zgartirmaymiz
};
