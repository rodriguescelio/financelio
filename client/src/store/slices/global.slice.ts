import { createSlice } from '@reduxjs/toolkit';
import { Account } from '../../models/dto/account';

export interface GlobalState {
  account: Account | null;
}

const initialState: GlobalState = {
  account: null,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
    },
  },
});

export const globalActions = globalSlice.actions;

export default globalSlice.reducer;
