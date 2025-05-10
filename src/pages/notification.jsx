import React, { useEffect, useState } from "react";
import axios from "../services/api";
import {
  Typography,
  Button,
  Box,
  Modal,
  Rating,
  TextField,
} from "@mui/material";
import { FaDownload, FaStar, FaChalkboardTeacher } from "react-icons/fa";
import { convertToHttps } from "../utils";

const TeacherSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/api/submissions/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
        },
      });
      setSubmissions(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      setError("Vazifalarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleEvaluate = (submission, file) => {
    setSelectedFile({ submission, file });
    setOpen(true);
  };

  const handleSubmitEvaluation = async () => {
    try {
      await axios.post(
        "/api/evaluation/submit",
        {
          workId: selectedFile.submission.workId,
          workType: selectedFile.submission.type,
          fileUrl: selectedFile.file.fileUrl,
          studentId: selectedFile.submission.studentId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ziyo-token")}`,
          },
        }
      );
      setOpen(false);
      setRating(0);
      setComment("");
    } catch (err) {
      setError("Baholashda xatolik: " + err.message);
    }
    fetchSubmissions();
  };

  if (loading) return <p className="text-center mt-10">Yuklanmoqda...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <Typography
          variant="h5"
          className="font-bold text-gray-800 mb-6 flex items-center gap-2"
        >
          <FaChalkboardTeacher size={24} /> Talabalardan kelgan vazifalar
        </Typography>
        {submissions.map((submission) => (
          <div
            key={submission.workId}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <Typography variant="h6" className="font-semibold text-gray-800">
              {submission.title}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Talaba ID: {submission.student}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Yuborilgan vaqt:{" "}
              {new Date(submission.submittedAt).toLocaleString()}
            </Typography>
            {submission.rating ? (
              <Typography className="flex gap-3 text-gray-600">
                <span>Belgilangan baho: </span>
                <span className="flex">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      size={20}
                      color={
                        index + 1 <= submission.rating ? "#FFD700" : "#E0E0E0"
                      }
                    />
                  ))}
                </span>
              </Typography>
            ) : (
              ""
            )}
            <div className="mt-2">
              {submission.files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-white rounded-lg mb-2"
                >
                  <div className="flex items-center gap-2">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.fileName}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="contained"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      startIcon={<FaDownload />}
                      href={convertToHttps(file.fileUrl)}
                      target="_blank"
                    >
                      Yuklab olish
                    </Button>
                    {submission.isSended == false ? (
                      <Button
                        variant="outlined"
                        className="border-green-500 text-green-500 hover:bg-green-50"
                        onClick={() => handleEvaluate(submission, file)}
                      >
                        Baholash
                      </Button>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Evaluation Modal */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" className="font-bold mb-4">
              Baholash
            </Typography>
            <Typography variant="body1" className="mb-4">
              Fayl: {selectedFile?.file.fileName}
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              max={5}
              icon={<FaStar />}
              emptyIcon={<FaStar />}
            />
            <TextField
              label="Izoh (Ixtiyoriy)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            <Button
              variant="contained"
              className="bg-blue-600 text-white hover:bg-blue-700 w-full"
              onClick={handleSubmitEvaluation}
            >
              Bahoni yuborish
            </Button>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherSubmissions;
