import React, { useEffect, useState } from "react";
import axios from "../services/api";
import {
  Typography,
  Button,
  Box,
  Modal,
  Rating,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Badge,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  FaDownload,
  FaStar,
  FaChalkboardTeacher,
  FaVideo,
  FaFile,
} from "react-icons/fa";
import { convertToHttps } from "../utils";

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TeacherSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [videoData, setVideoData] = useState([]);
  const [practiceData, setPracticeData] = useState([]);

  // Get counts for badges
  const getVideoCount = () => {
    return submissions.filter(
      (sub) => sub.type === "videoWork" && !sub.isSended
    ).length;
  };

  const getPracticeCount = () => {
    return submissions.filter(
      (sub) => sub.type === "practiceWork" && !sub.isSended
    ).length;
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("/api/submissions/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ziyo-jwt")}`,
        },
      });

      // Get all submissions
      const allSubmissions = res.data.data;
      setSubmissions(allSubmissions);

      // Group by video and practice
      const videoSubmissions = {};
      const practiceSubmissions = {};

      allSubmissions.forEach((submission) => {
        if (submission.type === "videoWork") {
          if (!videoSubmissions[submission.title]) {
            videoSubmissions[submission.title] = [];
          }
          videoSubmissions[submission.title].push(submission);
        } else if (submission.type === "practiceWork") {
          if (!practiceSubmissions[submission.title]) {
            practiceSubmissions[submission.title] = [];
          }
          practiceSubmissions[submission.title].push(submission);
        }
      });

      // Convert to array format with count info
      const videoDataArray = Object.entries(videoSubmissions).map(
        ([title, subs]) => {
          const unratedCount = subs.filter((s) => !s.isSended).length;
          return {
            title,
            submissions: subs,
            unratedCount,
          };
        }
      );

      const practiceDataArray = Object.entries(practiceSubmissions).map(
        ([title, subs]) => {
          const unratedCount = subs.filter((s) => !s.isSended).length;
          return {
            title,
            submissions: subs,
            unratedCount,
          };
        }
      );

      setVideoData(videoDataArray);
      setPracticeData(practiceDataArray);

      // Set filtered submissions based on tab
      filterSubmissionsByTab(tabValue, allSubmissions);
    } catch (err) {
      setError("Vazifalarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions by tab
  const filterSubmissionsByTab = (tab, allSubmissions = submissions) => {
    switch (tab) {
      case 0: // All
        setFilteredSubmissions(allSubmissions);
        break;
      case 1: // Video
        setFilteredSubmissions(
          allSubmissions.filter((s) => s.type === "videoWork")
        );
        break;
      case 2: // Practice
        setFilteredSubmissions(
          allSubmissions.filter((s) => s.type === "practiceWork")
        );
        break;
      default:
        setFilteredSubmissions(allSubmissions);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterSubmissionsByTab(newValue);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleEvaluate = (submission, file) => {
    setSelectedFile({ submission, file });
    setRating(0);
    setComment("");
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
            Authorization: `Bearer ${localStorage.getItem("ziyo-jwt")}`,
          },
        }
      );
      setOpen(false);
      fetchSubmissions(); // Reload the data
    } catch (err) {
      setError("Baholashda xatolik: " + err.message);
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography className="text-red-500 text-center">{error}</Typography>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <Typography
          variant="h5"
          className="font-bold text-gray-800 mb-6 flex items-center gap-2"
        >
          <FaChalkboardTeacher size={24} /> Talabalardan kelgan vazifalar
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="submission tabs"
            centered
          >
            <Tab label="Hammasi" id="tab-0" aria-controls="tabpanel-0" />
            <Tab
              label={
                <Badge badgeContent={getVideoCount()} color="error">
                  Video Vazifalar
                </Badge>
              }
              id="tab-1"
              aria-controls="tabpanel-1"
              icon={<FaVideo />}
              iconPosition="start"
            />
            <Tab
              label={
                <Badge badgeContent={getPracticeCount()} color="error">
                  Praktika Vazifalar
                </Badge>
              }
              id="tab-2"
              aria-controls="tabpanel-2"
              icon={<FaFile />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {filteredSubmissions.length === 0 ? (
            <Typography className="text-center text-gray-500 py-4">
              Vazifalar mavjud emas
            </Typography>
          ) : (
            <div>
              {/* Render by submission date */}
              {filteredSubmissions
                .sort(
                  (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
                )
                .map((submission, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 p-4 rounded-lg ${
                      submission.isSended
                        ? "bg-gray-50"
                        : "bg-blue-50 border-l-4 border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Typography
                          variant="h6"
                          className="font-semibold text-gray-800"
                        >
                          {submission.title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Talaba: {submission.student}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Yuborilgan vaqt:{" "}
                          {new Date(submission.submittedAt).toLocaleString()}
                        </Typography>
                        {submission.rating && (
                          <Box className="flex items-center mt-1">
                            <Typography variant="body2" className="mr-1">
                              Baho:
                            </Typography>
                            <Rating
                              value={submission.rating}
                              readOnly
                              size="small"
                              precision={0.5}
                            />
                          </Box>
                        )}
                      </div>
                      <Chip
                        color={
                          submission.type === "videoWork"
                            ? "primary"
                            : "secondary"
                        }
                        label={
                          submission.type === "videoWork" ? "Video" : "Praktika"
                        }
                        variant="outlined"
                        size="small"
                      />
                    </div>

                    <div>
                      {submission.files.map((file, fileIdx) => (
                        <div
                          key={fileIdx}
                          className="flex justify-between items-center p-2 bg-white rounded-lg mb-2 shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <FaFile className="text-blue-500" />
                            <span className="text-sm">
                              {file.fileName || file.fileUrl.split("/").pop()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<FaDownload />}
                              href={convertToHttps(file.fileUrl)}
                              target="_blank"
                              className="text-blue-600 border-blue-600"
                            >
                              Yuklab olish
                            </Button>

                            {!submission.isSended && (
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => handleEvaluate(submission, file)}
                              >
                                Baholash
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {videoData.length === 0 ? (
            <Typography className="text-center text-gray-500 py-4">
              Video vazifalari mavjud emas
            </Typography>
          ) : (
            <div>
              {videoData.map((group) => (
                <Card key={group.title} className="mb-4 shadow-sm">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        className="font-semibold flex items-center gap-2"
                      >
                        <FaVideo className="text-blue-500" />
                        {group.title}
                      </Typography>
                      <Badge badgeContent={group.unratedCount} color="error">
                        <Chip
                          label={`${group.submissions.length} ta vazifa`}
                          color="primary"
                          variant="outlined"
                        />
                      </Badge>
                    </Box>

                    <Divider className="mb-3" />

                    {group.submissions.map((submission, idx) => (
                      <Box key={idx} className="mb-3 p-3 bg-gray-50 rounded">
                        <Typography variant="subtitle1" className="font-medium">
                          {submission.student}
                        </Typography>

                        <Typography
                          variant="body2"
                          className="text-gray-500 mb-2"
                        >
                          Yuborilgan:{" "}
                          {new Date(submission.submittedAt).toLocaleString()}
                        </Typography>

                        {submission.rating && (
                          <Box className="flex items-center mb-2">
                            <Typography variant="body2" className="mr-1">
                              Baho:
                            </Typography>
                            <Rating
                              value={submission.rating}
                              readOnly
                              size="small"
                              precision={0.5}
                            />
                          </Box>
                        )}

                        <Box className="mt-2">
                          {submission.files.map((file, fileIdx) => (
                            <Box
                              key={fileIdx}
                              className="flex justify-between items-center p-2 bg-white rounded-lg mb-2 shadow-sm"
                            >
                              <Typography
                                variant="body2"
                                className="flex items-center gap-2"
                              >
                                <FaFile className="text-blue-500" />
                                {file.fileName || file.fileUrl.split("/").pop()}
                              </Typography>

                              <Box className="flex gap-2">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<FaDownload />}
                                  href={convertToHttps(file.fileUrl)}
                                  target="_blank"
                                  className="text-blue-600 border-blue-600"
                                >
                                  Yuklab olish
                                </Button>

                                {!submission.isSended && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    onClick={() =>
                                      handleEvaluate(submission, file)
                                    }
                                  >
                                    Baholash
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {practiceData.length === 0 ? (
            <Typography className="text-center text-gray-500 py-4">
              Praktika vazifalari mavjud emas
            </Typography>
          ) : (
            <div>
              {practiceData.map((group) => (
                <Card key={group.title} className="mb-4 shadow-sm">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        className="font-semibold flex items-center gap-2"
                      >
                        <FaFile className="text-green-500" />
                        {group.title}
                      </Typography>
                      <Badge badgeContent={group.unratedCount} color="error">
                        <Chip
                          label={`${group.submissions.length} ta vazifa`}
                          color="secondary"
                          variant="outlined"
                        />
                      </Badge>
                    </Box>

                    <Divider className="mb-3" />

                    {group.submissions.map((submission, idx) => (
                      <Box key={idx} className="mb-3 p-3 bg-gray-50 rounded">
                        <Typography variant="subtitle1" className="font-medium">
                          {submission.student}
                        </Typography>

                        <Typography
                          variant="body2"
                          className="text-gray-500 mb-2"
                        >
                          Yuborilgan:{" "}
                          {new Date(submission.submittedAt).toLocaleString()}
                        </Typography>

                        {submission.rating && (
                          <Box className="flex items-center mb-2">
                            <Typography variant="body2" className="mr-1">
                              Baho:
                            </Typography>
                            <Rating
                              value={submission.rating}
                              readOnly
                              size="small"
                              precision={0.5}
                            />
                          </Box>
                        )}

                        <Box className="mt-2">
                          {submission.files.map((file, fileIdx) => (
                            <Box
                              key={fileIdx}
                              className="flex justify-between items-center p-2 bg-white rounded-lg mb-2 shadow-sm"
                            >
                              <Typography
                                variant="body2"
                                className="flex items-center gap-2"
                              >
                                <FaFile className="text-green-500" />
                                {file.fileName || file.fileUrl.split("/").pop()}
                              </Typography>

                              <Box className="flex gap-2">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<FaDownload />}
                                  href={convertToHttps(file.fileUrl)}
                                  target="_blank"
                                  className="text-green-600 border-green-600"
                                >
                                  Yuklab olish
                                </Button>

                                {!submission.isSended && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() =>
                                      handleEvaluate(submission, file)
                                    }
                                  >
                                    Baholash
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

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
              Vazifani baholash
            </Typography>

            {selectedFile && (
              <>
                <Typography variant="body1" className="mb-2">
                  <strong>Talaba:</strong> {selectedFile.submission.student}
                </Typography>
                <Typography variant="body1" className="mb-4">
                  <strong>Fayl:</strong>{" "}
                  {selectedFile.file.fileName ||
                    selectedFile.file.fileUrl.split("/").pop()}
                </Typography>
              </>
            )}

            <Box className="mb-4">
              <Typography variant="body1" className="mb-2">
                Baho:
              </Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                size="large"
                precision={0.5}
              />
            </Box>

            <TextField
              label="Izoh (Ixtiyoriy)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              variant="outlined"
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 3,
                gap: 2,
              }}
            >
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Bekor qilish
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitEvaluation}
                disabled={!rating}
              >
                Bahoni yuborish
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherSubmissions;
