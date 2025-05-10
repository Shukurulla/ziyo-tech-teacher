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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, files } = e.target;

    if (name === "video") {
      setFormData({ ...formData, video: files[0] });
    } else if (name === "audios" || name === "presentations") {
      const existingFiles = Array.from(formData[name]);
      const newFiles = Array.from(files);

      // Yangi fayllarni oldingilar bilan qo‘shib yuborish
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
    const apiKey = "Jema7G2W7aF46lccCcnZz4slt5kljMsdHtnrZ1Phnjo";
    const title = formData.title;

    const createRes = await fetch("https://ws.api.video/videos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    const createData = await createRes.json();
    const videoId = createData.videoId;

    const formDataVideo = new FormData();
    formDataVideo.append("file", formData.video);

    const uploadRes = await fetch(
      `https://ws.api.video/videos/${videoId}/source`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formDataVideo,
      }
    );

    const uploadData = await uploadRes.json();
    return uploadData?.assets;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsLoading(true);
    try {
      const videoLink = await handleVideoUpload();

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("video", JSON.stringify(videoLink));

      for (const file of formData.audios) data.append("audios", file);
      for (const file of formData.presentations)
        data.append("presentations", file);

      await axios.post("/api/upload", data);
      //   setSuccess("Yuklandi!✅");
      toast.success("Yuklandi!✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Yuklashda xatolik yuz berdi.❌");
    }
    setIsLoading(false);
  };

  return (
    <div>
      <div>
        <Button onClick={() => navigate("/")}>
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
                >
                  Video tanlang
                  <input
                    name="video"
                    type="file"
                    accept="video/mp4"
                    hidden
                    onChange={handleChange}
                    required
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
                >
                  Audios tanlang
                  <input
                    name="audios"
                    type="file"
                    accept="audio/*"
                    multiple
                    hidden
                    onChange={handleChange}
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
                      <IconButton onClick={() => removeFile("audios", idx)}>
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
                >
                  Prezentatsiyalar tanlang
                  <input
                    name="presentations"
                    type="file"
                    accept=".pptx"
                    multiple
                    hidden
                    onChange={handleChange}
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
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Button
                disabled={isLoading}
                variant="contained"
                type="submit"
                color="primary"
              >
                {isLoading ? `Yuklanmoqda...` : "Yuklash"}
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
