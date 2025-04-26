import { Layout } from "antd";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppFooter from "./Footer";
import AppHeader from "./Header";
import SideBar from "./SideBar";

const { Content } = Layout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SideBar collapsed={collapsed} />
      <Layout>
        <AppHeader collapsed={collapsed} toggleSidebar={toggleSidebar} />
        <Content
          style={{ margin: "16px", padding: "16px", background: "#fff" }}
        >
          <Outlet />
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}
