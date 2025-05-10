import axios from "axios";

axios.defaults.baseURL = "https://ziyo-tech-server.vercel.app";
axios.interceptors.request.use((option) => {
  const token = localStorage.getItem("ziyo-jwt")
    ? localStorage.getItem("ziyo-jwt")
    : "";
  option.headers.Authorization = `Bearer ${token}`;
  return option;
});
export default axios;
