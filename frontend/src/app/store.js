import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";

export default configureStore({
  reducer: {
    auth: authReducer,
  },
});
