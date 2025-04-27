import "@ant-design/v5-patch-for-react-19";
import { StrictMode } from "react";

import { ConfigProvider } from "antd"; // Import ConfigProvider
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/App.tsx";

import "./index.css";
import { bootstrapThemeExtended } from "./ThemeConfig"; // Import cấu hình theme

import { store } from "./stores/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider theme={bootstrapThemeExtended}>
      <Provider store={store}>
        <App />
      </Provider>
    </ConfigProvider>
  </StrictMode>,
);
