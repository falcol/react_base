// components/CustomButton.tsx
import { Button, ButtonProps } from "antd";
import classNames from "classnames";
import React, { useState } from "react";

type CustomButtonType = "primary" | "secondary" | "tertiary";

interface CustomButtonProps extends ButtonProps {
  btnType?: CustomButtonType;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  btnType = "primary",
  className,
  children,
  loading,
  disabled,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    borderRadius: "6px",
    fontWeight: 800,
    padding: "20px 40px", // Nút to hơn một chút
    transition: "all 0.3s", // Cải thiện chuyển động mượt
    transform: isHovered ? "scale(1.05)" : "scale(1)", // Hiệu ứng phóng to khi hover
  };

  let customStyle: React.CSSProperties = {};

  if (btnType === "primary") {
    customStyle = {
      backgroundColor: isHovered ? "#379CA1" : "#4AB7BD", // Hover đổi màu nhẹ
      color: "#ffffff",
      border: "none",
    };
  } else if (btnType === "secondary") {
    customStyle = {
      backgroundColor: isHovered ? "#E0F7F8" : "#ffffff", // Hover đổi nền nhạt
      color: "#4AB7BD",
      border: "1px solid #4AB7BD",
    };
  } else if (btnType === "tertiary") {
    customStyle = {
      backgroundColor: "transparent",
      color: "#555",
      border: "none",
    };
  }

  // Adjust style for loading state
  if (loading) {
    customStyle = {
      ...customStyle,
      backgroundColor: "#4AB7BD", // Giữ màu xanh khi loading
      color: "#ffffff",
    };
  }

  // Adjust style for disabled state
  if (disabled) {
    customStyle = {
      ...customStyle,
      backgroundColor: "#E0F7F8", // Màu mờ khi disabled
      color: "#B0B0B0", // Màu chữ mờ
      border: "1px solid #B0B0B0", // Viền mờ
      transform: "scale(1)", // Không phóng to khi disabled
    };
  }

  return (
    <Button
      {...rest}
      className={classNames(className)}
      style={{
        ...baseStyle,
        ...customStyle,
        ...(rest.style || {}),
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)} // Hover vào
      onMouseLeave={() => !disabled && setIsHovered(false)} // Hover ra
    >
      {children}
    </Button>
  );
};

export default CustomButton;
