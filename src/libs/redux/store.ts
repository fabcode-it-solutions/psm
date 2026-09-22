import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/authSlice";
import buildReducer from "./slices/buildSlice";
import dashboardReducer from "./slices/dashboardSlice";
import partsReducer from "./slices/partsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      build: buildReducer,
      dashboard:dashboardReducer,
      part:partsReducer
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
