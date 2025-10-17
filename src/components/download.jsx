import { FaDownload } from "react-icons/fa";

const handleDownload = async (url) => {
  try {
    const response = await fetch(
      url.replace("http://teacher.ziyo-tech.uz/api", "https://ziyo-tech.uz/api")
    );
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "file"; 
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Yuklab olishda xato:", error);
  }
};

export default function DownloadButton({ material }) {
  return (
    <button
      onClick={() => handleDownload(material.fileUrl)}
      className="flex items-center gap-2 text-green-600 border border-green-600 hover:bg-green-50 px-3 py-1 rounded-md"
    >
      <FaDownload /> Yuklab olish
    </button>
  );
}
