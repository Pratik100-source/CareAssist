import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import userReducer from "./features/userSlice"; // Import your reducer
import loaderReducer from "./features/loaderSlice";
import professionalInfoReducer from "./features/professionalSlice";
// Persist configuration for user
const persistConfigUser = {
  key: "user",
  storage,
};

// Persist configuration for professional
const persistConfigProfessional = {
  key: "professional",
  storage,
};

// Create a persisted reducer
const persisted_user_Reducer = persistReducer(persistConfigUser, userReducer);
const persisted_professional_info_Reducer = persistReducer(
  persistConfigProfessional,
  professionalInfoReducer
);

// Create the Redux store
const store = configureStore({
  reducer: {
    loader: loaderReducer,
    user: persisted_user_Reducer, // Use the persisted reducer
    professional: persisted_professional_info_Reducer,
  },
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
