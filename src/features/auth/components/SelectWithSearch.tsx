import { Select, SelectProps } from "antd";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectResponse {
  data: SelectOption[];
  currentPage: number;
  totalPages: number;
}

export interface SelectApiParams {
  field: string;
  page: number;
  pageSize: number;
  search?: string;
}

interface SelectWithSearchProps
  extends Omit<SelectProps, "options" | "loading"> {
  field: string;
  debounceTime?: number;
  fieldProps?: ControllerRenderProps;
  api: (params: SelectApiParams) => Promise<SelectResponse>;
}

export default function SelectWithSearch({
  field,
  debounceTime = 500,
  fieldProps,
  api,
  ...props
}: SelectWithSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ["select", field, searchValue],
      queryFn: ({ pageParam = 1 }) => {
        const params: SelectApiParams = {
          field,
          page: pageParam,
          pageSize: 10,
          search: searchValue,
        };
        return api(params);
      },
      getNextPageParam: ({ currentPage, totalPages }) =>
        currentPage < totalPages ? currentPage + 1 : undefined,
    });

  const options = data?.pages.flatMap((page) => page.data) || [];

  const handleSearch = useCallback(
    (value: string) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => setSearchValue(value),
        debounceTime,
      );
    },
    [debounceTime],
  );

  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop === clientHeight &&
        hasNextPage &&
        !isFetching
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetching, fetchNextPage],
  );

  return (
    <Select
      showSearch
      allowClear
      loading={isLoading}
      options={options}
      onSearch={handleSearch}
      onPopupScroll={handlePopupScroll}
      filterOption={false}
      {...fieldProps}
      {...props}
    />
  );
}
