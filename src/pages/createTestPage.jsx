import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material"; // <-- Qo‘shimcha import
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiChevronLeft } from "react-icons/fi";

const AddTest = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({ a: "", b: "", c: "", d: "" });
  const [correctAnswer, setCorrectAnswer] = useState(""); // <-- qo‘shildi
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    if (
      !question ||
      !options.a ||
      !options.b ||
      !options.c ||
      !options.d ||
      !correctAnswer
    ) {
      return toast.error("Barcha maydonlarni to‘ldiring!");
    }

    const newQuestion = {
      question,
      options: { ...options },
      correctAnswer,
    };

    setQuestionsList([...questionsList, newQuestion]);
    setQuestion("");
    setOptions({ a: "", b: "", c: "", d: "" });
    setCorrectAnswer(""); // <-- tozalash

    toast.success("Savol qo‘shildi");
  };

  const handleSubmit = async () => {
    if (!topic || questionsList.length === 0) {
      return toast.error("Mavzu va kamida bitta savol bo‘lishi kerak");
    }

    setLoading(true);
    try {
      await axios.post(`/api/tests/${videoId}`, {
        topic,
        questions: questionsList,
      });

      toast.success("Test muvaffaqiyatli saqlandi");
      navigate(`/video/${videoId}`);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Button onClick={() => navigate(-1)}>
          <FiChevronLeft size={25} />
        </Button>
      </div>
      <div className="p-6 max-w-3xl mx-auto">
        <Typography variant="h5" className="mb-4 font-bold">
          Test yaratish
        </Typography>

        <TextField
          label="Test mavzusi"
          variant="outlined"
          fullWidth
          className="mb-4"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <Card className="mb-4">
          <CardContent>
            <Typography variant="h6" className="mb-3">
              Savol va variantlar
            </Typography>

            <TextField
              label="Savol matni"
              variant="outlined"
              fullWidth
              className="mb-4"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <TextField
                label="A"
                value={options.a}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, a: e.target.value }))
                }
              />
              <TextField
                label="B"
                value={options.b}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, b: e.target.value }))
                }
              />
              <TextField
                label="C"
                value={options.c}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, c: e.target.value }))
                }
              />
              <TextField
                label="D"
                value={options.d}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, d: e.target.value }))
                }
              />
            </div>

            {/* To‘g‘ri javob tanlash */}
            <FormControl fullWidth className="mb-4">
              <InputLabel id="correct-answer-label">To‘g‘ri javob</InputLabel>
              <Select
                labelId="correct-answer-label"
                value={correctAnswer}
                label="To‘g‘ri javob"
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <MenuItem value="a">A</MenuItem>
                <MenuItem value="b">B</MenuItem>
                <MenuItem value="c">C</MenuItem>
                <MenuItem value="d">D</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={handleAddQuestion}
            >
              Savolni qo‘shish
            </Button>
          </CardContent>
        </Card>

        {/* Qo‘shilgan savollar ro‘yxati */}
        {questionsList.length > 0 && (
          <div className="mb-6">
            <Typography variant="h6" className="mb-2 font-semibold">
              Qo‘shilgan savollar
            </Typography>
            <div className="space-y-3">
              {questionsList.map((q, index) => (
                <Paper
                  key={index}
                  className="p-4 border border-gray-200 shadow-sm"
                >
                  <Typography className="font-medium">
                    {index + 1}. {q.question}
                  </Typography>
                  <ul className="pl-5 mt-2 text-gray-600 list-disc">
                    <li>
                      <strong>A:</strong> {q.options.a}
                    </li>
                    <li>
                      <strong>B:</strong> {q.options.b}
                    </li>
                    <li>
                      <strong>C:</strong> {q.options.c}
                    </li>
                    <li>
                      <strong>D:</strong> {q.options.d}
                    </li>
                    <li className="text-green-600 mt-1">
                      <strong>To‘g‘ri javob:</strong>{" "}
                      {q.correctAnswer.toUpperCase()}
                    </li>
                  </ul>
                </Paper>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
          className="mt-4"
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Testni saqlash"
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddTest;
