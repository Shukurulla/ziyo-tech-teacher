import React, { useState } from "react";
import { Logo } from "../assets";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import UserService from "../services/user.service";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginHandler = () => {
    UserService.loginUser(
      dispatch,
      {
        login,
        password,
      },
      navigate
    );
  };
  return (
    <div className="h-[90vh] overflow-y-scroll ">
      <header className="py-4 px-4 container">
        <img src={Logo} alt="" />
      </header>
      <main className="w-100 flex justify-center py-5">
        <div className="bg-[#fff] border-[2px] border-[#E5E7EB] p-6 rounded-lg w-full max-w-md">
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Login*</label>
            <input
              type="text"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full bg-white text-gray-800 p-2 px-3 rounded-md border border-[#E5E7EB] focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Parol*</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-gray-800 p-2 px-3 rounded-md border border-[#E5E7EB] focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Link */}
          <Link to={"/auth/sign"} className="text-blue-500">
            Sizda account yo'qmi?
          </Link>
          {/* Registratsiya button */}
          <button
            onClick={() => loginHandler()}
            className="w-full mt-3 bg-blue-600 text-white text-lg font-semibold py-2 rounded-full hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
