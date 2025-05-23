import SearchPage from "@/features/auth/pages/SearchPage";
import SearchPage2 from "@/features/auth/pages/SearchPage2";
import SelectParentChildPage from "@/features/auth/pages/SelectParentChildPage";
import Layout from "@/layouts/Layout"; // Assuming you have a Layout component
import LoginForm from "@features/auth/components/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Check from "./Check";
import Coreui from "./Coreui";
import Home from "./Home";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - không cần authentication */}
        <Route path="/login" element={<LoginForm />} />

        {/* Protected routes - cần authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="coreui" element={<Coreui />} />
          <Route path="check" element={<Check />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="search2" element={<SearchPage2 />} />
          <Route path="select-parent" element={<SelectParentChildPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
