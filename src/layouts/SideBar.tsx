import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

// Map giữa path và title tương ứng
const PAGE_TITLES: Record<string, string> = {
  "/": "Trang chủ",
  "/check": "Kiểm tra",
  "/search": "Tìm kiếm",
  "/profile": "Hồ sơ",
  "/coreui": "CoreUI",
};

export default function SideBar({ collapsed }: SidebarProps) {
  const location = useLocation();

  // Thay đổi title khi path thay đổi
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || "Trang chủ";
    document.title = `${title} | Hệ thống`;
  }, [location.pathname]);

  const menuItems: MenuProps["items"] = [
    {
      key: "HOME",
      type: "group",
      label: <span className="menu-group-title">Home</span>,
      children: [
        {
          key: "/",
          label: (
            <Link to="/" className="custom-link">
              Home
            </Link>
          ),
        },
        {
          key: "/check",
          label: (
            <Link to="/check" className="custom-link">
              check
            </Link>
          ),
        },
        {
          key: "/search",
          label: (
            <Link to="/search" className="custom-link">
              search
            </Link>
          ),
        },
      ],
    },
    {
      key: "PROFILE",
      type: "group",
      label: <span className="menu-group-title">Profile</span>,
      children: [
        {
          key: "/profile",
          label: (
            <Link to="/profile" className="custom-link">
              Profile
            </Link>
          ),
        },
        {
          key: "/coreui",
          label: (
            <Link to="/coreui" className="custom-link">
              CoreUI
            </Link>
          ),
        },
      ],
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={!collapsed}
      collapsedWidth={0}
      trigger={null}
      width={250}
      style={{
        background: "#fff",
      }}
    >
      <div
        style={{
          height: 64,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "2px solid #f0f0f0",
          borderRight: "0px solid #ffffff !important",
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: 600 }}>Logo</h1>
      </div>
      <Menu
        className="custom-sidebar-menu"
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ borderRight: 0, boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}
      />
    </Sider>
  );
}
