import { ThemeConfig } from "antd";

export const bootstrapThemeExtended: ThemeConfig = {
  token: {
    colorPrimary: "#0d6efd",
    colorLink: "#0d6efd",
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
  components: {
    Input: {
      colorBorder: "#ced4da",
      controlHeight: 38,
      colorTextPlaceholder: "#6c757d",
      controlOutline: "rgba(13, 110, 253, 0.25)",
      paddingInline: 12,
      paddingBlock: 6,
    },
    Select: {
      controlHeight: 38,
      colorBorder: "#ced4da",
      controlOutline: "rgba(13, 110, 253, 0.25)",
    },
    Card: {
      colorBorderSecondary: "rgba(0, 0, 0, 0.175)",
      headerBg: "rgba(0, 0, 0, 0.03)",
      paddingLG: 16,
    },
    Table: {
      headerBg: "#f8f9fa",
      headerColor: "#212529",
      borderColor: "#dee2e6",
      rowHoverBg: "rgba(0, 0, 0, 0.075)",
      headerSortActiveBg: "#e9ecef",
      padding: 12,
      borderRadius: 0,
      borderRadiusOuter: 0,
      headerBorderRadius: 0,
    },
    Button: {},
  },
};
