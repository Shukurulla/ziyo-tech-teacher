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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  FaSpinner,
  FaBook,
  FaCalendarAlt,
} from "react-icons/fa";
import { convertToHttps } from "../utils";
import FileUploadProgress from "../components/FileUploadProgress";
import toast from "react-hot-toast";

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteClick = (materialId) => {
    setDeleteId(materialId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/materials/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setMaterials(materials.filter((material) => material._id !== deleteId));
      toast.success("Material muvaffaqiyatli o'chirildi!");
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch (err) {
      setError(
        "O'chirishda xato: " + (err.response?.data?.message || err.message)
      );
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleteLoading(false);
    }
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
        toast.success("Material muvaffaqiyatli yangilandi!");
      } else {
        setMaterials([res.data.data, ...materials]);
        toast.success("Material muvaffaqiyatli qo'shildi!");
      }

      resetForm();
      setOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Yuklashda xato yuz berdi");
      toast.error("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
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
        <CircularProgress size={60} />
        <span className="ml-4 text-lg text-gray-600">Yuklanmoqda...</span>
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" className="max-w-6xl mx-auto mt-10">
        {error}
      </Alert>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography
                variant="h4"
                className="font-bold text-gray-800 flex items-center gap-3"
              >
                <FaBook className="text-green-600" />
                Materiallar
              </Typography>
              <Typography variant="body1" className="text-gray-600 mt-2">
                O'quv materiallari va resurslar
              </Typography>
            </div>
            <Button
              variant="contained"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              startIcon={<FaPlus />}
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              size="large"
            >
              Material Qo'shish
            </Button>
          </div>
        </div>

        {/* Materials Grid */}
        {materials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaBook size={64} className="text-gray-300 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              Hali materiallar yo'q
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Birinchi materialni qo'shish uchun yuqoridagi tugmani bosing
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {materials.map((material) => (
              <Grid item xs={12} sm={6} md={4} key={material._id}>
                <Card className="h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  {material.thumbnailUrl ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={convertToHttps(material.thumbnailUrl)}
                      alt={material.title}
                      className="h-48 object-cover"
                    />
                  ) : (
                    <Box className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Box className="text-center">
                        {getFileIcon(material.fileType)}
                        <Typography
                          variant="body2"
                          className="mt-2 text-gray-600 font-medium"
                        >
                          {material.fileType?.toUpperCase() || "DOKUMENT"}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <CardContent className="flex-1 flex flex-col p-4">
                    <Typography
                      variant="h6"
                      className="font-semibold mb-2 line-clamp-2"
                    >
                      {material.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 mb-3 flex-grow line-clamp-3"
                    >
                      {material.description}
                    </Typography>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <FaCalendarAlt size={12} />
                      <span>
                        {new Date(material.createdAt).toLocaleDateString(
                          "uz-UZ"
                        )}
                      </span>
                    </div>

                    <Box className="flex justify-between items-center mt-auto gap-2">
                      <Box className="flex gap-1">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FaEdit />}
                          onClick={() => handleEdit(material)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
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
                            className="text-green-600 border-green-600 hover:bg-green-50"
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
                            className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          >
                            Havola
                          </Button>
                        )}
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(material._id)}
                        className="text-red-600 hover:bg-red-50"
                        size="small"
                      >
                        <FaTrash />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => !deleteLoading && setDeleteConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="text-lg font-semibold">
            Materialni o'chirish
          </DialogTitle>
          <DialogContent>
            <Typography className="text-gray-600">
              Haqiqatan ham bu materialni o'chirmoqchimisiz? Bu amalni qaytarib
              bo'lmaydi.
            </Typography>
          </DialogContent>
          <DialogActions className="p-4">
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
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

        {/* Add/Edit Material Modal */}
        <Modal open={open} onClose={() => !uploading && setOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: 600 },
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 24,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div className="sticky top-0 bg-white border-b p-4 rounded-t-2xl">
              <Typography variant="h6" className="font-bold">
                {editMode ? "Materialni tahrirlash" : "Yangi Material Qo'shish"}
              </Typography>
            </div>

            <div className="p-6">
              {formError && (
                <Alert severity="error" className="mb-4">
                  {formError}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <TextField
                    label="Sarlavha"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    fullWidth
                    required
                    disabled={uploading}
                    variant="outlined"
                  />

                  <TextField
                    label="Tavsif"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    fullWidth
                    multiline
                    rows={3}
                    required
                    disabled={uploading}
                    variant="outlined"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Material Turi</InputLabel>
                    <Select
                      name="content"
                      value={formData.content}
                      onChange={handleFormChange}
                      label="Material Turi"
                      disabled={uploading}
                    >
                      <MenuItem value="file">Fayl</MenuItem>
                      <MenuItem value="link">Havola</MenuItem>
                    </Select>
                  </FormControl>

                  {formData.content === "file" ? (
                    <div className="space-y-3">
                      {formData.file ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-2">
                            {getFileIcon(fileType)}
                            <span className="text-sm text-gray-700 font-medium">
                              {formData.file.name}
                            </span>
                          </div>
                          <Button
                            onClick={handleFileDelete}
                            className="text-red-500 hover:text-red-700"
                            disabled={uploading}
                          >
                            <FaTrash size={16} />
                          </Button>
                        </div>
                      ) : editMode && formData.fileUrl ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-2">
                            {getFileIcon(fileType)}
                            <div>
                              <span className="text-sm text-gray-700 font-medium block">
                                {formData.fileUrl.split("/").pop()}
                              </span>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                (Mavjud fayl)
                              </Typography>
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              setFormData({ ...formData, fileUrl: "" })
                            }
                            className="text-red-500 hover:text-red-700"
                            disabled={uploading}
                          >
                            <FaTrash size={16} />
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <FaPlus size={24} className="text-gray-400" />
                          <div className="text-center">
                            <span className="text-sm font-medium text-gray-700">
                              Fayl tanlang
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, DOC, DOCX formatlarini qo'llab-quvvatlaydi
                            </p>
                          </div>
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
                      required
                      disabled={uploading}
                      variant="outlined"
                      placeholder="https://example.com"
                    />
                  )}

                  <Divider className="my-4" />

                  <div>
                    <Typography
                      variant="subtitle1"
                      className="mb-3 font-medium"
                    >
                      Material rasmi (Ixtiyoriy)
                    </Typography>
                    {previewUrl ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
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
                          variant="outlined"
                          disabled={uploading}
                        >
                          Rasmni o'chirish
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <FaImage size={24} className="text-gray-400" />
                        <div className="text-center">
                          <span className="text-sm font-medium text-gray-700">
                            Material rasmi tanlang
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, GIF formatlarini qo'llab-quvvatlaydi
                          </p>
                        </div>
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
                  </div>

                  {uploading && uploadProgress > 0 && (
                    <Box className="mt-4 mb-4">
                      <FileUploadProgress
                        progress={uploadProgress}
                        fileName="Ma'lumotlar yuklanmoqda..."
                      />
                    </Box>
                  )}
                </div>

                <Box className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
                    className="bg-green-600 text-white hover:bg-green-700"
                    disabled={uploading || !!validateForm()}
                    startIcon={
                      uploading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPlus />
                      )
                    }
                  >
                    {uploading
                      ? `Yuklanmoqda... ${uploadProgress}%`
                      : editMode
                      ? "Saqlash"
                      : "Qo'shish"}
                  </Button>
                </Box>
              </form>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherMaterials;
