import { RootState } from "../store";

export const selectUser = (state: RootState) => state.user.user;
export const selectUserId = (state: RootState) => state.user.user?.user.id;
export const selectIsPrivate = (state: RootState) => state.user.isPrivate;
export const selectIsBlocked = (state: RootState) => state.user.isBlocked;
