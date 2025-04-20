import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { getUserInfoApi, loginApi } from '../../auth/api/api.auth';
import { AuthState } from '../../auth/types/auth.types';

const initialState: AuthState = {
  user: null,
  accessToken: Cookies.get('accessToken') || null,
  refreshToken: Cookies.get('refreshToken') || null,
  isAuthenticated: !!Cookies.get('accessToken'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, thunkAPI) => {
    try {
      const data = await loginApi(username, password);

      // Token backend trả về là { access, refresh }
      Cookies.set('accessToken', data.access, { secure: true });
      Cookies.set('refreshToken', data.refresh, { secure: true });

      return {
        accessToken: data.access,
        refreshToken: data.refresh,
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (_, thunkAPI) => {
    const token = Cookies.get('accessToken');
    if (!token) return thunkAPI.rejectWithValue('No token found');
    try {
      const data = await getUserInfoApi(token);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch user info');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
