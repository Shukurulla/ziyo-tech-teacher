import axios from "axios";

axios.defaults.baseURL = "http://localhost:2025";
axios.interceptors.request.use((option) => {
  const token = localStorage.getItem("ziyo-jwt")
    ? localStorage.getItem("ziyo-jwt")
    : "";
  option.headers.Authorization = `Bearer ${token}`;
  return option;
});
export default axios;
