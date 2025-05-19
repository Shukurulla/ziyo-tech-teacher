// src/pages/VideoManagement.jsx
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiEdit, FiPlus } from "react-icons/fi";
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
  });
  const navigate = useNavigate();

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
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (video) => {
    setSelectedVideo(video);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(
        `/api/video/${selectedVideo._id}`,
        editForm
      );
      if (response.data.status === "success") {
        toast.success("Video muvaffaqiyatli yangilandi");
        setEditDialogOpen(false);
        fetchVideos();
      }
    } catch (error) {
      toast.error("Videoni yangilashda xatolik yuz berdi");
      console.error("Error updating video:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`/api/video/${selectedVideo._id}`);
      if (response.data.status === "success") {
        toast.success("Video muvaffaqiyatli o'chirildi");
        setDeleteDialogOpen(false);
        fetchVideos();
      }
    } catch (error) {
      toast.error("Videoni o'chirishda xatolik yuz berdi");
      console.error("Error deleting video:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          <div className="col-lg-4 col-md-6 col-sm-12 mt-4 ">
            <Card
              className="h-full flex flex-col cursor-pointer "
              onClick={() => navigate(`/video/${video._id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={video.video?.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
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
                    onClick={() => handleEditClick(video)}
                  >
                    Tahrirlash
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<FiTrash2 />}
                    onClick={() => handleDeleteClick(video)}
                  >
                    O'chirish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Videoni Tahrirlash</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Sarlavha"
            type="text"
            fullWidth
            value={editForm.title}
            onChange={handleInputChange}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Bekor qilish</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Saqlash
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
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VideoManagement;
