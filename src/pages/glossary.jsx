import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  TextField,
  Box,
  Modal,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSpinner,
  FaBook,
  FaCalendarAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

const TeacherGlossary = () => {
  const [glossary, setGlossary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchGlossary();
  }, []);

  const fetchGlossary = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/glossary", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setGlossary(res.data.data);
    } catch (err) {
      setError(
        "Glossaryni yuklashda xato: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
    });
    setEditMode(false);
    setEditId(null);
    setFormError("");
  };

  const handleEdit = (entry) => {
    setEditMode(true);
    setEditId(entry._id);
    setFormData({
      title: entry.title,
      content: entry.content,
    });
    setOpen(true);
    setFormError("");
  };

  const handleDeleteClick = (entryId) => {
    setDeleteId(entryId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/glossary/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setGlossary(glossary.filter((entry) => entry._id !== deleteId));
      toast.success("Glossary yozuvi muvaffaqiyatli o'chirildi!");
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

  const validateForm = () => {
    if (!formData.title) return "Sarlavha majburiy";
    if (!formData.content) return "Mazmun majburiy";
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

    try {
      if (editMode) {
        const res = await axios.put(`/api/glossary/${editId}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
          },
        });
        setGlossary((prevGlossary) =>
          prevGlossary.map((entry) =>
            entry._id === editId ? res.data.data : entry
          )
        );
        toast.success("Glossary yozuvi muvaffaqiyatli yangilandi!");
      } else {
        const res = await axios.post("/api/glossary", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
          },
        });
        setGlossary([res.data.data, ...glossary]);
        toast.success("Glossary yozuvi muvaffaqiyatli qo'shildi!");
      }

      resetForm();
      setOpen(false);
    } catch (err) {
      setFormError(
        "Saqlashda xato: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setUploading(false);
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
                <FaBook className="text-blue-600" />
                Glossary Boshqaruvi
              </Typography>
              <Typography variant="body1" className="text-gray-600 mt-2">
                Glossary yozuvlarini qo'shish, tahrirlash va o'chirish
              </Typography>
            </div>
            <Button
              variant="contained"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              startIcon={<FaPlus />}
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              size="large"
            >
              Glossary Qo'shish
            </Button>
          </div>
        </div>

        {/* Glossary Grid */}
        {glossary.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaBook size={64} className="text-gray-300 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              Hali glossary yozuvlari yo'q
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Birinchi glossary yozuvini qo'shish uchun yuqoridagi tugmani
              bosing
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {glossary.map((entry) => (
              <Grid item xs={12} md={6} key={entry._id}>
                <Card className="h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  <CardContent className="flex-1 flex flex-col p-4">
                    <Typography
                      variant="h6"
                      className="font-semibold mb-2 line-clamp-2"
                    >
                      {entry.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 mb-3 flex-grow line-clamp-4"
                    >
                      {entry.content}
                    </Typography>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <FaCalendarAlt size={12} />
                      <span>
                        {new Date(entry.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>

                    <Box className="flex justify-between items-center mt-auto gap-2">
                      <Box className="flex gap-1">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FaEdit />}
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Tahrirlash
                        </Button>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(entry._id)}
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
            Glossary yozuvini o'chirish
          </DialogTitle>
          <DialogContent>
            <Typography className="text-gray-600">
              Haqiqatan ham bu glossary yozuvini o'chirmoqchimisiz? Bu amalni
              qaytarib bo'lmaydi.
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

        {/* Add/Edit Glossary Modal */}
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
                {editMode
                  ? "Glossary yozuvini tahrirlash"
                  : "Yangi Glossary Yozuvi Qo'shish"}
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
                    label="Mazmun"
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    fullWidth
                    multiline
                    rows={6}
                    required
                    disabled={uploading}
                    variant="outlined"
                    placeholder="Glossary yozuvining mazmunini kiriting..."
                  />
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
                    className="bg-blue-600 text-white hover:bg-blue-700"
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
                      ? "Saqlanmoqda..."
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

export default TeacherGlossary;
