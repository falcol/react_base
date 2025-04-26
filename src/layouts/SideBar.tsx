import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export default function SideBar({ collapsed }: SidebarProps) {
  const location = useLocation();

  const menuItems: MenuProps["items"] = [
    {
      key: "HOME",
      type: "group",
      label: <span className="menu-group-title">Home</span>,
      children: [
        {
          key: "/",
          //   icon: <HomeOutlined />,
          label: (
            <Link to="/" className="custom-link">
              Home
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
          //   icon: <UserOutlined />,
          label: (
            <Link to="/profile" className="custom-link">
              Profile
            </Link>
          ),
        },
        {
          key: "/coreui",
          //   icon: <UserOutlined />,
          label: (
            <Link to="/coreui" className="custom-link">
              coreui
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
      style={{ background: "#fff" }}
    >
      <div className="bo" style={{ height: 64, background: "#fff" }}>
        <h1>Text</h1>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ borderRight: 0 }}
        className="custom-menu"
      />
    </Sider>
  );
}
