import Layout from "@/layouts/Layout"; // Assuming you have a Layout component
import LoginForm from "@features/auth/components/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Check from "./Check";
import Coreui from "./Coreui";
import Home from "./Home";
import Profile from "./Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/coreui" element={<Coreui />} />
          <Route path="/check" element={<Check />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
