// Updated src/components/SideBar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiHome,
  FiLogOut,
  FiFileText,
  FiMessageSquare,
  FiSettings,
  FiBookOpen,
  FiBell,
  FiVideo,
} from "react-icons/fi";
import { Logo } from "../assets";
import axios from "axios";

const menuItems = [
  {
    title: "Bosh Sahifa",
    path: "/",
    icon: <FiHome />,
  },
  {
    title: "Praktik testlar",
    path: "/practicum-tests",
    icon: <FiFileText />,
  },
  {
    title: "Materiyallar",
    path: "/materials",
    icon: <FiFileText />,
  },
  {
    title: "Xabarlar",
    path: "/notifications",
    icon: <FiBell />,
  },
  {
    title: "Sozlamalar",
    path: "/settings",
    icon: <FiSettings />,
  },
];

const Sidebar = ({ active, onClose }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get("/api/notifications/unread-count", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ziyo-jwt")}`,
          },
        });
        setUnreadCount(res.data.data);
      } catch (err) {
        setError("Unread count fetch error: " + err.message);
        console.error("Error fetching unread notification count:", err);
      }
    };
    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ziyo-jwt");
    navigate("/");
    window.location.reload();
  };

  if (error) console.log(error); // Log any errors for debugging

  return (
    <>
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">
              Profildan chiqmoqchimisiz?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-full lg:w-auto min-h-[200px] lg:min-h-screen bg-white pl-3 pr-2 py-4 shadow-sm flex flex-col">
        <div>
          <div className="flex items-center justify-between mb-6">
            <img src={Logo} alt="logo" className="w-[120px] lg:w-[120px]" />
            <button onClick={onClose} className="lg:hidden text-gray-600">
              <FiX size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`flex items-center justify-between gap-3 px-2 py-2 rounded-lg text-sm font-medium w-full text-left transition
                  ${
                    active === item.title
                      ? "bg-gray-100 text-[#1D2B53]"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                {item.title === "Xabarlar" && unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs py-1 px-3 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium w-full text-left transition
            text-gray-500 hover:bg-gray-100 hover:text-gray-800 mt-auto`}
        >
          <FiLogOut size={18} />
          <span>Chiqish</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
