import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userType: null,
  token: null,
  firstname: null,
  lastname: null,
  number: null,
  email: null,
  gender: null,
  birthdate: null,
  status: false,
};

const userSlice = createSlice({
  name: "user", // This is just a name, not related to Store.js
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userType = action.payload.userType;
      state.token = action.payload.token;

      if (action.payload.basic_info) {
        const {
          firstname,
          lastname,
          number,
          email,
          gender,
          birthdate,
          status,
        } = action.payload.basic_info;
        state.firstname = firstname;
        state.lastname = lastname;
        state.number = number || "NA";
        state.email = email;
        state.gender = gender || "NA";
        state.birthdate = birthdate || "NA";
        state.status = status || "NA";
      }
    },

    logout: (state) => {
      state.userType = null;
      state.token = null;
      state.firstname = null;
      state.lastname = null;
      state.number = null;
      state.email = null;
      state.gender = null;
      state.birthdate = null;
      state.status = false;
    },
  },
});

// Export the reducer function
export const { setUserInfo, logout } = userSlice.actions;
export default userSlice.reducer;
