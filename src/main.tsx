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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";

setLogoutCallback(() => {
  store.dispatch(logout());
  window.location.href = "/login";
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={bootstrapThemeExtended}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
);
