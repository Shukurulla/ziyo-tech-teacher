import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "../slices/user.slices";

const store = configureStore({
  reducer: {
    user: UserReducer,
  },
  devTools: process.env.NODE_ENV != "production",
});

export default store;
