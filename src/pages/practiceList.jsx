import React, { useEffect, useState } from "react";
import axios from "../services/api";
import {
  FaTrash,
  FaDownload,
  FaPlus,
  FaTimes,
  FaBell,
  FaFileAlt,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";
import {
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import toast from "react-hot-toast";

export default function PracticeList() {
  const [practices, setPractices] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", file: null });
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteClick = (practiceId) => {
    setDeleteId(practiceId);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/practices/${deleteId}`);
      setPractices((prev) => prev.filter((p) => p._id !== deleteId));
      toast.success("Praktika muvaffaqiyatli o'chirildi!");
      setConfirmDeleteOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting practice:", error);
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleteLoading(false);
    }
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
      toast.success("Praktika muvaffaqiyatli qo'shildi!");
    } catch (error) {
      console.error("Error uploading practice:", error);
      toast.error("Yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress size={60} />
        <span className="ml-4 text-lg text-gray-600">Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaFileAlt className="text-blue-600" />
              Praktikalar ro'yxati
            </h2>
            <p className="text-gray-600 mt-2">
              Talabalar uchun amaliy mashqlar va topshiriqlar
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaPlus size={18} />
            Yangi praktika qo'shish
          </button>
        </div>
      </div>

      {/* Practices List */}
      {practices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FaFileAlt size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Hali praktikalar yo'q
          </h3>
          <p className="text-gray-500">
            Birinchi praktikani qo'shish uchun yuqoridagi tugmani bosing
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {practices.map((practice) => (
            <div
              key={practice._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-xl text-gray-800">
                      {practice.title}
                    </h3>
                    {submissions[practice._id] > 0 && (
                      <Tooltip
                        title={`${
                          submissions[practice._id]
                        } ta yangi topshiriq`}
                      >
                        <Badge
                          badgeContent={submissions[practice._id]}
                          color="error"
                        >
                          <FaBell className="text-orange-500" />
                        </Badge>
                      </Tooltip>
                    )}
                  </div>

                  <p className="text-gray-600 text-base mb-4 leading-relaxed">
                    {practice.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt size={14} />
                      <span>
                        {new Date(practice.createdAt).toLocaleDateString(
                          "uz-UZ"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <a
                    href={practice.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <FaDownload size={16} />
                    Yuklab olish
                  </a>

                  <button
                    onClick={() => handleDeleteClick(practice._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    title="O'chirish"
                  >
                    <FaTrash size={16} />
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => !deleteLoading && setConfirmDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="text-lg font-semibold">
          Praktikani o'chirish
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-600">
            Haqiqatan ham bu praktikani o'chirmoqchimisiz? Bu amalni qaytarib
            bo'lmaydi.
          </p>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            disabled={deleteLoading}
            variant="outlined"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteLoading}
            variant="contained"
            color="error"
            startIcon={
              deleteLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaTrash />
              )
            }
          >
            {deleteLoading ? "O'chirilmoqda..." : "Ha, o'chirish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Practice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Yangi praktika qo'shish
                </h3>
                <button
                  type="button"
                  onClick={() => !isUploading && setShowModal(false)}
                  disabled={isUploading}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddPractice} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sarlavha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Praktika sarlavhasini kiriting"
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tavsif
                  </label>
                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Praktika haqida qisqacha ma'lumot"
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fayl <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      onChange={(e) =>
                        setForm({ ...form, file: e.target.files[0] })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isUploading}
                    />
                  </div>
                  {form.file && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tanlangan: {form.file.name}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Yuklanmoqda...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      className="h-2 rounded-full"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isUploading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Yuklanmoqda... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Qo'shish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
