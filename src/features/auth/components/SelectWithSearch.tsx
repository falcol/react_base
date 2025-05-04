import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectProps } from "antd";
import Cookies from "js-cookie";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";

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
  isStaticField?: boolean;
  fieldProps?: ControllerRenderProps;
  api: (params: SelectApiParams) => Promise<SelectResponse>;
}

export default function SelectWithSearch({
  field,
  debounceTime = 500,
  isStaticField = false,
  fieldProps,
  api,
  ...props
}: SelectWithSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();
  const initialFetchRef = useRef(false);

  const debouncedSetSearchValue = useDebouncedCallback((value: string) => {
    setSearchValue(value.trim());
  }, debounceTime);

  // Only clear queries when search value changes, not on every render
  useEffect(() => {
    if (!isStaticField && searchValue !== "") {
      queryClient.removeQueries({ queryKey: ["select", field] });
    }
  }, [searchValue, field, queryClient, isStaticField]);

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ["select", field, searchValue],
      queryFn: ({ pageParam = 1 }) => {
        const params: SelectApiParams = {
          field,
          page: pageParam as number,
          pageSize: 10,
          search: searchValue,
        };
        return api(params);
      },
      getNextPageParam: (lastPage: SelectResponse) =>
        lastPage.currentPage < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined,
      initialPageParam: 1,
      enabled:
        !!Cookies.get("accessToken") &&
        (initialFetchRef.current || searchValue !== ""),
      staleTime: isStaticField ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000,
      gcTime: isStaticField ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000,
      retry: 1,
    });

  // Set the initialFetchRef to true after component mounts to ensure data is loaded on first render
  useEffect(() => {
    initialFetchRef.current = true;

    // Cleanup function to reset ref when component unmounts
    return () => {
      initialFetchRef.current = false;
    };
  }, []);

  const memoizedOptions = useMemo(() => {
    return data?.pages.flatMap((page: SelectResponse) => page.data) || [];
  }, [data]);

  const handleSearch = useCallback(
    (value: string) => {
      debouncedSetSearchValue(value);
    },
    [debouncedSetSearchValue],
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
      loading={isFetching || isLoading}
      options={memoizedOptions}
      onSearch={handleSearch}
      onPopupScroll={handlePopupScroll}
      notFoundContent={isLoading ? "Loading..." : "No results"}
      filterOption={false}
      {...fieldProps}
      {...props}
    />
  );
}
