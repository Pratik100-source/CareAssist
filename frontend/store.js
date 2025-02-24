import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import userReducer from "./features/userSlice"; // Import your reducer
import loaderReducer from "./features/loaderSlice";
// Persist configuration
const persistConfig = {
  key: "root", // Key for the persisted state
  storage, // Use localStorage
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

// Create the Redux store
const store = configureStore({
  reducer: {
    loader: loaderReducer,
    user: persistedReducer, // Use the persisted reducer
  },
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
