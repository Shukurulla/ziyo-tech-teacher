// Improved src/pages/create-video.jsx
import React, { useState } from "react";
import axios from "../services/api";
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

  const handleVideoUpload = async () => {
    setUploadStage("video");
    const apiKey = "Jema7G2W7aF46lccCcnZz4slt5kljMsdHtnrZ1Phnjo";
    const title = formData.title;

    try {
      // Create video metadata
      const createRes = await fetch("https://ws.api.video/videos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const createData = await createRes.json();
      if (!createData.videoId) {
        throw new Error("Video yaratishda xatolik");
      }

      const videoId = createData.videoId;

      // Prepare upload form data
      const formDataVideo = new FormData();
      formDataVideo.append("file", formData.video);

      // Upload the video with progress tracking
      const uploadResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress((prev) => ({
              ...prev,
              video: percentComplete,
              overall: Math.round(percentComplete * 0.7), // Video is 70% of overall progress
            }));
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Set video progress to 100% when complete
            setUploadProgress((prev) => ({
              ...prev,
              video: 100,
              overall: 70, // Video is 70% complete of overall process
            }));
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        xhr.open("POST", `https://ws.api.video/videos/${videoId}/source`);
        xhr.setRequestHeader("Authorization", `Bearer ${apiKey}`);
        xhr.send(formDataVideo);
      });

      return uploadResponse?.assets;
    } catch (error) {
      console.error("Video yuklashda xatolik:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsLoading(true);
    setUploadProgress({ video: 0, server: 0, overall: 0 });

    try {
      // Upload video to API.video
      const videoLink = await handleVideoUpload();

      // Now move to server upload stage
      setUploadStage("server");

      // Prepare form data for server upload
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("video", JSON.stringify(videoLink));

      // Calculate total files for progress tracking
      const totalFiles = formData.audios.length + formData.presentations.length;
      setTotalServerFiles(totalFiles);
      setServerFilesCompleted(0);

      // Add audio files
      for (const file of formData.audios) {
        data.append("audios", file);
      }

      // Add presentation files
      for (const file of formData.presentations) {
        data.append("presentations", file);
      }

      // Set the server processing flag
      setProcessingData(true);

      // Upload to our server with progress tracking
      const serverResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentComplete = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress((prev) => ({
              ...prev,
              server: percentComplete,
              overall: 70 + Math.round(percentComplete * 0.3), // Server upload is 30% of overall progress
            }));
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress({
              video: 100,
              server: 100,
              overall: 100,
            });
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));

        xhr.open("POST", `${axios.defaults.baseURL}/api/upload`);
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${localStorage.getItem("ziyo-jwt")}`
        );
        xhr.send(data);
      });

      // Set upload as complete
      setUploadStage("complete");

      // Set a loading delay to ensure files are fully processed on the server
      setTimeout(() => {
        // Processing finished
        setProcessingData(false);

        // Success!
        toast.success("Video muvaffaqiyatli yuklandi! ✅");

        // Navigate to home
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Yuklashda xatolik yuz berdi.❌");
      toast.error("Yuklashda xatolik yuz berdi.❌");
      setProcessingData(false);
      setIsLoading(false);
    }
  };

  // Get stage text
  const getStageText = () => {
    switch (uploadStage) {
      case "video":
        return "Video API.video serveriga yuklanmoqda...";
      case "server":
        return processingData
          ? "Fayllar serverda qayta ishlanmoqda..."
          : "Audio va taqdimotlar serverga yuklanmoqda...";
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

                  {uploadStage === "video" &&
                    renderProgressBar("Video yuklash", uploadProgress.video)}

                  {uploadStage === "server" && (
                    <>
                      <Typography variant="body2" color="success.main" mb={1}>
                        ✓ Video yuklandi
                      </Typography>
                      {renderProgressBar(
                        "Audio va taqdimotlar yuklash",
                        uploadProgress.server
                      )}
                    </>
                  )}

                  {uploadStage === "complete" && (
                    <>
                      <Typography variant="body2" color="success.main" mb={1}>
                        ✓ Video yuklandi
                      </Typography>
                      <Typography variant="body2" color="success.main" mb={1}>
                        ✓ Audio va taqdimotlar yuklandi
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
