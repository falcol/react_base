import { axiosPrivate } from "@lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ApiConfig {
  name: string; // Tên trường trong form
  label: string; // Nhãn hiển thị
  getParams: (values: Record<string, any>) => any; // Hàm lấy params cho API
  apiUrl: string; // Đường dẫn API
}

interface SelectParentProps {
  apis: ApiConfig[];
}

const fetchOptions = async (apiUrl: string, params: any) => {
  const res = await axiosPrivate.get(apiUrl, { params });
  return res.data;
};

export const SelectParent: React.FC<SelectParentProps> = ({ apis }) => {
  const { control, watch, setValue } = useFormContext();

  // Theo dõi tất cả giá trị cha
  const values = watch();

  return (
    <>
      {apis.map((api, idx) => {
        // Lấy giá trị cha gần nhất (nếu có)
        const parentValues = apis.slice(0, idx).map((a) => values[a.name]);
        // Nếu có cha mà chưa chọn thì disable select con
        const disabled = idx > 0 && !parentValues[idx - 1];

        // Query options cho select này
        const { data: options = [] } = useQuery({
          queryKey: [api.name, ...parentValues],
          queryFn: () => fetchOptions(api.apiUrl, api.getParams(values)),
          enabled: idx === 0 || !!parentValues[idx - 1], // Chỉ fetch khi cha đã chọn
        });

        // Reset các select con khi cha thay đổi
        React.useEffect(() => {
          if (idx > 0 && !parentValues[idx - 1]) {
            setValue(api.name, undefined);
          }
        }, [parentValues[idx - 1], setValue, api.name, idx]);

        return (
          <Form.Item label={api.label} key={api.name}>
            <Controller
              name={api.name}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={options}
                  placeholder={`Chọn ${api.label.toLowerCase()}`}
                  allowClear
                  disabled={disabled}
                />
              )}
            />
          </Form.Item>
        );
      })}
    </>
  );
};
