import { useAppSelector } from "@hooks/redux.hooks";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  // Nếu đang ở trang login và đã đăng nhập -> redirect về trang chủ
  if (location.pathname === "/login" && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Nếu chưa đăng nhập và không phải trang login -> redirect về trang login
  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
