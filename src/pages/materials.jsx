import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Modal,
} from "@mui/material";
import {
  FaPlus,
  FaTrash,
  FaDownload,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa";
import { convertToHttps } from "../utils";

const TeacherMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "file",
    file: null,
    fileUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get("/api/materials", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setMaterials(res.data.data);
    } catch (err) {
      setError("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleFileDelete = () => {
    setFormData({ ...formData, file: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("content", formData.content);
    if (formData.content === "file") {
      data.append("file", formData.file);
    } else {
      data.append("fileUrl", formData.fileUrl);
    }

    try {
      const res = await axios.post("/api/materials", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setMaterials([...materials, res.data.data]);
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        content: "file",
        file: null,
        fileUrl: "",
      });
    } catch (err) {
      setError("Material qo‘shishda xatolik: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/materials/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setMaterials(materials.filter((material) => material._id !== id));
    } catch (err) {
      setError("Material o‘chirishda xatolik: " + err.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Yuklanmoqda...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    if (extension === "pdf")
      return <FaFilePdf size={24} className="text-red-500" />;
    if (extension === "docx" || extension === "doc")
      return <FaFileWord size={24} className="text-blue-500" />;
    return <FaFileWord size={24} className="text-gray-500" />;
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-l p-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h5" className="font-bold text-gray-800">
            Materiallar
          </Typography>
          <Button
            variant="contained"
            className="bg-blue-600 text-white hover:bg-blue-700"
            startIcon={<FaPlus />}
            onClick={() => setOpen(true)}
          >
            Material Qo‘shish
          </Button>
        </div>

        {/* Materials List */}
        {materials.map((material) => (
          <div
            key={material._id}
            className="p-4 mb-4 bg-gray-50 rounded-lg flex justify-between items-center"
          >
            <div>
              <Typography variant="h6" className="font-semibold text-gray-800">
                {material.title}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {material.description}
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Turi: {material.content}
              </Typography>
              {material.content === "file" && (
                <Typography variant="body2" className="text-gray-500">
                  Fayl turi: {material.fileType}
                </Typography>
              )}
              {material.content === "link" && (
                <a
                  href={convertToHttps(material.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {material.fileUrl}
                </a>
              )}
            </div>
            <div className="flex gap-2">
              {material.content === "file" && (
                <Button
                  variant="contained"
                  className="bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700"
                  href={convertToHttps(material.fileUrl)}
                  target="_blank"
                >
                  <FaDownload />
                </Button>
              )}
              <Button
                variant="outlined"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(material._id)}
              >
                <FaTrash />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Material Modal */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" className="font-bold mb-4">
              Yangi Material Qo‘shish
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Sarlavha"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Tavsif"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Material Turi</InputLabel>
                <Select
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  label="Material Turi"
                >
                  <MenuItem value="file">Fayl</MenuItem>
                  <MenuItem value="link">Havola</MenuItem>
                </Select>
              </FormControl>
              {formData.content === "file" ? (
                <div className="mb-4">
                  {formData.file ? (
                    <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getFileIcon(formData.file.name)}
                        <span className="text-sm text-gray-600">
                          {formData.file.name}
                        </span>
                      </div>
                      <Button
                        onClick={handleFileDelete}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={16} />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <FaPlus size={20} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Fayl tanlang
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <TextField
                  label="Havola (URL)"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                  required
                />
              )}
              <Button
                type="submit"
                variant="contained"
                className="bg-blue-600 text-white hover:bg-blue-700 w-full"
                disabled={uploading}
              >
                {uploading ? "Yuklanmoqda..." : "Qo‘shish"}
              </Button>
            </form>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherMaterials;
