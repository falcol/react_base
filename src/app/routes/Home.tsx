import { getUserInfoApi } from "@/features/auth/api/api.auth";
import { logout } from "@/features/auth/stores/auth.slice";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";

export default function Home() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      <h1>Welcome Home!</h1>
      <p>This is a protected route.</p>

      <button onClick={handleLogout}>Logout</button>
      <button
        onClick={() => {
          const fetchUserInfo = async () => {
            const token = Cookies.get("accessToken");
            if (!token) return;
            try {
              const data = await getUserInfoApi(token);
              console.log(data);
            } catch (err: any) {
              console.error(
                err.response?.data?.message || "Failed to fetch user info",
              );
            }
          };
          fetchUserInfo();
        }}
      >
        Get User Info
      </button>
    </div>
  );
}
