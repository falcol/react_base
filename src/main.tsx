import "@ant-design/v5-patch-for-react-19";
import { StrictMode } from "react";

import { ConfigProvider } from "antd"; // Import ConfigProvider
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/App.tsx";

import "./index.css";
import { store } from "./stores/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          // Cấu hình các thuộc tính của theme ở đây
          colorPrimary: "#00b96b", // Màu chính
          fontSize: 14, // Kích thước font
          borderRadius: 4, // Bo góc
          controlHeight: 40, // Chiều cao của input, select, datepicker, v.v.
        },
      }}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </ConfigProvider>
  </StrictMode>,
);
