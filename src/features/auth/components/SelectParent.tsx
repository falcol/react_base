import { axiosPrivate } from "@lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ApiConfig {
  name: string; // Tên trường trong form
  label: string; // Nhãn hiển thị
  getParams: (values: Record<string, any>, search: string, page: number) => any; // Hàm lấy params cho API
  apiUrl: string; // Đường dẫn API
}

interface SelectParentProps {
  apis: ApiConfig[];
  pageSize?: number;
}

const fetchOptions = async (apiUrl: string, params: any) => {
  const res = await axiosPrivate.get(apiUrl, { params });
  return res.data;
};

export const SelectParent: React.FC<SelectParentProps> = ({
  apis,
  pageSize = 10,
}) => {
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

        // State cho search và page
        const [search, setSearch] = React.useState("");
        const [page, setPage] = React.useState(1);
        const [options, setOptions] = React.useState<any[]>([]);
        const [totalPages, setTotalPages] = React.useState(1);

        // Query options
        const { data, isFetching } = useQuery({
          queryKey: [api.name, ...parentValues, search, page],
          queryFn: () =>
            fetchOptions(api.apiUrl, api.getParams(values, search, page)),
          enabled: idx === 0 || !!parentValues[idx - 1],
        });

        // Gộp options khi phân trang
        React.useEffect(() => {
          if (page === 1) {
            setOptions(data?.data || []);
          } else if (data?.data) {
            setOptions((prev) => [...prev, ...data.data]);
          }
          setTotalPages(data?.totalPages || 1);
        }, [data, page]);

        // Reset các select con khi cha thay đổi
        React.useEffect(() => {
          setValue(api.name, values[api.name]); // Giữ giá trị hiện tại
          setOptions([]);
          setPage(1);
          setSearch("");
        }, [parentValues[idx - 1], setValue, api.name, idx]);

        // Tải lại option cho giá trị hiện tại khi mount (để hiển thị label từ URL)
        React.useEffect(() => {
          const currentValue = values[api.name];
          if (
            currentValue &&
            !options.some((opt) => opt.value === currentValue)
          ) {
            fetchOptions(
              api.apiUrl,
              api.getParams(values, currentValue, 1),
            ).then((res) => {
              setOptions((prev) => [
                ...prev,
                ...res.data.filter(
                  (opt: any) => !prev.some((o) => o.value === opt.value),
                ),
              ]);
            });
          }
        }, [api.apiUrl, api.name, values, options]);

        // Xử lý load thêm
        const handlePopupScroll = (e: any) => {
          const target = e.target;
          if (
            target.scrollTop + target.offsetHeight >=
              target.scrollHeight - 10 &&
            page < totalPages &&
            !isFetching
          ) {
            setPage((p) => p + 1);
          }
        };

        // Xử lý search
        const handleSearch = (val: string) => {
          setSearch(val);
          setPage(1);
        };

        return (
          <Form.Item label={api.label} key={api.name}>
            <Controller
              name={api.name}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  filterOption={false}
                  onSearch={handleSearch}
                  onPopupScroll={handlePopupScroll}
                  options={options}
                  placeholder={`Chọn ${api.label.toLowerCase()}`}
                  allowClear
                  disabled={disabled}
                  notFoundContent={isFetching ? <Spin size="small" /> : null}
                />
              )}
            />
          </Form.Item>
        );
      })}
    </>
  );
};
