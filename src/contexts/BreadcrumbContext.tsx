import { createContext, useContext, useState } from "react";
import { BreadcrumbProps } from "antd";

interface BreadcrumbContextType {
  breadcrumb: BreadcrumbProps["items"];
  setBreadcrumb: (items: BreadcrumbProps["items"]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbProps["items"]>([]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};
