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
  const token = localStorage.getItem("ziyo-jwt");
  if (!token) throw new Error("Token topilmadi");

  const response = await axios.get("/api/teacher/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response);

  return response.data.data;
};

export default UserService;
