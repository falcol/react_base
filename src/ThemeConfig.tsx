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
    controlHeight: 38,
    controlInteractiveSize: 30,
  },
  components: {
    Menu: {
      itemColor: "#00798a", // Màu chữ mặc định
      itemHoverColor: "#008b9b", // Màu chữ hover
      itemSelectedColor: "#ffffff", // Màu chữ selected (active)

      itemBg: "#ffffff", // Background mặc định
      itemHoverBg: "transparent", // Nền hover
      itemSelectedBg: "#008b9b", // Nền khi selected

      itemHeight: 48, // Chiều cao item (12px padding top + bottom + text)

      itemPaddingInline: 24, // Padding left/right khi bình thường
      collapsedWidth: 80, // Sidebar collapse width (gần giống)

      groupTitleColor: "#000000", // Màu chữ của group title
      groupTitleFontSize: 20,
      fontWeightStrong: 1000,
      linkHoverDecoration: "underline",
    },
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
      controlHeight: 70,
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
    Dropdown: {
      colorBgElevated: "#ffffff",
      colorText: "#00798a",

      controlItemBgHover: "rgba(0, 185, 155, 0.1)",
      controlItemBgActive: "#008b9b",
      controlItemBgActiveHover: "#00798a",
    },
    Pagination: {
      itemActiveBg: "#008b9b", // background khi active
      colorText: "#00798a", // màu chữ bình thường
      colorTextDisabled: "#d9d9d9", // màu chữ disabled
      colorPrimary: "#ffffff", // màu chữ khi active
      colorPrimaryHover: "#ffffff", // màu chữ khi hover vào active
      itemSize: 32, // kích thước item
      controlHeight: 32, // chiều cao item
    },
  },
};
