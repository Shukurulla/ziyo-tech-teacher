import React, { useEffect, useState } from "react";
import {
  FiClock,
  FiLock,
  FiPlay,
  FiPlus,
  FiVideo,
  FiBell,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button, Badge, Tooltip, CircularProgress } from "@mui/material";
import axios from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch videos
        const res = await axios.get("/api/video/all");
        if (res.data.status === "success") {
          setVideos(res.data.data);
        }

        // Fetch submissions to count them by video
        const submissionsRes = await axios.get("/api/submissions/all");
        const submissionData = submissionsRes.data.data;

        // Group submissions by video ID
        const submissionCounts = {};
        submissionData.forEach((sub) => {
          if (sub.type === "videoWork") {
            // Extract video ID from the title or from workId
            const videoId = sub.workId;
            if (videoId) {
              if (!submissionCounts[videoId]) {
                submissionCounts[videoId] = 0;
              }
              // Only count unrated submissions
              if (!sub.isSended) {
                submissionCounts[videoId]++;
              }
            }
          }
        });

        setSubmissions(submissionCounts);
      } catch (err) {
        console.error("Video olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const videoStatus = (video, idx) => {
    if (video.complete === true || idx === 0) return <FiPlay />;
    if (video.complete === false) return <FiLock />;
    if (video.complete === "watching") return <FiClock />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <div className="flex mb-3 items-center justify-between">
        <h1 className="text-2xl font-[600]">Video darslar</h1>
        <Button variant="contained" onClick={() => navigate("/create-video")}>
          <FiPlus /> Qo'shish
        </Button>
      </div>

      <div className="row">
        {videos.map((item, idx) => (
          <div
            key={item._id}
            className="col-lg-3 col-md-4 col-sm-6 col-12"
            onClick={() => navigate(`/video/${item._id}`)}
          >
            <div className="cursor-pointer mb-4">
              <div className="relative video-image rounded-lg overflow-hidden h-[180px] bg-gray-100">
                <img
                  src={item.video?.thumbnail}
                  loading="eager"
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                {/* Play Icon Centered */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#1111] bg-opacity-40 hover:bg-opacity-50 transition">
                  <div className="w-14 flex items-center justify-center bg-white rounded-full h-14">
                    {videoStatus(item, idx)}
                  </div>
                </div>

                {/* Notification badge */}
                {submissions[item._id] > 0 && (
                  <div className="absolute top-2 right-2">
                    <Tooltip
                      title={`${submissions[item._id]} ta yangi topshiriq`}
                    >
                      <Badge badgeContent={submissions[item._id]} color="error">
                        <div className="bg-white rounded-full p-2">
                          <FiBell size={16} className="text-orange-500" />
                        </div>
                      </Badge>
                    </Tooltip>
                  </div>
                )}
              </div>
              <h1 className="text-md font-[600] mt-2">{item.title}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
