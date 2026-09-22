// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SocialMeidaType = {
  name: string;
  link: string;
};
export type Build = {
  id?: string;
  brand?: {
    name: string;
    logo?: string;
    id: number;
  };
  model?: {
    name: string;
    id: number;
  };
  type?: {
    name: string;
    id: number;
  };
  licensePlate?: string;
  vinNumber?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  userName?: string;
  bio?: string;
  anonymous?: boolean;
  anonymousName?: string;
  profileImage?: string;
  sm?: SocialMeidaType[];
  isExisting?: string;
};

type BuildState = {
  build: Build | null;
};

const initialState: BuildState = {
  build: null,
};

export const buildSlice = createSlice({
  name: "build",
  initialState,
  reducers: {
    clearBuild(state) {
      state.build = null;
    },
    setBuild(state, action: PayloadAction<Build>) {
      state.build = action.payload;
    },
    setIsExisting(state, action: PayloadAction<string>) {
      if (state.build) {
        state.build.isExisting = action.payload;
      }
    },
    removeBuildField(state, action: PayloadAction<keyof Build>) {
      if (state.build) {
        delete state.build[action.payload];
      }
    },
  },
});

export const { setBuild, clearBuild, removeBuildField, setIsExisting } = buildSlice.actions;
export default buildSlice.reducer;
