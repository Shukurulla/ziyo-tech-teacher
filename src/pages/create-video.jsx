// Improved src/pages/create-video.jsx
import React, { useState } from "react";
import axios from "../services/api";
import {
  uploadVideo,
  validateFile,
  checkCORSSupport,
} from "../utils/uploadHelpers";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  InputLabel,
  FormHelperText,
  Alert,
  IconButton,
  Paper,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";

function CreateVideo() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video: null,
    audios: [],
    presentations: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    server: 0,
    overall: 0,
  });
  const [uploadStage, setUploadStage] = useState(""); // 'video', 'server', 'complete'
  const [processingData, setProcessingData] = useState(false);
  const [serverFilesCompleted, setServerFilesCompleted] = useState(0);
  const [totalServerFiles, setTotalServerFiles] = useState(0);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, files } = e.target;

    if (name === "video") {
      setFormData({ ...formData, video: files[0] });
    } else if (name === "audios" || name === "presentations") {
      const existingFiles = Array.from(formData[name]);
      const newFiles = Array.from(files);

      // Yangi fayllarni oldingilar bilan qo'shib yuborish
      const combined = [...existingFiles, ...newFiles];
      setFormData({ ...formData, [name]: combined });
    }
  };

  const removeFile = (type, index) => {
    const updated = [...formData[type]];
    updated.splice(index, 1);
    setFormData({ ...formData, [type]: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsLoading(true);
    setUploadProgress({ video: 0, server: 0, overall: 0 });

    try {
      // Server ga to'g'ridan-to'g'ri yuklash (video, audios, presentations)
      setUploadStage("server");
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);

      // Video faylni qo'shish
      if (formData.video) {
        data.append("video", formData.video);
      }

      // Audio fayllarni qo'shish
      for (const file of formData.audios) {
        data.append("audios", file);
      }

      // Presentation fayllarni qo'shish
      for (const file of formData.presentations) {
        data.append("presentations", file);
      }

      const serverResponse = await uploadVideo(data, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          server: progress,
          video: progress, // Video va server bir xil progress bo'ladi
          overall: progress,
        }));
      });

      setUploadStage("complete");
      setTimeout(() => {
        setProcessingData(false);
        toast.success("Video muvaffaqiyatli yuklandi! ✅");
        navigate("/");
      }, 1500);
    } catch (err) {
      // Error handling automatic
      console.error("Upload error:", err);
      setProcessingData(false);
      setIsLoading(false);
      toast.error("Yuklashda xatolik yuz berdi!");
    }
  };

  // Get stage text
  const getStageText = () => {
    switch (uploadStage) {
      case "server":
        return processingData
          ? "Fayllar serverda qayta ishlanmoqda..."
          : "Video va fayllar serverga yuklanmoqda...";
      case "complete":
        return "Yuklash yakunlandi! Sahifaga yo'naltirilmoqdasiz...";
      default:
        return "";
    }
  };

  // Render upload progress component
  const renderProgressBar = (label, value) => (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2">{value}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 5,
          backgroundColor: "#e6e6e6",
          "& .MuiLinearProgress-bar": {
            borderRadius: 5,
            backgroundColor: "#1a90ff",
          },
        }}
      />
    </Box>
  );

  return (
    <div>
      <div>
        <Button onClick={() => navigate("/")} disabled={isLoading}>
          <FiChevronLeft size={25} />
        </Button>
      </div>
      <Container maxWidth="md">
        <Box sx={{ p: 4, boxShadow: 3, borderRadius: 3, bgcolor: "white" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Video Yuklash Formasi
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Sarlavha"
                name="title"
                variant="outlined"
                required
                fullWidth
                disabled={isLoading}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <TextField
                label="Tavsif"
                name="description"
                multiline
                rows={4}
                required
                fullWidth
                disabled={isLoading}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              {/* VIDEO */}
              <Box>
                <InputLabel>Video (MP4)</InputLabel>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={isLoading}
                >
                  Video tanlang
                  <input
                    name="video"
                    type="file"
                    accept="video/mp4"
                    hidden
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </Button>
                <FormHelperText>
                  Tanlangan: {formData.video?.name || "Hech narsa tanlanmagan"}
                </FormHelperText>
              </Box>

              {/* AUDIOS */}
              <Box>
                <InputLabel>Audios</InputLabel>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={isLoading}
                >
                  Audios tanlang
                  <input
                    name="audios"
                    type="file"
                    accept="audio/*"
                    multiple
                    hidden
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </Button>
                <FormHelperText>
                  {formData.audios.length > 0
                    ? `${formData.audios.length} ta fayl tanlandi`
                    : "Hech narsa tanlanmagan"}
                </FormHelperText>

                <Stack spacing={1} mt={1}>
                  {formData.audios.map((file, idx) => (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{ display: "flex", alignItems: "center", p: 1 }}
                    >
                      <Box sx={{ flexGrow: 1 }}>{file.name}</Box>
                      <IconButton
                        onClick={() => removeFile("audios", idx)}
                        disabled={isLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* PRESENTATIONS */}
              <Box>
                <InputLabel>Prezentatsiyalar</InputLabel>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={isLoading}
                >
                  Prezentatsiyalar tanlang
                  <input
                    name="presentations"
                    type="file"
                    accept=".pptx"
                    multiple
                    hidden
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </Button>
                <FormHelperText>
                  {formData.presentations.length > 0
                    ? `${formData.presentations.length} ta fayl tanlandi`
                    : "Hech narsa tanlanmagan"}
                </FormHelperText>

                <Stack spacing={1} mt={1}>
                  {formData.presentations.map((file, idx) => (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{ display: "flex", alignItems: "center", p: 1 }}
                    >
                      <Box sx={{ flexGrow: 1 }}>{file.name}</Box>
                      <IconButton
                        onClick={() => removeFile("presentations", idx)}
                        disabled={isLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* Progress Indicators */}
              {isLoading && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    {getStageText()}
                  </Typography>

                  {uploadStage === "server" && (
                    <>
                      {renderProgressBar(
                        "Video va fayllar yuklash",
                        uploadProgress.server
                      )}
                    </>
                  )}

                  {uploadStage === "complete" && (
                    <>
                      <Typography variant="body2" color="success.main" mb={1}>
                        ✓ Barcha fayllar muvaffaqiyatli yuklandi
                      </Typography>
                      {processingData && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            Ma'lumotlar qayta ishlanmoqda...
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}

                  {renderProgressBar("Umumiy progress", uploadProgress.overall)}
                </Box>
              )}

              <Button
                disabled={isLoading || processingData}
                variant="contained"
                type="submit"
                color="primary"
                size="large"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {isLoading
                  ? `Yuklanmoqda... ${uploadProgress.overall}%`
                  : processingData
                  ? "Ma'lumotlar qayta ishlanmoqda..."
                  : "Yuklash"}
              </Button>

              {success && <Alert severity="success">{success}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </form>
        </Box>
      </Container>
    </div>
  );
}

export default CreateVideo;
