import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    isFetching: false,
    error: false,
    registerFetching: false,
    registerError: false,
  },
  reducers: {
    // Login
    loginStart: (state) => { state.isFetching = true; state.error = false; },
    loginSuccess: (state, action) => { state.isFetching = false; state.currentUser = action.payload; },
    loginFailure: (state) => { state.isFetching = false; state.error = true; },

    // Register
    registerStart: (state) => { state.registerFetching = true; state.registerError = false; },
    registerSuccess: (state) => { state.registerFetching = false; },
    registerFailure: (state) => { state.registerFetching = false; state.registerError = true; },

    logout: (state) => {
      state.currentUser = null;
      state.isFetching = false;
      state.error = false;
    },
  },
});

export const {
  loginStart, loginSuccess, loginFailure,
  registerStart, registerSuccess, registerFailure,
  logout
} = userSlice.actions;

export default userSlice.reducer;