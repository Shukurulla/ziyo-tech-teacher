import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { FaDownload } from "react-icons/fa";
import { FiChevronLeft } from "react-icons/fi";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { convertToHttps } from "../utils";

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tests, setTests] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`/api/video/${id}`);
        if (res.data.status === "success") {
          setVideo(res.data.data);
        } else {
          setError("Video topilmadi");
        }
      } catch (err) {
        setError("Xatolik yuz berdi: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchTests = async () => {
      try {
        setTestLoading(true);
        const res = await axios.get(`/api/tests/${id}`);
        setTests(res.data.data);
      } catch (err) {
        console.error("Testlarni olishda xatolik:", err.message);
      } finally {
        setTestLoading(false);
      }
    };

    fetchVideo();
    fetchTests();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Yuklanmoqda...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!video) return null;
  const handleDelete = async (testId) => {
    try {
      await axios.delete(`/api/tests/${testId}`);
      setTests((prev) => prev.filter((t) => t._id !== testId));
      setDeleteConfirmOpen(false);
    } catch (err) {
      alert("O‘chirishda xatolik yuz berdi: " + err.message);
    }
  };

  return (
    <div className="md:px-8  max-w-7xl mx-auto">
      <Button onClick={() => navigate("/")} className="mb-3">
        <FiChevronLeft size={25} />
      </Button>

      {/* Video player */}
      <div className="relative w-full h-[60vh] mb-6 rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={video.video?.player}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          title={video.title}
          className="w-full h-full"
        ></iframe>
      </div>

      {/* Video info */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h5" className="font-bold mb-2">
            {video.title}
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            {video.description}
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-2">
            Qo‘shilgan sana: {new Date(video.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Testlar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h6" className="font-semibold">
            Testlar
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/video/${id}/add-test`)}
          >
            Test qo‘shish
          </Button>
        </div>
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Diqqat!</DialogTitle>
          <DialogContent>
            <Typography>Haqiqatan ham bu testni o‘chirmoqchimisiz?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>
              Bekor qilish
            </Button>
            <Button color="error" onClick={() => handleDelete(deleteTarget)}>
              Ha, o‘chir
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showTestModal}
          onClose={() => setShowTestModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedTest?.topic}</DialogTitle>
          <DialogContent dividers>
            {selectedTest?.questions.map((q, idx) => (
              <div key={idx} className="mb-4">
                <Typography className="font-medium mb-1">
                  {idx + 1}. {q.question}
                </Typography>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  {Object.entries(q.options).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key.toUpperCase()}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTestModal(false)}>Yopish</Button>
          </DialogActions>
        </Dialog>

        {testLoading ? (
          <div className="text-center mt-4">
            <CircularProgress />
          </div>
        ) : tests?.length == 0 || tests == undefined || tests == null ? (
          <Typography variant="body2" className="text-gray-500">
            Bu videoga hali test qo‘shilmagan.
          </Typography>
        ) : (
          <div className="space-y-4">
            {tests?.length === 0 &&
              tests?.map((test) => (
                <Card key={test._id}>
                  <CardContent className="flex justify-between items-start gap-4">
                    <div>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-1"
                      >
                        {test.topic}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        {test.questions.length} ta savol
                      </Typography>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                          setSelectedTest(test);
                          setShowTestModal(true);
                        }}
                      >
                        Ko‘rish
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setDeleteTarget(test._id);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        O‘chirish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Presentations */}
      {video.presentations && Object.keys(video.presentations).length > 0 && (
        <div className="mb-6">
          <Typography variant="h6" className="mb-2 font-semibold">
            Prezentatsiyalar
          </Typography>
          <div className="flex flex-wrap gap-3">
            {Object.entries(video.presentations).map(([name, url]) => (
              <Button
                key={name}
                href={convertToHttps(url)}
                target="_blank"
                variant="outlined"
                startIcon={<FaDownload />}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Audios */}
      {video.audios && Object.keys(video.audios).length > 0 && (
        <div className="mb-6">
          <Typography variant="h6" className="mb-2 font-semibold">
            Audios
          </Typography>
          <div className="flex flex-wrap gap-4">
            {Object.entries(video.audios).map(([name, url]) => (
              <div
                key={name}
                className="flex flex-col items-start gap-1 border p-3 rounded-lg shadow w-full md:w-1/2"
              >
                <Typography variant="subtitle1" className="font-medium">
                  {name}
                </Typography>
                <audio controls className="w-full">
                  <source src={url} type="audio/mpeg" />
                  Brauzeringiz audio pleerni qo‘llab-quvvatlamaydi.
                </audio>
                <Button
                  href={convertToHttps(url)}
                  target="_blank"
                  variant="outlined"
                  color="secondary"
                  startIcon={<FaDownload />}
                  className="mt-2"
                >
                  Yuklab olish
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetail;
