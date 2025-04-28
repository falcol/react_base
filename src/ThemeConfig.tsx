import { ThemeConfig } from "antd";

export const bootstrapThemeExtended: ThemeConfig = {
  token: {
    // Các token toàn cục ảnh hưởng đến toàn bộ hệ thống
    colorPrimary: "#008b9b", // main-color-i
    colorInfo: "#008b9b", // main-color-i
    colorPrimaryHover: "#00798a", // main-color-i-dark
    colorPrimaryActive: "#00798a", // main-color-i-dark
    colorPrimaryBg: "#e6f7f9", // main-color-i-light
    colorBgContainer: "#ffffff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    borderRadius: 6,
    colorLink: "#008b9b",
    colorLinkHover: "#00798a",
  },
  components: {
    DatePicker: {
      // Tùy chỉnh cho DatePicker và RangePicker
      // AntD 5.24.8 sử dụng Color System mới
      activeBorderColor: "#008b9b",
      activeShadow: "0 0 0 2px rgba(0, 139, 155, 0.2)",
      cellActiveWithRangeBg: "#e6f7f9",
      cellHoverWithRangeBg: "rgba(230, 247, 249, 0.7)",
      cellRangeBorderColor: "#008b9b",
      hoverBorderColor: "#008b9b",
      cellHoverBg: "#e6f7f9",
    },
    Calendar: {
      // Tùy chỉnh cho Calendar
      itemActiveBg: "#e6f7f9",
    },
    Input: {
      activeBorderColor: "#008b9b",
      hoverBorderColor: "#008b9b",
      activeShadow: "0 0 0 2px rgba(0, 139, 155, 0.2)",
      controlHeight: 38,
      colorTextPlaceholder: "#6c757d",
      colorBorder: "#ced4da",
      paddingInline: 12,
      paddingBlock: 6,
    },
    Select: {
      controlHeight: 38,
      colorBorder: "#ced4da",
      activeBorderColor: "#008b9b",
      hoverBorderColor: "#008b9b",
      activeOutlineColor: "0 0 0 2px rgba(0, 139, 155, 0.2)",
      optionSelectedBg: "#e6f7f9",
      optionSelectedColor: "#008b9b",
      optionActiveBg: "rgba(230, 247, 249, 0.5)",
    },
    Checkbox: {
      colorPrimary: "#008b9b",
      colorPrimaryHover: "#00798a",
    },
    Radio: {
      colorPrimary: "#008b9b",
      colorPrimaryHover: "#00798a",
    },
    Switch: {
      colorPrimary: "#008b9b",
      colorPrimaryHover: "#00798a",
    },
    Button: {
      colorPrimary: "#008b9b",
      colorPrimaryHover: "#00798a",
      colorPrimaryActive: "#006d7b",
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
    Badge: {
      colorBgContainer: "#008b9b",
    },
    Tag: {
      colorPrimary: "#008b9b",
    },
    Slider: {
      colorPrimary: "#008b9b",
      colorPrimaryBorderHover: "#00798a",
      trackBg: "#008b9b",
      trackHoverBg: "#00798a",
      handleColor: "#ffffff",
      handleActiveColor: "#ffffff",
    },
    TimePicker: {
      activeBorderColor: "#008b9b",
      hoverBorderColor: "#008b9b",
      activeShadow: "0 0 0 2px rgba(0, 139, 155, 0.2)",
    },
  },
};
