// Enhanced src/pages/dashboard.jsx for teacher
import React, { useState, useEffect } from "react";
import axios from "../services/api";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Box,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiEdit, FiPlus, FiX } from "react-icons/fi";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    audios: [],
    presentations: [],
    newAudios: [],
    newPresentations: [],
  });
  const navigate = useNavigate();
  const [audioUploads, setAudioUploads] = useState([]);
  const [presentationUploads, setPresentationUploads] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/video/all");
      if (response.data.status === "success") {
        setVideos(response.data.data);
      }
    } catch (error) {
      toast.error("Videolarni yuklashda xatolik yuz berdi");
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (video) => {
    setSelectedVideo(video);
    setEditForm({
      title: video.title,
      description: video.description,
      audios: Object.keys(video.audios || {}).map((key) => ({
        name: key,
        url: video.audios[key],
      })),
      presentations: Object.keys(video.presentations || {}).map((key) => ({
        name: key,
        url: video.presentations[key],
      })),
      newAudios: [],
      newPresentations: [],
    });
    setAudioUploads([]);
    setPresentationUploads([]);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (video, e) => {
    e.stopPropagation(); // Prevent navigation when clicking the delete button
    setSelectedVideo(video);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      setUpdateLoading(true);

      // First, update the basic info
      const basicResponse = await axios.put(`/api/video/${selectedVideo._id}`, {
        title: editForm.title,
        description: editForm.description,
      });

      // If there are new files to upload
      if (
        editForm.newAudios.length > 0 ||
        editForm.newPresentations.length > 0
      ) {
        const formData = new FormData();

        // Add basic info
        formData.append("videoId", selectedVideo._id);
        formData.append("title", editForm.title);
        formData.append("description", editForm.description);

        // Add new audio files
        editForm.newAudios.forEach((file) => {
          formData.append("audios", file);
        });

        // Add new presentation files
        editForm.newPresentations.forEach((file) => {
          formData.append("presentations", file);
        });

        // Upload new files
        await axios.post("/api/video/update-files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast.success("Video muvaffaqiyatli yangilandi");
      setEditDialogOpen(false);
      fetchVideos();
    } catch (error) {
      toast.error("Videoni yangilashda xatolik yuz berdi");
      console.error("Error updating video:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setUpdateLoading(true);
      const response = await axios.delete(`/api/video/${selectedVideo._id}`);
      if (response.data.status === "success") {
        toast.success("Video muvaffaqiyatli o'chirildi");
        setDeleteDialogOpen(false);
        fetchVideos();
      }
    } catch (error) {
      toast.error("Videoni o'chirishda xatolik yuz berdi");
      console.error("Error deleting video:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);

    if (type === "audios") {
      setEditForm((prev) => ({
        ...prev,
        newAudios: [...prev.newAudios, ...files],
      }));
      setAudioUploads((prev) => [...prev, ...files]);
    } else {
      setEditForm((prev) => ({
        ...prev,
        newPresentations: [...prev.newPresentations, ...files],
      }));
      setPresentationUploads((prev) => [...prev, ...files]);
    }
  };

  const removeExistingFile = (type, index) => {
    setEditForm((prev) => {
      const updatedFiles = [...prev[type]];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        [type]: updatedFiles,
      };
    });
  };

  const removeNewFile = (type, index) => {
    const stateKey = type === "audios" ? "newAudios" : "newPresentations";
    const uploadsKey = type === "audios" ? audioUploads : presentationUploads;
    const setUploadsKey =
      type === "audios" ? setAudioUploads : setPresentationUploads;

    setEditForm((prev) => {
      const updatedFiles = [...prev[stateKey]];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        [stateKey]: updatedFiles,
      };
    });

    const updatedUploads = [...uploadsKey];
    updatedUploads.splice(index, 1);
    setUploadsKey(updatedUploads);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="font-bold">
          Video Boshqaruvi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FiPlus />}
          onClick={() => navigate("/create-video")}
        >
          Yangi Video Qo'shish
        </Button>
      </div>

      <div className="row">
        {videos.map((video) => (
          <div className="col-lg-4 col-md-6 col-sm-12 mt-4" key={video._id}>
            <Card
              className="h-full flex flex-col cursor-pointer"
              onClick={() => navigate(`/video/${video._id}`)}
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {video.video?.thumbnail && !video.video?.thumbnail.endsWith('.mp4') ? (
                  <img
                    src={video.video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <CardContent className="flex-1 flex flex-col">
                <Typography variant="h6" className="font-semibold mb-2">
                  {video.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="flex-1 mb-4 line-clamp-3"
                >
                  {video.description}
                </Typography>
                <div className="flex justify-between mt-auto">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FiEdit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(video);
                    }}
                  >
                    Tahrirlash
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<FiTrash2 />}
                    onClick={(e) => handleDeleteClick(video, e)}
                  >
                    O'chirish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Enhanced Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Videoni Tahrirlash</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Sarlavha"
            type="text"
            fullWidth
            value={editForm.title}
            onChange={handleInputChange}
            className="mb-4"
          />

          <TextField
            margin="dense"
            name="description"
            label="Tavsif"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={handleInputChange}
            className="mb-4"
          />

          {/* Existing Audio Files */}
          <Typography variant="h6" className="mt-4 mb-2">
            Mavjud audio fayllar
          </Typography>
          {editForm.audios.length > 0 ? (
            <div className="mb-4">
              {editForm.audios.map((audio, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-between p-2 mb-2 border rounded"
                >
                  <Typography>{audio.name}</Typography>
                  <IconButton
                    onClick={() => removeExistingFile("audios", index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </div>
          ) : (
            <Typography variant="body2" color="textSecondary" className="mb-3">
              Mavjud audio fayllar yo'q
            </Typography>
          )}

          {/* New Audio Upload */}
          <FormControl fullWidth className="mb-4">
            <input
              accept="audio/*"
              style={{ display: "none" }}
              id="new-audio-upload"
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "audios")}
            />
            <label htmlFor="new-audio-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Yangi audio fayllar qo'shish
              </Button>
            </label>
          </FormControl>

          {/* New Audio Files List */}
          {audioUploads.length > 0 && (
            <div className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Yangi qo'shiladigan audio fayllar:
              </Typography>
              {audioUploads.map((file, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-between p-2 mb-2 border rounded"
                >
                  <Typography>{file.name}</Typography>
                  <IconButton
                    onClick={() => removeNewFile("audios", index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </div>
          )}

          {/* Existing Presentation Files */}
          <Typography variant="h6" className="mt-4 mb-2">
            Mavjud prezentatsiya fayllar
          </Typography>
          {editForm.presentations.length > 0 ? (
            <div className="mb-4">
              {editForm.presentations.map((presentation, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-between p-2 mb-2 border rounded"
                >
                  <Typography>{presentation.name}</Typography>
                  <IconButton
                    onClick={() => removeExistingFile("presentations", index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </div>
          ) : (
            <Typography variant="body2" color="textSecondary" className="mb-3">
              Mavjud prezentatsiya fayllar yo'q
            </Typography>
          )}

          {/* New Presentation Upload */}
          <FormControl fullWidth className="mb-4">
            <input
              accept=".pptx,.ppt"
              style={{ display: "none" }}
              id="new-presentation-upload"
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "presentations")}
            />
            <label htmlFor="new-presentation-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Yangi prezentatsiya fayllar qo'shish
              </Button>
            </label>
          </FormControl>

          {/* New Presentation Files List */}
          {presentationUploads.length > 0 && (
            <div className="mb-4">
              <Typography variant="subtitle1" className="mb-2">
                Yangi qo'shiladigan prezentatsiya fayllar:
              </Typography>
              {presentationUploads.map((file, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-between p-2 mb-2 border rounded"
                >
                  <Typography>{file.name}</Typography>
                  <IconButton
                    onClick={() => removeNewFile("presentations", index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={updateLoading}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleEditSubmit}
            color="primary"
            disabled={updateLoading}
            startIcon={updateLoading ? <CircularProgress size={20} /> : null}
          >
            {updateLoading ? "Yangilanmoqda..." : "Saqlash"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Videoni o'chirishni tasdiqlaysizmi?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {selectedVideo?.title} videosini o'chirmoqchimisiz? Bu amalni
            qaytarib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={updateLoading}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={updateLoading}
            startIcon={updateLoading ? <CircularProgress size={20} /> : null}
          >
            {updateLoading ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VideoManagement;
