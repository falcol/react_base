import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { logout } from "@/features/auth/stores/auth.slice";
import { RootState, store } from "@/stores/store";
import {
  BellOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Badge, Breadcrumb, Button, Dropdown, Layout } from "antd";
import { useSelector } from "react-redux";

const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function AppHeader({ collapsed, toggleSidebar }: HeaderProps) {
  const { breadcrumb } = useBreadcrumb();
  const user = useSelector((state: RootState) => state.auth.user);

  const items: MenuProps["items"] = [
    { key: "changePassword", icon: <LockOutlined />, label: "Thay mật khẩu" },
    { key: "user", icon: <UserOutlined />, label: "User" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    console.log(`${e.key} clicked`);
    if (e.key == "logout") {
      store.dispatch(logout());
      window.location.href = "/login";
    }
  };

  return (
    <Header
      style={{
        padding: "0 16px",
        background: "#ffffff",
        borderBottom: "2px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}
    >
      {/* Toggle + Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
        />
        <Breadcrumb
          items={breadcrumb?.length ? breadcrumb : [{ title: "Trang chủ" }]}
        />
      </div>

      {/* Notification + User */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Badge count={5} size="small" offset={[-2, 2]}>
          <Button
            type="primary"
            style={{
              backgroundColor: "#00b96b",
              borderColor: "#00b96b",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Thông báo
            <BellOutlined />
          </Button>
        </Badge>

        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          trigger={["click"]}
        >
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <UserOutlined />
            <span>{user?.username}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
