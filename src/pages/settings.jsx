import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { FaSave } from "react-icons/fa";
import { useSelector } from "react-redux";
import { getProfile } from "../services/user.service";
import { toast } from "react-hot-toast";

export default function EditProfile() {
  const [user, setUser] = useState({}); // URL'dan id olish
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    workPlace: "",
    position: "",
    login: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const data = await getProfile();

        setForm(data);
        setLoading(false);
        setUser(data);
      } catch (err) {
        console.error("Ma'lumot yuklanmadi", err);
      }
    };
    fetchTeacher();
  }, [user._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/teacher/${user._id}`, form);
      toast.success("Profil muvaffaqiyatli yangilandi!");
    } catch (err) {
      console.error("Xatolik:", err);
      toast.error("Xatolik yuz berdi");
    }
  };

  if (loading) return <p>Yuklanmoqda...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Profilni tahrirlash</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["firstname", "lastname", "workPlace", "position", "login"].map(
          (field) => (
            <div key={field}>
              <label className="block mb-1 capitalize">{field}</label>
              <input
                type="text"
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
          )
        )}

        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <FaSave /> Saqlash
        </button>
      </form>
    </div>
  );
}
