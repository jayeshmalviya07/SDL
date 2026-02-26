import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");

const initialState = {
  token: token || null,
  user: token ? jwtDecode(token) : null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload;
      state.user = jwtDecode(action.payload);
      localStorage.setItem("token", action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = slice.actions;
export default slice.reducer;
