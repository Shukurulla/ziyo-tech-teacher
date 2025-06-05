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
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import {
  FaPlus,
  FaTrash,
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaImage,
  FaLink,
  FaEdit,
} from "react-icons/fa";
import { convertToHttps } from "../utils";
import FileUploadProgress from "../components/FileUploadProgress";

const TeacherMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "file",
    file: null,
    fileUrl: "",
    thumbnail: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileType, setFileType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/materials", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setMaterials(res.data.data);
    } catch (err) {
      setError(
        "Materiallarni yuklashda xato: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "file",
      file: null,
      fileUrl: "",
      thumbnail: null,
    });
    setFileType(null);
    setPreviewUrl("");
    setUploadProgress(0);
    setEditMode(false);
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (material) => {
    setEditMode(true);
    setEditId(material._id);
    setFormData({
      title: material.title,
      description: material.description,
      content: material.content,
      file: null,
      fileUrl: material.fileUrl || "",
      thumbnail: null,
    });
    setFileType(material.fileType);
    setPreviewUrl(material.thumbnailUrl || "");
    setOpen(true);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
      const extension = file.name.split(".").pop().toLowerCase();
      setFileType(extension);
      setFormError("");
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormError("Thumbnail faqat rasm bo'lishi kerak");
        return;
      }
      setFormData({ ...formData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setFormError("");
    }
  };

  const handleFileDelete = () => {
    setFormData({ ...formData, file: null });
    setFileType(null);
    setFormError("");
  };

  const handleThumbnailDelete = () => {
    setFormData({ ...formData, thumbnail: null });
    setPreviewUrl("");
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.title) return "Sarlavha majburiy";
    if (!formData.description) return "Tavsif majburiy";
    if (formData.content === "file" && !editMode && !formData.file) {
      return "Fayl majburiy";
    }
    if (formData.content === "link" && !formData.fileUrl) {
      return "Havola majburiy";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("content", formData.content);

    if (formData.content === "file" && formData.file) {
      data.append("file", formData.file);
    } else if (editMode && formData.fileUrl) {
      data.append("fileUrl", formData.fileUrl);
    } else if (formData.content === "link") {
      data.append("fileUrl", formData.fileUrl);
    }

    if (formData.thumbnail) {
      data.append("thumbnail", formData.thumbnail);
    } else if (editMode && previewUrl && previewUrl.startsWith("http")) {
      data.append("thumbnailUrl", previewUrl);
    }

    const url = editMode ? `/api/materials/${editId}` : "/api/materials";
    const method = editMode ? "put" : "post";

    try {
      const res = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (editMode) {
        setMaterials((prevMaterials) =>
          prevMaterials.map((m) => (m._id === editId ? res.data.data : m))
        );
      } else {
        setMaterials([res.data.data, ...materials]);
      }

      resetForm();
      setOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Yuklashda xato yuz berdi");
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
      setError(
        "O'chirishda xato: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFileWord size={24} className="text-gray-500" />;
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FaFilePdf size={24} className="text-red-500" />;
      case "doc":
      case "docx":
        return <FaFileWord size={24} className="text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FaImage size={24} className="text-green-500" />;
      case "link":
        return <FaLink size={24} className="text-purple-500" />;
      default:
        return <FaFileWord size={24} className="text-gray-500" />;
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" className="max-w-6xl mx-auto mt-10">
        {error}
      </Alert>
    );

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h5" className="font-bold text-gray-800">
            Materiallar
          </Typography>
          <Button
            variant="contained"
            className="bg-blue-600 text-white hover:bg-blue-700"
            startIcon={<FaPlus />}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
          >
            Material Qo'shish
          </Button>
        </div>

        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material._id}>
              <Card className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow">
                {material.thumbnailUrl ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={convertToHttps(material.thumbnailUrl)}
                    alt={material.title}
                    className="h-48 object-cover"
                  />
                ) : (
                  <Box className="h-48 flex items-center justify-center bg-gray-100">
                    <Box className="text-center">
                      {getFileIcon(material.fileType)}
                      <Typography
                        variant="body2"
                        className="mt-2 text-gray-600"
                      >
                        {material.fileType?.toUpperCase() || "DOKUMENT"}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <CardContent className="flex-1 flex flex-col">
                  <Typography variant="h6" className="font-semibold mb-2">
                    {material.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-gray-600 mb-4 flex-grow line-clamp-3"
                  >
                    {material.description}
                  </Typography>
                  <Box className="flex justify-between items-center mt-auto">
                    <Box className="flex gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FaEdit />}
                        onClick={() => handleEdit(material)}
                      >
                        Tahrirlash
                      </Button>
                      {material.content === "file" && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FaDownload />}
                          href={convertToHttps(material.fileUrl)}
                          target="_blank"
                          color="primary"
                        >
                          Yuklab olish
                        </Button>
                      )}
                      {material.content === "link" && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FaLink />}
                          href={convertToHttps(material.fileUrl)}
                          target="_blank"
                          color="secondary"
                        >
                          Havola
                        </Button>
                      )}
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(material._id)}
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <Typography variant="h6" className="font-bold mb-4">
              {editMode ? "Materialni tahrirlash" : "Yangi Material Qo'shish"}
            </Typography>
            {formError && (
              <Alert severity="error" className="mb-4">
                {formError}
              </Alert>
            )}
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
                        {getFileIcon(fileType)}
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
                  ) : editMode && formData.fileUrl ? (
                    <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getFileIcon(fileType)}
                        <span className="text-sm text-gray-600">
                          {formData.fileUrl.split("/").pop()}
                        </span>
                        <Typography variant="caption" color="textSecondary">
                          (Mavjud fayl)
                        </Typography>
                      </div>
                      <Button
                        onClick={() =>
                          setFormData({ ...formData, fileUrl: "" })
                        }
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
                        accept=".doc, .docx, .pdf"
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
              <Divider className="my-4" />
              <Typography variant="subtitle1" className="mb-2">
                Material rasmi
              </Typography>
              {previewUrl ? (
                <div className="mb-4">
                  <div className="relative w-full h-40 rounded overflow-hidden mb-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={handleThumbnailDelete}
                    startIcon={<FaTrash />}
                    color="error"
                    size="small"
                  >
                    Rasmni o'chirish
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="thumbnail-upload"
                  className="flex flex-col items-center justify-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-4"
                >
                  <FaImage size={30} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Material rasmi tanlang
                  </span>
                  <Typography variant="caption" color="textSecondary">
                    (Ixtiyoriy)
                  </Typography>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                    disabled={uploading}
                  />
                </label>
              )}
              {uploading && uploadProgress > 0 && (
                <Box className="mt-4 mb-4">
                  <FileUploadProgress
                    progress={uploadProgress}
                    fileName="Ma'lumotlar yuklanmoqda..."
                  />
                </Box>
              )}
              <Box className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => setOpen(false)}
                  variant="outlined"
                  disabled={uploading}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={uploading || !!validateForm()}
                >
                  {uploading
                    ? "Yuklanmoqda..."
                    : editMode
                    ? "Saqlash"
                    : "Qo'shish"}
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherMaterials;
