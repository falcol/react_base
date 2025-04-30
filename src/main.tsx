import "@ant-design/v5-patch-for-react-19";
import { StrictMode } from "react";

import { logout } from "@/features/auth/stores/auth.slice";
import { setLogoutCallback } from "@/lib/axios"; // ✅
import { ConfigProvider } from "antd"; // Import ConfigProvider
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/App.tsx";

import "./index.css";
import { bootstrapThemeExtended } from "./ThemeConfig"; // Import cấu hình theme

import { persistor, store } from "@/stores/store";
import { PersistGate } from "redux-persist/integration/react";

setLogoutCallback(() => {
  store.dispatch(logout());
  window.location.href = "/login";
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider theme={bootstrapThemeExtended}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ConfigProvider>
  </StrictMode>,
);
