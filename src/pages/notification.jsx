// Enhanced TeacherSubmissions component for notifications
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
  Avatar,
} from "@mui/material";
import {
  FaDownload,
  FaStar,
  FaChalkboardTeacher,
  FaVideo,
  FaFile,
  FaBell,
  FaFilter,
  FaCheckCircle,
  FaRegClock,
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
  const [sortBy, setSortBy] = useState("unrated-first"); // "unrated-first", "newest", "oldest"

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
      setLoading(true);
      const res = await axios.get("/api/submissions/all");

      // Get all submissions
      const allSubmissions = res.data.data;

      // Sort submissions based on user preference
      const sortedSubmissions = sortSubmissions(allSubmissions, sortBy);
      setSubmissions(sortedSubmissions);

      // Group by video and practice
      const videoSubmissions = {};
      const practiceSubmissions = {};

      sortedSubmissions.forEach((submission) => {
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

      // Sort groups by unrated count (highest first)
      videoDataArray.sort((a, b) => b.unratedCount - a.unratedCount);
      practiceDataArray.sort((a, b) => b.unratedCount - a.unratedCount);

      setVideoData(videoDataArray);
      setPracticeData(practiceDataArray);

      // Set filtered submissions based on tab
      filterSubmissionsByTab(tabValue, sortedSubmissions);
    } catch (err) {
      console.error("Vazifalarni yuklashda xatolik:", err);
      setError("Vazifalarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort submissions function
  const sortSubmissions = (submissions, sortOption) => {
    const submissionsCopy = [...submissions];

    switch (sortOption) {
      case "unrated-first":
        return submissionsCopy.sort((a, b) => {
          // Sort by rating status first (unrated first)
          if (a.isSended !== b.isSended) {
            return a.isSended ? 1 : -1;
          }
          // Then by date (newest first)
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        });
      case "newest":
        return submissionsCopy.sort(
          (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
        );
      case "oldest":
        return submissionsCopy.sort(
          (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
        );
      default:
        return submissionsCopy;
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

  const handleSortChange = (option) => {
    setSortBy(option);
    const sortedSubmissions = sortSubmissions(submissions, option);
    setSubmissions(sortedSubmissions);
    filterSubmissionsByTab(tabValue, sortedSubmissions);
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
      console.error("Baholashda xatolik:", err);
    }
  };

  if (loading)
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );

  if (error) {
    return (
      <Typography className="text-red-500 text-center">{error}</Typography>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-6">
            <Typography
              variant="h5"
              className="font-bold text-gray-800 mb-6 flex items-center gap-2"
            >
              <FaChalkboardTeacher size={24} /> Talabalardan kelgan vazifalar
            </Typography>

            {/* Tabs and sorting options */}
            <Box className="flex flex-col md:flex-row justify-between items-center mb-4">
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="submission tabs"
                className="mb-3 md:mb-0"
              >
                <Tab
                  label="Hammasi"
                  id="tab-0"
                  aria-controls="tabpanel-0"
                  icon={
                    <Badge
                      badgeContent={getVideoCount() + getPracticeCount()}
                      color="error"
                    >
                      <FaBell />
                    </Badge>
                  }
                  iconPosition="start"
                />
                <Tab
                  label="Video"
                  id="tab-1"
                  aria-controls="tabpanel-1"
                  icon={
                    <Badge badgeContent={getVideoCount()} color="error">
                      <FaVideo />
                    </Badge>
                  }
                  iconPosition="start"
                />
                <Tab
                  label="Praktika"
                  id="tab-2"
                  aria-controls="tabpanel-2"
                  icon={
                    <Badge badgeContent={getPracticeCount()} color="error">
                      <FaFile />
                    </Badge>
                  }
                  iconPosition="start"
                />
              </Tabs>

              <Box className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <Button
                  variant={
                    sortBy === "unrated-first" ? "contained" : "outlined"
                  }
                  size="small"
                  color="primary"
                  onClick={() => handleSortChange("unrated-first")}
                >
                  Baholanmaganlar
                </Button>
                <Button
                  variant={sortBy === "newest" ? "contained" : "outlined"}
                  size="small"
                  color="primary"
                  onClick={() => handleSortChange("newest")}
                >
                  Eng yangi
                </Button>
                <Button
                  variant={sortBy === "oldest" ? "contained" : "outlined"}
                  size="small"
                  color="primary"
                  onClick={() => handleSortChange("oldest")}
                >
                  Eng eski
                </Button>
              </Box>
            </Box>

            <Divider className="mb-4" />

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
              {filteredSubmissions.length === 0 ? (
                <Typography className="text-center text-gray-500 py-4">
                  Vazifalar mavjud emas
                </Typography>
              ) : (
                <div>
                  {/* Render all submissions */}
                  {filteredSubmissions.map((submission, idx) => (
                    <Card
                      key={idx}
                      className={`mb-4 ${
                        submission.isSended
                          ? "border border-gray-200"
                          : "border-l-4 border-blue-500 shadow-md"
                      }`}
                      variant="outlined"
                    >
                      <CardContent>
                        <Box className="flex justify-between items-start">
                          <Box className="flex items-center gap-3">
                            {submission.type === "videoWork" ? (
                              <Avatar className="bg-blue-100 text-blue-700">
                                <FaVideo />
                              </Avatar>
                            ) : (
                              <Avatar className="bg-green-100 text-green-700">
                                <FaFile />
                              </Avatar>
                            )}
                            <Box>
                              <Typography
                                variant="h6"
                                className="font-semibold text-gray-800"
                              >
                                {submission.title}
                                {!submission.isSended && (
                                  <Chip
                                    label="Yangi"
                                    size="small"
                                    color="error"
                                    className="ml-2"
                                  />
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                className="text-gray-600"
                              >
                                Talaba: {submission.student}
                              </Typography>
                              <Typography
                                variant="body2"
                                className="text-gray-500"
                              >
                                Yuborilgan vaqt:{" "}
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>

                          <Box className="flex items-center">
                            {submission.isSended ? (
                              <Chip
                                icon={<FaCheckCircle />}
                                label={`Baholangan: ${
                                  submission.rating || 0
                                }/5`}
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                icon={<FaRegClock />}
                                label="Baholanmagan"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>

                        <Divider className="my-3" />

                        <Box className="mt-3">
                          {submission.files.map((file, fileIdx) => (
                            <Box
                              key={fileIdx}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2 hover:bg-gray-100 transition-colors"
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
                      </CardContent>
                    </Card>
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
                <div className="space-y-6">
                  {videoData.map((group) => (
                    <Card key={group.title} className="shadow-sm border">
                      <CardContent>
                        <Box className="flex justify-between items-center mb-3">
                          <Typography
                            variant="h6"
                            className="font-semibold flex items-center gap-2"
                          >
                            <FaVideo className="text-blue-500" />
                            {group.title}
                          </Typography>
                          <Badge
                            badgeContent={group.unratedCount}
                            color="error"
                          >
                            <Chip
                              label={`${group.submissions.length} ta vazifa`}
                              color="primary"
                              variant="outlined"
                            />
                          </Badge>
                        </Box>

                        <Divider className="mb-3" />

                        {group.submissions
                          .sort((a, b) =>
                            a.isSended === b.isSended ? 0 : a.isSended ? 1 : -1
                          )
                          .map((submission, idx) => (
                            <Box
                              key={idx}
                              className={`mb-3 p-3 rounded ${
                                submission.isSended
                                  ? "bg-gray-50"
                                  : "bg-blue-50 border-l-3 border-blue-500"
                              }`}
                            >
                              <Box className="flex justify-between items-start">
                                <Typography
                                  variant="subtitle1"
                                  className="font-medium"
                                >
                                  {submission.student}
                                  {!submission.isSended && (
                                    <Chip
                                      label="Yangi"
                                      size="small"
                                      color="error"
                                      className="ml-2"
                                    />
                                  )}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  className="text-gray-500"
                                >
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleString()}
                                </Typography>
                              </Box>

                              {submission.rating && (
                                <Box className="flex items-center mb-2 mt-1">
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
                                      {file.fileName ||
                                        file.fileUrl.split("/").pop()}
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
                <div className="space-y-6">
                  {practiceData.map((group) => (
                    <Card key={group.title} className="mb-4 shadow-sm">
                      <CardContent>
                        <Box className="flex justify-between items-center mb-2">
                          <Typography
                            variant="h6"
                            className="font-semibold flex items-center gap-2"
                          >
                            <FaFile className="text-green-500" />
                            {group.title}
                          </Typography>
                          <Badge
                            badgeContent={group.unratedCount}
                            color="error"
                          >
                            <Chip
                              label={`${group.submissions.length} ta vazifa`}
                              color="secondary"
                              variant="outlined"
                            />
                          </Badge>
                        </Box>

                        <Divider className="mb-3" />

                        {/* Sort submissions - unrated first */}
                        {group.submissions
                          .sort((a, b) =>
                            a.isSended === b.isSended ? 0 : a.isSended ? 1 : -1
                          )
                          .map((submission, idx) => (
                            <Box
                              key={idx}
                              className={`mb-3 p-3 rounded ${
                                submission.isSended
                                  ? "bg-gray-50"
                                  : "bg-green-50 border-l-3 border-green-500"
                              }`}
                            >
                              <Box className="flex justify-between items-start">
                                <Typography
                                  variant="subtitle1"
                                  className="font-medium"
                                >
                                  {submission.student}
                                  {!submission.isSended && (
                                    <Chip
                                      label="Yangi"
                                      size="small"
                                      color="error"
                                      className="ml-2"
                                    />
                                  )}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  className="text-gray-500"
                                >
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleString()}
                                </Typography>
                              </Box>

                              {submission.rating && (
                                <Box className="flex items-center mb-2 mt-1">
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
                                      {file.fileName ||
                                        file.fileUrl.split("/").pop()}
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
          </CardContent>
        </Card>

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
                startIcon={<FaStar />}
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
