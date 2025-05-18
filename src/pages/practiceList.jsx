import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { FaTrash, FaDownload, FaPlus, FaTimes, FaBell } from "react-icons/fa";
import { MdOutlineAddBox } from "react-icons/md";
import { Badge, Tooltip } from "@mui/material";

export default function PracticeList() {
  const [practices, setPractices] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", file: null });
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch practices
        const { data: practicesData } = await axios.get("/api/practices");
        setPractices(practicesData.data);

        // Fetch submissions to count them
        const submissionsRes = await axios.get("/api/submissions/all");
        const submissionData = submissionsRes.data.data;

        // Group submissions by practice ID
        const submissionCounts = {};
        submissionData.forEach((sub) => {
          if (sub.type === "practiceWork") {
            // Extract practice ID from the title or from workId
            const practiceId = sub.workId;
            if (practiceId) {
              if (!submissionCounts[practiceId]) {
                submissionCounts[practiceId] = 0;
              }
              // Only count unrated submissions
              if (!sub.isSended) {
                submissionCounts[practiceId]++;
              }
            }
          }
        });

        setSubmissions(submissionCounts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async () => {
    await axios.delete(`/api/practices/${deleteId}`);
    setPractices((prev) => prev.filter((p) => p._id !== deleteId));
    setDeleteId(null);
  };

  const handleAddPractice = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("file", form.file);

    try {
      const { data } = await axios.post("/api/practices", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setPractices((prev) => [data, ...prev]);
      setForm({ title: "", description: "", file: null });
      setShowModal(false);
    } catch (error) {
      console.error("Error uploading practice:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📚 Praktikalar ro'yxati</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <MdOutlineAddBox size={20} />
          Yangi qo'shish
        </button>
      </div>

      {practices.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 text-lg">
          {loading ? "Yuklanmoqda..." : "🔍 Hech narsa topilmadi."}
        </div>
      ) : (
        practices?.map((p) => (
          <div
            key={p._id}
            className="border p-4 mb-4 rounded shadow flex justify-between items-start"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                {submissions[p._id] > 0 && (
                  <Tooltip title={`${submissions[p._id]} ta yangi topshiriq`}>
                    <Badge badgeContent={submissions[p._id]} color="error">
                      <FaBell className="text-orange-500" />
                    </Badge>
                  </Tooltip>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-1">{p.description}</p>
              <a
                href={p.fileUrl}
                target="_blank"
                className="text-blue-500 text-sm flex items-center gap-1 hover:underline"
                rel="noreferrer"
              >
                <FaDownload /> Yuklab olish
              </a>
            </div>
            <button
              onClick={() => setDeleteId(p._id)}
              className="text-red-600 hover:text-red-800"
              title="O'chirish"
            >
              <FaTrash size={18} />
            </button>
          </div>
        ))
      )}

      {/* O'chirish tasdiqlovchi oynasi */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#11111149] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg">Haqiqatan ham o'chirmoqchimisiz?</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded"
              >
                Yo'q
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Ha, o'chir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Qo'shish oynasi */}
      {showModal && (
        <div className="fixed inset-0 bg-[#11111149] bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleAddPractice}
            className="bg-white p-6 rounded shadow-lg w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Yangi practica qo'shish</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Sarlavha</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full mt-1 border px-3 py-2 rounded"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Izoh</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full mt-1 border px-3 py-2 rounded"
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Fayl</label>
              <input
                type="file"
                required
                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                className="mt-1"
              />
            </div>

            {/* Progress bar */}
            {isUploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-right">
                  {uploadProgress}%
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center ${
                isUploading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "Yuklanmoqda..." : "Qo'shish"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
