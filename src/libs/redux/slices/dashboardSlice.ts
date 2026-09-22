// store/dashboardSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  loading: string | boolean;
};

const initialState: UserState = {
  loading: false,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setloading(state, action: PayloadAction<string | boolean>) {
      state.loading = action.payload;
    }
  },
});

export const {setloading} = dashboardSlice.actions;
export default dashboardSlice.reducer;
