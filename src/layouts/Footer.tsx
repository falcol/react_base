import { Layout } from "antd";

const { Footer } = Layout;

export default function AppFooter() {
  return (
    <Footer
      style={{
        textAlign: "center",
        background: "#fff",
        borderTop: "1px solid #f0f0f0",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        padding: "16px",
      }}
    >
      ©2025 Created by Your Company
    </Footer>
  );
}
