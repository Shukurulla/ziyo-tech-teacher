import toast from "react-hot-toast";
import {
  getUserFailure,
  getUserStart,
  getUserSuccess,
} from "../slices/user.slices";
import axios from "./api";

const UserService = {
  async signUser(dispatch, user, navigate) {
    dispatch(getUserStart());
    try {
      const { data } = await axios.post("/api/teacher/sign", user);
      if (data.token) {
        localStorage.setItem("ziyo-jwt", data.token);
      }
      dispatch(getUserSuccess(data.data));
      toast.success("Ro'yhatdan muaffaqiyatli o'tdingiz");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      dispatch(getUserFailure());
    }
  },
  async loginUser(dispatch, user, navigate) {
    dispatch(getUserStart());
    try {
      const { data } = await axios.post("/api/teacher/login", user);
      if (data.token) {
        localStorage.setItem("ziyo-jwt", data.token);
      }
      dispatch(getUserSuccess(data.data));
      toast.success("Ro'yhatdan muaffaqiyatli o'tdingiz");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      dispatch(getUserFailure());
    }
  },
};

export const getProfile = async () => {
  try {
    const response = await axios.get("/api/teacher/profile");
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("ziyo-jwt");
      window.location.href = "/auth/login";
    }
    throw error;
  }
};

export default UserService;
