// Improved src/pages/matchingTestCreate.jsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Grid,
  IconButton,
  Divider,
  InputAdornment,
  Box,
} from "@mui/material";
import {
  FiChevronLeft,
  FiPlus,
  FiMinus,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../services/api";

const AddMatchingTest = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [pairs, setPairs] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handlePairChange = (index, field, value) => {
    const newPairs = [...pairs];
    newPairs[index][field] = value;
    setPairs(newPairs);
  };

  const addPair = () => {
    setPairs([...pairs, { question: "", answer: "" }]);
  };

  const removePair = (index) => {
    if (pairs.length <= 2) {
      toast.error("Kamida 2 ta juftlik bo'lishi kerak");
      return;
    }
    const newPairs = [...pairs];
    newPairs.splice(index, 1);
    setPairs(newPairs);
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!topic.trim()) {
      return toast.error("Test mavzusini kiriting");
    }

    if (pairs.some((pair) => !pair.question.trim() || !pair.answer.trim())) {
      return toast.error("Barcha savol va javoblarni to'ldiring");
    }

    // Format pairs for API
    const formattedOptions = pairs.flatMap((pair) => [
      { text: pair.answer, group: 1, match: pair.question },
      { text: pair.question, group: 2, match: pair.answer },
    ]);

    setLoading(true);
    try {
      await axios.post(`/api/questions/create`, {
        questionText: topic,
        options: formattedOptions,
        videoId,
      });

      toast.success("Matching test muvaffaqiyatli saqlandi");
      navigate(`/video/${videoId}`);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button onClick={() => navigate(-1)}>
          <FiChevronLeft size={25} />
        </Button>
      </div>

      <Typography variant="h4" className="mb-6 font-bold text-center">
        Juftlashtirish Testi Yaratish
      </Typography>

      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Test ma'lumotlari
          </Typography>

          <TextField
            label="Test mavzusi"
            variant="outlined"
            fullWidth
            className="mb-6"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Masalan: So'z va uning ma'nosi juftligi"
          />

          <Divider className="my-4" />

          <Box className="mb-5 p-3 bg-blue-50 rounded-lg">
            <Typography
              variant="subtitle1"
              className="mb-2 text-gray-700 font-medium"
            >
              Juftliklarni qo'shish uchun ko'rsatmalar:
            </Typography>
            <ul className="list-disc pl-5 text-gray-700">
              <li className="mb-1">
                <strong>O'ng ustun (Savol):</strong> Talaba tomonidan
                o'qiladigan savol yoki tushuncha
              </li>
              <li className="mb-1">
                <strong>Chap ustun (Javob):</strong> Savol/tushunchaga mos
                keladigan to'g'ri javob
              </li>
              <li>
                Test jarayonida talaba chap ustundan bir javobni, o'ng ustundan
                unga mos keluvchi savolni tanlaydi
              </li>
            </ul>
          </Box>

          {pairs.map((pair, index) => (
            <Paper
              key={index}
              elevation={1}
              className="p-4 mb-4 border border-gray-200"
            >
              <Typography
                variant="subtitle2"
                className="mb-3 text-gray-500 text-center"
              >
                Juftlik #{index + 1}
              </Typography>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={5}>
                  <TextField
                    label="Javob"
                    variant="outlined"
                    fullWidth
                    value={pair.answer}
                    onChange={(e) =>
                      handlePairChange(index, "answer", e.target.value)
                    }
                    placeholder="To'g'ri javob"
                    helperText="Chap ustunda ko'rinadi"
                  />
                </Grid>

                <Grid item xs={2} className="flex justify-center">
                  <FiArrowRight size={24} className="text-blue-500" />
                </Grid>

                <Grid item xs={5} className="flex flex-row items-center">
                  <TextField
                    label="Savol"
                    variant="outlined"
                    fullWidth
                    value={pair.question}
                    onChange={(e) =>
                      handlePairChange(index, "question", e.target.value)
                    }
                    placeholder="Savol yoki tushuncha"
                    helperText="O'ng ustunda ko'rinadi"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => removePair(index)}
                            edge="end"
                            color="error"
                            size="small"
                          >
                            <FiMinus />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Button
            variant="outlined"
            color="primary"
            startIcon={<FiPlus />}
            onClick={addPair}
            className="mt-2 mb-4"
          >
            Yangi juftlik qo'shish
          </Button>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={handleSubmit}
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={20} color="inherit" /> : <FiCheck />
        }
      >
        {loading ? "Saqlanmoqda..." : "Testni saqlash"}
      </Button>
    </div>
  );
};

export default AddMatchingTest;
