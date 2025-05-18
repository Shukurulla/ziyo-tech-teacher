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
} from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiChevronLeft } from "react-icons/fi";

const AddMatchingTest = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [options, setOptions] = useState([
    { left: "", right: "" }, // 1-juftlik
    { left: "", right: "" }, // 2-juftlik
    { left: "", right: "" }, // 3-juftlik
    { left: "", right: "" }, // 4-juftlik
    { left: "", right: "" }, // 5-juftlik
  ]);
  const [isPairing, setIsPairing] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleAddQuestion = () => {
    if (!topic || options.some((opt) => !opt.left || !opt.right)) {
      return toast.error("Barcha maydonlarni to'ldiring!");
    }

    setIsPairing(true);
    toast.success("Juftliklarni tasdiqlashga o'ting");
  };

  const handleConfirmPairs = () => {
    const formattedOptions = options.flatMap((opt) => [
      { text: opt.left, group: 1, match: opt.right },
      { text: opt.right, group: 2, match: opt.left },
    ]);

    const newQuestion = {
      questionText: topic,
      options: formattedOptions,
    };

    setQuestionsList([...questionsList, newQuestion]);
    setTopic("");
    setOptions([
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
    ]);
    setIsPairing(false);

    toast.success("Savol qo'shildi");
  };

  const handleSubmit = async () => {
    if (!topic || questionsList.length === 0) {
      return toast.error("Mavzu va kamida bitta savol bo'lishi kerak");
    }

    setLoading(true);
    try {
      // Updated to include videoId
      await axios.post(`/api/questions/create`, {
        questionText: topic,
        options: questionsList[0].options, // assuming one question format for matching
        videoId,
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
      <div className="p-6 max-w-4xl mx-auto">
        <Typography variant="h5" className="mb-4 font-bold">
          Juftlashtirish Testi Yaratish
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
              Savol va juftliklar
            </Typography>

            {!isPairing ? (
              <>
                <Typography variant="subtitle1" className="mb-2">
                  Juftliklarni kiriting
                </Typography>
                <Grid container spacing={2} className="mb-4">
                  {options.map((opt, index) => (
                    <Grid item xs={12} key={index}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label={`Chap ${index + 1}`}
                            variant="outlined"
                            fullWidth
                            value={opt.left}
                            onChange={(e) =>
                              handleOptionChange(index, "left", e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label={`O'ng ${index + 1}`}
                            variant="outlined"
                            fullWidth
                            value={opt.right}
                            onChange={(e) =>
                              handleOptionChange(index, "right", e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddQuestion}
                >
                  Juftliklarni tasdiqlash
                </Button>
              </>
            ) : (
              <>
                <Typography variant="subtitle1" className="mb-2">
                  Juftliklarni tasdiqlang
                </Typography>
                <div className="mb-4">
                  {options.map((opt, index) => (
                    <Paper key={index} className="p-2 mb-2">
                      <Typography>
                        {index + 1}. {opt.left} → {opt.right}
                      </Typography>
                    </Paper>
                  ))}
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirmPairs}
                >
                  Savolni qo'shish
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setIsPairing(false)}
                  className="ml-2"
                >
                  O'zgartirish
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {questionsList.length > 0 && (
          <div className="mb-6">
            <Typography variant="h6" className="mb-2 font-semibold">
              Qo'shilgan savollar
            </Typography>
            <div className="space-y-3">
              {questionsList.map((q, index) => (
                <Paper
                  key={index}
                  className="p-4 border border-gray-200 shadow-sm"
                >
                  <Typography className="font-medium">
                    {index + 1}. {q.questionText}
                  </Typography>
                  <ul className="pl-5 mt-2 text-gray-600 list-disc">
                    {q.options
                      .filter((opt) => opt.group === 1)
                      .map((opt, idx) => (
                        <li key={idx}>
                          {opt.text} → {opt.match}
                        </li>
                      ))}
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

export default AddMatchingTest;
