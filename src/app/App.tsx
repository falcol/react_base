import {
  logout,
  setUser,
  useUserInfoQuery,
} from "@/features/auth/stores/auth.slice";
import AppRouter from "@app/routes/AppRouter";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function App() {
  const dispatch = useDispatch();
  const { data, error } = useUserInfoQuery();

  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    }

    if (error) {
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  return <AppRouter />;
}
