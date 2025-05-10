import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import axios from "axios";
import { FiCheck, FiClock, FiLock } from "react-icons/fi";

const Video = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("/api/video/all");
        if (res.data.status === "success") {
          setVideos(res.data.data);
        }
      } catch (err) {
        console.error("Video olishda xatolik:", err);
      }
    };

    fetchVideos();
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

    fetchVideo();
  }, [id]);

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!video) return null;
  const statusVideo = (video) => {
    if (video.complate) return <FiCheck size={16} />;
    if (video.id === id) return <FiClock size={16} />;
    return <FiLock size={16} />;
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-8 col-md-8">
          <div className="video-box">
            <div className="w-100 flex items-center justify-center rounded-lg bg-white h-[70vh] relative">
              {/* Iframe player */}
              <iframe
                src={video.video?.player}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title={video.title}
                className="rounded-lg absolute top-0 left-0 w-full h-full"
              ></iframe>
              {/* Play icon (agar iframe autoplay bo‘lmasa kerak bo‘lishi mumkin) */}
              {/* Agar iframe darhol o‘ynasa, quyidagisini olib tashlash mumkin */}
              {/* <div className="bg-[#F2F5F9] cursor-pointer w-20 h-20 rounded-full flex items-center justify-center z-10">
                <FaPlay size={27} />
              </div> */}
            </div>
            <h1 className="mt-3 text-xl font-semibold">{video.title}</h1>
            <p className="mt-2 text-gray-600">{video.description}</p>
          </div>
        </div>
        <div className="col-lg-4">
          <div>
            {videos.map((video) => (
              <div
                key={video.id}
                className={`flex items-center justify-between p-2 mb-2 rounded-xl cursor-pointer ${
                  video.id === id
                    ? "border-[1px] border-blue-500"
                    : video.complate || video.id === 1
                    ? "bg-gray-50"
                    : "bg-gray-50 opacity-50 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (video.complate || video.id === 1) {
                    window.location.href = `/dashboard/videos/${video.id}`;
                    setIsVideoListOpen(false);
                  }
                }}
              >
                <div>
                  <p className="text-sm font-medium">Video Kurs {video.id}</p>
                  <p className="text-xs text-gray-500">{video.title}</p>
                </div>
                <div className="w-8">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                    {statusVideo(video)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
