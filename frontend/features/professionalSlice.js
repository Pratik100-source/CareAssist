import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  professionalName: null,
  token: null,
  date: null,
  experience: null,
  profession: null,
  specialization: null,
  photoUrl: null,
  charge: null,
  startTime: null,
  endTime: null,
  professionalEmail: null,
};

const professionalSlice = createSlice({
  name: "professional", // This is just a name, not related to Store.js
  initialState,
  reducers: {
    setProfessionalInfo: (state, action) => {
      state.professionalName = action.payload.professionalName;
      state.professionalEmail = action.payload.professionalEmail;
      state.token = action.payload.token;
      state.date = action.payload.date;
      state.startTime = action.payload.startTime;
      state.endTime = action.payload.endTime;
      state.profession = action.payload.profession;
      state.experience = action.payload.experience;
      state.specialization = action.payload.specialization;
      state.photoUrl = action.payload.photoUrl;
      state.charge = action.payload.charge;
    },
    NotAvailable: (state) => {
      state.professionalName = null;
      state.professionalEmail = null;
      state.token = null;
      state.date = null;
      state.startTime = null;
      state.endTime = null;
      state.profession = null;
      state.experience = null;
      state.specialization = null;
      state.photoUrl = null;
      state.charge = null;
    },
  },
});

// Export the reducer function
export const { setProfessionalInfo, NotAvailable } = professionalSlice.actions;
export default professionalSlice.reducer;
