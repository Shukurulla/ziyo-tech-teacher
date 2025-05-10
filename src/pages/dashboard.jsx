import React, { useEffect, useState } from "react";
import { FiPlay, FiPlus, FiVideo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
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
  }, []);

  return (
    <div>
      <div className="flex mb-3 items-center justify-between">
        <h1 className="text-2xl font-[600]">Video darslar</h1>
        <Button variant="contained" onClick={() => navigate("/create-video")}>
          <FiPlus /> Qo‘shish
        </Button>
      </div>

      <div className="row">
        {videos.map((item) => (
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
                    <FiPlay
                      size={18}
                      className="
                    "
                    />
                  </div>
                </div>
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
