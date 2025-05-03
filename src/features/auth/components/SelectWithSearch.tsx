import { Select, SelectProps } from "antd";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { selectApi, SelectParams } from "../api/api.select";
import { ControllerRenderProps } from "react-hook-form";

interface SelectWithSearchProps
  extends Omit<SelectProps, "options" | "loading"> {
  field: string;
  debounceTime?: number;
  fieldProps?: ControllerRenderProps;
}

export default function SelectWithSearch({
  field,
  debounceTime = 500,
  fieldProps,
  ...props
}: SelectWithSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout>();

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ["select", field, searchValue],
      queryFn: async ({ pageParam = 1, signal }) => {
        const params: SelectParams = {
          field,
          page: pageParam,
          pageSize: 10,
          search: searchValue,
        };
        return selectApi(params);
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.currentPage < lastPage.totalPages) {
          return lastPage.currentPage + 1;
        }
        return undefined;
      },
    });

  const options = data?.pages.flatMap((page) => page.data) || [];

  const handleSearch = useCallback(
    (value: string) => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        setSearchValue(value);
      }, debounceTime);
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
    [fetchNextPage, hasNextPage, isFetching],
  );

  return (
    <Select
      showSearch
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
