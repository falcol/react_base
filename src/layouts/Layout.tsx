import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import {
  logout,
  setUser,
  useUserInfoQuery,
} from "@/features/auth/stores/auth.slice";
import { Layout } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import AppFooter from "./Footer";
import AppHeader from "./Header";
import SideBar from "./SideBar";

const { Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const dispatch = useDispatch();
  const { data, error } = useUserInfoQuery();

  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    }
    if (error) {
      dispatch(logout());
    }
  }, [data, error]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <BreadcrumbProvider>
      <Layout
        style={{ height: "100vh", overflow: "hidden", background: "#ffffff" }}
      >
        <SideBar collapsed={collapsed} />
        <Layout style={{ flexDirection: "column", overflow: "hidden" }}>
          <AppHeader collapsed={collapsed} toggleSidebar={toggleSidebar} />

          <Layout
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Content
              style={{
                flex: 1,
                overflowY: "auto", // Chỉ cho phép cuộn dọc
                overflowX: "hidden", // Ngăn cuộn ngang
                background: "#f8f8f9",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                // className="content-container"
                style={{
                  margin: "16px",
                  padding: "10px",
                  maxWidth: "100%", // Giới hạn chiều rộng
                  boxSizing: "border-box", // Đảm bảo padding không làm tăng chiều rộng
                }}
              >
                {/* Content goes here */}
                <Outlet />
              </div>
            </Content>
            <AppFooter />
          </Layout>
        </Layout>
      </Layout>
    </BreadcrumbProvider>
  );
}
