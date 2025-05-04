import { axiosPrivate } from "@lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ApiConfig {
  name: string;
  label: string;
  getParams: (values: Record<string, any>, search: string, page: number) => any;
  apiUrl: string;
}

interface SingleSelectProps {
  apiConfig: ApiConfig;
  parentNames?: string[];
  childNames?: string[];
  pageSize?: number;
}

const fetchOptions = async (apiUrl: string, params: any) => {
  const res = await axiosPrivate.get(apiUrl, { params });
  return res.data;
};

export const SingleSelect: React.FC<SingleSelectProps> = ({
  apiConfig,
  parentNames = [],
  childNames = [],
  pageSize = 10,
}) => {
  const { control, watch, setValue, getValues } = useFormContext();
  const { name, label, apiUrl, getParams } = apiConfig;

  const directParentName = parentNames[parentNames.length - 1];
  const values = watch();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [options, setOptions] = React.useState<any[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [isDisabled, setIsDisabled] = React.useState(false);

  const parentValue = directParentName
    ? getValues(directParentName)
    : undefined;
  const currentValue = getValues(name);

  // Update disabled state reactively
  React.useEffect(() => {
    if (!directParentName) {
      setIsDisabled(false);
    } else {
      if (!parentValue && !currentValue) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    }
  }, [parentValue, currentValue, directParentName]);

  // Query data
  const { data, isFetching } = useQuery({
    queryKey: [name, parentValue, search, page],
    queryFn: () => fetchOptions(apiUrl, getParams(values, search, page)),
    enabled: !isDisabled,
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

  // Clear value + con nếu cha thay đổi
  React.useEffect(() => {
    if (!directParentName) return;

    // Nếu cha đổi (watch tự trigger), thì clear con
    const unsub = watch((_, { name: changedName }) => {
      if (changedName === directParentName) {
        // Clear current
        setValue(name, undefined, {
          shouldValidate: false,
          shouldDirty: true,
        });
        // Clear children
        childNames.forEach((childName) => {
          setValue(childName, undefined, {
            shouldValidate: false,
            shouldDirty: true,
          });
        });
        // Reset state
        setSearch("");
        setPage(1);
        setOptions([]);
      }
    });

    return () => unsub.unsubscribe?.();
  }, [watch, directParentName]);

  // Ensure currentValue exists in options (for reload/back)
  React.useEffect(() => {
    if (currentValue && !options.some((opt) => opt.value === currentValue)) {
      fetchOptions(apiUrl, getParams(values, currentValue, 1)).then((res) => {
        const newOpts = res.data.filter(
          (opt: any) => !options.some((o) => o.value === opt.value),
        );
        setOptions((prev) => [...prev, ...newOpts]);
      });
    }
  }, [currentValue]);

  const handlePopupScroll = (e: any) => {
    const target = e.target;
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 &&
      page < totalPages &&
      !isFetching
    ) {
      setPage((p) => p + 1);
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <Form.Item label={label}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            showSearch
            filterOption={false}
            onSearch={handleSearch}
            onPopupScroll={handlePopupScroll}
            options={options}
            placeholder={`Chọn ${label.toLowerCase()}`}
            allowClear
            disabled={isDisabled}
            notFoundContent={isFetching ? <Spin size="small" /> : null}
          />
        )}
      />
    </Form.Item>
  );
};
