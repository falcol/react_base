import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout } from "antd";

const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function AppHeader({ collapsed, toggleSidebar }: HeaderProps) {
  return (
    <Header
      style={{
        padding: 0,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleSidebar}
      />
      <h1 style={{ margin: 0, padding: "0 16px" }}>App Header</h1>
    </Header>
  );
}
