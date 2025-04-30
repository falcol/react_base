import { fetchUserInfo } from "@/features/auth/stores/auth.slice";
import AppRouter from "@app/routes/AppRouter";
import Cookies from "js-cookie"; // Để kiểm tra cookie
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    console.log("token ", token);
    if (token) {
      // Nếu có accessToken trong cookie thì dispatch fetchUserInfo
      dispatch(fetchUserInfo());
    }
  }, [dispatch]);

  return <AppRouter />;
}
