import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { FaTrash, FaDownload, FaPlus, FaTimes } from "react-icons/fa";
import { MdOutlineAddBox } from "react-icons/md";

export default function PracticeList() {
  const [practices, setPractices] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", file: null });

  useEffect(() => {
    const getPractices = async () => {
      const { data } = await axios.get("/api/practices");
      setPractices(data.data);
    };
    getPractices();
  }, []);

  const handleDelete = async () => {
    await axios.delete(`/api/practices/${deleteId}`);
    setPractices((prev) => prev.filter((p) => p._id !== deleteId));
    setDeleteId(null);
  };

  const handleAddPractice = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("file", form.file);

    const { data } = await axios.post("/api/practices", formData);
    setPractices((prev) => [data, ...prev]);
    setForm({ title: "", description: "", file: null });
    setShowModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📚 Praktikalar ro‘yxati</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <MdOutlineAddBox size={20} />
          Yangi qo‘shish
        </button>
      </div>

      {practices.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 text-lg">
          🔍 Hech narsa topilmadi.
        </div>
      ) : (
        practices?.map((p) => (
          <div
            key={p._id}
            className="border p-4 mb-4 rounded shadow flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold text-lg">{p.title}</h3>
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
              title="O‘chirish"
            >
              <FaTrash size={18} />
            </button>
          </div>
        ))
      )}

      {/* ✅ O‘chirish tasdiqlovchi oynasi */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#11111149] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg">Haqiqatan ham o‘chirmoqchimisiz?</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded"
              >
                Yo‘q
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Ha, o‘chir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Qo‘shish oynasi */}
      {showModal && (
        <div className="fixed inset-0 bg-[#11111149] bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleAddPractice}
            className="bg-white p-6 rounded shadow-lg w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Yangi practica qo‘shish</h3>
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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Qo‘shish
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
